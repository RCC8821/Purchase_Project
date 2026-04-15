

// const express = require('express');
// const { sheets, drive, SiteExpeseSheetId } = require('../../config/googleSheet');
// const PDFDocument = require('pdfkit');
// const { Readable } = require('stream');

// const router = express.Router();

// async function generateLabourPDF(records, billNo, paidName) {
//   return new Promise((resolve, reject) => {
//     const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
//     const buffers = [];

//     doc.on('data', chunk => buffers.push(chunk));
//     doc.on('end', () => resolve(Buffer.concat(buffers)));
//     doc.on('error', reject);

//     const pageWidth    = 841.89;
//     const margin       = 40;
//     const contentWidth = pageWidth - margin * 2;
//     const first        = records[0];

//     doc.fontSize(16).font('Helvetica-Bold')
//       .text('LABOUR DEPLOYED REPORT', margin, 30, { align: 'center', width: contentWidth });

//     doc.moveDown(0.5);
//     doc.moveTo(margin, doc.y).lineTo(margin + contentWidth, doc.y).lineWidth(1).stroke();
//     doc.moveDown(0.4);

//     const headerStartY = doc.y;
//     const col1X        = margin;
//     const col2X        = margin + contentWidth / 2;

//     const headerField = (label, value, x, y) => {
//       doc.fontSize(9).font('Helvetica-Bold').text(`${label} :`, x, y, { continued: true, width: 180 });
//       doc.font('Helvetica').text(`  ${value || '-'}`);
//     };

//     headerField('Project Name',           first.projectName,               col1X, headerStartY);

//     // headerField('Total Labour',           first.totalLabour,               col2X, headerStartY);

//     const totalAllLabour = records.reduce((s, r) => {
//   const cleanNum = val => parseFloat((val || '0').toString().replace(/,/g, '')) || 0;
//   return s + cleanNum(r.Number_Of_Labour_1_3) + cleanNum(r.Number_Of_Labour_2_3);
// }, 0);

// headerField('Total Labour', totalAllLabour.toString(), col2X, headerStartY);

//     headerField('Labour Contractor Name', first.Labouar_Contractor_Name_3, col1X, headerStartY + 16);
//     headerField('Paid By',                paidName,                        col2X, headerStartY + 16);
//     headerField('Bill No.',               billNo,                          col1X, headerStartY + 32);
//     headerField('Bill Date',              new Date().toLocaleDateString('en-IN'), col2X, headerStartY + 32);

//     doc.moveDown(3.2);
//     doc.moveTo(margin, doc.y).lineTo(margin + contentWidth, doc.y).lineWidth(0.5).stroke();
//     doc.moveDown(0.9);

//     const columns = [
//       { label: 'Sr.\nNo.',             width: 30  },
//       { label: 'UID No.',              width: 80  },
//       { label: 'Work Details',         width: 200 },
//       { label: 'Labour\nCategory 1',   width: 72  },
//       { label: 'Labour\nNo. 1',        width: 50  },
//       { label: 'Labour\nCategory 2',   width: 72  },
//       { label: 'Labour\nNo. 2',        width: 50  },
//       { label: 'Total\nLabour',        width: 50  },
//       { label: 'Company\nHead Amt',    width: 75  },
//       { label: 'Contractor\nHead Amt', width: 75  },
//     ];

//     const headerHeight = 30;
//     const rowHeight    = 22;
//     let tableX         = margin;
//     let tableY         = doc.y;

//     let cx = tableX;
//     columns.forEach(col => {
//       doc.rect(cx, tableY, col.width, headerHeight).fillAndStroke('#1a3c6e', '#000000');
//       doc.fillColor('#ffffff').fontSize(6.5).font('Helvetica-Bold')
//         .text(col.label, cx + 2, tableY + 5, { width: col.width - 4, align: 'center', lineGap: 1 });
//       doc.fillColor('#000000');
//       cx += col.width;
//     });

//     tableY += headerHeight;

//     // cleanNum pehle define karo
//     const cleanNum = val => parseFloat((val || '0').toString().replace(/,/g, '')) || 0;

//     // --- Table Data Rows ---
//     records.forEach((row, i) => {
//       const rowTotalLabour = cleanNum(row.Number_Of_Labour_1_3) + cleanNum(row.Number_Of_Labour_2_3);

//       const rowData = [
//         (i + 1).toString(),
//         row.uid,
//         row.workDescription,
//         row.Labour_Category_1_3,
//         row.Number_Of_Labour_1_3,
//         row.Labour_Category_2_3,
//         row.Number_Of_Labour_2_3,
//         rowTotalLabour.toString(),
//         row.Revised_Company_Head_Amount_4,
//         row.Revised_Contractor_Head_Amount_4,
//       ];

//       const bgColor = i % 2 === 0 ? '#f0f5ff' : '#ffffff';
//       cx = tableX;

