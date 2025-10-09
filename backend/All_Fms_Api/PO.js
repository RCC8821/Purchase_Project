const express = require('express');
const { sheets, spreadsheetId , drive} = require('../config/googleSheet');
const router = express.Router();
require('dotenv').config();

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

router.get('/get-po-data', async (req, res) => {
  try {
    const range = 'Purchase_FMS!B7:BJ'; // Adjusted to include up to BJ column (PLANNED_7 and ACTUAL_7)

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

    // Define headers with their expected column positions (0-based index relative to B)
    const headers = [
      { key: 'PLANNED_7', column: 56 }, // Column BI
      { key: 'UID', column: 0 }, // Column B
      { key: 'Req_No', column: 1 }, // Column C
      { key: 'Site_Name', column: 2 }, // Column D
      { key: 'Material_Type', column: 4 }, // Column F
      { key: 'SKU_Code', column: 5 }, // Column G
      { key: 'Material_Name', column: 6 }, // Column H
      { key: 'Require_Date', column: 10 }, // Column L
      { key: 'REVISED_QUANTITY_2', column: 15 }, // Column Q
      { key: 'Unit_Name', column: 8 }, // Column J
      { key: 'DECIDED_BRAND/COMPANY_NAME_2', column: 16 }, // Column R
      { key: 'INDENT_NUMBER_3', column: 23 }, // Column Y
      { key: 'PDF_URL_3', column: 24 }, // Column Z
      { key: 'QUOTATION_NO_5', column: 36 }, // Column AK
      { key: 'Vendor_Name_5', column: 37 }, // Column AL
      { key: 'Vendor_Ferm_Name_5', column: 38 }, // Column AM
      { key: 'Vendor_Address_5', column: 39 }, // Column AN
      { key: 'Vendor_GST_No_5', column: 41 }, // Column AP
      { key: 'Rate_5', column: 42 }, // Column AQ
      { key: 'CGST_5', column: 44 }, // Column AS
      { key: 'SGST_5', column: 45 }, // Column AT
      { key: 'IGST_5', column: 46 }, // Column AU
      { key: 'FINAL_RATE_5', column: 47 }, // Column AV
      { key: 'TOTAL_VALUE_5', column: 48 }, // Column AW
      { key: 'APPROVAL_5', column: 49 }, // Column AX
      { key: 'IS_TRANSPORT_REQUIRED', column: 50 }, // Column AY
      { key: 'EXPECTED_TRANSPORT_CHARGES', column: 51 }, // Column AZ
      { key: 'FRIGHET_CHARGES', column: 52 }, // Column BA
      { key: 'EXPECTED_FRIGHET_CHARGES', column: 53 }, // Column BB
      { key: 'PDF_URL_5', column: 54 }, // Column BC
      { key: 'ACTUAL_7', column: 57 }, // Column BJ
    ];

    // Validate PLANNED_7 and ACTUAL_7 columns
    const planned7Index = headers.find(h => h.key === 'PLANNED_7')?.column;
    const actual7Index = headers.find(h => h.key === 'ACTUAL_7')?.column;
    if (planned7Index === undefined || actual7Index === undefined) {
      console.error('Required columns not found in headers');
      return res.status(500).json({
        error: 'Invalid sheet structure',
        details: 'PLANNED_7 or ACTUAL_7 column missing',
      });
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

        // Check PLANNED_7 and ACTUAL_7
        const planned7 = row[planned7Index]?.trim() || '';
        const actual7 = row[actual7Index]?.trim() || '';
        console.log(
          `Row ${index + 8} - PLANNED_7: "${planned7}", ACTUAL_7: "${actual7}", Full row: ${JSON.stringify(row)}`
        );

        // Skip if PLANNED_7 is empty or ACTUAL_7 is non-empty
        if (!planned7 || actual7) {
          console.log(
            `Skipping row ${index + 8} - Reason: ${
              !planned7 ? `Empty PLANNED_7="${planned7}"` : ''
            }${!planned7 && actual7 ? ' and ' : ''}${
              actual7 ? `Non-empty ACTUAL_7="${actual7}"` : ''
            }`
          );
          return null;
        }

        validRowCount++;
        const obj = {};
        headers.forEach(({ key, column }) => {
          const rawValue = row[column];
          const trimmed = rawValue?.trim() ?? '';
          obj[key] = trimmed;
        });
        return obj;
      })
      .filter(obj => obj && Object.entries(obj).some(([key, value]) => value !== ''));

    console.log(`Rows with PLANNED_7 non-empty and ACTUAL_7 empty: ${validRowCount}`);
    console.log('Final formData:', JSON.stringify(formData, null, 2));

    if (!formData.length) {
      console.log('No valid data found after filtering');
      return res.status(404).json({
        error: 'No valid data found after filtering',
        details: validRowCount === 0
          ? 'No rows have PLANNED_7 non-empty and ACTUAL_7 empty in columns BI and BJ'
          : 'All rows with PLANNED_7 non-empty and ACTUAL_7 empty are empty in other columns',
      });
    }

    return res.json({ data: formData });
  } catch (error) {
    console.error('Error fetching data:', error.message, error.stack);
    return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});


