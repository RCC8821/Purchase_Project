
const express = require('express');
const { sheets, spreadsheetId, drive } = require('../config/googleSheet');
require('dotenv').config();
const router = express.Router();

// Load jsPDF and jspdf-autotable
const { jsPDF } = require('jspdf');

// Apply jspdf-autotable using the same robust method as indentRoutes.js
try {
  require('jspdf-autotable');
  console.log('jspdf-autotable loaded successfully (Method 1)');
} catch (err) {
  console.log('Method 1 failed, trying method 2:', err.message);
  try {
    const autoTable = require('jspdf-autotable').default;
    autoTable(jsPDF);
    console.log('jspdf-autotable loaded successfully (Method 2)');
  } catch (err2) {
    console.log('Method 2 failed, trying method 3:', err2.message);
    try {
      const jspdfAutoTable = require('jspdf-autotable');
      jspdfAutoTable.default(jsPDF);
      console.log('jspdf-autotable loaded successfully (Method 3)');
    } catch (err3) {
      console.error('Failed to load jspdf-autotable:', err3.message, err3.stack);
      throw new Error('jspdf-autotable dependency could not be loaded');
    }
  }
}

// Test jsPDF and autoTable to ensure functionality
try {
  const doc = new jsPDF();
  if (!doc.autoTable) {
    throw new Error('jspdf-autotable plugin not applied');
  }
  doc.autoTable({ head: [['Test']], body: [['Sample']] });
  console.log('jsPDF and autoTable test successful');
} catch (err) {
  console.error('jsPDF autoTable test failed:', err.message, err.stack);
  throw new Error('jsPDF instance initialization with autoTable failed');
}