//       rowData.forEach((cell, j) => {
//         doc.rect(cx, tableY, columns[j].width, rowHeight).fillAndStroke(bgColor, '#cccccc');
//         doc.fillColor('#000000').fontSize(6.5).font('Helvetica')
//           .text(cell || '-', cx + 2, tableY + 6, {
//             width: columns[j].width - 4,
//             align: 'center',
//             ellipsis: true,
//             lineBreak: false,
//           });
//         cx += columns[j].width;
//       });

//       tableY += rowHeight;
//     });

//     // --- Total Row ---
//     const totalCompanyHead    = records.reduce((s, r) => s + cleanNum(r.Revised_Company_Head_Amount_4),    0);
//     const totalContractorHead = records.reduce((s, r) => s + cleanNum(r.Revised_Contractor_Head_Amount_4), 0);
//     const totalLabourAll      = records.reduce((s, r) => s + cleanNum(r.Number_Of_Labour_1_3) + cleanNum(r.Number_Of_Labour_2_3), 0);

//     const totalRowData = [
//       '', '', '', '', '', '', '', totalLabourAll.toString(),
//       totalCompanyHead.toFixed(2),
//       totalContractorHead.toFixed(2),
//     ];

//     cx = tableX;

//     totalRowData.forEach((cell, j) => {
//       doc.rect(cx, tableY, columns[j].width, rowHeight).fillAndStroke('#cfe2ff', '#000000');
//       doc.fillColor('#000000').fontSize(7).font('Helvetica-Bold')
//         .text(cell || '', cx + 2, tableY + 6, { width: columns[j].width - 4, align: 'center', lineBreak: false });
//       cx += columns[j].width;
//     });

//     tableY += rowHeight + 10;

//     // --- Grand Total Section ---
//     const grandTotalCombined = totalCompanyHead + totalContractorHead;
//     const gtBoxX     = margin + contentWidth - 280;
//     const gtBoxWidth = 280;
//     const gtRowH     = 20;

//     doc.rect(gtBoxX, tableY, gtBoxWidth / 2, gtRowH).fillAndStroke('#0d2b4e', '#000000');
//     doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold')
//       .text('GRAND TOTAL', gtBoxX + 4, tableY + 5, { width: gtBoxWidth / 2 - 8, align: 'left' });
//     doc.rect(gtBoxX + gtBoxWidth / 2, tableY, gtBoxWidth / 2, gtRowH).fillAndStroke('#cfe2ff', '#000000');
//     doc.fillColor('#000000').fontSize(8.5).font('Helvetica-Bold')
//       .text(grandTotalCombined.toFixed(2), gtBoxX + gtBoxWidth / 2 + 4, tableY + 5, { width: gtBoxWidth / 2 - 8, align: 'right' });
//     tableY += gtRowH + 25;

//     // --- Signature Section ---
//     doc.fontSize(9).font('Helvetica-Bold')
//       .text('Prepared By: _____________________', margin,       tableY)
//       .text('Checked By:  _____________________', margin + 240, tableY)
//       .text('Approved By: _____________________', margin + 480, tableY);

//     doc.end();
//   });
// }

// async function uploadPDFToDrive(pdfBuffer, fileName) {
//   const bufferStream = new Readable();
//   bufferStream.push(pdfBuffer);
//   bufferStream.push(null);

//   const response = await drive.files.create({
//     supportsAllDrives: true,
//     requestBody: {
//       name: fileName,
//       mimeType: 'application/pdf',
//       parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
//     },
//     media: {
//       mimeType: 'application/pdf',
//       body: bufferStream,
//     },
//     fields: 'id, webViewLink',
//   });

//   await drive.permissions.create({
//     fileId: response.data.id,
//     supportsAllDrives: true,
//     requestBody: {
//       role: 'reader',
//       type: 'anyone',
//     },
//   });

//   return {
//     fileId: response.data.id,
//     fileUrl: response.data.webViewLink,
//   };
// }

// router.get('/Get-PDF-Data', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: SiteExpeseSheetId,
//       range: 'Labour_FMS!A7:BL',
//     });

//     const rows = response.data.values || [];

