
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
        { align: 'center' }
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


module.exports = router;