// GET: Fetch get-approval-Quotation
router.get('/get-approval-Quotation', async (req, res) => {
  try {
    const range = 'Purchase_FMS!B7:BF';
    console.log(`Fetching data from sheet: ${process.env.SPREADSHEET_ID || spreadsheetId}, range: ${range}`);

    // Fetch data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID || spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    console.log(`Raw rows fetched (length: ${rows.length})`);

    if (!rows.length) {
      console.log('No data found in the sheet for range:', range);
      return res.status(404).json({ error: 'No data found in the sheet', details: 'Sheet or range is empty' });
    }

    // Define required headers with their expected column positions (0-based index relative to B)
    const headers = [
      { key: 'UID', column: 0 }, // B
      { key: 'Req_No', column: 1 }, // C
      { key: 'Site_Name', column: 2 }, // D
      { key: 'Supervisor_Name', column: 3 }, // E
      { key: 'Material_Type', column: 4 }, // F
      { key: 'SKU_Code', column: 5 }, // G
      { key: 'Material_Name', column: 6 }, // H
      { key: 'Quantity', column: 7 }, // I
      { key: 'Unit_Name', column: 8 }, // J
      { key: 'Purpose', column: 9 }, // K
      { key: 'Require_Date', column: 10 }, // L
      { key: 'REVISED_QUANTITY_2', column: 15 }, // Q
      { key: 'DECIDED_BRAND/COMPANY_NAME_2', column: 16 }, // R
      { key: 'INDENT_NUMBER_3', column: 23 }, // Y
      { key: 'PDF_URL_3', column: 24 }, // Z
      { key: 'No._Of_Quotation_4', column: 30 }, // AF
      { key: 'PLANNED_5', column: 32 }, // AI
      { key: 'ACTUAL_5', column: 33 }, // AJ
    ];

    // Normalize sheet headers
    const sheetHeadersRaw = rows[0]?.map(h => h?.trim().replace(/\s+/g, '_').toUpperCase()) || [];
    console.log('Raw sheet headers:', sheetHeadersRaw);

    // Map sheet headers to expected headers
    const headerMap = {};
    headers.forEach(({ key, column }) => {
      headerMap[key] = { column, sheetHeader: sheetHeadersRaw[column] || key };
    });

    // Validate headers
    const missingHeaders = headers.filter(({ key, column }) => !sheetHeadersRaw[column] || sheetHeadersRaw[column].toUpperCase() !== key.toUpperCase());
    if (missingHeaders.length) {
      console.warn('Header mismatches detected:', missingHeaders.map(h => ({
        key: h.key,
        expectedColumn: String.fromCharCode(66 + h.column), // B=66
        found: sheetHeadersRaw[h.column] || 'missing',
      })));
    }

    // Find ACTUAL_5 and PLANNED_5 column indices dynamically
    const actual5Index = headers.find(h => h.key === 'ACTUAL_5')?.column;
    const planned5Index = headers.find(h => h.key === 'PLANNED_5')?.column;
    if (actual5Index === undefined || planned5Index === undefined) {
      console.error('Required columns not found in headers');
      return res.status(500).json({ error: 'Invalid sheet structure', details: 'ACTUAL_5 or PLANNED_5 column missing' });
    }

    // Process data rows (skip header row)
    const dataRows = rows.slice(1);
    if (!dataRows.length) {
      console.log('No data rows found starting from row 8');
      return res.status(404).json({ error: 'No data found starting from row 8', details: 'No rows after header' });
    }

    // Map and filter rows
    let validRowCount = 0;
    const formData = dataRows
      .map((row, index) => {
        if (!row || row.every(cell => !cell || cell.trim() === '')) {
          console.log(`Skipping empty row ${index + 8}`);
          return null;
        }

        // Check if ACTUAL_5 is empty and PLANNED_5 is non-empty
        const actual5 = row[actual5Index]?.trim() || '';
        const planned5 = row[planned5Index]?.trim() || '';
        console.log(
          `Row ${index + 8} - ACTUAL_5: "${actual5}", PLANNED_5: "${planned5}", Full row: ${JSON.stringify(row)}`
        );

        if (actual5 || !planned5) {
          console.log(
            `Skipping row ${index + 8} - Reason: ${actual5 ? `Non-empty ACTUAL_5="${actual5}"` : ''}${
              actual5 && !planned5 ? ' and ' : ''
            }${!planned5 ? `Empty PLANNED_5="${planned5}"` : ''}`
          );
          return null;
        }

        validRowCount++;
        const obj = {};
        headers.forEach(({ key, column }) => {
          if (key === 'Action') {
            obj[key] = '';
          } else {
            const rawValue = row[column];
            const trimmed = rawValue?.trim() ?? '';
            obj[key] = trimmed;
          }
        });
        return obj;
      })
      .filter(obj => obj && Object.entries(obj).some(([key, value]) => key !== 'Action' && value !== ''));

    console.log(`Rows with ACTUAL_5 empty and PLANNED_5 non-empty: ${validRowCount}`);
    console.log('Final formData:', JSON.stringify(formData, null, 2));

    if (!formData.length) {
      console.log('No valid data found after filtering');
      return res.status(404).json({
        error: 'No valid data found after filtering',
        details: validRowCount === 0
          ? 'No rows have ACTUAL_5 empty and PLANNED_5 non-empty in columns AJ and AI'
          : 'All rows with ACTUAL_5 empty and PLANNED_5 non-empty are empty in other columns',
      });
    }

    // Sort object keys for consistent output
    const sortedFormData = formData.map(obj => {
      const sortedObj = {};
      Object.keys(obj).sort().forEach(key => {
        sortedObj[key] = obj[key];
      });
      return sortedObj;
    });

    return res.json({ data: sortedFormData });
  } catch (error) {
    console.error('Error fetching data:', error.message, error.stack);
    return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});

// GET: Fetch Quotation_Master sheet data
router.get('/get-Quotation-create', async (req, res) => {
  try {
    const sheetName = 'Quotation_Master';
    const range = `${sheetName}!A1:AL`;
    console.log(`Fetching data from sheet: ${process.env.SPREADSHEET_ID || spreadsheetId}, range: ${range}`);

    // Fetch data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID || spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    console.log(`Raw rows fetched (length: ${rows.length})`);

    if (!rows.length) {
      console.log('No data found in the sheet for range:', range);
      return res.status(404).json({ error: 'No data found in the sheet', details: 'Sheet or range is empty' });
    }

    // Extract headers (first row) and data rows (starting from row 2)
    const headers = rows[0];
    const dataRows = rows.slice(1);

    if (!dataRows.length) {
      console.log('No data rows found after header');
      return res.status(404).json({ error: 'No data found after header', details: 'No data rows available' });
    }

    // Map rows to objects with header names and filter out approved rows
    const formData = dataRows
      .map((row, index) => {
        if (!row || row.every(cell => !cell || cell.trim() === '')) {
          console.log(`Skipping empty row ${index + 2}`);
          return null;
        }

        const approvalStatus = row[31]?.trim() || '';
        if (approvalStatus.toLowerCase() === 'approved') {
          console.log(`Skipping row ${index + 2} due to Approved status`);
          return null;
        }

        return {
          Time_Stamp: row[0]?.trim() || '',
          Req_No: row[1]?.trim() || '',
          UID: row[2]?.trim() || '',
          site_name: row[3]?.trim() || '',
          Indent_No: row[4]?.trim() || '',
          Material_name: row[5]?.trim() || '',
          Vendor_Name: row[6]?.trim() || '',
          Vendor_Ferm_Name: row[7]?.trim() || '',
          Vendor_Address: row[8]?.trim() || '',
          Contact_Number: row[9]?.trim() || '',
          Vendor_GST_No: row[10]?.trim() || '',
          RATE: row[11]?.trim() || '',
          Discount: row[12]?.trim() || '',
          CGST: row[13]?.trim() || '',
          SGST: row[14]?.trim() || '',
          IGST: row[15]?.trim() || '',
          Final_Rate: row[16]?.trim() || '',
          Delivery_Expected_Date: row[17]?.trim() || '',
          Payment_Terms_Condition_Advance_Credit: row[18]?.trim() || '',
          Credit_in_Days: row[19]?.trim() || '',
          Bill_Type: row[20]?.trim() || '',
          IS_TRANSPORT_REQUIRED: row[21]?.trim() || '',
          EXPECTED_TRANSPORT_CHARGES: row[22]?.trim() || '',
          FRIGHET_CHARGES: row[23]?.trim() || '',
          EXPECTED_FRIGHET_CHARGES: row[24]?.trim() || '',
          Status: row[25]?.trim() || '',
          No_Of_Quotation_4: row[26]?.trim() || '',
          Remark_4: row[27]?.trim() || '',
          Quotation_No: row[28]?.trim() || '',
          Total_Quantity: row[29]?.trim() || '',
          Total_Value: row[30]?.trim() || '',
          Approval_Status: approvalStatus,
        };
      })
      .filter(obj => obj && Object.values(obj).some(val => val !== ''));

    console.log(`Valid rows after mapping and filtering: ${formData.length}`);
    console.log('Final formData:', JSON.stringify(formData, null, 2));

    if (!formData.length) {
      console.log('No valid data found after filtering out approved rows');
      return res.status(404).json({
        error: 'No valid data found after filtering',
        details: 'All rows are either empty or approved',
      });
    }

    const sortedFormData = formData.map(obj => ({
      Time_Stamp: obj.Time_Stamp,
      Req_No: obj.Req_No,
      UID: obj.UID,
      site_name: obj.site_name,
      Indent_No: obj.Indent_No,
      Material_name: obj.Material_name,
      Vendor_Name: obj.Vendor_Name,
      Vendor_Ferm_Name: obj.Vendor_Ferm_Name,
      Vendor_Address: obj.Vendor_Address,
      Contact_Number: obj.Contact_Number,
      Vendor_GST_No: obj.Vendor_GST_No,
      RATE: obj.RATE,
      Discount: obj.Discount,
      CGST: obj.CGST,
      SGST: obj.SGST,
      IGST: obj.IGST,
      Final_Rate: obj.Final_Rate,
      Delivery_Expected_Date: obj.Delivery_Expected_Date,
      Payment_Terms_Condition_Advance_Credit: obj.Payment_Terms_Condition_Advance_Credit,
      Credit_in_Days: obj.Credit_in_Days,
      Bill_Type: obj.Bill_Type,
      IS_TRANSPORT_REQUIRED: obj.IS_TRANSPORT_REQUIRED,
      EXPECTED_TRANSPORT_CHARGES: obj.EXPECTED_TRANSPORT_CHARGES,
      FRIGHET_CHARGES: obj.FRIGHET_CHARGES,
      EXPECTED_FRIGHET_CHARGES: obj.EXPECTED_FRIGHET_CHARGES,
      Status: obj.Status,
      No_Of_Quotation_4: obj.No_Of_Quotation_4,
      Remark_4: obj.Remark_4,
      Quotation_No: obj.Quotation_No,
      Total_Quantity: obj.Total_Quantity,
      Total_Value: obj.Total_Value,
      Approval_Status: obj.Approval_Status,
    }));

    return res.json({ data: sortedFormData });
  } catch (error) {
    console.error('Error fetching data:', error.message, error.stack);
    return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});

// Define generateQuotationPDF
const generateQuotationPDF = (approvedItems, quotationNo, indentNo) => {
  console.log(`Generating PDF: Quotation ${quotationNo}, Indent ${indentNo}, Items: ${approvedItems.length}`);
  try {
    const doc = new jsPDF();
    if (typeof doc.autoTable !== 'function') {
      const err = new Error('autoTable plugin not loaded');
      console.error(err.message);
      throw err;
    }
    console.log('jsPDF and autoTable ready');

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Enhanced cleaning function to remove special characters
    const cleanText = (text) => {
      return (text || 'N/A').toString().trim().replace(/[^a-zA-Z0-9\s\-\/.,]/g, '');
    };

    // Header Section - Company Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('R.C.C Infrastructures', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('310 Saket Nagar, 9B Near Sagar Public School, Bhopal, 462026', pageWidth / 2, 22, { align: 'center' });
    doc.text('Contact: 9753432126 | Email: mayank@rcinfrastructure.com', pageWidth / 2, 28, { align: 'center' });
    doc.text('GST: 23ABHFR3130L1ZA', pageWidth / 2, 34, { align: 'center' });

    // Title Section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 53, 69); // Red color
    doc.text('APPROVED QUOTATION', pageWidth / 2, 60, { align: 'center' });

    doc.setDrawColor(220, 53, 69);
    doc.setLineWidth(1);
    doc.line(60, 63, pageWidth - 60, 63);

    // Reset color for content
    doc.setTextColor(0, 0, 0);

    // Quotation Information
    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).replace(/ /g, '-');

    // Clean vendor and quotation details
    const vendorName = cleanText(approvedItems[0]?.rowData[6]); // Vendor_Name
    const vendorAddress = cleanText(approvedItems[0]?.rowData[8]); // Vendor_Address
    const vendorGST = cleanText(approvedItems[0]?.rowData[10]); // Vendor_GST_No
    const cleanQuotationNo = cleanText(quotationNo);
    const cleanIndentNo = cleanText(indentNo);

    // Left Column Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Quotation No:', 15, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(cleanQuotationNo, 40, 80);

    doc.setFont('helvetica', 'bold');
    doc.text('Indent No:', 15, 88);
    doc.setFont('helvetica', 'normal');
    doc.text(cleanIndentNo, 40, 88);

    doc.setFont('helvetica', 'bold');
    doc.text('Date:', 15, 96);
    doc.setFont('helvetica', 'normal');
    doc.text(currentDate, 40, 96);

    // Right Column Info
    doc.setFont('helvetica', 'bold');
    doc.text('Vendor:', 120, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(vendorName, 145, 80);

    doc.setFont('helvetica', 'bold');
    doc.text('Address:', 120, 88);
    doc.setFont('helvetica', 'normal');
    doc.text(vendorAddress, 145, 88);

    doc.setFont('helvetica', 'bold');
    doc.text('GST No:', 120, 96);
    doc.setFont('helvetica', 'normal');
    doc.text(vendorGST, 145, 96);

    // Order Details Header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 53, 69);
    doc.text('Order Details', 15, 110);

    // Log sample row data
    if (approvedItems.length > 0) {
      console.log('Sample row data (first 17 columns):', approvedItems[0].rowData.slice(0, 17));
    }

    // Prepare table data from approved items
    const tableBody = approvedItems.map((item, index) => {
      const row = item.rowData;
      return [
        index + 1,
        cleanText(row[5]), // Material_name
        cleanText(row[29]), // Total_Quantity
        cleanText(row[7]), // Vendor_Ferm_Name
        cleanText(row[11]), // RATE
        cleanText(row[13]), // CGST
        cleanText(row[14]), // SGST
        cleanText(row[15]), // IGST
        cleanText(row[16]), // Final_Rate
        cleanText(row[30]), // Total_Value
      ];
    });

    // Calculate dynamic table properties based on data
    const totalItems = tableBody.length;

    // Adjusted column widths to fit within page (total ~180mm to fit A4 page width of 190mm with margins)
    const columnWidths = {
      0: 10, // Sr.
      1: 35, // Material Name (reduced to fit)
      2: 15, // Qty
      3: 15, // Unit
      4: 20, // Rate
      5: 15, // CGST
      6: 15, // SGST
      7: 15, // IGST
      8: 20, // Final Rate
      9: 20, // Total Value
    };

    // Dynamic font size based on data amount
    let tableFontSize = 8;
    let headerFontSize = 9;
    let cellPadding = 3;

    if (totalItems > 15) {
      tableFontSize = 7;
      headerFontSize = 8;
      cellPadding = 2;
    } else if (totalItems > 10) {
      tableFontSize = 7.5;
      headerFontSize = 8.5;
      cellPadding = 2.5;
    }

    // Table configuration
    doc.autoTable({
      head: [['Sr.', 'Material Name', 'Qty', 'Unit', 'Rate', 'CGST', 'SGST', 'IGST', 'Final Rate', 'Total Value']],
      body: tableBody,
      startY: 115,
      theme: 'grid',
      styles: {
        fontSize: tableFontSize,
        cellPadding: cellPadding,
        font: 'helvetica',
        textColor: [0, 0, 0],
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontStyle: 'normal',
      },
      headStyles: {
        fillColor: [255, 255, 255], // White (no background)
        textColor: [0, 0, 0], // Black text for header
        fontStyle: 'bold',
        fontSize: headerFontSize,
        halign: 'center',
        cellPadding: cellPadding + 1,
        overflow: 'linebreak',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: columnWidths[0] },
        1: { cellWidth: columnWidths[1] },
        2: { halign: 'center', cellWidth: columnWidths[2] },
        3: { halign: 'center', cellWidth: columnWidths[3] },
        4: { halign: 'right', cellWidth: columnWidths[4] },
        5: { halign: 'center', cellWidth: columnWidths[5] },
        6: { halign: 'center', cellWidth: columnWidths[6] },
        7: { halign: 'center', cellWidth: columnWidths[7] },
        8: { halign: 'right', cellWidth: columnWidths[8] },
        9: { halign: 'right', cellWidth: columnWidths[9] },
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245], // Light gray for alternate rows
      },
      margin: { top: 115, left: 15, right: 15 },
      tableWidth: 'auto',
      pageBreak: 'auto',
      showHead: 'everyPage',
    });

    // Terms & Conditions
    const tableEndY = doc.lastAutoTable?.finalY || 150;
    const termsY = Math.max(tableEndY + 10, 200);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 53, 69);
    doc.text('Terms & Conditions', 15, termsY);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`Payment Terms: ${cleanText(approvedItems[0]?.rowData[18] || 'Credit (30 days)')}`, 15, termsY + 10); // Payment_Terms_Condition_Advance_Credit
    doc.text('Delivery: At site', 15, termsY + 18);
    doc.text(`Transport: ${cleanText(approvedItems[0]?.rowData[21] || 'No')}`, 15, termsY + 26); // IS_TRANSPORT_REQUIRED

    // Footer
    const footerY = Math.max(termsY + 40, pageHeight - 60);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Authorized Signature', 15, footerY);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(15, footerY + 15, 80, footerY + 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, footerY + 25);

    // Page border
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(2);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

    // Output as buffer instead of data URI to avoid base64 issues
    const pdfBuffer = doc.output('arraybuffer');
    console.log('PDF buffer generated, length:', pdfBuffer.byteLength);

    // Convert buffer to base64 for debugging
    const base64Data = Buffer.from(pdfBuffer).toString('base64');
    console.log('Base64 data length:', base64Data.length);
    return `data:application/pdf;base64,${base64Data}`;
  } catch (pdfError) {
    console.error('PDF generation error:', pdfError.message, pdfError.stack);
    throw new Error(`Failed to generate PDF: ${pdfError.message}`);
  }
};