//     const pendingLabour = rows
//       .filter(row => {
//         if (row.length < 18) return false;
//         const planned3 = (row[56] || '').toString().trim();
//         const actual3  = (row[57] || '').toString().trim();
//         return planned3 !== '' && actual3 === '';
//       })
//       .map(row => ({
//         timestamp:                        row[0]  || '',
//         uid:                              row[1]  || '',
//         projectName:                      row[2]  || '',
//         projectEngineer:                  row[3]  || '',
//         workType:                         row[4]  || '',
//         workDescription:                  row[5]  || '',
//         labourCategory1:                  row[6]  || '',
//         numberOfLabour1:                  row[7]  || '',
//         labourCategory2:                  row[8]  || '',
//         numberOfLabour2:                  row[9]  || '',
//         totalLabour:                      row[10] || '',
//         dateRequired:                     row[11] || '',
//         headOfContractor:                 row[12] || '',
//         nameOfContractor:                 row[13] || '',
//         contractorFirmName:               row[14] || '',
//         Approved_Head_2:                  row[24] || '',
//         Labouar_Contractor_Name_3:        row[32] || '',
//         Labour_Category_1_3:              row[33] || '',
//         Number_Of_Labour_1_3:             row[34] || '',
//         Labour_Rate_1_3:                  row[35] || '',
//         Labour_Category_2_3:              row[36] || '',
//         Number_Of_Labour_2_3:             row[37] || '',
//         Labour_Rate_2_3:                  row[38] || '',
//         Total_Wages_3:                    row[39] || '',
//         Conveyanance_3:                   row[40] || '',
//         Total_Paid_Amount_3:              row[41] || '',
//         Deployed_Category_1_Labour_No_4:  row[52] || '',
//         Deployed_Category_2_Labour_No_4:  row[53] || '',
//         Revised_Company_Head_Amount_4:    row[54] || '',
//         Revised_Contractor_Head_Amount_4: row[55] || '',
//         remark4:                          row[56] || '',
//         planned5:                         row[56] || '',
//         actua5:                           row[57] || '',
//       }));

//     res.json({
//       success: true,
//       count: pendingLabour.length,
//       data: pendingLabour,
//     });
//   } catch (error) {
//     console.error('Error fetching pending labour approvals:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch pending labour approvals',
//     });
//   }
// });

// router.post('/Generate-PDF', async (req, res) => {
//   try {
//     const { uids, paidName, billNo } = req.body;

//     if (!uids || !Array.isArray(uids) || uids.length === 0)
//       return res.status(400).json({ success: false, error: 'uids array is required' });
//     if (!paidName)
//       return res.status(400).json({ success: false, error: 'paidName is required' });
//     if (!billNo)
//       return res.status(400).json({ success: false, error: 'billNo is required' });

//     const sheetResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId: SiteExpeseSheetId,
//       range: 'Labour_FMS!A7:BL',
//     });

//     const rows = sheetResponse.data.values || [];

//     const matchedRecords   = [];
//     const matchedSheetRows = [];

//     rows.forEach((row, index) => {
//       const rowUid = (row[1] || '').toString().trim();
//       if (uids.includes(rowUid)) {
//         matchedRecords.push({
//           sheetRowIndex:                    index + 7,
//           uid:                              row[1]  || '',
//           projectName:                      row[2]  || '',
//           projectEngineer:                  row[3]  || '',
//           workType:                         row[4]  || '',
//           workDescription:                  row[5]  || '',
//           labourCategory1:                  row[6]  || '',
//           numberOfLabour1:                  row[7]  || '',
//           labourCategory2:                  row[8]  || '',
//           numberOfLabour2:                  row[9]  || '',
//           totalLabour:                      row[10] || '',
//           dateRequired:                     row[11] || '',
//           headOfContractor:                 row[12] || '',
//           nameOfContractor:                 row[13] || '',
//           contractorFirmName:               row[14] || '',
//           Approved_Head_2:                  row[24] || '',
//           Labouar_Contractor_Name_3:        row[32] || '',
//           Labour_Category_1_3:              row[33] || '',
//           Number_Of_Labour_1_3:             row[34] || '',
//           Labour_Rate_1_3:                  row[35] || '',
//           Labour_Category_2_3:              row[36] || '',
//           Number_Of_Labour_2_3:             row[37] || '',
//           Labour_Rate_2_3:                  row[38] || '',
//           Total_Wages_3:                    row[39] || '',
//           Conveyanance_3:                   row[40] || '',
//           Total_Paid_Amount_3:              row[41] || '',
//           Deployed_Category_1_Labour_No_4:  row[52] || '',
//           Deployed_Category_2_Labour_No_4:  row[53] || '',
//           Revised_Company_Head_Amount_4:    row[54] || '',
//           Revised_Contractor_Head_Amount_4: row[55] || '',
//         });
//         matchedSheetRows.push(index + 7);
//       }
//     });

//     if (matchedRecords.length === 0)
//       return res.status(404).json({ success: false, error: 'No matching UIDs found in sheet' });

//     const pdfBuffer = await generateLabourPDF(matchedRecords, billNo, paidName);

//     const fileName = `Labour_Bill_${billNo}_${Date.now()}.pdf`;
//     const { fileId, fileUrl } = await uploadPDFToDrive(pdfBuffer, fileName);

//     const updateRequests = matchedSheetRows.map(sheetRow => ({
//       range: `Labour_FMS!BG${sheetRow}:BJ${sheetRow}`,
//       values: [['Done', paidName, billNo, fileUrl]],
//     }));

