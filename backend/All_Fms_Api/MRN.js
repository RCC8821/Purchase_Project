
//////////////////////////////////////////////////////////////////////////////////////

const express = require('express');
const { sheets, spreadsheetId, drive } = require('../config/googleSheet');
const router = express.Router();
require('dotenv').config();
const retry = require('async-retry');
const { jsPDF } = require('jspdf');

// Apply jspdf-autotable
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

// Test jsPDF and autoTable
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

// GET: Fetch MRN Data
router.get('/get-MRN-Data', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_fms!A8:CJ',
    });

    let data = response.data.values || [];

    const filteredData = data
      .filter(row => {
        const planned11 = row[81] || '';
        const actual11 = row[82] || '';
        return planned11 && !actual11;
      })
      .map(row => ({
        UID: row[1] || '',
        reqNo: row[2] || '',
        siteName: row[3] || '',
        supervisorName: row[4] || '',
        materialType: row[5] || '',
        skuCode: row[6] || '',
        materialName: row[7] || '',
        revisedQuantity: row[16] || '',
        unitName: row[9] || '',
        purpose: row[10] || '',
        pdfUrl3: row[25] || '',
        pdfUrl5: row[55] || '',
        pdfUrl7: row[61] || '',
        finalReceivedQuantity9: row[75] || '',
        vendorFirmName5: row[39] || '',
        indentNumber3: row[24] || '',
        poNumber7: row[60] || '',
        deliveryDate: row[62] || '',
        Challan_No: row[15] || '',
      }));

    res.json({
      success: true,
      data: filteredData,
    });
    console.log('Filtered data:', filteredData);
  } catch (error) {
    console.error('Error fetching filtered data:', error);
    res.status(500).json({ error: 'Failed to fetch filtered data' });
  }
});

// Function to clean text and ensure only English characters for siteName
const cleanText = (text, isSiteName = false) => {
  if (!text || text === '') return '-';
  let cleaned = text.toString().trim();
  if (isSiteName) {
    cleaned = cleaned.replace(/[^a-zA-Z0-9\s.,-]/g, '');
  }
  return cleaned || '-';
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

// PDF Generation Function for MRN
const generateMRNPDF = (rowDatas, mrnNo, poNumber, indentNo, deliveryDate) => {
  const doc = new jsPDF();
  if (typeof doc.autoTable !== 'function') {
    throw new Error('autoTable plugin not loaded');
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const tableStartY = 105;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('R.C.C Infrastructures', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('310 Saket Nagar, 9B Near Sagar Public School, Bhopal, 462026', pageWidth / 2, 22, { align: 'center' });
  doc.text('Contact: 9753432126 | Email: mayank@rcinfrastructure.com', pageWidth / 2, 28, { align: 'center' });
  doc.text('GST: 23ABHFR3130L1ZA', pageWidth / 2, 34, { align: 'center' });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Material Receipt Note', pageWidth / 2, 50, { align: 'center' });

  doc.setDrawColor(220, 53, 69);
  doc.setLineWidth(1);
  doc.line(margin, 53, pageWidth - margin, 53);

  doc.setFontSize(10);
  const infoY = 60;
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).replace(/ /g, '-');

  const vendorName = cleanText(rowDatas[0]?.vendorName || '-');
  const siteName = cleanText(rowDatas[0]?.siteName || '-', true);
  const pdfDeliveryDate = cleanText(deliveryDate || '-');

  doc.setFont('helvetica', 'bold');
  doc.text('MRN Number:', margin, infoY);
  doc.setFont('helvetica', 'normal');
  doc.text(cleanText(mrnNo), margin + 35, infoY);

  doc.setFont('helvetica', 'bold');
  doc.text('MRN Date:', pageWidth / 2 + 15, infoY);
  doc.setFont('helvetica', 'normal');
  doc.text(currentDate, pageWidth / 2 + 50, infoY);

  doc.setFont('helvetica', 'bold');
  doc.text('PO No:', margin, infoY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(cleanText(poNumber), margin + 35, infoY + 8);

  doc.setFont('helvetica', 'bold');
  doc.text('Indent No:', pageWidth / 2 + 15, infoY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(cleanText(indentNo), pageWidth / 2 + 50, infoY + 8);

  doc.setFont('helvetica', 'bold');
  doc.text('Vendor Name:', margin, infoY + 16);
  doc.setFont('helvetica', 'normal');
  doc.text(vendorName, margin + 35, infoY + 16);

  doc.setFont('helvetica', 'bold');
  doc.text('Site Name:', pageWidth / 2 + 15, infoY + 16);
  doc.setFont('helvetica', 'normal');
  doc.text(siteName, pageWidth / 2 + 50, infoY + 16);

  doc.setFont('helvetica', 'bold');
  doc.text('Delivery Date:', margin, infoY + 24);
  doc.setFont('helvetica', 'normal');
  doc.text(pdfDeliveryDate, margin + 35, infoY + 24);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 53, 69);
  doc.text('Material Details', margin, infoY + 40);

  const tableBody = rowDatas.map((rowData, index) => [
    index + 1,
    cleanText(rowData.uid),
    cleanText(rowData.materialType),
    cleanText(rowData.skuCode),
    cleanText(rowData.materialName),
    cleanText(rowData.unit),
    cleanText(rowData.brand),
    cleanText(rowData.finalReceivedQuantity),
    cleanText(rowData.challanNo), // Will now contain comma-separated challan numbers
    cleanText(rowData.vehicleNo),
  ]);

  doc.autoTable({
    head: [['Sr No.', 'UID', 'Material Type', 'SKU', 'Material Name', 'Unit', 'Brand', 'Final Received Quantity', 'Challan No.', 'Vehicle No.']],
    body: tableBody,
    startY: tableStartY,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 2,
      font: 'helvetica',
      textColor: [0, 0, 0],
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
      overflow: 'linebreak',
      halign: 'center',
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 18 },
      2: { cellWidth: 20 },
      3: { cellWidth: 18 },
      4: { cellWidth: 30 },
      5: { cellWidth: 12 },
      6: { cellWidth: 18 },
      7: { cellWidth: 20 },
      8: { cellWidth: 25 }, // Increased width to accommodate multiple challan numbers
      9: { cellWidth: 20 },
    },
    margin: { top: tableStartY, left: margin, right: margin },
    tableWidth: pageWidth - (2 * margin),
    pageBreak: 'auto',
    showHead: 'everyPage',
    didDrawPage: (data) => {
      const footerY = pageHeight - 60;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Authorized Signature', pageWidth - 50, footerY);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(pageWidth - 60, footerY + 5, pageWidth - 20, footerY + 5);

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        'This document is auto-generated by the computer system. Therefore, no signature is required.',
        margin,
        footerY + 15,
        { align: 'left' }
      );

      doc.text('@ 2025 R.C.C Infrastructures. All Rights Reserved.', pageWidth / 2, footerY + 25, {
        align: 'center',
      });
    },
  });

  const pdfBuffer = doc.output('arraybuffer');
  const base64Data = Buffer.from(pdfBuffer).toString('base64');
  return `data:application/pdf;base64,${base64Data}`;
};

