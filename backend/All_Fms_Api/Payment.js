const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');
const router = express.Router();

router.get('/Payment', async (req, res) => {
  try {
    const [billingResponse, paymentSheetResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Billing_FMS!A8:CC',  // CC tak safe (header ke hisaab se)
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Payment_Sheet!A:O",
      })
    ]);

    const billingRows = billingResponse.data.values || [];
    const paymentRows = paymentSheetResponse.data.values || [];

    const processedData = billingRows
      .filter(row => {
        // NET_Amount_17 (BV column - index 73) check
        const netAmount17 = (row[73] || "").toString().trim();
        if (!netAmount17 || netAmount17 === '-' || netAmount17 === '') {
          return false;
        }

        // BALANCE_AMOUNT_17 (BX column - index 75) check
        // Agar BX mein "0", "0.00", ya 0 hai → exclude karo
        const balanceStr = (row[75] || "").toString().trim();
        if (balanceStr !== '') {
          const balanceNum = parseFloat(balanceStr);
          if (!isNaN(balanceNum) && balanceNum === 0) {
            return false; // Fully paid → hide
          }
        }

        // Agar BX empty hai ya >0 hai → include
        return true;
      })
      .map(row => {
        const currentInvoiceNo = (row[52] || "").toString().trim(); // BA column

        let latestPaidAmount = "0";
        let latestBalanceAmount = "0";

        if (currentInvoiceNo && paymentRows.length > 0) {
          for (let i = paymentRows.length - 1; i >= 0; i--) {
            const pRow = paymentRows[i];
            const pInvoiceNo = (pRow[4] || "").toString().trim(); // E column
            if (pInvoiceNo === currentInvoiceNo) {
              latestPaidAmount = (pRow[7] || "0").toString().trim();     // H
              latestBalanceAmount = (pRow[8] || "0").toString().trim();  // I
              break;
            }
          }
        }

        return {
          planned17: row[69] ? String(row[69]).trim() : '',
          UID: row[1] ? String(row[1]).trim() : '',
          siteName: row[3] ? String(row[3]).trim() : '',
          materialType: row[5] ? String(row[5]).trim() : '',
          skuCode: row[6] ? String(row[6]).trim() : '',
          materialName: row[7] ? String(row[7]).trim() : '',
          netAmount17: row[73] ? String(row[73]).trim() : '0',
          netAmount16: row[67] ? String(row[67]).trim() : '0',
          revisedQuantity: row[25] ? String(row[25]).trim() : '',
          finalReceivedQuantity: row[26] ? String(row[26]).trim() : '',
          unitName: row[9] ? String(row[9]).trim() : '',
          finalIndentNo: row[12] ? String(row[12]).trim() : '',
          finalIndentPDF: row[13] ? String(row[13]).trim() : '',
          approvalQuotationNo: row[14] ? String(row[14]).trim() : '',
          approvalQuotationPDF: row[15] ? String(row[15]).trim() : '',
          poNumber: row[16] ? String(row[16]).trim() : '',
          poPDF: row[17] ? String(row[17]).trim() : '',
          mrnNo: row[18] ? String(row[18]).trim() : '',
          mrnPDF: row[19] ? String(row[19]).trim() : '',
          vendorFirmName: row[51] ? String(row[51]).trim() : (row[23] ? String(row[23]).trim() : ''),
          invoice13: currentInvoiceNo,
          invoicePhoto: row[37] ? String(row[37].trim() ): '',
          billDate: row[53] ? String(row[53]).trim() : '',
          latestPaidAmount,
          latestBalanceAmount
        };
      });

    // Unique vendors & sites
    const vendorSeen = new Set();
    const siteSeen = new Set();
    const uniqueVendors = [];
    const uniqueSites = [];

    processedData.forEach(item => {
      if (item.vendorFirmName && !vendorSeen.has(item.vendorFirmName)) {
        vendorSeen.add(item.vendorFirmName);
        uniqueVendors.push({ vendorFirmName: item.vendorFirmName });
      }
      if (item.siteName && !siteSeen.has(item.siteName)) {
        siteSeen.add(item.siteName);
        uniqueSites.push({ siteName: item.siteName });
      }
    });

    res.json({
      success: true,
      count: processedData.length,
      data: processedData,
      uniqueVendors,
      uniqueSites
    });

  } catch (error) {
    console.error('Error in /Payment API:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});







router.post("/Update-Payment", async (req, res) => {
  try {
    const paymentDataArray = req.body;

    if (!Array.isArray(paymentDataArray) || paymentDataArray.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Request body must be a non-empty array of payment objects.",
      });
    }

    const billNos = paymentDataArray.map(item => item.billNo);

    // Billing_FMS से billNo ढूंढने के लिए BA column (row 7 से शुरू)
    const findRowRes = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'Billing_FMS!BA7:BA',
    });

    const sheetRows = findRowRes.data.values || [];
    const rowMap = new Map();

    // यहीं बदलाव किया गया है → अब last occurrence मिलेगा
    billNos.forEach(billNo => {
      const requestBillNo = billNo.toString().trim();

      // Last matching row का index ढूंढ रहे हैं
      let rowIndex = -1;
      sheetRows.forEach((row, idx) => {
        if (row && row[0]?.toString().trim() === requestBillNo) {
          rowIndex = idx; // हर match पर update होता रहेगा → अंत में last वाला रहेगा
        }
      });

      if (rowIndex !== -1) {
        rowMap.set(billNo, 7 + rowIndex); // actual row number (last occurrence)
      }
    });

    const fmsUpdates = [];
    const newPaymentRows = [];
    const missingBills = [];

 const now = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).replace(',', '');

    for (const item of paymentDataArray) {
      const {
        timestamp = now,
        planned17,
        siteName,
        vendorFirmName16,
        billNo,
        billDate16,
        netAmount16,
        currentPaid,
        paidAmount17,
        balanceAmount17,
        bankDetails17,
        paymentMode17,
        paymentDetails17,
        paymentDate18,
        grandTotal
      } = item;

      const targetRow = rowMap.get(billNo);

      if (targetRow) {
        fmsUpdates.push(
          { range: `Billing_FMS!BT${targetRow}`, values: [["Done"]] },
          { range: `Billing_FMS!BW${targetRow}`, values: [[paidAmount17]] },
          { range: `Billing_FMS!BX${targetRow}`, values: [[balanceAmount17]] },
          { range: `Billing_FMS!BY${targetRow}`, values: [[bankDetails17]] },
          { range: `Billing_FMS!BZ${targetRow}`, values: [[paymentMode17]] },
          { range: `Billing_FMS!CA${targetRow}`, values: [[paymentDetails17]] },
          { range: `Billing_FMS!CB${targetRow}`, values: [[paymentDate18]] },
        );
      } else {
        missingBills.push(billNo);
      }

      newPaymentRows.push([
        timestamp,
        planned17,
        siteName,
        vendorFirmName16,
        billNo,
        billDate16,
        netAmount16,
        currentPaid,
        balanceAmount17,
        bankDetails17,
        paymentMode17,
        paymentDetails17,
        paymentDate18,
        grandTotal
      ]);
    }

    // 1. Billing_FMS में batch update
    if (fmsUpdates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: spreadsheetId,
        resource: {
          valueInputOption: 'USER_ENTERED',
          data: fmsUpdates
        }
      });
    }

    // 2. Payment_Sheet में पहली empty row से insert करना
    if (newPaymentRows.length > 0) {
      // Column A पढ़कर पहली empty row ढूंढो (header row 1 है)
      const existingRes = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: 'Payment_Sheet!A:A', // performance के लिए सिर्फ column A
      });

      const columnA = existingRes.data.values || [];
      let firstEmptyRow = 2; // default: header के ठीक नीचे (row 2)

      // Row 2 से शुरू करके पहली empty cell ढूंढो
      for (let i = 1; i < columnA.length; i++) { // i=1 → actual row 2
        const cellValue = columnA[i][0];
        if (cellValue === undefined || cellValue === null || cellValue.toString().trim() === "") {
          firstEmptyRow = i + 1; // actual sheet row number
          break;
        }
      }

      // अगर कोई empty row नहीं मिली (पूरी column filled) → last row के नीचे
      if (firstEmptyRow === 2 && columnA.length > 1 && (columnA[columnA.length - 1][0] !== undefined && columnA[columnA.length - 1][0] !== null && columnA[columnA.length - 1][0].toString().trim() !== "")) {
        firstEmptyRow = columnA.length + 1;
      }

      // नई rows को firstEmptyRow से लिखो
      await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: `Payment_Sheet!A${firstEmptyRow}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: newPaymentRows
        }
      });
    }

    // Success response
    res.json({
      success: true,
      updatedInFMS: Math.floor(fmsUpdates.length / 8),
      addedToPaymentSheet: newPaymentRows.length,
      missingBills
    });

  } catch (error) {
    console.error('Error in /Update-Payment:', error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error"
    });
  }
});

module.exports = router;