//     await sheets.spreadsheets.values.batchUpdate({
//       spreadsheetId: SiteExpeseSheetId,
//       requestBody: {
//         valueInputOption: 'USER_ENTERED',
//         data: updateRequests,
//       },
//     });

//     res.json({
//       success: true,
//       message: `PDF generated and sheet updated for ${matchedRecords.length} UID(s)`,
//       pdfUrl: fileUrl,
//       fileId,
//       billNo,
//       updatedUids: matchedRecords.map(r => r.uid),
//     });

//   } catch (error) {
//     console.error('Error generating PDF:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to generate PDF or update sheet',
//       details: error.message,
//     });
//   }
// });


// module.exports = router;





////


const express = require('express');
const { sheets, drive, SiteExpeseSheetId } = require('../../config/googleSheet');
const PDFDocument = require('pdfkit');
const { Readable } = require('stream');

const router = express.Router();

// ─── Bill No Generator ─────────────────────────────────────────────────────────
// Sheet mein BI column (index 60) mein saare Bill Nos check karta hai
// Format: Bill_0001, Bill_0002 ...
// Agar already exist karta hai to next available number deta hai

async function generateUniqueBillNo() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SiteExpeseSheetId,
    range: 'Labour_FMS!BI7:BI',   // BG=Bill Status, BH=PaidName, BI=BillNo, BJ=URL
  });

  const rows = response.data.values || [];

  // Saare existing bill numbers collect karo
  const existingBillNos = new Set(
    rows
      .flat()
      .map(v => (v || '').toString().trim())
      .filter(v => /^Bill_\d+$/.test(v))
  );

  // Sabse bada number nikalo
  let maxNum = 0;
  existingBillNos.forEach(billNo => {
    const num = parseInt(billNo.replace('Bill_', ''), 10);
    if (!isNaN(num) && num > maxNum) maxNum = num;
  });

  // Next unique number generate karo
  let nextNum = maxNum + 1;
  let candidate = `Bill_${String(nextNum).padStart(4, '0')}`;

  // Safety: agar kisi wajah se exist kare to aage badho
  while (existingBillNos.has(candidate)) {
    nextNum++;
    candidate = `Bill_${String(nextNum).padStart(4, '0')}`;
  }

  return candidate;
}

// ─── Get Next Bill No (preview ke liye — frontend fetch karega) ────────────────
router.get('/Get-Next-BillNo', async (req, res) => {
  try {
    const billNo = await generateUniqueBillNo();
    res.json({ success: true, billNo });
  } catch (error) {
    console.error('Error generating bill no:', error);
    res.status(500).json({ success: false, error: 'Failed to generate bill number' });
  }
});

// ─── PDF Generator ─────────────────────────────────────────────────────────────
// async function generateLabourPDF(records, billNo, paidName) {
//   return new Promise((resolve, reject) => {
//     const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
//     const buffers = [];

//     doc.on('data', chunk => buffers.push(chunk));
//     doc.on('end', () => resolve(Buffer.concat(buffers)));
//     doc.on('error', reject);

//     const pageWidth    = 841.89;
//     const margin       = 40;
//     const contentWidth = pageWidth - margin * 2;
//     const first        = records[0];

//     doc.fontSize(16).font('Helvetica-Bold')
//       .text('R. C. C. Infrastructures', margin, 30, { align: 'center', width: contentWidth });
      
//     doc.fontSize(16).font('Helvetica-Bold')
//       .text('LABOUR DEPLOYED REPORT', margin, 30, { align: 'center', width: contentWidth });

//     doc.moveDown(0.5);
//     doc.moveTo(margin, doc.y).lineTo(margin + contentWidth, doc.y).lineWidth(1).stroke();
//     doc.moveDown(0.4);

//     const headerStartY = doc.y;
//     const col1X        = margin;
//     const col2X        = margin + contentWidth / 2;

//     const headerField = (label, value, x, y) => {
//       doc.fontSize(9).font('Helvetica-Bold').text(`${label} :`, x, y, { continued: true, width: 180 });
//       doc.font('Helvetica').text(`  ${value || '-'}`);
//     };

//     const cleanNum = val => parseFloat((val || '0').toString().replace(/,/g, '')) || 0;

//     const totalAllLabour = records.reduce((s, r) =>
//       s + cleanNum(r.Number_Of_Labour_1_3) + cleanNum(r.Number_Of_Labour_2_3), 0);

//     headerField('Project Name',           first.projectName,               col1X, headerStartY);
//     headerField('Total Labour',           totalAllLabour.toString(),       col2X, headerStartY);
//     headerField('Labour Contractor Name', first.Labouar_Contractor_Name_3, col1X, headerStartY + 16);
//     headerField('Paid By',                paidName,                        col2X, headerStartY + 16);
//     headerField('Bill No.',               billNo,                          col1X, headerStartY + 32);
//     headerField('Bill Date',              new Date().toLocaleDateString('en-IN'), col2X, headerStartY + 32);