async function generatePONumber(spreadsheetId, sheetName) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!BI:BI`,
    });
    const rows = response.data.values || [];
    let lastPONumber = 0;
    if (rows.length > 0) {
      const lastRow = rows[rows.length - 1][0];
      if (lastRow && lastRow.startsWith('PO_')) {
        lastPONumber = parseInt(lastRow.replace('PO_', ''), 10) || 0;
      }
    }
    const newPONumber = `PO_${String(lastPONumber + 1).padStart(3, '0')}`;
    return newPONumber;
  } catch (error) {
    console.error('Error generating PO number:', error.message);
    throw new Error('Failed to generate PO number');
  }
}

// Updated PDF Generation Function
const generateQuotationPDF = (approvedItems, quotationNo, indentNo, expectedDeliveryDate) => {
  console.log(`Generating PDF: Quotation ${quotationNo}, Indent ${indentNo}, Items: ${approvedItems.length}, Delivery Date: ${expectedDeliveryDate}`);
  const doc = new jsPDF();
  if (typeof doc.autoTable !== 'function') {
    throw new Error('autoTable plugin not loaded');
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const cleanText = (text) => (text || 'N/A').toString().trim().replace(/[^a-zA-Z0-9\s\-\/.,]/g, '');

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
  // doc.setTextColor(220, 53, 69);
  doc.text('Purchase Order', pageWidth / 2, 50, { align: 'center' });

  doc.setDrawColor(220, 53, 69);
  doc.setLineWidth(1);
  doc.line(15, 53, pageWidth - 15, 53);

  // PO Information (Two-column layout)
  doc.setFontSize(10);
  const infoY = 60;
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).replace(/ /g, '-');

  const firstItem = approvedItems[0] || {};
  const vendorName = cleanText(firstItem.vendorFirm || '');
  const vendorAddress = cleanText(firstItem.vendorAddress || '');
  const vendorContact = cleanText(firstItem.vendorContact || '');
  const siteName = cleanText(firstItem.siteName || '');
  const siteLocation = cleanText(firstItem.siteLocation || '');
  const supervisorName = cleanText(firstItem.supervisorName || '');
  const supervisorContact = cleanText(firstItem.supervisorContact || '');

  doc.setFont('helvetica', 'bold');
  doc.text('PO Number:', 15, infoY);
  doc.setFont('helvetica', 'normal');
  doc.text(cleanText(quotationNo), 50, infoY);

  doc.setFont('helvetica', 'bold');
  doc.text('PO Date:', pageWidth / 2 + 15, infoY);
  doc.setFont('helvetica', 'normal');
  doc.text(currentDate, pageWidth / 2 + 50, infoY);

  doc.setFont('helvetica', 'bold');
  doc.text('Indent No:', 15, infoY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(cleanText(indentNo), 50, infoY + 8);

  doc.setFont('helvetica', 'bold');
  doc.text('Quotation No:', pageWidth / 2 + 15, infoY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(cleanText(quotationNo), pageWidth / 2 + 50, infoY + 8); // Using quotationNo as a placeholder

  doc.setFont('helvetica', 'bold');
  doc.text('Vendor:', 15, infoY + 16);
  doc.setFont('helvetica', 'normal');
  doc.text(vendorName, 50, infoY + 16);

  doc.setFont('helvetica', 'bold');
  doc.text('Vendor Contact:', pageWidth / 2 + 15, infoY + 16);
  doc.setFont('helvetica', 'normal');
  doc.text(vendorContact, pageWidth / 2 + 50, infoY + 16);

  doc.setFont('helvetica', 'bold');
  doc.text('Vendor Address:', 15, infoY + 24);
  doc.setFont('helvetica', 'normal');
  doc.text(vendorAddress, 50, infoY + 24);

  doc.setFont('helvetica', 'bold');
  doc.text('GST No:', pageWidth / 2 + 15, infoY + 24);
  doc.setFont('helvetica', 'normal');
  doc.text(cleanText(firstItem.vendorGST || ''), pageWidth / 2 + 50, infoY + 24);

  doc.setFont('helvetica', 'bold');
  doc.text('Site Name:', 15, infoY + 32);
  doc.setFont('helvetica', 'normal');
  doc.text(siteName, 50, infoY + 32);

  doc.setFont('helvetica', 'bold');
  doc.text('Site Location:', pageWidth / 2 + 15, infoY + 32);
  doc.setFont('helvetica', 'normal');
  doc.text(siteLocation, pageWidth / 2 + 50, infoY + 32);

  doc.setFont('helvetica', 'bold');
  doc.text('Supervisor Name:', 15, infoY + 40);
  doc.setFont('helvetica', 'normal');
  doc.text(supervisorName, 50, infoY + 40);

  doc.setFont('helvetica', 'bold');
  doc.text('Supervisor Contact:', pageWidth / 2 + 15, infoY + 40);
  doc.setFont('helvetica', 'normal');
  doc.text(supervisorContact, pageWidth / 2 + 50, infoY + 40);

  doc.setFont('helvetica', 'bold');
  doc.text('Expected Delivery:', 15, infoY + 48);
  doc.setFont('helvetica', 'normal');
  doc.text(cleanText(expectedDeliveryDate), 50, infoY + 48);

  // Order Details Header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 53, 69);
  doc.text('Order Details', 15, infoY + 60);

  // Prepare table data
  const tableBody = approvedItems.map((item, index) => [
    index + 1,
    cleanText(item.materialName || ''),
    cleanText(item.quantity || ''),
    cleanText(item.unit || ''),
    cleanText(item.rate || ''),
    cleanText(item.cgst || ''),
    cleanText(item.sgst || ''),
    cleanText(item.igst || ''),
    cleanText(item.finalRate || ''),
    cleanText(item.totalValue || ''),
  ]);

  // Table configuration
  doc.autoTable({
    head: [['S.No.', 'Material Name', 'Quantity', 'Unit', 'Rate', 'CGST', 'SGST', 'IGST', 'Final Rate', 'Total Value']],
    body: tableBody,
    startY: infoY + 65,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3, font: 'helvetica', textColor: [0, 0, 0], lineColor: [200, 200, 200], lineWidth: 0.1, overflow: 'linebreak' },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9, halign: 'center', cellPadding: 4 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 35 },
      2: { halign: 'center', cellWidth: 15 },
      3: { halign: 'center', cellWidth: 15 },
      4: { halign: 'right', cellWidth: 20 },
      5: { halign: 'center', cellWidth: 15 },
      6: { halign: 'center', cellWidth: 15 },
      7: { halign: 'center', cellWidth: 15 },
      8: { halign: 'right', cellWidth: 20 },
      9: { halign: 'right', cellWidth: 20 },
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { top: infoY + 65, left: 15, right: 15 },
    tableWidth: 'auto',
    pageBreak: 'auto',
    showHead: 'everyPage',
    didDrawPage: (data) => {
      const grandTotal = tableBody.reduce((sum, row) => sum + (parseFloat(row[9]) || 0), 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Grand Total: ${grandTotal.toFixed(2)}`, 15, data.cursor.y + 10);
    },
  });

  // Transport Details
  const tableEndY = doc.lastAutoTable.finalY || infoY + 70;
  const transportY = tableEndY + 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 53, 69);
  doc.text('Transport Details', 15, transportY);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`Transport Required: ${cleanText(firstItem.transportRequired || '')}`, 15, transportY + 10);
  doc.text(`Expected Transport Charges: ${cleanText(firstItem.transportCharges || '')}`, pageWidth / 2 + 15, transportY + 10);

  doc.text(`Freight Charges: ${cleanText(firstItem.freightCharges || '')}`, 15, transportY + 18);
  doc.text(`Expected Freight Charges: ${cleanText(firstItem.freightCost || '')}`, pageWidth / 2 + 15, transportY + 18);

  // Payment Details
  const paymentY = transportY + 30;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 53, 69);
  doc.text('Payment Details', 15, paymentY);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`Payment Terms: ${cleanText(firstItem.paymentTerms || '')}`, 15, paymentY + 10);
  doc.text(`Credit Days: ${cleanText(firstItem.creditDays || '')}`, pageWidth / 2 + 15, paymentY + 10);

  doc.text(`Bill Type: ${cleanText(firstItem.billType || '')}`, 15, paymentY + 18);

  // Footer
  const footerY = Math.max(paymentY + 40, pageHeight - 60);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Authorized Signature', pageWidth - 50, footerY);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(pageWidth - 60, footerY + 5, pageWidth - 20, footerY + 5);

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('This document is auto-generated by the computer system. Therefore, no signature is required.', 15, footerY + 15);

  doc.setFontSize(8);
  doc.text('@ 2025 R.C.C Infrastructures. All Rights Reserved.', pageWidth / 2, footerY + 25, { align: 'center' });

  // Page border
  // doc.setDrawColor(220, 53, 69);
  // doc.setLineWidth(2);
  // doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  const pdfBuffer = doc.output('arraybuffer');
  const base64Data = Buffer.from(pdfBuffer).toString('base64');
  return `data:application/pdf;base64,${base64Data}`;
};