router.post('/save-MRN-data', async (req, res) => {
  console.log('=== SAVE MRN DATA START ===');
  console.log('Received request:', req.body);
  const { poNumber, finalReceivedQuantities = [], challanNo, vehicleNo, deliveryDate, purchaseFmsUIDs = [] } = req.body;

  try {
    if (!drive || !drive.files) {
      throw new Error('Google Drive API client not initialized');
    }
    if (!process.env.GOOGLE_DRIVE_FOLDER_ID) {
      throw new Error('GOOGLE_DRIVE_FOLDER_ID not set in environment variables');
    }
    if (!process.env.SPREADSHEET_ID) {
      throw new Error('SPREADSHEET_ID not set in environment variables');
    }

    if (!Array.isArray(purchaseFmsUIDs) || purchaseFmsUIDs.length === 0) {
      throw new Error('purchaseFmsUIDs must be a non-empty array in the request body');
    }

    if (!Array.isArray(finalReceivedQuantities) || finalReceivedQuantities.length !== purchaseFmsUIDs.length) {
      throw new Error('finalReceivedQuantities must be an array with the same length as purchaseFmsUIDs');
    }

    const mrnNo = await retry(
      async () => await generateMRNNumber(process.env.SPREADSHEET_ID, 'Purchase_fms'),
      { retries: 3, factor: 2, minTimeout: 1000, maxTimeout: 5000 }
    );
    console.log(`Generated MRN Number: ${mrnNo}`);

    const sheetResponse = await retry(
      async () => await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'Purchase_fms!A:CJ',
      }),
      { retries: 3, factor: 2, minTimeout: 1000, maxTimeout: 5000 }
    );
    const rows = sheetResponse.data.values || [];
    const rowIndices = [];
    const rowDatas = [];
    let indentNo = '-';
    let commonDeliveryDate = deliveryDate || '-';

    // Fetch all challan numbers from Material_Received sheet
    const materialResponse = await retry(
      async () => await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'Material_Received!A:P',
      }),
      { retries: 3, factor: 2, minTimeout: 1000, maxTimeout: 5000 }
    );
    const materialRows = materialResponse.data.values || [];
    const uidToChallanMap = new Map();
    materialRows.forEach(row => {
      if (row[1] && row[15]) { // Column B (UID) and Column P (Challan No)
        const uid = row[1].toString().trim();
        const challanNo = row[15].toString().trim();
        if (uidToChallanMap.has(uid)) {
          uidToChallanMap.get(uid).add(challanNo);
        } else {
          uidToChallanMap.set(uid, new Set([challanNo]));
        }
      }
    });

    for (let uidIndex = 0; uidIndex < purchaseFmsUIDs.length; uidIndex++) {
      const purchaseFmsUID = purchaseFmsUIDs[uidIndex];
      const finalReceivedQuantity = finalReceivedQuantities[uidIndex];
      let rowIndex = -1;

      for (let i = 0; i < rows.length; i++) {
        if (
          rows[i][60] &&
          rows[i][60].toString().trim() === poNumber.toString().trim() &&
          rows[i][1] &&
          rows[i][1].toString().trim() === purchaseFmsUID.toString().trim()
        ) {
          if (!rows[i][11] || rows[i][11].toString().trim() === '') {
            console.error(`Planned data missing for row ${i + 1} with poNumber: ${poNumber} and UID: ${purchaseFmsUID}`);
            return res.status(400).json({
              error: `Planned data is missing for PO '${poNumber}' and UID '${purchaseFmsUID}'`,
            });
          }
          rowIndex = i;
          break;
        }
      }

      if (rowIndex === -1) {
        console.error(`No matching row found for poNumber: ${poNumber} and purchaseFmsUID: ${purchaseFmsUID}`);
        return res.status(400).json({
          error: `No matching PO '${poNumber}' and UID '${purchaseFmsUID}' found in the sheet`,
        });
      }

      rowIndices.push(rowIndex);
      const row = rows[rowIndex];

      // Aggregate all challan numbers for the UID
      const challanSet = uidToChallanMap.get(purchaseFmsUID.toString().trim()) || new Set();
      const challanNos = Array.from(challanSet).join(', ');

      const rowData = {
        uid: row[1] || '-',
        siteName: row[3] || '-',
        vendorName: row[39] || '-',
        materialType: row[5] || '-',
        skuCode: row[6] || '-',
        materialName: row[7] || '-',
        unit: row[9] || '-',
        brand: row[17] || '-', // DECIDED BRAND/COMPANY NAME 2
        finalReceivedQuantity: finalReceivedQuantity || row[75] || '-',
        challanNo: challanNos || (challanNo || '-'), // Use aggregated challan numbers or fallback
        vehicleNo: vehicleNo || row[78] || '-',
        deliveryDate: row[62] || deliveryDate || '-',
      };
      console.log(`Row data for UID ${purchaseFmsUID}:`, rowData);

      rowDatas.push(rowData);

      if (uidIndex === 0) {
        indentNo = row[24] || '-';
        commonDeliveryDate = rowData.deliveryDate;
      }
    }

    console.log('All rowDatas for PDF:', rowDatas);

    let pdfDataUri;
    try {
      pdfDataUri = generateMRNPDF(rowDatas, mrnNo, poNumber, indentNo, commonDeliveryDate);
      console.log(`PDF data URI length: ${pdfDataUri.length}`);
    } catch (error) {
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }

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
    const media = { mimeType: 'application/pdf', body: Readable.from(pdfBuffer) };

    const file = await retry(
      async () => await drive.files.create({
        resource: fileMetadata,
        media,
        fields: 'id, webViewLink',
        supportsAllDrives: true,
      }),
      { retries: 3, factor: 2, minTimeout: 1000, maxTimeout: 5000 }
    );
    const pdfUrl = file.data.webViewLink;

    await retry(
      async () => await drive.permissions.create({
        fileId: file.data.id,
        requestBody: { role: 'reader', type: 'anyone' },
        supportsAllDrives: true,
      }),
      { retries: 3, factor: 2, minTimeout: 1000, maxTimeout: 5000 }
    );
    console.log(`Upload success: ${pdfUrl}`);

    const batchData = [];
    for (let i = 0; i < rowIndices.length; i++) {
      const rowIndex = rowIndices[i];
      const finalQty = finalReceivedQuantities[i] || rows[rowIndex][75] || '-';
      batchData.push({
        range: `Purchase_fms!CF${rowIndex + 1}:CJ${rowIndex + 1}`,
        values: [['Done', mrnNo, pdfUrl, '', finalQty]],
      });
    }

    await retry(
      async () => await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: process.env.SPREADSHEET_ID,
        valueInputOption: 'RAW',
        resource: { data: batchData, valueInputOption: 'RAW' },
      }),
      { retries: 3, factor: 2, minTimeout: 1000, maxTimeout: 5000 }
    );
    console.log(`Batch updated rows ${rowIndices.map(r => r + 1).join(', ')} for MRN ${mrnNo}`);

    const responseData = { message: 'MRN data saved successfully', mrnNo, pdfUrl };
    console.log('Response:', responseData);
    res.status(200).json(responseData);
  } catch (error) {
    console.error('=== MAJOR ERROR ===', error.message, error.stack);
    res.status(500).json({ error: `Failed to save MRN data: ${error.message}`, details: error.stack });
  }
  console.log('=== SAVE MRN DATA END ===');
});

module.exports = router;