//     doc.moveDown(3.2);
//     doc.moveTo(margin, doc.y).lineTo(margin + contentWidth, doc.y).lineWidth(0.5).stroke();
//     doc.moveDown(0.9);

//     const columns = [
//       { label: 'Sr.\nNo.',             width: 30  },
//       { label: 'UID No.',              width: 80  },
//       { label: 'Work Details',         width: 200 },
//       { label: 'Labour\nCategory 1',   width: 72  },
//       { label: 'Labour\nNo. 1',        width: 50  },
//       { label: 'Labour\nCategory 2',   width: 72  },
//       { label: 'Labour\nNo. 2',        width: 50  },
//       { label: 'Total\nLabour',        width: 50  },
//       { label: 'Company\nHead Amt',    width: 75  },
//       { label: 'Contractor\nHead Amt', width: 75  },
//     ];

//     const headerHeight = 30;
//     const rowHeight    = 22;
//     let tableX         = margin;
//     let tableY         = doc.y;

//     // Header row
//     let cx = tableX;
//     columns.forEach(col => {
//       doc.rect(cx, tableY, col.width, headerHeight).fillAndStroke('#1a3c6e', '#000000');
//       doc.fillColor('#ffffff').fontSize(6.5).font('Helvetica-Bold')
//         .text(col.label, cx + 2, tableY + 5, { width: col.width - 4, align: 'center', lineGap: 1 });
//       doc.fillColor('#000000');
//       cx += col.width;
//     });

//     tableY += headerHeight;

//     // Data rows
//     records.forEach((row, i) => {
//       const rowTotalLabour = cleanNum(row.Number_Of_Labour_1_3) + cleanNum(row.Number_Of_Labour_2_3);
//       const rowData = [
//         (i + 1).toString(),
//         row.uid,
//         row.workDescription,
//         row.Labour_Category_1_3,
//         row.Number_Of_Labour_1_3,
//         row.Labour_Category_2_3,
//         row.Number_Of_Labour_2_3,
//         rowTotalLabour.toString(),
//         row.Revised_Company_Head_Amount_4,
//         row.Revised_Contractor_Head_Amount_4,
//       ];

//       const bgColor = i % 2 === 0 ? '#f0f5ff' : '#ffffff';
//       cx = tableX;

//       rowData.forEach((cell, j) => {
//         doc.rect(cx, tableY, columns[j].width, rowHeight).fillAndStroke(bgColor, '#cccccc');
//         doc.fillColor('#000000').fontSize(6.5).font('Helvetica')
//           .text(cell || '-', cx + 2, tableY + 6, {
//             width: columns[j].width - 4,
//             align: 'center',
//             ellipsis: true,
//             lineBreak: false,
//           });
//         cx += columns[j].width;
//       });

//       tableY += rowHeight;
//     });

//     // Total row
//     const totalCompanyHead    = records.reduce((s, r) => s + cleanNum(r.Revised_Company_Head_Amount_4), 0);
//     const totalContractorHead = records.reduce((s, r) => s + cleanNum(r.Revised_Contractor_Head_Amount_4), 0);
//     const totalLabourAll      = records.reduce((s, r) => s + cleanNum(r.Number_Of_Labour_1_3) + cleanNum(r.Number_Of_Labour_2_3), 0);

//     const totalRowData = [
//       '', '', '', '', '', '', '',
//       totalLabourAll.toString(),
//       totalCompanyHead.toFixed(2),
//       totalContractorHead.toFixed(2),
//     ];

//     cx = tableX;
//     totalRowData.forEach((cell, j) => {
//       doc.rect(cx, tableY, columns[j].width, rowHeight).fillAndStroke('#cfe2ff', '#000000');
//       doc.fillColor('#000000').fontSize(7).font('Helvetica-Bold')
//         .text(cell || '', cx + 2, tableY + 6, { width: columns[j].width - 4, align: 'center', lineBreak: false });
//       cx += columns[j].width;
//     });

//     tableY += rowHeight + 10;

//     // Grand Total
//     const grandTotalCombined = totalCompanyHead + totalContractorHead;
//     const gtBoxX     = margin + contentWidth - 280;
//     const gtBoxWidth = 280;
//     const gtRowH     = 20;

//     doc.rect(gtBoxX, tableY, gtBoxWidth / 2, gtRowH).fillAndStroke('#0d2b4e', '#000000');
//     doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold')
//       .text('GRAND TOTAL', gtBoxX + 4, tableY + 5, { width: gtBoxWidth / 2 - 8, align: 'left' });
//     doc.rect(gtBoxX + gtBoxWidth / 2, tableY, gtBoxWidth / 2, gtRowH).fillAndStroke('#cfe2ff', '#000000');
//     doc.fillColor('#000000').fontSize(8.5).font('Helvetica-Bold')
//       .text(grandTotalCombined.toFixed(2), gtBoxX + gtBoxWidth / 2 + 4, tableY + 5, { width: gtBoxWidth / 2 - 8, align: 'right' });
//     tableY += gtRowH + 25;

