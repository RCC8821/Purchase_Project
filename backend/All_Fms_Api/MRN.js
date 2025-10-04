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



// get MRN APi 
router.get('/get-MRN-Data', async (req, res) => {
  try {
    // Fetch data from Purchase_FMS sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!A8:CE', // Range from A8 to CE
    });

    let data = response.data.values || [];

    // Filter and transform data based on PLANNED 11 and ACTUAL 11
    const filteredData = data
      .filter(row => {
        const planned11 = row[81] || ''; // Column CD (82nd column, 0-based index) for PLANNED 11
        const actual11 = row[82] || ''; // Column CE (83rd column, 0-based index) for ACTUAL 11
        return planned11 && !actual11; // Include row if PLANNED 11 has data and ACTUAL 11 is empty
      })
      .map(row => ({
        UID: row[1] || '', // Column B (assumed)
        reqNo: row[2] || '', // Column C
        siteName: row[3] || '', // Column D (assumed)
        supervisorName: row[4] || '', // Column E (assumed)
        materialType: row[5] || '', // Column F (assumed)
        skuCode: row[6] || '', // Column G (assumed)
        materialName: row[7] || '', // Column H (assumed)
        revisedQuantity: row[16] || '', // Column Q for Revised Quantity 2
        unitName: row[9] || '', // Column I (assumed)
        purpose: row[10] || '', // Column J (assumed)
        pdfUrl3: row[25] || '', // Column L (assumed)
        pdfUrl5: row[55] || '', // Column N (assumed)
        pdfUrl7: row[61] || '', // Column P (assumed)
        finalReceivedQuantity9: row[75] || '', // Column J (assumed)
        vendorFermName5: row[38] || '', // Column M (assumed)
        indentNumber3: row[24] || '', // Column O (assumed)
        poNumber7: row[60] || '' // Column Q (assumed, may need adjustment)
      }));

    res.json({
      success: true,
      data: filteredData
    });
  } catch (error) {
    console.error('Error fetching filtered data:', error);
    res.status(500).json({ error: 'Failed to fetch filtered data' });
  }
});


// PDF Generation Function for MRN
const generateMRNPDF = (rowData, mrnNo, poNumber, indentNo, deliveryDate, finalReceivedQuantity, challanNo, vehicleNo) => {
  const doc = new jsPDF();
  if (typeof doc.autoTable !== 'function') {
    throw new Error('autoTable plugin not loaded');
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const cleanText = (text) => (text || '-').toString().trim().replace(/[^a-zA-Z0-9\s\-\/.,]/g, '');

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
  doc.text('Material Receipt Note', pageWidth / 2, 50, { align: 'center' });

  doc.setDrawColor(220, 53, 69);
  doc.setLineWidth(1);
  doc.line(15, 53, pageWidth - 15, 53);

  // MRN Information (Two-column layout)
  doc.setFontSize(10);
  const infoY = 60;
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).replace(/ /g, '-');

  const vendorName = cleanText(rowData.vendorName);
  const siteName = cleanText(rowData.siteName);

  doc.setFont('helvetica', 'bold');
  doc.text('MRN Number:', 15, infoY);
  doc.setFont('helvetica', 'normal');
  doc.text(cleanText(mrnNo), 50, infoY);

  doc.setFont('helvetica', 'bold');
  doc.text('MRN Date:', pageWidth / 2 + 15, infoY);
  doc.setFont('helvetica', 'normal');
  doc.text(currentDate, pageWidth / 2 + 50, infoY);

  doc.setFont('helvetica', 'bold');
  doc.text('PO No:', 15, infoY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(cleanText(poNumber), 50, infoY + 8);

  doc.setFont('helvetica', 'bold');
  doc.text('Indent No:', pageWidth / 2 + 15, infoY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(cleanText(indentNo), pageWidth / 2 + 50, infoY + 8);

  doc.setFont('helvetica', 'bold');
  doc.text('Vendor Name:', 15, infoY + 16);
  doc.setFont('helvetica', 'normal');
  doc.text(vendorName, 50, infoY + 16);

  doc.setFont('helvetica', 'bold');
  doc.text('Site Name:', pageWidth / 2 + 15, infoY + 16);
  doc.setFont('helvetica', 'normal');
  doc.text(siteName, pageWidth / 2 + 50, infoY + 16);

  doc.setFont('helvetica', 'bold');
  doc.text('Delivery Date:', 15, infoY + 24);
  doc.setFont('helvetica', 'normal');
  doc.text(cleanText(deliveryDate), 50, infoY + 24);

  // Material Details Header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 53, 69);
  doc.text('Material Details', 15, infoY + 40);

  // Prepare table data
  const tableBody = [[
    1,
    cleanText(rowData.materialType),
    cleanText(rowData.skuCode),
    cleanText(rowData.materialName),
    cleanText(rowData.brand),
    cleanText(finalReceivedQuantity),
    cleanText(challanNo),
    cleanText(vehicleNo)
  ]];

  // Table configuration
  doc.autoTable({
    head: [['Sr No.', 'Material Type', 'SKU', 'Material Name', 'Brand', 'Final Received Quantity', 'Challan No.', 'Vehicle No.']],
    body: tableBody,
    startY: infoY + 45,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3, font: 'helvetica', textColor: [0, 0, 0], lineColor: [200, 200, 200], lineWidth: 0.1, overflow: 'linebreak' },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9, halign: 'center', cellPadding: 4 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 25 },
      2: { halign: 'center', cellWidth: 20 },
      3: { cellWidth: 40 },
      4: { halign: 'center', cellWidth: 20 },
      5: { halign: 'right', cellWidth: 25 },
      6: { halign: 'center', cellWidth: 25 },
      7: { halign: 'center', cellWidth: 25 },
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { top: infoY + 45, left: 15, right: 15 },
    tableWidth: 'auto',
    pageBreak: 'auto',
    showHead: 'everyPage',
  });

  // Footer
  const footerY = Math.max(doc.lastAutoTable.finalY + 20, pageHeight - 60);
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

  const pdfBuffer = doc.output('arraybuffer');
  const base64Data = Buffer.from(pdfBuffer).toString('base64');
  return `data:application/pdf;base64,${base64Data}`;
};