// POST: Update approval
router.post('/update-approval', async (req, res) => {
  console.log('=== UPDATE APPROVAL START ===');
  console.log('Received request:', req.body);
  const { approvals, status } = req.body;

  // Validate inputs
  if (!approvals || !Array.isArray(approvals) || approvals.length === 0) {
    console.error('Validation error: No approvals provided');
    return res.status(400).json({ error: 'No approvals provided or invalid format' });
  }
  if (!status) {
    console.error('Validation error: No status');
    return res.status(400).json({ error: 'Status is required' });
  }
  if (!['approved', 'rejected'].includes(status.toLowerCase())) {
    console.error('Validation error: Invalid status');
    return res.status(400).json({ error: 'Status must be "approved" or "rejected"' });
  }

  try {
    // Validate Google Drive client
    if (!drive || !drive.files) {
      throw new Error('Google Drive API client not initialized');
    }

    // Validate environment variables
    if (!process.env.GOOGLE_DRIVE_FOLDER_ID) {
      throw new Error('GOOGLE_DRIVE_FOLDER_ID not set in environment variables');
    }

    // Get current approval counter from sheet
    const counterResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID || spreadsheetId,
      range: 'Quotation_Master!AM1',
    });
    let approvalCounter = parseInt(counterResponse.data.values?.[0]?.[0] || '0', 10) || 0;

    // Helper functions
    function padNumber(num, size) {
      return num.toString().padStart(size, '0');
    }

    function generateApprovedQuotationNo(counter) {
      return `FQUOT_${padNumber(counter, 4)}`;
    }

    // Get sheet data
    console.log('Fetching sheet data...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID || spreadsheetId,
      range: 'Quotation_Master!A:AO',
    });
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.error('No data in sheet');
      return res.status(404).json({ error: 'No data found in sheet' });
    }
    console.log(`Sheet rows fetched: ${rows.length}`);

    const header = rows[0];
    console.log('Headers:', header);

    // Define column indices
    const uidColumnIndex = 2; // Column C (UID)
    const indentNoIndex = 4; // Column E (Indent_No)
    const vendorFirmNameIndex = 7; // Column I (Vendor_Ferm_Name, assuming it's column I)
    const approvalStatusIndex = 31; // Column AF (Approval Status)
    const approvedQuotationNoIndex = 32; // Column AG (Approved Quotation No)
    const pdfUrlIndex = 33; // Column AH (PDF URL)

    // Verify columns exist
    if (
      uidColumnIndex >= header.length ||
      indentNoIndex >= header.length ||
      vendorFirmNameIndex >= header.length ||
      approvalStatusIndex >= header.length ||
      approvedQuotationNoIndex >= header.length ||
      pdfUrlIndex >= header.length
    ) {
      console.error('Required columns not found in sheet');
      return res.status(400).json({
        error: 'Required columns (C, E, I, AF, AG, AH) not found in sheet',
      });
    }

    // Track unique Indent_No and their corresponding approvedQuotationNo
    const indentNoMap = new Map();
    let updates = [];
    let updatedCount = 0;
    let approvedRowsData = [];

    // First pass: Identify rows to update based on UID and Vendor_Ferm_Name
    rows.forEach((row, index) => {
      if (index === 0) return; // Skip header
      const uid = row[uidColumnIndex]?.toString().trim() || '';
      const vendorFirmName = row[vendorFirmNameIndex]?.toString().trim() || '';
      const indentNo = row[indentNoIndex]?.toString().trim() || '';

      // Check if this row matches any approval request
      const matchingApproval = approvals.find(
        (approval) =>
          approval.uid.toString().trim() === uid &&
          approval.vendor_firm_name.toString().trim() === vendorFirmName
      );

      if (matchingApproval) {
        if (status.toLowerCase() === 'approved' && !indentNoMap.has(indentNo)) {
          approvalCounter++;
          indentNoMap.set(indentNo, generateApprovedQuotationNo(approvalCounter));
        }
        approvedRowsData.push({
          uid,
          vendor_firm_name: vendorFirmName,
          indentNo,
          quotationNo: indentNoMap.get(indentNo) || '',
          rowData: row,
          rowIndex: index + 1,
        });
        console.log(
          `Collected row for UID ${uid}, Vendor ${vendorFirmName}, Indent ${indentNo}`
        );
      }
    });
    console.log(
      `Approved rows collected: ${approvedRowsData.length}, Indent Map:`,
      Array.from(indentNoMap.entries())
    );

    // PDF Generation
    let pdfUrlsByIndent = {};
    let pdfErrors = [];
    let indentGroups = {};
    if (status.toLowerCase() === 'approved' && approvedRowsData.length > 0) {
      console.log('=== STARTING PDF GENERATION ===');
      approvedRowsData.forEach((item) => {
        if (!indentGroups[item.indentNo]) {
          indentGroups[item.indentNo] = [];
        }
        indentGroups[item.indentNo].push(item);
      });
      console.log('Indent groups:', Object.keys(indentGroups));

      for (const [indentNo, group] of Object.entries(indentGroups)) {
        console.log(`Generating PDF for Indent ${indentNo} (${group.length} items)`);
        try {
          const quotationNo = indentNoMap.get(indentNo);
          const pdfDataUri = generateQuotationPDF(group, quotationNo, indentNo);
          console.log(`PDF data URI length for ${indentNo}: ${pdfDataUri.length}`);

          // Debug the data URI format
          console.log('PDF data URI sample:', pdfDataUri.substring(0, 50));

          // Extract base64 data
          const base64Prefix = 'data:application/pdf;base64,';
          if (!pdfDataUri.startsWith(base64Prefix)) {
            throw new Error('PDF data URI does not start with expected base64 prefix');
          }
          const base64Data = pdfDataUri.replace(base64Prefix, '');

          // Validate base64 data
          if (!base64Data || !/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
            throw new Error('Invalid base64 data for PDF');
          }

          console.log(`Uploading to Drive for ${indentNo}...`);
          const pdfBuffer = Buffer.from(base64Data, 'base64');
          const fileMetadata = {
            name: `quotation_${quotationNo}_${indentNo}_${Date.now()}.pdf`,
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
            mimeType: 'application/pdf',
          };
          const Readable = require('stream').Readable;
          const media = {
            mimeType: 'application/pdf',
            body: Readable.from(pdfBuffer),
          };

          const file = await drive.files.create({
            resource: fileMetadata,
            media,
            fields: 'id, webViewLink',
            supportsAllDrives: true,
          });
          const pdfUrl = file.data.webViewLink;
          console.log(`Upload success for ${indentNo}: ${pdfUrl}`);

          await drive.permissions.create({
            fileId: file.data.id,
            requestBody: { role: 'reader', type: 'anyone' },
            supportsAllDrives: true,
          });
          console.log(`Permissions set for ${indentNo}`);

          pdfUrlsByIndent[indentNo] = pdfUrl;
        } catch (pdfErr) {
          console.error(`PDF Error for ${indentNo}:`, pdfErr.message, pdfErr.stack);
          pdfErrors.push({ indentNo, error: pdfErr.message });
        }
      }
      console.log('=== PDF GENERATION END ===');
      console.log('PDF URLs generated:', pdfUrlsByIndent);
      if (pdfErrors.length > 0) {
        console.error('PDF Errors:', pdfErrors);
      }
    }

    // Second pass: Update rows based on UID and Vendor_Ferm_Name
    rows.forEach((row, index) => {
      if (index === 0) return; // Skip header
      const uid = row[uidColumnIndex]?.toString().trim() || '';
      const vendorFirmName = row[vendorFirmNameIndex]?.toString().trim() || '';
      const indentNo = row[indentNoIndex]?.toString().trim() || '';

      const matchingApproval = approvals.find(
        (approval) =>
          approval.uid.toString().trim() === uid &&
          approval.vendor_firm_name.toString().trim() === vendorFirmName
      );

      if (matchingApproval) {
        updates.push({
          range: `Quotation_Master!AF${index + 1}`,
          values: [[status]],
        });

        if (status.toLowerCase() === 'approved') {
          const quotationNo = indentNoMap.get(indentNo) || '';
          updates.push({
            range: `Quotation_Master!AG${index + 1}`,
            values: [[quotationNo]],
          });
          const pdfUrl = pdfUrlsByIndent[indentNo] || '';
          updates.push({
            range: `Quotation_Master!AH${index + 1}`,
            values: [[pdfUrl]],
          });

          console.log(
            `Prepared update for row ${index + 1}: UID ${uid}, Vendor ${vendorFirmName}, Quotation: ${quotationNo}, PDF: ${pdfUrl ? 'URL set' : 'No PDF'}`
          );
        }

        updatedCount++;
      }
    });

    if (updates.length === 0) {
      console.error('No matching quotations found');
      return res.status(404).json({
        error: `No matching quotations found. Provided: ${JSON.stringify(
          approvals
        )}.`,
      });
    }

    if (status.toLowerCase() === 'approved' && indentNoMap.size > 0) {
      console.log('Updating approval counter:', approvalCounter);
      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.SPREADSHEET_ID || spreadsheetId,
        range: 'Quotation_Master!AM1',
        valueInputOption: 'RAW',
        resource: { values: [[approvalCounter.toString()]] },
      });
    }

    console.log(`Batch updating ${updates.length} cells...`);
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: process.env.SPREADSHEET_ID || spreadsheetId,
      requestBody: {
        data: updates,
        valueInputOption: 'RAW',
      },
    });
    console.log('Batch update successful');

    const responseData = {
      message: `Updated ${updatedCount} rows. Generated PDFs: ${Object.keys(
        pdfUrlsByIndent
      ).length}/${Object.keys(indentGroups).length}`,
      pdfUrls: pdfUrlsByIndent,
      errors: pdfErrors.length > 0 ? pdfErrors : undefined,
      indentNosProcessed: Array.from(indentNoMap.keys()),
    };
    console.log('Response:', responseData);
    res.status(200).json(responseData);
  } catch (error) {
    console.error('=== MAJOR ERROR ===', error.message, error.stack);
    res.status(500).json({ error: 'Failed: ' + error.message, details: error.stack });
  }
  console.log('=== UPDATE APPROVAL END ===');
});

module.exports = router;