//     // Signatures
//     doc.fontSize(9).font('Helvetica-Bold')
//       .text('Prepared By: _____________________', margin,       tableY)
//       .text('Checked By:  _____________________', margin + 240, tableY)
//       .text('Approved By: _____________________', margin + 480, tableY);

//     doc.end();
//   });
// }




////

async function generateLabourPDF(records, billNo, paidName) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    const buffers = [];

    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const pageWidth    = 841.89;
    const margin       = 40;
    const contentWidth = pageWidth - margin * 2;
    const first        = records[0];

    // ✅ Line 1 - Company Name (top)
    doc.fontSize(16).font('Helvetica-Bold')
      .text('R. C. C. Infrastructures', margin, 30, { align: 'center', width: contentWidth });

    // ✅ Gap between two headings
    doc.moveDown(0.4);

    // ✅ Line 2 - Report Title
    doc.fontSize(13).font('Helvetica-Bold')
      .text('LABOUR DEPLOYED REPORT', margin, doc.y, { align: 'center', width: contentWidth });

    doc.moveDown(0.5);
    doc.moveTo(margin, doc.y).lineTo(margin + contentWidth, doc.y).lineWidth(1).stroke();
    doc.moveDown(0.4);

    const headerStartY = doc.y;
    const col1X        = margin;
    const col2X        = margin + contentWidth / 2;

    const headerField = (label, value, x, y) => {
      doc.fontSize(9).font('Helvetica-Bold').text(`${label} :`, x, y, { continued: true, width: 180 });
      doc.font('Helvetica').text(`  ${value || '-'}`);
    };

    const cleanNum = val => parseFloat((val || '0').toString().replace(/,/g, '')) || 0;

    const totalAllLabour = records.reduce((s, r) =>
      s + cleanNum(r.Number_Of_Labour_1_3) + cleanNum(r.Number_Of_Labour_2_3), 0);

    headerField('Project Name',           first.projectName,               col1X, headerStartY);
    headerField('Total Labour',           totalAllLabour.toString(),       col2X, headerStartY);
    headerField('Labour Contractor Name', first.Labouar_Contractor_Name_3, col1X, headerStartY + 16);
    headerField('Paid By',                paidName,                        col2X, headerStartY + 16);
    headerField('Bill No.',               billNo,                          col1X, headerStartY + 32);
    headerField('Bill Date',              new Date().toLocaleDateString('en-IN'), col2X, headerStartY + 32);

    doc.moveDown(3.2);
    doc.moveTo(margin, doc.y).lineTo(margin + contentWidth, doc.y).lineWidth(0.5).stroke();
    doc.moveDown(0.9);

    const columns = [
      { label: 'Sr.\nNo.',             width: 30  },
      { label: 'UID No.',              width: 80  },
      { label: 'Work Details',         width: 200 },
      { label: 'Labour\nCategory 1',   width: 72  },
      { label: 'Labour\nNo. 1',        width: 50  },
      { label: 'Labour\nCategory 2',   width: 72  },
      { label: 'Labour\nNo. 2',        width: 50  },
      { label: 'Total\nLabour',        width: 50  },
      { label: 'Company\nHead Amt',    width: 75  },
      { label: 'Contractor\nHead Amt', width: 75  },
    ];

    const headerHeight = 30;
    const rowHeight    = 22;
    let tableX         = margin;
    let tableY         = doc.y;

    // Header row
    let cx = tableX;
    columns.forEach(col => {
      doc.rect(cx, tableY, col.width, headerHeight).fillAndStroke('#1a3c6e', '#000000');
      doc.fillColor('#ffffff').fontSize(6.5).font('Helvetica-Bold')
        .text(col.label, cx + 2, tableY + 5, { width: col.width - 4, align: 'center', lineGap: 1 });
      doc.fillColor('#000000');
      cx += col.width;
    });

    tableY += headerHeight;

    // Data rows
    records.forEach((row, i) => {
      const rowTotalLabour = cleanNum(row.Number_Of_Labour_1_3) + cleanNum(row.Number_Of_Labour_2_3);
      const rowData = [
        (i + 1).toString(),
        row.uid,
        row.workDescription,
        row.Labour_Category_1_3,
        row.Number_Of_Labour_1_3,
        row.Labour_Category_2_3,
        row.Number_Of_Labour_2_3,
        rowTotalLabour.toString(),
        row.Revised_Company_Head_Amount_4,
        row.Revised_Contractor_Head_Amount_4,
      ];

      const bgColor = i % 2 === 0 ? '#f0f5ff' : '#ffffff';
      cx = tableX;

      rowData.forEach((cell, j) => {
        doc.rect(cx, tableY, columns[j].width, rowHeight).fillAndStroke(bgColor, '#cccccc');
        doc.fillColor('#000000').fontSize(6.5).font('Helvetica')
          .text(cell || '-', cx + 2, tableY + 6, {
            width: columns[j].width - 4,
            align: 'center',
            ellipsis: true,
            lineBreak: false,
          });
        cx += columns[j].width;
      });

      tableY += rowHeight;
    });

    // Total row
    const totalCompanyHead    = records.reduce((s, r) => s + cleanNum(r.Revised_Company_Head_Amount_4), 0);
    const totalContractorHead = records.reduce((s, r) => s + cleanNum(r.Revised_Contractor_Head_Amount_4), 0);
    const totalLabourAll      = records.reduce((s, r) => s + cleanNum(r.Number_Of_Labour_1_3) + cleanNum(r.Number_Of_Labour_2_3), 0);

    const totalRowData = [
      '', '', '', '', '', '', '',
      totalLabourAll.toString(),
      totalCompanyHead.toFixed(2),
      totalContractorHead.toFixed(2),
    ];

    cx = tableX;
    totalRowData.forEach((cell, j) => {
      doc.rect(cx, tableY, columns[j].width, rowHeight).fillAndStroke('#cfe2ff', '#000000');
      doc.fillColor('#000000').fontSize(7).font('Helvetica-Bold')
        .text(cell || '', cx + 2, tableY + 6, { width: columns[j].width - 4, align: 'center', lineBreak: false });
      cx += columns[j].width;
    });

    tableY += rowHeight + 10;

    // Grand Total
    const grandTotalCombined = totalCompanyHead + totalContractorHead;
    const gtBoxX     = margin + contentWidth - 280;
    const gtBoxWidth = 280;
    const gtRowH     = 20;

    doc.rect(gtBoxX, tableY, gtBoxWidth / 2, gtRowH).fillAndStroke('#0d2b4e', '#000000');
    doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold')
      .text('GRAND TOTAL', gtBoxX + 4, tableY + 5, { width: gtBoxWidth / 2 - 8, align: 'left' });
    doc.rect(gtBoxX + gtBoxWidth / 2, tableY, gtBoxWidth / 2, gtRowH).fillAndStroke('#cfe2ff', '#000000');
    doc.fillColor('#000000').fontSize(8.5).font('Helvetica-Bold')
      .text(grandTotalCombined.toFixed(2), gtBoxX + gtBoxWidth / 2 + 4, tableY + 5, { width: gtBoxWidth / 2 - 8, align: 'right' });
    tableY += gtRowH + 25;

    // Signatures
    doc.fontSize(9).font('Helvetica-Bold')
      .text('Prepared By: _____________________', margin,       tableY)
      .text('Checked By:  _____________________', margin + 240, tableY)
      .text('Approved By: _____________________', margin + 480, tableY);

    doc.end();
  });
}