// // POST: Create PO
router.post('/create-po', async (req, res) => {
  console.log('=== CREATE PO START ===');
  console.log('Received request:', req.body);
  const { quotationNo, expectedDeliveryDate, items, siteName, vendorName, vendorAddress, vendorGST } = req.body;

  // Validate required fields
  if (!quotationNo || !expectedDeliveryDate || !items || items.length === 0) {
    console.error('Validation error: Missing required fields');
    return res.status(400).json({ error: 'Quotation number, delivery date, and items are required' });
  }

  try {
    // Validate environment variables and Google Drive API
    if (!drive || !drive.files) {
      throw new Error('Google Drive API client not initialized');
    }
    if (!process.env.GOOGLE_DRIVE_FOLDER_ID) {
      throw new Error('GOOGLE_DRIVE_FOLDER_ID not set in environment variables');
    }
    if (!process.env.SPREADSHEET_ID) {
      throw new Error('SPREADSHEET_ID not set in environment variables');
    }

    // Group items by indentNo
    const indentGroups = {};
    items.forEach(item => {
      if (!indentGroups[item.indentNo]) {
        indentGroups[item.indentNo] = [];
      }
      indentGroups[item.indentNo].push(item);
    });

    let pdfUrl = null;
    let pdfErrors = [];
    let poNumber = null;

    // Generate PO number
    poNumber = await generatePONumber(process.env.SPREADSHEET_ID, 'Purchase_fms');
    console.log(`Generated PO Number: ${poNumber}`);

    console.log('=== STARTING PDF GENERATION ===');
    for (const [indentNo, group] of Object.entries(indentGroups)) {
      console.log(`Generating PDF for Indent ${indentNo} (${group.length} items)`);
      try {
        // Generate PDF
        const pdfDataUri = generateQuotationPDF(group, quotationNo, indentNo, expectedDeliveryDate);
        console.log(`PDF data URI length for ${indentNo}: ${pdfDataUri.length}`);

        const base64Prefix = 'data:application/pdf;base64,';
        if (!pdfDataUri.startsWith(base64Prefix)) {
          throw new Error('PDF data URI does not start with expected base64 prefix');
        }
        const base64Data = pdfDataUri.replace(base64Prefix, '');

        if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
          throw new Error('Invalid base64 data for PDF');
        }

        const pdfBuffer = Buffer.from(base64Data, 'base64');
        const fileMetadata = {
          name: `po_${quotationNo}_${indentNo}_${Date.now()}.pdf`,
          parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
          mimeType: 'application/pdf',
        };
        const Readable = require('stream').Readable;
        const media = {
          mimeType: 'application/pdf',
          body: Readable.from(pdfBuffer),
        };

        // Upload PDF to Google Drive
        const file = await drive.files.create({
          resource: fileMetadata,
          media,
          fields: 'id, webViewLink',
          supportsAllDrives: true,
        });
        pdfUrl = file.data.webViewLink;

        await drive.permissions.create({
          fileId: file.data.id,
          requestBody: { role: 'reader', type: 'anyone' },
          supportsAllDrives: true,
        });
        console.log(`Upload success for ${indentNo}: ${pdfUrl}`);

        // Find the row with matching quotationNo in column AL (index 37)
        const sheetResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.SPREADSHEET_ID,
          range: 'Purchase_fms!A:BK',
        });
        const rows = sheetResponse.data.values || [];
        let rowIndex = -1;

        // Search for the row where column AL (index 37) matches quotationNo
        for (let i = 0; i < rows.length; i++) {
          if (rows[i][37] && rows[i][37].toString().trim() === quotationNo.toString().trim()) {
            rowIndex = i;
            break;
          }
        }

        // If no matching row is found, return an error
        if (rowIndex === -1) {
          console.error(`No matching row found for quotationNo: ${quotationNo}`);
          return res.status(400).json({
            error: `No matching quotation number '${quotationNo}' found in the sheet`,
          });
        }

        // Prepare the data to update only columns BH, BI, BJ
        const values = [[poNumber, pdfUrl, expectedDeliveryDate]]; // BH=poNumber, BI=pdfUrl, BJ=expectedDeliveryDate

        // Update only columns BH to BJ in the matching row
        await sheets.spreadsheets.values.update({
          spreadsheetId: process.env.SPREADSHEET_ID,
          range: `Purchase_fms!BI${rowIndex + 1}:BK${rowIndex + 1}`, // Update only BH:BJ
          valueInputOption: 'RAW',
          resource: { values },
        });
        console.log(`Updated columns BI:BK in row ${rowIndex + 1} in Google Sheets for PO ${poNumber}, Indent ${indentNo}`);
      } catch (pdfErr) {
        console.error(`PDF Error for ${indentNo}:`, pdfErr.message, pdfErr.stack);
        pdfErrors.push({ indentNo, error: pdfErr.message });
      }
    }
    console.log('=== PDF GENERATION END ===');

    // Handle errors if PDF generation failed for all indents
    if (!pdfUrl && pdfErrors.length > 0) {
      return res.status(500).json({ error: 'Failed to generate PDF', details: pdfErrors });
    }

    const responseData = {
      message: `PO generated successfully for ${Object.keys(indentGroups).length} indent(s)`,
      poNumber,
      pdfUrl: pdfUrl || null,
      errors: pdfErrors.length > 0 ? pdfErrors : undefined,
    };
    console.log('Response:', responseData);
    res.status(200).json(responseData);

  } catch (error) {
    console.error('=== MAJOR ERROR ===', error.message, error.stack);
    res.status(500).json({ error: 'Failed to create PO: ' + error.message, details: error.stack });
  }
  console.log('=== CREATE PO END ===');
});




module.exports = router