// Function to generate MRN number
async function generateMRNNumber(spreadsheetId, sheetName) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!CG:CG`,
    });
    const rows = response.data.values || [];
    let maxNum = 0;
    rows.forEach(row => {
      if (row[0] && row[0].startsWith('MRN_')) {
        const num = parseInt(row[0].substring(4), 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    return `MRN_${String(maxNum + 1).padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating MRN number:', error);
    throw error;
  }
}

// POST: Save MRN Data
router.post('/save-MRN-data', async (req, res) => {
  console.log('=== SAVE MRN DATA START ===');
  console.log('Received request:', req.body);
  const { poNumber, finalReceivedQuantity , } = req.body;

  // Validate required fields
  if (!poNumber || !finalReceivedQuantity ) {
    console.error('Validation error: Missing required fields');
    return res.status(400).json({ error: 'PO number, final received quantity, and delivery date are required' });
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

    // Generate MRN number
    const mrnNo = await generateMRNNumber(process.env.SPREADSHEET_ID, 'Purchase_fms');
    console.log(`Generated MRN Number: ${mrnNo}`);

    // Find the row with matching poNumber in column BI (index 60)
    const sheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Purchase_fms!A:CJ',
    });
    const rows = sheetResponse.data.values || [];
    let rowIndex = -1;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][60] && rows[i][60].toString().trim() === poNumber.toString().trim()) {
        rowIndex = i;
        break;
      }
    }

    // If no matching row is found, return an error
    if (rowIndex === -1) {
      console.error(`No matching row found for poNumber: ${poNumber}`);
      return res.status(400).json({
        error: `No matching PO number '${poNumber}' found in the sheet`,
      });
    }

    const row = rows[rowIndex];

    // Extract data from row for PDF dynamically
    const rowData = {
      siteName: row[3] || '-',
      vendorName: row[12] || '-',
      materialType: row[5] || '-',
      skuCode: row[6] || '-',
      materialName: row[7] || '-',
      brand: row[10] || '-',
    };
    const indentNo = row[14] || '-';

    // Generate PDF
    const pdfDataUri = generateMRNPDF(rowData, mrnNo, poNumber, indentNo,  finalReceivedQuantity, );
    console.log(`PDF data URI length: ${pdfDataUri.length}`);

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
      name: `mrn_${mrnNo}_${Date.now()}.pdf`,
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
    const pdfUrl = file.data.webViewLink;

    await drive.permissions.create({
      fileId: file.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
      supportsAllDrives: true,
    });
    console.log(`Upload success: ${pdfUrl}`);

    // Prepare the data to update columns CF to CJ
    const values = [['Done', mrnNo, pdfUrl, '', finalReceivedQuantity]];  // CF=Done, CG=MRN No, CH=PDF URL, CI=empty, CJ=Final Received Quantity

    // Update columns CF to CJ in the matching row
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `Purchase_fms!CF${rowIndex + 1}:CJ${rowIndex + 1}`,
      valueInputOption: 'RAW',
      resource: { values },
    });
    console.log(`Updated columns CF:CJ in row ${rowIndex + 1} in Google Sheets for MRN ${mrnNo}`);

    const responseData = {
      message: 'MRN data saved successfully',
      mrnNo,
      pdfUrl,
    };
    console.log('Response:', responseData);
    res.status(200).json(responseData);

  } catch (error) {
    console.error('=== MAJOR ERROR ===', error.message, error.stack);
    res.status(500).json({ error: 'Failed to save MRN data: ' + error.message, details: error.stack });
  }
  console.log('=== SAVE MRN DATA END ===');
});


module.exports= router