// ─── Upload to Drive ───────────────────────────────────────────────────────────
async function uploadPDFToDrive(pdfBuffer, fileName) {
  const bufferStream = new Readable();
  bufferStream.push(pdfBuffer);
  bufferStream.push(null);

  const response = await drive.files.create({
    supportsAllDrives: true,
    requestBody: {
      name: fileName,
      mimeType: 'application/pdf',
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    },
    media: { mimeType: 'application/pdf', body: bufferStream },
    fields: 'id, webViewLink',
  });

  await drive.permissions.create({
    fileId: response.data.id,
    supportsAllDrives: true,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  return { fileId: response.data.id, fileUrl: response.data.webViewLink };
}

// ─── GET PDF Data ──────────────────────────────────────────────────────────────
router.get('/Get-PDF-Data', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Labour_FMS!A7:BL',
    });

    const rows = response.data.values || [];

    const pendingLabour = rows
      .filter(row => {
        if (row.length < 18) return false;
        const planned3 = (row[56] || '').toString().trim();
        const actual3  = (row[57] || '').toString().trim();
        return planned3 !== '' && actual3 === '';
      })
      .map(row => ({
        timestamp:                        row[0]  || '',
        uid:                              row[1]  || '',
        projectName:                      row[2]  || '',
        projectEngineer:                  row[3]  || '',
        workType:                         row[4]  || '',
        workDescription:                  row[5]  || '',
        labourCategory1:                  row[6]  || '',
        numberOfLabour1:                  row[7]  || '',
        labourCategory2:                  row[8]  || '',
        numberOfLabour2:                  row[9]  || '',
        totalLabour:                      row[10] || '',
        dateRequired:                     row[11] || '',
        headOfContractor:                 row[12] || '',
        nameOfContractor:                 row[13] || '',
        contractorFirmName:               row[14] || '',
        Approved_Head_2:                  row[24] || '',
        Labouar_Contractor_Name_3:        row[32] || '',
        Labour_Category_1_3:             row[33] || '',
        Number_Of_Labour_1_3:             row[34] || '',
        Labour_Rate_1_3:                  row[35] || '',
        Labour_Category_2_3:              row[36] || '',
        Number_Of_Labour_2_3:             row[37] || '',
        Labour_Rate_2_3:                  row[38] || '',
        Total_Wages_3:                    row[39] || '',
        Conveyanance_3:                   row[40] || '',
        Total_Paid_Amount_3:              row[41] || '',
        Deployed_Category_1_Labour_No_4:  row[52] || '',
        Deployed_Category_2_Labour_No_4:  row[53] || '',
        Revised_Company_Head_Amount_4:    row[54] || '',
        Revised_Contractor_Head_Amount_4: row[55] || '',
        remark4:                          row[56] || '',
        planned5:                         row[56] || '',
        actua5:                           row[57] || '',
      }));

    res.json({ success: true, count: pendingLabour.length, data: pendingLabour });
  } catch (error) {
    console.error('Error fetching pending labour:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch pending labour approvals' });
  }
});

