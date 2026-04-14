const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');
const router = express.Router();

// ==========================================
// GET API - Fetch Data from Advance_Dropdown_Data Sheet
// Column A (Site Name) and Column B (Vendor_Firm)
// ==========================================

router.get('/dropdown-data', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Advance_Dropdown_Data!A:B',
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data found in Advance_Dropdown_Data sheet',
      });
    }

    const siteNames = [];
    const vendorFirms = [];

    rows.forEach((row, index) => {
      if (index === 0) return; // Skip header row

      if (row[0] && row[0].trim() !== '') {
        siteNames.push(row[0].trim());
      }
      if (row[1] && row[1].trim() !== '') {
        vendorFirms.push(row[1].trim());
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Dropdown data fetched successfully',
      data: {
        siteNames,
        vendorFirms,
      },
    });

  } catch (error) {
    console.error('Error fetching dropdown data:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
});

// ==========================================
// Helper Function - Get Next Empty Row in Sheet
// Yeh function sheet ki last filled row dhundh ke
// uske neeche next empty row ka number return karta hai
// ==========================================

const getNextEmptyRow = async (sheetName) => {
  try {
    // Puri sheet ka column A fetch karo
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:A`,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      // Agar sheet bilkul empty hai to row 2 se start karo (row 1 header hai)
      return 2;
    }

    // Last filled row ke baad wali row return karo
    return rows.length + 1;

  } catch (error) {
    console.error('Error finding next empty row:', error);
    throw error;
  }
};

// ==========================================
// POST API - Submit Form Data to Advance_Payment_Sheet
// Columns A to I:
// A: Timestamp (Auto)
// B: Site Name
// C: VENDOR FIRM NAME 16
// D: PAID_AMOUNT_17
// E: BANK_DETAILS_17
// F: PAYMENT_MODE_17
// G: PAYMENT_DETAILS_17
// H: PAYMENT DATE_18
// I: Exp._Head
// ==========================================

router.post('/submit-payment', async (req, res) => {
  try {
    const {
      siteName,
      vendorFirmName,
      paidAmount,
      bankDetails,
      paymentMode,
      paymentDetails,
      paymentDate,
      expHead,
    } = req.body;

    // ---- Validate Required Fields ----
    if (
      !siteName ||
      !vendorFirmName ||
      !paidAmount ||
      !bankDetails ||
      !paymentMode ||
      !paymentDetails ||
      !paymentDate ||
      !expHead
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        requiredFields: {
          siteName: 'Site Name',
          vendorFirmName: 'Vendor Firm Name',
          paidAmount: 'Paid Amount',
          bankDetails: 'Bank Details',
          paymentMode: 'Payment Mode',
          paymentDetails: 'Payment Details',
          paymentDate: 'Payment Date',
          expHead: 'Exp. Head',
        },
      });
    }

    // ---- Generate Timestamp - Format: DD/MM/YYYY HH:MM:SS ----
    const generateTimestamp = () => {
      const now = new Date();

      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();

      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

      // Output: 24/12/2025 09:31:58
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    };

    const timestamp = generateTimestamp();

    // ---- Prepare Row Data (A to I) ----
    const rowData = [
      timestamp,       // A - Timestamp (Auto Generated)
      siteName,        // B - Site Name
      vendorFirmName,  // C - VENDOR FIRM NAME 16
      paidAmount,      // D - PAID_AMOUNT_17
      bankDetails,     // E - BANK_DETAILS_17
      paymentMode,     // F - PAYMENT_MODE_17
      paymentDetails,  // G - PAYMENT_DETAILS_17
      paymentDate,     // H - PAYMENT DATE_18
      expHead,         // I - Exp._Head
    ];

    // ---- Find Next Empty Row ----
    const nextRow = await getNextEmptyRow('Advance_Payment_Sheet');
    console.log(`Data will be inserted at row: ${nextRow}`);

    // ---- Insert Data at Exact Empty Row using UPDATE ----
    // update method use kiya hai jo exact row pe data set karta hai
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Advance_Payment_Sheet!A${nextRow}:I${nextRow}`, // Exact row set
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData],
      },
    });

    return res.status(201).json({
      success: true,
      message: `Payment data submitted successfully at row ${nextRow}`,
      insertedAt: `Row ${nextRow}`,
      data: {
        timestamp,
        siteName,
        vendorFirmName,
        paidAmount,
        bankDetails,
        paymentMode,
        paymentDetails,
        paymentDate,
        expHead,
      },
      sheetsResponse: {
        updatedRange: response.data.updatedRange,
        updatedRows: response.data.updatedRows,
      },
    });

  } catch (error) {
    console.error('Error submitting payment data:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
});

module.exports = router;