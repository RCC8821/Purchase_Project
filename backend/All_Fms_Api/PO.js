

const express = require('express');
const { sheets, spreadsheetId, drive } = require('../config/googleSheet');
const router = express.Router();
require('dotenv').config();
const fs = require('fs');
const fontkit = require('fontkit');
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



router.get('/get-othersheet-data', async (req, res) => {
  try {
    const range = 'Site_Supervisor!A2:E';

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

    const headers = [
      { key: 'Supervisor', column: 0 },
      { key: 'Contact_No', column: 1 },
      { key: 'Site_Name', column: 3 },
      { key: 'Site_Location', column: 4 },
    ];

    // Transform rows into structured data
    const data = rows.map(row => {
      const item = {};
      headers.forEach(header => {
        item[header.key] = row[header.column] || null;
      });
      return item;
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data:', error.message, error.stack);
    return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});





router.get('/get-po-data', async (req, res) => {
  try {
    const range = 'Purchase_FMS!B7:BJ';

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

    const headers = [
      { key: 'PLANNED_7', column: 56 },
      { key: 'UID', column: 0 },
      { key: 'Req_No', column: 1 },
      { key: 'Site_Name', column: 2 },
      { key: 'Site_Location', column: 3 },
      { key: 'Material_Type', column: 4 },
      { key: 'SKU_Code', column: 5 },
      { key: 'Material_Name', column: 6 },
      { key: 'Unit_Name', column: 8 },
      { key: 'Require_Date', column: 10 },
      { key: 'REVISED_QUANTITY_2', column: 15 },
      { key: 'DECIDED_BRAND/COMPANY_NAME_2', column: 16 },
      { key: 'INDENT_NUMBER_3', column: 23 },
      { key: 'PDF_URL_3', column: 24 },
      { key: 'QUOTATION_NO_5', column: 36 },
      { key: 'Vendor_Name_5', column: 37 },
      { key: 'Vendor_Firm_Name_5', column: 38 },
      { key: 'Vendor_Address_5', column: 39 },
      { key: 'Vendor_Contact_5', column: 40 },
      { key: 'Vendor_GST_No_5', column: 41 },
      { key: 'DISCOUNT_5', column: 43 },
      { key: 'Rate_5', column: 42 },
      { key: 'CGST_5', column: 44 },
      { key: 'SGST_5', column: 45 },
      { key: 'IGST_5', column: 46 },
      { key: 'FINAL_RATE_5', column: 47 },
      { key: 'TOTAL_VALUE_5', column: 48 },
      { key: 'APPROVAL_5', column: 49 },
      { key: 'IS_TRANSPORT_REQUIRED', column: 50 },
      { key: 'EXPECTED_TRANSPORT_CHARGES', column: 51 },
      { key: 'FREIGHT_CHARGES', column: 52 },
      { key: 'EXPECTED_FREIGHT_CHARGES', column: 53 },
      { key: 'PDF_URL_5', column: 54 },
      { key: 'ACTUAL_7', column: 57 },
      { key: 'Remark5', column: 55 },
    ];

    const planned7Index = headers.find(h => h.key === 'PLANNED_7')?.column;
    const actual7Index = headers.find(h => h.key === 'ACTUAL_7')?.column;
    if (planned7Index === undefined || actual7Index === undefined) {
      console.error('Required columns not found in headers');
      return res.status(500).json({
        error: 'Invalid sheet structure',
        details: 'PLANNED_7 or ACTUAL_7 column missing',
      });
    }

    const dataRows = rows.slice(1);
    if (!dataRows.length) {
      console.log('No data rows found starting from row 8');
      return res.status(404).json({ error: 'No data found starting from row 8', details: 'No rows after header' });
    }

    let validRowCount = 0;
    const formData = dataRows
      .map((row, index) => {
        if (!row || row.every(cell => !cell || cell.trim() === '')) {
          console.log(`Skipping empty row ${index + 8}`);
          return null;
        }

        const planned7 = row[planned7Index]?.trim() || '';
        const actual7 = row[actual7Index]?.trim() || '';
        console.log(
          `Row ${index + 8} - PLANNED_7: "${planned7}", ACTUAL_7: "${actual7}"`
        );

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
    let maxPONumber = 0;
    rows.forEach((row) => {
      const value = row[0];
      if (value && value.startsWith('PO_')) {
        const num = parseInt(value.replace('PO_', ''), 10) || 0;
        if (num > maxPONumber) {
          maxPONumber = num;
        }
      }
    });
    const newPONumber = `PO_${String(maxPONumber + 1).padStart(3, '0')}`;
    console.log(`Generated new PO Number: ${newPONumber} (max found: ${maxPONumber})`);
    return newPONumber;
  } catch (error) {
    console.error('Error generating PO number:', error.message);
    throw new Error('Failed to generate PO number');
  }
}




// const generatePODocument = (approvedItems, quotationNo, indentNo, expectedDeliveryDate, poNumber, siteName, siteLocation, supervisorName, supervisorContact, vendorName, vendorAddress, vendorGST, vendorContact, companyLogoBase64 = null) => {
//   console.log('Current working directory:', process.cwd());
//   console.log(`Generating PDF: PO ${poNumber}, Quotation ${quotationNo}, Indent ${indentNo}, Items: ${approvedItems.length}, Delivery Date: ${expectedDeliveryDate}`);
//   const doc = new jsPDF();
//   if (typeof doc.autoTable !== 'function') {
//     throw new Error('autoTable plugin not loaded');
//   }

//   doc.setFont('helvetica', 'normal');

//   const pageWidth = doc.internal.pageSize.getWidth();
//   const pageHeight = doc.internal.pageSize.getHeight();
//   const bottomMargin = 30;

//   const extractEnglish = (text) => {
//     if (!text) return 'N/A';
//     const englishOnly = text.split(/[/\p{Script=Devanagari}\p{So}\p{S}]/u)[0].trim();
//     return englishOnly || 'N/A';
//   };

//   const checkPageBreak = (currentY, requiredSpace) => {
//     if (currentY + requiredSpace > pageHeight - bottomMargin) {
//       doc.addPage();
//       return 20;
//     }
//     return currentY;
//   };

//   const headerY = 15;

//   if (companyLogoBase64) {
//     try {
//       doc.addImage(companyLogoBase64, 'PNG', 15, headerY, 35, 25);
//     } catch (error) {
//       console.error('Logo load error:', error);
//       doc.setFillColor(245, 222, 179);
//       doc.rect(15, headerY, 35, 25, 'F');
//       doc.setFontSize(10);
//       doc.setFont('helvetica', 'bold');
//       doc.setTextColor(139, 69, 19);
//       doc.text('RCC', 25, headerY + 10);
//       doc.setFontSize(7);
//       doc.text('INFRASTRUCTURES', 18, headerY + 15);
//     }
//   } else {
//     doc.setFillColor(245, 222, 179);
//     doc.rect(15, headerY, 35, 25, 'F');
//     doc.setFontSize(10);
//     doc.setFont('helvetica', 'bold');
//     doc.setTextColor(139, 69, 19);
//     doc.text('RCC', 25, headerY + 10);
//     doc.setFontSize(7);
//     doc.text('INFRASTRUCTURES', 18, headerY + 15);
//   }
  
//   // === ADDRESS BLOCK - CORRECTLY POSITIONED ABOVE RED LINE ===
//   const addressStartY = headerY + 10; // Logo starts at headerY+10 → Address starts here

//   doc.setFontSize(8);
//   doc.setFont('helvetica', 'bold');
//   doc.setTextColor(0, 0, 0);
//   doc.text('R. C. C. Infrastructures', pageWidth - 15, addressStartY, { align: 'right' });
  
//   doc.setFontSize(7);
//   doc.setFont('helvetica', 'normal');
//   doc.text('310 Saket Nagar, 9B Near Sagar Public School, Bhopal, 462026', pageWidth - 15, addressStartY + 4, { align: 'right' });
//   doc.text('Contact: 7869962504', pageWidth - 15, addressStartY + 8, { align: 'right' });
//   doc.text('Email: mayank@rccinfrastructure.com', pageWidth - 15, addressStartY + 12, { align: 'right' });
//   doc.text('GST: 23ABHFR3130L1ZA', pageWidth - 15, addressStartY + 16, { align: 'right' });

//   doc.setDrawColor(220, 53, 69);
//   doc.setLineWidth(0.5);
//   doc.line(15, headerY + 27, pageWidth - 15, headerY + 27);

//   doc.setFontSize(16);
//   doc.setFont('helvetica', 'bold');
//   doc.setTextColor(220, 53, 69);
//   doc.text('Purchase Order', 15, headerY + 35);

//   doc.setDrawColor(255, 193, 7);
//   doc.setLineWidth(0.5);
//   doc.line(15, headerY + 37, pageWidth - 15, headerY + 37);

//   doc.setFontSize(9);
//   const infoY = headerY + 43;
//   const currentDate = new Date().toLocaleDateString('en-GB', {
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric',
//   }).replace(/ /g, '-');

//   const firstItem = approvedItems && approvedItems.length > 0 ? approvedItems[0] : {};

//   const finalVendorName = extractEnglish(vendorName || firstItem.Vendor_Firm_Name_5 || 'N/A');
//   const finalVendorGST = extractEnglish(vendorGST || firstItem.Vendor_GST_No_5 || 'N/A');
//   const finalVendorAddress = extractEnglish(vendorAddress || firstItem.Vendor_Address_5 || 'N/A');
//   const finalVendorContact = extractEnglish(vendorContact || firstItem.Vendor_Contact_5 || 'N/A');
//   const finalSiteName = extractEnglish(siteName || firstItem.Site_Name || 'N/A');
//   const finalSiteLocation = extractEnglish(siteLocation || firstItem.Site_Location || 'N/A');
//   const finalSupervisorName = extractEnglish(supervisorName || firstItem.Supervisor_Name || 'N/A');
//   const finalSupervisorContact = extractEnglish(supervisorContact || firstItem.Supervisor_Contact || 'N/A');

//   const keyLeft = 15;
//   const keyRight = pageWidth / 2 + 10;
//   const gap = 2;
//   const lineHeight = 5;
//   let currentY = infoY;

//   doc.setTextColor(0, 0, 0);
  
//   doc.setFont('helvetica', 'bold');
//   const poNumberKeyWidth = doc.getTextWidth('PO Number:');
//   doc.text('PO Number:', keyLeft, currentY);
//   doc.setFont('helvetica', 'normal');
//   doc.text(extractEnglish(poNumber), keyLeft + poNumberKeyWidth + gap, currentY);

//   doc.setFont('helvetica', 'bold');
//   const poDateKeyWidth = doc.getTextWidth('PO Date:');
//   doc.text('PO Date:', keyRight, currentY);
//   doc.setFont('helvetica', 'normal');
//   doc.text(currentDate, keyRight + poDateKeyWidth + gap, currentY);

//   currentY += lineHeight;

//   doc.setFont('helvetica', 'bold');
//   const indentKeyWidth = doc.getTextWidth('Indent No:');
//   doc.text('Indent No:', keyLeft, currentY);
//   doc.setFont('helvetica', 'normal');
//   doc.text(extractEnglish(indentNo), keyLeft + indentKeyWidth + gap, currentY);

//   doc.setFont('helvetica', 'bold');
//   const quotationKeyWidth = doc.getTextWidth('Quotation No:');
//   doc.text('Quotation No:', keyRight, currentY);
//   doc.setFont('helvetica', 'normal');
//   doc.text(extractEnglish(quotationNo), keyRight + quotationKeyWidth + gap, currentY);

//   currentY += lineHeight;

//   doc.setFont('helvetica', 'bold');
//   const vendorKeyWidth = doc.getTextWidth('Vendor:');
//   doc.text('Vendor:', keyLeft, currentY);
//   doc.setFont('helvetica', 'normal');
//   doc.text(finalVendorName, keyLeft + vendorKeyWidth + gap, currentY);

//   doc.setFont('helvetica', 'bold');
//   const gstKeyWidth = doc.getTextWidth('GST No:');
//   doc.text('GST No:', keyRight, currentY);
//   doc.setFont('helvetica', 'normal');
//   doc.text(finalVendorGST, keyRight + gstKeyWidth + gap, currentY);

//   currentY += lineHeight;

//   doc.setFont('helvetica', 'bold');
//   const addressKeyWidth = doc.getTextWidth('Vendor Address:');
//   doc.text('Vendor Address:', keyLeft, currentY);
//   doc.setFont('helvetica', 'normal');
//   const addressLines = doc.splitTextToSize(finalVendorAddress, pageWidth / 2 - keyLeft - addressKeyWidth - gap - 10);
//   doc.text(addressLines[0] || finalVendorAddress, keyLeft + addressKeyWidth + gap, currentY);

//   doc.setFont('helvetica', 'bold');
//   const contactKeyWidth = doc.getTextWidth('Vendor Contact:');
//   doc.text('Vendor Contact:', keyRight, currentY);
//   doc.setFont('helvetica', 'normal');
//   doc.text(finalVendorContact, keyRight + contactKeyWidth + gap, currentY);

//   currentY += lineHeight;

//   doc.setFont('helvetica', 'bold');
//   const siteKeyWidth = doc.getTextWidth('Site Name:');
//   doc.text('Site Name:', keyLeft, currentY);
//   doc.setFont('helvetica', 'normal');
//   doc.text(finalSiteName, keyLeft + siteKeyWidth + gap, currentY);

//   doc.setFont('helvetica', 'bold');
//   const locationKeyWidth = doc.getTextWidth('Site Location:');
//   doc.text('Site Location:', keyRight, currentY);
//   doc.setFont('helvetica', 'normal');
//   const locationLines = doc.splitTextToSize(finalSiteLocation, pageWidth - keyRight - locationKeyWidth - gap - 15);
//   doc.text(locationLines[0] || finalSiteLocation, keyRight + locationKeyWidth + gap, currentY);

//   currentY += lineHeight;

//   doc.setFont('helvetica', 'bold');
//   const supervisorKeyWidth = doc.getTextWidth('Supervisor Name:');
//   doc.text('Supervisor Name:', keyLeft, currentY);
//   doc.setFont('helvetica', 'normal');
//   doc.text(finalSupervisorName, keyLeft + supervisorKeyWidth + gap, currentY);

//   doc.setFont('helvetica', 'bold');
//   const supervisorContactKeyWidth = doc.getTextWidth('Supervisor Contact:');
//   doc.text('Supervisor Contact:', keyRight, currentY);
//   doc.setFont('helvetica', 'normal');
//   doc.text(finalSupervisorContact, keyRight + supervisorContactKeyWidth + gap, currentY);

//   currentY += lineHeight;

//   doc.setFont('helvetica', 'bold');
//   const deliveryKeyWidth = doc.getTextWidth('Expected Delivery:');
//   doc.text('Expected Delivery:', keyLeft, currentY);
//   doc.setFont('helvetica', 'normal');
//   doc.text(extractEnglish(expectedDeliveryDate), keyLeft + deliveryKeyWidth + gap, currentY);

//   currentY += 5;

//   doc.setDrawColor(255, 193, 7);
//   doc.line(15, currentY, pageWidth - 15, currentY);

//   currentY += 7;
//   doc.setFontSize(11);
//   doc.setFont('helvetica', 'bold');
//   doc.setTextColor(220, 53, 69);
//   doc.text('Order Details', 15, currentY);

//   currentY += 3;

//   // UPDATED TABLE BODY WITH DISCOUNT
//   const tableBody = approvedItems && approvedItems.length > 0 ? approvedItems.map((item, index) => [
//     index + 1,
//     extractEnglish(item.UID || item.uid || ''),
//     extractEnglish(item.Material_Name || item.materialName || ''),
//     extractEnglish(item.REVISED_QUANTITY_2 || item.quantity || ''),
//     extractEnglish(item.Unit_Name || item.unit || ''),
//     extractEnglish(item.Rate_5 || item.rate || ''),
//     (extractEnglish(item.DISCOUNT_5 || item.discount || '0') || '0') + '%', // DISCOUNT WITH %
//     extractEnglish(item.CGST_5 || item.cgst || ''),
//     extractEnglish(item.SGST_5 || item.sgst || ''),
//     extractEnglish(item.IGST_5 || item.igst || ''),
//     extractEnglish(item.FINAL_RATE_5 || item.finalRate || ''),
//     extractEnglish(item.TOTAL_VALUE_5 || item.totalValue || ''),
//   ]) : [];

//   const grandTotal = approvedItems && approvedItems.length > 0 
//     ? approvedItems.reduce((acc, item) => {
//         const value = parseFloat(extractEnglish(item.TOTAL_VALUE_5 || item.totalValue || 0));
//         return acc + (isNaN(value) ? 0 : value);
//       }, 0)
//     : 0;

//   // UPDATED autoTable WITH BOLD BORDERS FOR BETTER BLACK & WHITE PRINTING
//  doc.autoTable({
//   head: [['S.No', 'UID', 'Material Name', 'Quantity', 'Unit', 'Rate', 'Discount', 'CGST', 'SGST', 'IGST', 'Final Rate', 'Total Value']],
//   body: tableBody,
//   startY: currentY + 2,
//   theme: 'grid',

//   // GLOBAL STYLES
//   styles: {
//     fontSize: 9.2,           
//     cellPadding: 2.8,        
//     font: 'helvetica',
//     lineColor: [0, 0, 0],
//     lineWidth: 0.35,
//     overflow: 'linebreak',
//   },

//   // BODY TEXT KO BOLD + DARK KAR DO (sabse important)
//   bodyStyles: {
//     fontStyle: 'bold',
//     textColor: [15, 15, 15],  // Darker than black for print
//   },

//   // HEADER KO CHHOTA AUR CLEAN RAKHO
//   headStyles: {
//     fillColor: [235, 235, 235],
//     textColor: [0, 0, 0],
//     fontStyle: 'bold',
//     fontSize: 8.3,
//     halign: 'center',
//     cellPadding: 3,
//     lineWidth: 0.4,
//   },

//   // COLUMN WIDTHS — OPTIMIZED (total ~195mm = A4 safe width)
//   columnStyles: {
//     0: { cellWidth: 10,   halign: 'center' },     // S.No
//     1: { cellWidth: 16,   halign: 'center' },     // UID
//     2: { cellWidth: 42,   halign: 'left' },       // Material Name (thoda bada kiya)
//     3: { cellWidth: 13,   halign: 'center' },     // Qty
//     4: { cellWidth: 12,   halign: 'center' },     // Unit
//     5: { cellWidth: 16,   halign: 'right' },      // Rate
//     6: { cellWidth: 13,   halign: 'center' },     // Discount
//     7: { cellWidth: 10,   halign: 'center' },     // CGST
//     8: { cellWidth: 10,   halign: 'center' },     // SGST
//     9: { cellWidth: 10,   halign: 'center' },     // IGST
//     10: { cellWidth: 16,  halign: 'right' },      // Final Rate
//     11: { cellWidth: 19,  halign: 'right', fontStyle: 'bold' }, // Total Value (extra bold)
//   },

//   alternateRowStyles: { fillColor: [250, 250, 250] },
//   margin: { left: 14, right: 14, bottom: 30 },
//   pageBreak: 'auto',
//   showHead: 'everyPage',
//   rowPageBreak: 'avoid',

//   // YEH LINE SABSE ZAROORI HAI — text overflow ko smartly handle karega
//   didParseCell: function (data) {
//     if (data.column.index === 2 && data.cell.raw && data.cell.raw.length > 30) {
//       data.cell.text = doc.splitTextToSize(data.cell.raw, 40);
//     }
//   }
// });

//   let tableEndY = doc.lastAutoTable.finalY;
//   tableEndY = checkPageBreak(tableEndY, 15);
  
//   doc.setFontSize(9);
//   doc.setFont('helvetica', 'bold');
//   doc.setTextColor(0, 0, 0);
//   doc.text(`Grand Total: ${grandTotal.toFixed(2)}`, pageWidth - 15, tableEndY + 7, { align: 'right' });

//   doc.setDrawColor(255, 193, 7);
//   doc.line(15, tableEndY + 11, pageWidth - 15, tableEndY + 11);

//   let transportY = tableEndY + 17;
//   transportY = checkPageBreak(transportY, 25);
  
//   doc.setFontSize(11);
//   doc.setFont('helvetica', 'bold');
//   doc.setTextColor(220, 53, 69);
//   doc.text('Transport Details', 15, transportY);

//   doc.setFontSize(9);
//   doc.setFont('helvetica', 'normal');
//   doc.setTextColor(0, 0, 0);
  
//   let transY = transportY + 5;
//   doc.setFont('helvetica', 'bold');
//   const transportReqKeyWidth = doc.getTextWidth('Transport Required:');
//   doc.text('Transport Required:', keyLeft, transY);
//   doc.setFont('helvetica', 'normal');
//   doc.text(extractEnglish(firstItem.IS_TRANSPORT_REQUIRED || ''), keyLeft + transportReqKeyWidth + gap, transY);
  
//   doc.setFont('helvetica', 'bold');
//   const transportChargesKeyWidth = doc.getTextWidth('Expected Transport Charges:');
//   doc.text('Expected Transport Charges:', keyRight, transY);
//   doc.setFont('helvetica', 'normal');
//   doc.text(extractEnglish(firstItem.EXPECTED_TRANSPORT_CHARGES || ''), keyRight + transportChargesKeyWidth + gap, transY);

//   transY += lineHeight;
//   doc.setFont('helvetica', 'bold');
//   const freightKeyWidth = doc.getTextWidth('Freight Charges:');
//   doc.text('Freight Charges:', keyLeft, transY);
//   doc.setFont('helvetica', 'normal');
//   doc.text(extractEnglish(firstItem.FREIGHT_CHARGES || ''), keyLeft + freightKeyWidth + gap, transY);

//   transY += 5;

//   doc.setDrawColor(255, 193, 7);
//   doc.line(15, transY, pageWidth - 15, transY);

//   let paymentY = transY + 7;
//   paymentY = checkPageBreak(paymentY, 25);
  
//   doc.setFontSize(11);
//   doc.setFont('helvetica', 'bold');
//   doc.setTextColor(220, 53, 69);
//   doc.text('Payment Details', 15, paymentY);

//   doc.setFontSize(9);
//   doc.setFont('helvetica', 'normal');
//   doc.setTextColor(0, 0, 0);
  
//   let payY = paymentY + 5;
//   doc.setFont('helvetica', 'bold');
//   const paymentTermsKeyWidth = doc.getTextWidth('Payment Terms:');
//   doc.text('Payment Terms:', keyLeft, payY);
//   doc.setFont('helvetica', 'normal');
//   doc.text(extractEnglish(firstItem.paymentTerms || 'Credit'), keyLeft + paymentTermsKeyWidth + gap, payY);
  
//   doc.setFont('helvetica', 'bold');
//   const creditDaysKeyWidth = doc.getTextWidth('Credit Days:');
//   doc.text('Credit Days:', keyRight, payY);
//   doc.setFont('helvetica', 'normal');
//   doc.text(extractEnglish(firstItem.creditDays || '30'), keyRight + creditDaysKeyWidth + gap, payY);

//   payY += lineHeight;
//   doc.setFont('helvetica', 'bold');
//   const billTypeKeyWidth = doc.getTextWidth('Bill Type:');
//   doc.text('Bill Type:', keyLeft, payY);
//   doc.setFont('helvetica', 'normal');
//   doc.text(extractEnglish(firstItem.billType || 'Invoice'), keyLeft + billTypeKeyWidth + gap, payY);

//   payY += 5;

//   doc.setDrawColor(255, 193, 7);
//   doc.line(15, payY, pageWidth - 15, payY);

//   let signatureY = payY + 15;
//   signatureY = checkPageBreak(signatureY, 20);
  
//   doc.setTextColor(0, 0, 0);
//   doc.setFontSize(9);
//   doc.setFont('helvetica', 'normal');
//   doc.text('Authorized Signature', pageWidth - 60, signatureY, { align: 'center' });
//   doc.setDrawColor(0, 0, 0);
//   doc.setLineWidth(0.2);
//   doc.setLineDash([1, 1], 0);
//   doc.line(pageWidth - 90, signatureY + 5, pageWidth - 30, signatureY + 5);
//   doc.setLineDash();

//   const totalPages = doc.internal.getNumberOfPages();
//   for (let i = 1; i <= totalPages; i++) {
//     doc.setPage(i);
//     doc.setFillColor(0, 0, 0);
//     doc.roundedRect(pageWidth / 2 - 25, pageHeight - 15, 50, 10, 5, 5, 'F');
//     doc.setTextColor(255, 255, 255);
//     doc.setFontSize(9);
//     doc.setFont('helvetica', 'normal');
//     doc.text(`Page ${i} / ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
//   }

//   const pdfBuffer = doc.output('arraybuffer');
//   const base64Data = Buffer.from(pdfBuffer).toString('base64');
//   return `data:application/pdf;base64,${base64Data}`;
// };



//////////////////////////////////////////////////////////////////////////////////////////



const generatePODocument = (approvedItems, quotationNo, indentNo, expectedDeliveryDate, poNumber, siteName, siteLocation, supervisorName, supervisorContact, vendorName, vendorAddress, vendorGST, vendorContact, companyLogoBase64 = null) => {
  console.log('Current working directory:', process.cwd());
  console.log(`Generating PDF: PO ${poNumber}, Quotation ${quotationNo}, Indent ${indentNo}, Items: ${approvedItems.length}, Delivery Date: ${expectedDeliveryDate}`);
  
  const doc = new jsPDF();
  
  if (typeof doc.autoTable !== 'function') {
    throw new Error('autoTable plugin not loaded');
  }

  doc.setFont('helvetica', 'normal');

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomMargin = 30;

  const extractEnglish = (text) => {
    if (!text) return 'N/A';
    return String(text).split(/[/\p{Script=Devanagari}\p{So}\p{S}]/u)[0].trim() || 'N/A';
  };

  const checkPageBreak = (currentY, requiredSpace) => {
    if (currentY + requiredSpace > pageHeight - bottomMargin) {
      doc.addPage();
      return 20;
    }
    return currentY;
  };

  const headerY = 15;

  // Logo
  if (companyLogoBase64) {
    try {
      doc.addImage(companyLogoBase64, 'PNG', 15, headerY, 35, 25);
    } catch (error) {
      console.error('Logo load error:', error);
      doc.setFillColor(245, 222, 179);
      doc.rect(15, headerY, 35, 25, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(139, 69, 19);
      doc.text('RCC', 25, headerY + 10);
      doc.setFontSize(7);
      doc.text('INFRASTRUCTURES', 18, headerY + 15);
    }
  } else {
    doc.setFillColor(245, 222, 179);
    doc.rect(15, headerY, 35, 25, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 69, 19);
    doc.text('RCC', 25, headerY + 10);
    doc.setFontSize(7);
    doc.text('INFRASTRUCTURES', 18, headerY + 15);
  }

  // Address Block
  const addressStartY = headerY + 10;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('R. C. C. Infrastructures', pageWidth - 15, addressStartY, { align: 'right' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('310 Saket Nagar, 9B Near Sagar Public School, Bhopal, 462026', pageWidth - 15, addressStartY + 4, { align: 'right' });
  doc.text('Contact: 7869962504', pageWidth - 15, addressStartY + 8, { align: 'right' });
  doc.text('Email: mayank@rccinfrastructure.com', pageWidth - 15, addressStartY + 12, { align: 'right' });
  doc.text('GST: 23ABHFR3130L1ZA', pageWidth - 15, addressStartY + 16, { align: 'right' });

  doc.setDrawColor(220, 53, 69);
  doc.setLineWidth(0.5);
  doc.line(15, headerY + 27, pageWidth - 15, headerY + 27);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 53, 69);
  doc.text('Purchase Order', 15, headerY + 35);

  doc.setDrawColor(255, 193, 7);
  doc.setLineWidth(0.5);
  doc.line(15, headerY + 37, pageWidth - 15, headerY + 37);

  // Info Section
  doc.setFontSize(9);
  const infoY = headerY + 43;
  const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');

  const firstItem = approvedItems && approvedItems.length > 0 ? approvedItems[0] : {};

  const finalVendorName = extractEnglish(vendorName || firstItem.vendorFirm || 'N/A');
  const finalVendorGST = extractEnglish(vendorGST || 'N/A');
  const finalVendorAddress = extractEnglish(vendorAddress || 'N/A');
  const finalVendorContact = extractEnglish(vendorContact || 'N/A');
  const finalSiteName = extractEnglish(siteName || firstItem.Site_Name || 'N/A');
  const finalSiteLocation = extractEnglish(siteLocation || 'N/A');
  const finalSupervisorName = extractEnglish(supervisorName || 'N/A');
  const finalSupervisorContact = extractEnglish(supervisorContact || 'N/A');

  const keyLeft = 15;
  const keyRight = pageWidth / 2 + 10;
  const gap = 2;
  const lineHeight = 5;
  let currentY = infoY;

  doc.setTextColor(0, 0, 0);

  doc.setFont('helvetica', 'bold');
  doc.text('PO Number:', keyLeft, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(extractEnglish(poNumber), keyLeft + doc.getTextWidth('PO Number:') + gap, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text('PO Date:', keyRight, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(currentDate, keyRight + doc.getTextWidth('PO Date:') + gap, currentY);

  currentY += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Indent No:', keyLeft, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(extractEnglish(indentNo), keyLeft + doc.getTextWidth('Indent No:') + gap, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text('Quotation No:', keyRight, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(extractEnglish(quotationNo), keyRight + doc.getTextWidth('Quotation No:') + gap, currentY);

  currentY += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Vendor:', keyLeft, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(finalVendorName, keyLeft + doc.getTextWidth('Vendor:') + gap, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text('GST No:', keyRight, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(finalVendorGST, keyRight + doc.getTextWidth('GST No:') + gap, currentY);

  currentY += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Vendor Address:', keyLeft, currentY);
  doc.setFont('helvetica', 'normal');
  const addressLines = doc.splitTextToSize(finalVendorAddress, pageWidth / 2 - 30);
  doc.text(addressLines, keyLeft + doc.getTextWidth('Vendor Address:') + gap, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text('Vendor Contact:', keyRight, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(finalVendorContact, keyRight + doc.getTextWidth('Vendor Contact:') + gap, currentY);

  currentY += Math.max(addressLines.length, 1) * lineHeight + 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Site Name:', keyLeft, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(finalSiteName, keyLeft + doc.getTextWidth('Site Name:') + gap, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text('Site Location:', keyRight, currentY);
  doc.setFont('helvetica', 'normal');
  const locationLines = doc.splitTextToSize(finalSiteLocation, pageWidth / 2 - 30);
  doc.text(locationLines, keyRight + doc.getTextWidth('Site Location:') + gap, currentY);

  currentY += Math.max(locationLines.length, 1) * lineHeight + 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Supervisor Name:', keyLeft, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(finalSupervisorName, keyLeft + doc.getTextWidth('Supervisor Name:') + gap, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text('Supervisor Contact:', keyRight, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(finalSupervisorContact, keyRight + doc.getTextWidth('Supervisor Contact:') + gap, currentY);

  currentY += lineHeight + 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Expected Delivery:', keyLeft, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(extractEnglish(expectedDeliveryDate), keyLeft + doc.getTextWidth('Expected Delivery:') + gap, currentY);

  currentY += 10;

  doc.setDrawColor(255, 193, 7);
  doc.line(15, currentY, pageWidth - 15, currentY);

  currentY += 7;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 53, 69);
  doc.text('Order Details', 15, currentY);

  currentY += 5;

  // ==================== FINAL SAFE TABLE - MATERIAL NAME + REMARK BELOW ====================
  const tableBody = approvedItems.map((item, index) => {
    let materialName = extractEnglish(item.Material_Name || item.materialName || 'N/A');

    let remarkText = '';
    const rawRemark = item.remark || item.Remark5;

    if (rawRemark !== undefined && rawRemark !== null && rawRemark !== '') {
      remarkText = String(rawRemark).trim();
      remarkText = remarkText.replace(/\[object\s+Object\]/gi, '').trim();
      if (remarkText.length > 80) {
        remarkText = remarkText.substring(0, 77) + '...';
      }
      if (remarkText) {
        remarkText = '\n(' + remarkText + ')';  // नीचे नई लाइन में remark
      }
    }

    // Material Name + Remark in one string with new line
    const fullMaterialText = materialName + remarkText;

    return [
      index + 1,
      extractEnglish(item.UID || item.uid || ''),
      fullMaterialText,
      extractEnglish(item.REVISED_QUANTITY_2 || item.quantity || ''),
      extractEnglish(item.Unit_Name || item.unit || ''),
      extractEnglish(item.Rate_5 || item.rate || ''),
      (extractEnglish(item.DISCOUNT_5 || item.discount || '0') || '0') + '%',
      extractEnglish(item.CGST_5 || item.cgst || ''),
      extractEnglish(item.SGST_5 || item.sgst || ''),
      extractEnglish(item.IGST_5 || item.igst || ''),
      extractEnglish(item.FINAL_RATE_5 || item.finalRate || ''),
      extractEnglish(item.TOTAL_VALUE_5 || item.totalValue || ''),
    ];
  });

  const grandTotal = approvedItems.reduce((acc, item) => {
    const val = parseFloat(extractEnglish(item.TOTAL_VALUE_5 || item.totalValue || '0'));
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  doc.autoTable({
    head: [['S.No', 'UID', 'Material Name', 'Quantity', 'Unit', 'Rate', 'Discount', 'CGST', 'SGST', 'IGST', 'Final Rate', 'Total Value']],
    body: tableBody,
    startY: currentY,
    theme: 'grid',
    styles: {
      fontSize: 9.2,
      cellPadding: 3,
      font: 'helvetica',
      lineColor: [0, 0, 0],
      lineWidth: 0.35,
      overflow: 'linebreak',
      valign: 'top',  // important for remark to go below
    },
    bodyStyles: {
      fontStyle: 'bold',
      textColor: [15, 15, 15],
    },
    headStyles: {
      fillColor: [235, 235, 235],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 8.3,
      halign: 'center',
      cellPadding: 3,
      lineWidth: 0.4,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 16, halign: 'center' },
      2: { cellWidth: 30, halign: 'left', valign: 'top' }, // width बढ़ाया + top align
      3: { cellWidth: 13, halign: 'center' },
      4: { cellWidth: 12, halign: 'center' },
      5: { cellWidth: 16, halign: 'right' },
      6: { cellWidth: 13, halign: 'center' },
      7: { cellWidth: 10, halign: 'center' },
      8: { cellWidth: 10, halign: 'center' },
      9: { cellWidth: 10, halign: 'center' },
      10: { cellWidth: 16, halign: 'right' },
      11: { cellWidth: 19, halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    margin: { left: 14, right: 14, bottom: 30 },
    pageBreak: 'auto',
    showHead: 'everyPage',
    rowPageBreak: 'avoid',
  });

  let tableEndY = doc.lastAutoTable.finalY || currentY + 20;
  tableEndY = checkPageBreak(tableEndY, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`Grand Total: ${grandTotal.toFixed(2)}`, pageWidth - 15, tableEndY + 7, { align: 'right' });

  doc.setDrawColor(255, 193, 7);
  doc.line(15, tableEndY + 11, pageWidth - 15, tableEndY + 11);

  let transportY = tableEndY + 17;
  transportY = checkPageBreak(transportY, 25);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 53, 69);
  doc.text('Transport Details', 15, transportY);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  let transY = transportY + 5;
  doc.setFont('helvetica', 'bold');
  const transportReqKeyWidth = doc.getTextWidth('Transport Required:');
  doc.text('Transport Required:', keyLeft, transY);
  doc.setFont('helvetica', 'normal');
  doc.text(extractEnglish(firstItem.transportRequired || firstItem.IS_TRANSPORT_REQUIRED || ''), keyLeft + transportReqKeyWidth + gap, transY);

  doc.setFont('helvetica', 'bold');
  const transportChargesKeyWidth = doc.getTextWidth('Expected Transport Charges:');
  doc.text('Expected Transport Charges:', keyRight, transY);
  doc.setFont('helvetica', 'normal');
  doc.text(extractEnglish(firstItem.expectedTransport || firstItem.EXPECTED_TRANSPORT_CHARGES || ''), keyRight + transportChargesKeyWidth + gap, transY);

  transY += lineHeight;

  doc.setFont('helvetica', 'bold');
  const freightKeyWidth = doc.getTextWidth('Freight Charges:');
  doc.text('Freight Charges:', keyLeft, transY);
  doc.setFont('helvetica', 'normal');
  doc.text(extractEnglish(firstItem.FREIGHT_CHARGES || ''), keyLeft + freightKeyWidth + gap, transY);

  transY += 5;

  doc.setDrawColor(255, 193, 7);
  doc.line(15, transY, pageWidth - 15, transY);

  let paymentY = transY + 7;
  paymentY = checkPageBreak(paymentY, 25);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 53, 69);
  doc.text('Payment Details', 15, paymentY);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  let payY = paymentY + 5;
  doc.setFont('helvetica', 'bold');
  const paymentTermsKeyWidth = doc.getTextWidth('Payment Terms:');
  doc.text('Payment Terms:', keyLeft, payY);
  doc.setFont('helvetica', 'normal');
  doc.text('Credit', keyLeft + paymentTermsKeyWidth + gap, payY);

  doc.setFont('helvetica', 'bold');
  const creditDaysKeyWidth = doc.getTextWidth('Credit Days:');
  doc.text('Credit Days:', keyRight, payY);
  doc.setFont('helvetica', 'normal');
  doc.text('30', keyRight + creditDaysKeyWidth + gap, payY);

  payY += lineHeight;
  doc.setFont('helvetica', 'bold');
  const billTypeKeyWidth = doc.getTextWidth('Bill Type:');
  doc.text('Bill Type:', keyLeft, payY);
  doc.setFont('helvetica', 'normal');
  doc.text('Invoice', keyLeft + billTypeKeyWidth + gap, payY);

  payY += 5;

  doc.setDrawColor(255, 193, 7);
  doc.line(15, payY, pageWidth - 15, payY);

  let signatureY = payY + 15;
  signatureY = checkPageBreak(signatureY, 20);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Signature', pageWidth - 60, signatureY, { align: 'center' });
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.setLineDash([1, 1], 0);
  doc.line(pageWidth - 90, signatureY + 5, pageWidth - 30, signatureY + 5);
  doc.setLineDash();

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(0, 0, 0);
    doc.roundedRect(pageWidth / 2 - 25, pageHeight - 15, 50, 10, 5, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} / ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
  }

  const pdfBuffer = doc.output('arraybuffer');
  const base64Data = Buffer.from(pdfBuffer).toString('base64');
  return `data:application/pdf;base64,${base64Data}`;
};



router.post('/create-po', async (req, res) => {
  console.log('=== CREATE PO START ===');
  console.log('Received request:', req.body);
  const { quotationNo, expectedDeliveryDate, items, siteName, siteLocation, supervisorName, supervisorContact, vendorName, vendorAddress, vendorGST, vendorContact } = req.body;

  if (!quotationNo || !expectedDeliveryDate || !items || items.length === 0) {
    console.error('Validation error: Missing required fields');
    return res.status(400).json({ error: 'Quotation number, delivery date, and items are required' });
  }

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

    const poNumber = await generatePONumber(process.env.SPREADSHEET_ID, 'Purchase_FMS');
    console.log(`✅ Generated PO Number ONCE: ${poNumber}`);

    const supervisorResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID || spreadsheetId,
      range: 'Site_Supervisor!A2:E',
    });
    const supervisorRows = supervisorResponse.data.values || [];
    const supervisors = supervisorRows.map(row => ({
      Supervisor: row[0] || null,
      Contact_No: row[1] || null,
      Site_Name: row[3] || null,
      Site_Location: row[4] || null,
    }));

    const matchedSite = supervisors.find(s => s.Site_Name === siteName);
    const finalSiteLocation = matchedSite ? matchedSite.Site_Location : siteLocation || 'N/A';
    const finalSupervisorName = matchedSite ? matchedSite.Supervisor : supervisorName || 'N/A';
    const finalSupervisorContact = matchedSite ? matchedSite.Contact_No : supervisorContact || 'N/A';

    console.log('Matched Site Location:', finalSiteLocation);
    console.log('Matched Supervisor Name:', finalSupervisorName);
    console.log('Matched Supervisor Contact:', finalSupervisorContact);

    const sheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Purchase_FMS!A:BK',
    });
    const rows = sheetResponse.data.values || [];

    const allIndents = [...new Set(items.map(item => item.indentNo))].join(', ');
    const pdfDataUri = generatePODocument(items, quotationNo, allIndents, expectedDeliveryDate, poNumber, siteName, finalSiteLocation, finalSupervisorName, finalSupervisorContact, vendorName, vendorAddress, vendorGST, vendorContact);
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
      name: `${poNumber}_${quotationNo}_${Date.now()}.pdf`,
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

    await drive.permissions.create({
      fileId: file.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
      supportsAllDrives: true,
    });
    console.log(`✅ Upload success: ${pdfUrl}`);

    const quotationColumnIndex = 36 + 1;

    let updatedCount = 0;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row && row[quotationColumnIndex] && row[quotationColumnIndex].trim() === quotationNo.trim()) {
        const rowNumber = i + 1;
        const values = [[poNumber, pdfUrl, expectedDeliveryDate]];

        await sheets.spreadsheets.values.update({
          spreadsheetId: process.env.SPREADSHEET_ID,
          range: `Purchase_FMS!BI${rowNumber}:BK${rowNumber}`,
          valueInputOption: 'RAW',
          resource: { values },
        });
        console.log(`✅ Updated row ${rowNumber} for quotation ${quotationNo} - PO: ${poNumber}, PDF: ${pdfUrl}, Delivery: ${expectedDeliveryDate}`);
        updatedCount++;
      }
    }

    if (updatedCount === 0) {
      console.warn('No rows updated for quotation');
    }

    const responseData = {
      message: `PO generated successfully, updated ${updatedCount} rows`,
      poNumber,
      pdfUrl,
    };
    console.log('✅ Response:', responseData);
    res.status(200).json(responseData);

  } catch (error) {
    console.error('=== MAJOR ERROR ===', error.message, error.stack);
    res.status(500).json({ error: 'Failed to create PO: ' + error.message, details: error.stack });
  }
  console.log('=== CREATE PO END ===');
});

module.exports = router;