// ─── POST Generate PDF ─────────────────────────────────────────────────────────
router.post('/Generate-PDF', async (req, res) => {
  try {
    const { uids, paidName } = req.body;

    if (!uids || !Array.isArray(uids) || uids.length === 0)
      return res.status(400).json({ success: false, error: 'uids array is required' });
    if (!paidName)
      return res.status(400).json({ success: false, error: 'paidName is required' });

    // ✅ Bill No. ab backend se generate hoga — frontend se nahi aayega
    const billNo = await generateUniqueBillNo();

    const sheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Labour_FMS!A7:BL',
    });

    const rows = sheetResponse.data.values || [];
    const matchedRecords   = [];
    const matchedSheetRows = [];

    rows.forEach((row, index) => {
      const rowUid = (row[1] || '').toString().trim();
      if (uids.includes(rowUid)) {
        matchedRecords.push({
          sheetRowIndex:                    index + 7,
          uid:                              row[1]  || '',
          projectName:                      row[2]  || '',
          projectEngineer:                  row[3]  || '',
          workType:                         row[4]  || '',
          workDescription:                  row[5]  || '',
          labourCategory1:                  row[6]  || '',
          numberOfLabour1:                  row[7]  || '',
          labourCategory2:                  row[8]  || '',
          numberOfLabour2:                  row[9]  || '',
          totalLabour:                      row[10] || '',
          dateRequired:                     row[11] || '',
          headOfContractor:                 row[12] || '',
          nameOfContractor:                 row[13] || '',
          contractorFirmName:               row[14] || '',
          Approved_Head_2:                  row[24] || '',
          Labouar_Contractor_Name_3:        row[32] || '',
          Labour_Category_1_3:              row[33] || '',
          Number_Of_Labour_1_3:             row[34] || '',
          Labour_Rate_1_3:                  row[35] || '',
          Labour_Category_2_3:              row[36] || '',
          Number_Of_Labour_2_3:             row[37] || '',
          Labour_Rate_2_3:                  row[38] || '',
          Total_Wages_3:                    row[39] || '',
          Conveyanance_3:                   row[40] || '',
          Total_Paid_Amount_3:              row[41] || '',
          Deployed_Category_1_Labour_No_4:  row[52] || '',
          Deployed_Category_2_Labour_No_4:  row[53] || '',
          Revised_Company_Head_Amount_4:    row[54] || '',
          Revised_Contractor_Head_Amount_4: row[55] || '',
        });
        matchedSheetRows.push(index + 7);
      }
    });

    if (matchedRecords.length === 0)
      return res.status(404).json({ success: false, error: 'No matching UIDs found in sheet' });

    const pdfBuffer          = await generateLabourPDF(matchedRecords, billNo, paidName);
    const fileName           = `Labour_Bill_${billNo}_${Date.now()}.pdf`;
    const { fileId, fileUrl } = await uploadPDFToDrive(pdfBuffer, fileName);

    // ✅ Sheet update: BG=Done, BH=paidName, BI=billNo, BJ=fileUrl
    const updateRequests = matchedSheetRows.map(sheetRow => ({
      range: `Labour_FMS!BG${sheetRow}:BJ${sheetRow}`,
      values: [['Done', paidName, billNo, fileUrl]],
    }));

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SiteExpeseSheetId,
      requestBody: { valueInputOption: 'USER_ENTERED', data: updateRequests },
    });

    res.json({
      success: true,
      message: `PDF generated for ${matchedRecords.length} UID(s)`,
      pdfUrl: fileUrl,
      fileId,
      billNo,   // ✅ frontend ko billNo wapas bhejo (toast mein dikhane ke liye)
      updatedUids: matchedRecords.map(r => r.uid),
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate PDF or update sheet',
      details: error.message,
    });
  }
});

module.exports = router;