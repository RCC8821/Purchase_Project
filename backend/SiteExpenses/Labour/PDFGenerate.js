

// const express = require('express');
// const { sheets, drive, SiteExpeseSheetId } = require('../../config/googleSheet');
// const PDFDocument = require('pdfkit');
// const { Readable } = require('stream');

// const router = express.Router();

// // ─── Bill No Generator ─────────────────────────────────────────────────────────
// async function generateUniqueBillNo() {
//   const response = await sheets.spreadsheets.values.get({
//     spreadsheetId: SiteExpeseSheetId,
//     range: 'Labour_FMS!BJ7:BJ',
//   });

//   const rows = response.data.values || [];

//   console.log('=== Bill No Debug ===');
//   console.log('Total rows fetched:', rows.length);
//   console.log('Raw values (first 10):', rows.slice(0, 10));

//   const allValues = rows
//     .flat()
//     .map(v => (v || '').toString().trim());

//   console.log('All bill values:', allValues.filter(v => v !== ''));

//   // ✅ Bug Fix 1: Regex ab "Lab_Bill_0001" pattern match karega
//   const existingBillNos = new Set(
//     allValues.filter(v => /^Lab_Bill_\d+$/.test(v))
//   );

//   console.log('Existing Lab_Bill numbers:', [...existingBillNos]);

//   let maxNum = 0;
//   existingBillNos.forEach(billNo => {
//     // ✅ Bug Fix 2: Replace string regex se match karta hai
//     const num = parseInt(billNo.replace('Lab_Bill_', ''), 10);
//     if (!isNaN(num) && num > maxNum) maxNum = num;
//   });

//   console.log('Max number found:', maxNum);
//   console.log('Next number will be:', maxNum + 1);
//   console.log('====================');

//   let nextNum   = maxNum + 1;
//   let candidate = `Lab_Bill_${String(nextNum).padStart(4, '0')}`;

//   // Duplicate check (safety net)
//   while (existingBillNos.has(candidate)) {
//     nextNum++;
//     candidate = `Lab_Bill_${String(nextNum).padStart(4, '0')}`;
//   }

//   return candidate;
// }

// // ─── Get Next Bill No ──────────────────────────────────────────────────────────
// router.get('/Get-Next-BillNo', async (req, res) => {
//   try {
//     const billNo = await generateUniqueBillNo();
//     res.json({ success: true, billNo });
//   } catch (error) {
//     console.error('Error generating bill no:', error);
//     res.status(500).json({ 
//       success: false, 
//       error: 'Failed to generate bill number' 
//     });
//   }
// });



// async function generateLabourPDF(records, billNo, paidName) {
//   return new Promise((resolve, reject) => {
//     const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
//     const buffers = [];

//     doc.on('data', chunk => buffers.push(chunk));
//     doc.on('end',  () => resolve(Buffer.concat(buffers)));
//     doc.on('error', reject);

//     const pageWidth    = 841.89;
//     const margin       = 40;
//     const contentWidth = pageWidth - margin * 2;
//     const first        = records[0];

//     const cleanNum = val => {
//       if (val == null || val === '') return 0;
//       const cleaned = val.toString().replace(/[^0-9.-]/g, '');
//       return parseFloat(cleaned) || 0;
//     };

//     // ─── Company Name ─────────────────────────────────────────────────────────
//     doc.fontSize(16).font('Helvetica-Bold')
//       .text('R. C. C. Infrastructures', margin, 30, { align: 'center', width: contentWidth });

//     doc.moveDown(0.4);

//     doc.fontSize(13).font('Helvetica-Bold')
//       .text('LABOUR DEPLOYED REPORT', margin, doc.y, { align: 'center', width: contentWidth });

//     doc.moveDown(0.5);
//     doc.moveTo(margin, doc.y).lineTo(margin + contentWidth, doc.y).lineWidth(1).stroke();
//     doc.moveDown(0.4);

//     const headerStartY = doc.y;
//     const col1X        = margin;
//     const col2X        = margin + contentWidth / 2;
//     const labelWidth   = 130;
//     const valueWidth   = 200;
//     const lineHeight   = 16;

//     const totalAllLabour = records.reduce((s, r) =>
//       s + cleanNum(r.Number_Of_Labour_1_3) + cleanNum(r.Number_Of_Labour_2_3), 0);

//     const headerField = (label, value, x, y) => {
//       doc.fontSize(8.5).font('Helvetica-Bold')
//         .text(`${label} :`, x, y, {
//           width:     labelWidth,
//           lineBreak: false,
//           ellipsis:  false,
//         });
//       doc.fontSize(8.5).font('Helvetica')
//         .text(value || '-', x + labelWidth + 4, y, {
//           width:     valueWidth,
//           lineBreak: false,
//           ellipsis:  true,
//         });
//     };

//     // ✅ Row 1
//     headerField('Project Name',           first.projectName,                     col1X, headerStartY);
//     headerField('Bill No.',               billNo,                                col2X, headerStartY);
//     // ✅ Row 2
//     headerField('Labour Contractor Name', first.Labouar_Contractor_Name_3,       col1X, headerStartY + lineHeight);
//     headerField('Bill Date',              new Date().toLocaleDateString('en-IN'), col2X, headerStartY + lineHeight);
//     // ✅ Row 3
//     headerField('Paid By',                paidName,                              col1X, headerStartY + lineHeight * 2);
//     headerField('Total Labour',           totalAllLabour.toString(),             col2X, headerStartY + lineHeight * 2);

//     const tableStartY = headerStartY + lineHeight * 2 + 28;

//     doc.moveTo(margin, tableStartY - 8)
//        .lineTo(margin + contentWidth, tableStartY - 8)
//        .lineWidth(0.5).stroke();

//     // ─── Table Columns ────────────────────────────────────────────────────────
//     const columns = [
//       { label: 'Sr.\nNo.',              width: 28  },
//       { label: 'Date\nRequired',        width: 55  },
//       { label: 'UID No.',               width: 70  },
//       { label: 'Work Details',          width: 135 },
//       { label: 'Contractor\nDebit Name', width: 85  },
//       { label: 'Labour\nCategory 1',    width: 60  },
//       { label: 'Labour\nNo. 1',         width: 40  },
//       { label: 'Labour\nCategory 2',    width: 60  },
//       { label: 'Labour\nNo. 2',         width: 40  },
//       { label: 'Total\nLabour',         width: 40  },
//       { label: 'Company\nHead Amt',     width: 72  },
//       { label: 'Contractor\nHead Amt',  width: 72  },
//     ];

//     const headerHeight = 30;
//     const rowHeight    = 22;
//     const tableX       = margin;
//     let   tableY       = tableStartY;

//     // ─── Table Header Row ─────────────────────────────────────────────────────
//     let cx = tableX;
//     columns.forEach(col => {
//       doc.rect(cx, tableY, col.width, headerHeight).fillAndStroke('#1a3c6e', '#000000');
//       doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold')
//         .text(col.label, cx + 2, tableY + 4, {
//           width:   col.width - 4,
//           align:   'center',
//           lineGap: 1,
//         });
//       doc.fillColor('#000000');
//       cx += col.width;
//     });

//     tableY += headerHeight;

//     // ─── Data Rows ────────────────────────────────────────────────────────────
//     records.forEach((row, i) => {
//       const rowTotalLabour = cleanNum(row.Number_Of_Labour_1_3) + cleanNum(row.Number_Of_Labour_2_3);
//       const companyAmt     = cleanNum(row.Revised_Company_Head_Amount_4);
//       const contractorAmt  = cleanNum(row.Revised_Contractor_Head_Amount_4);

//       const rowData = [
//         (i + 1).toString(),
//         row.dateRequired         || '-',
//         row.uid                  || '-',
//         row.workDescription      || '-',
//         row.contractorFirmName   || '-',
//         row.Labour_Category_1_3  || '-',
//         row.Number_Of_Labour_1_3 || '-',
//         row.Labour_Category_2_3  || '-',
//         row.Number_Of_Labour_2_3 || '-',
//         rowTotalLabour > 0 ? rowTotalLabour.toString() : '-',
//         companyAmt    > 0  ? companyAmt.toFixed(2)     : '-',
//         contractorAmt > 0  ? contractorAmt.toFixed(2)  : '-',
//       ];

//       const bgColor = i % 2 === 0 ? '#f0f5ff' : '#ffffff';
//       cx = tableX;

//       rowData.forEach((cell, j) => {
//         doc.rect(cx, tableY, columns[j].width, rowHeight).fillAndStroke(bgColor, '#cccccc');
//         doc.fillColor('#000000').fontSize(9.5).font('Helvetica')
//           .text(String(cell), cx + 2, tableY + 6, {
//             width:     columns[j].width - 4,
//             align:     'center',
//             ellipsis:  true,
//             lineBreak: false,
//           });
//         cx += columns[j].width;
//       });

//       tableY += rowHeight;
//     });

//     // ─── Total Row ────────────────────────────────────────────────────────────
//     const totalCompanyHead    = records.reduce((s, r) => s + cleanNum(r.Revised_Company_Head_Amount_4),    0);
//     const totalContractorHead = records.reduce((s, r) => s + cleanNum(r.Revised_Contractor_Head_Amount_4), 0);
//     const totalLabourAll      = records.reduce((s, r) =>
//       s + cleanNum(r.Number_Of_Labour_1_3) + cleanNum(r.Number_Of_Labour_2_3), 0);

//     const totalRowData = [
//       '',
//       '',
//       '',
//       '',
//       '',
//       '',
//       '',
//       '',
//       '',
//       totalLabourAll.toString(),
//       totalCompanyHead.toFixed(2),
//       totalContractorHead.toFixed(2),
//     ];

//     cx = tableX;
//     totalRowData.forEach((cell, j) => {
//       doc.rect(cx, tableY, columns[j].width, rowHeight).fillAndStroke('#cfe2ff', '#000000');
//       doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold')
//         .text(cell || '', cx + 2, tableY + 7, {
//           width:     columns[j].width - 4,
//           align:     'center',
//           lineBreak: false,
//         });
//       cx += columns[j].width;
//     });

//     tableY += rowHeight + 12;

//     // ─── Summary Box ──────────────────────────────────────────────────────────
//     const boxWidth = 290;
//     const boxX     = margin + contentWidth - boxWidth;
//     const boxRowH  = 22;

//     doc.rect(boxX, tableY, boxWidth / 2, boxRowH).fillAndStroke('#0d2b4e', '#000000');
//     doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold')
//       .text('Total Company Head Amt', boxX + 5, tableY + 6, {
//         width:     boxWidth / 2 - 10,
//         align:     'left',
//         lineBreak: false,
//       });
//     doc.rect(boxX + boxWidth / 2, tableY, boxWidth / 2, boxRowH).fillAndStroke('#cfe2ff', '#000000');
//     doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold')
//       .text(totalCompanyHead.toFixed(2), boxX + boxWidth / 2 + 5, tableY + 6, {
//         width:     boxWidth / 2 - 10,
//         align:     'right',
//         lineBreak: false,
//       });

//     tableY += boxRowH;

//     doc.rect(boxX, tableY, boxWidth / 2, boxRowH).fillAndStroke('#0d2b4e', '#000000');
//     doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold')
//       .text('Total Contractor Head Amt', boxX + 5, tableY + 6, {
//         width:     boxWidth / 2 - 10,
//         align:     'left',
//         lineBreak: false,
//       });
//     doc.rect(boxX + boxWidth / 2, tableY, boxWidth / 2, boxRowH).fillAndStroke('#d4edda', '#000000');
//     doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold')
//       .text(totalContractorHead.toFixed(2), boxX + boxWidth / 2 + 5, tableY + 6, {
//         width:     boxWidth / 2 - 10,
//         align:     'right',
//         lineBreak: false,
//       });

//     tableY += boxRowH + 30;

//     // ─── Signatures ───────────────────────────────────────────────────────────
//     doc.fontSize(9).font('Helvetica-Bold')
//       .text('Prepared By: _____________________', margin,       tableY)
//       .text('Checked By:  _____________________', margin + 240, tableY)
//       .text('Approved By: _____________________', margin + 490, tableY);

//     doc.end();
//   });
// }



// // ─── Upload to Drive ───────────────────────────────────────────────────────────
// async function uploadPDFToDrive(pdfBuffer, fileName) {
//   const bufferStream = new Readable();
//   bufferStream.push(pdfBuffer);
//   bufferStream.push(null);

//   const response = await drive.files.create({
//     supportsAllDrives: true,
//     requestBody: {
//       name:     fileName,
//       mimeType: 'application/pdf',
//       parents:  [process.env.GOOGLE_DRIVE_FOLDER_ID],
//     },
//     media: { mimeType: 'application/pdf', body: bufferStream },
//     fields: 'id, webViewLink',
//   });

//   await drive.permissions.create({
//     fileId: response.data.id,
//     supportsAllDrives: true,
//     requestBody: { role: 'reader', type: 'anyone' },
//   });

//   return { fileId: response.data.id, fileUrl: response.data.webViewLink };
// }

// // ─── GET PDF Data ──────────────────────────────────────────────────────────────
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
//         const planned3 = (row[57] || '').toString().trim();
//         const actual3  = (row[58] || '').toString().trim();
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
//         contractorFirmName:               row[26] || '',
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
//         Deployed_Category_1_Labour_No_4:  row[53] || '',
//         Deployed_Category_2_Labour_No_4:  row[54] || '',
//         Revised_Company_Head_Amount_4:    row[55] || '',
//         Revised_Contractor_Head_Amount_4: row[56] || '',
//         remark4:                          row[56] || '',
//         planned5:                         row[57] || '',
//         actua5:                           row[58] || '',
//       }));

//     res.json({ success: true, count: pendingLabour.length, data: pendingLabour });
//   } catch (error) {
//     console.error('Error fetching pending labour:', error);
//     res.status(500).json({ success: false, error: 'Failed to fetch pending labour approvals' });
//   }
// });

// // ─── POST Generate PDF ─────────────────────────────────────────────────────────
// router.post('/Generate-PDF', async (req, res) => {
//   try {
//     const { uids, paidName } = req.body;

//     if (!uids || !Array.isArray(uids) || uids.length === 0)
//       return res.status(400).json({ success: false, error: 'uids array is required' });
//     if (!paidName)
//       return res.status(400).json({ success: false, error: 'paidName is required' });

//     const billNo = await generateUniqueBillNo();

//     const sheetResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId: SiteExpeseSheetId,
//       range: 'Labour_FMS!A7:BL',
//     });

//     const rows             = sheetResponse.data.values || [];
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
//           contractorFirmName:               row[26] || '',
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
//           Revised_Company_Head_Amount_4:    row[55] || '',
//           Revised_Contractor_Head_Amount_4: row[56] || '',
//         });
//         matchedSheetRows.push(index + 7);
//       }
//     });

//     if (matchedRecords.length === 0)
//       return res.status(404).json({ success: false, error: 'No matching UIDs found in sheet' });

//     const pdfBuffer           = await generateLabourPDF(matchedRecords, billNo, paidName);
//     const fileName            = `Labour_Bill_${billNo}_${Date.now()}.pdf`;
//     const { fileId, fileUrl } = await uploadPDFToDrive(pdfBuffer, fileName);

//     const updateRequests = matchedSheetRows.map(sheetRow => ({
//       range:  `Labour_FMS!BH${sheetRow}:BK${sheetRow}`,
//       values: [['Done', paidName, billNo, fileUrl]],
//     }));

//     await sheets.spreadsheets.values.batchUpdate({
//       spreadsheetId: SiteExpeseSheetId,
//       requestBody: { valueInputOption: 'USER_ENTERED', data: updateRequests },
//     });

//     res.json({
//       success:     true,
//       message:     `PDF generated for ${matchedRecords.length} UID(s)`,
//       pdfUrl:      fileUrl,
//       fileId,
//       billNo,
//       updatedUids: matchedRecords.map(r => r.uid),
//     });

//   } catch (error) {
//     console.error('Error generating PDF:', error);
//     res.status(500).json({
//       success:  false,
//       error:    'Failed to generate PDF or update sheet',
//       details:  error.message,
//     });
//   }
// });

// module.exports = router;




//////////





const express = require('express');
const { sheets, drive, SiteExpeseSheetId } = require('../../config/googleSheet');
const PDFDocument = require('pdfkit');
const { Readable } = require('stream');

const router = express.Router();

// ─── Bill No Generator ─────────────────────────────────────────────────────────
async function generateUniqueBillNo() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SiteExpeseSheetId,
    range: 'Labour_FMS!BJ7:BJ',
  });

  const rows = response.data.values || [];

  const allValues = rows
    .flat()
    .map(v => (v || '').toString().trim());

  const existingBillNos = new Set(
    allValues.filter(v => /^Lab_Bill_\d+$/.test(v))
  );

  let maxNum = 0;
  existingBillNos.forEach(billNo => {
    const num = parseInt(billNo.replace('Lab_Bill_', ''), 10);
    if (!isNaN(num) && num > maxNum) maxNum = num;
  });

  let nextNum   = maxNum + 1;
  let candidate = `Lab_Bill_${String(nextNum).padStart(4, '0')}`;

  while (existingBillNos.has(candidate)) {
    nextNum++;
    candidate = `Lab_Bill_${String(nextNum).padStart(4, '0')}`;
  }

  return candidate;
}

// ─── Get Next Bill No ──────────────────────────────────────────────────────────
router.get('/Get-Next-BillNo', async (req, res) => {
  try {
    const billNo = await generateUniqueBillNo();
    res.json({ success: true, billNo });
  } catch (error) {
    console.error('Error generating bill no:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate bill number' 
    });
  }
});

// ─── PDF Generator ─────────────────────────────────────────────────────────────
async function generateLabourPDF(records, billNo, paidName) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    const buffers = [];

    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end',  () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const pageWidth    = 841.89;
    const margin       = 40;
    const contentWidth = pageWidth - margin * 2;
    const first        = records[0];

    const cleanNum = val => {
      if (val == null || val === '') return 0;
      const cleaned = val.toString().replace(/[^0-9.-]/g, '');
      return parseFloat(cleaned) || 0;
    };

    // ✅ Check: Kisi bhi record mein contractor amount hai ya nahi
    const hasAnyContractorAmount = records.some(
      r => cleanNum(r.Revised_Contractor_Head_Amount_4) > 0
    );

    // ─── Company Name ─────────────────────────────────────────────────────
    doc.fontSize(16).font('Helvetica-Bold')
      .text('R. C. C. Infrastructures', margin, 30, { 
        align: 'center', width: contentWidth 
      });

    doc.moveDown(0.4);

    doc.fontSize(13).font('Helvetica-Bold')
      .text('LABOUR DEPLOYED REPORT', margin, doc.y, { 
        align: 'center', width: contentWidth 
      });

    // ✅ "Debit Note" - RED color - sirf tab dikhao jab contractor amount ho
    if (hasAnyContractorAmount) {
      doc.moveDown(0.3);

      const debitText  = 'Debit Note';
      const debitFontSize = 12;
      doc.fontSize(debitFontSize).font('Helvetica-Bold');
      const textWidth  = doc.widthOfString(debitText);
      const textHeight = doc.currentLineHeight();

      const textX = margin + (contentWidth - textWidth) / 2;
      const textY = doc.y;
      const padX  = 12;
      const padY  = 4;

      // Red highlight background
      doc.save();
      doc.roundedRect(
        textX - padX,
        textY - padY,
        textWidth + padX * 2,
        textHeight + padY * 2,
        4
      ).fill('#DC2626');

      // White text on red background
      doc.fillColor('#FFFFFF')
        .fontSize(debitFontSize)
        .font('Helvetica-Bold')
        .text(debitText, textX, textY, {
          width:     textWidth,
          align:     'center',
          lineBreak: false,
        });
      doc.restore();
      doc.fillColor('#000000');

      doc.moveDown(0.5);
    }

    doc.moveDown(0.5);
    doc.moveTo(margin, doc.y)
      .lineTo(margin + contentWidth, doc.y)
      .lineWidth(1).stroke();
    doc.moveDown(0.4);

    const headerStartY = doc.y;
    const col1X        = margin;
    const col2X        = margin + contentWidth / 2;
    const labelWidth   = 130;
    const valueWidth   = 200;
    const lineHeight   = 16;

    const totalAllLabour = records.reduce((s, r) =>
      s + cleanNum(r.Number_Of_Labour_1_3) + cleanNum(r.Number_Of_Labour_2_3), 0);

    const headerField = (label, value, x, y) => {
      doc.fontSize(8.5).font('Helvetica-Bold')
        .text(`${label} :`, x, y, {
          width:     labelWidth,
          lineBreak: false,
          ellipsis:  false,
        });
      doc.fontSize(8.5).font('Helvetica')
        .text(value || '-', x + labelWidth + 4, y, {
          width:     valueWidth,
          lineBreak: false,
          ellipsis:  true,
        });
    };

    // Row 1
    headerField('Project Name',           first.projectName,                     col1X, headerStartY);
    headerField('Bill No.',               billNo,                                col2X, headerStartY);
    // Row 2
    headerField('Labour Contractor Name', first.Labouar_Contractor_Name_3,       col1X, headerStartY + lineHeight);
    headerField('Bill Date',              new Date().toLocaleDateString('en-IN'), col2X, headerStartY + lineHeight);
    // Row 3
    headerField('Paid By',                paidName,                              col1X, headerStartY + lineHeight * 2);
    headerField('Total Labour',           totalAllLabour.toString(),             col2X, headerStartY + lineHeight * 2);

    const tableStartY = headerStartY + lineHeight * 2 + 28;

    doc.moveTo(margin, tableStartY - 8)
       .lineTo(margin + contentWidth, tableStartY - 8)
       .lineWidth(0.5).stroke();

    // ─── Table Columns ────────────────────────────────────────────────────
    const columns = [
      { label: 'Sr.\nNo.',              width: 28  },
      { label: 'Date\nRequired',        width: 55  },
      { label: 'UID No.',               width: 70  },
      { label: 'Work Details',          width: 135 },
      { label: 'Contractor\nDebit Name', width: 85  },
      { label: 'Labour\nCategory 1',    width: 60  },
      { label: 'Labour\nNo. 1',         width: 40  },
      { label: 'Labour\nCategory 2',    width: 60  },
      { label: 'Labour\nNo. 2',         width: 40  },
      { label: 'Total\nLabour',         width: 40  },
      { label: 'Company\nHead Amt',     width: 72  },
      { label: 'Contractor\nHead Amt',  width: 72  },
    ];

    const headerHeight = 30;
    const rowHeight    = 22;
    const tableX       = margin;
    let   tableY       = tableStartY;

    // ─── Table Header Row ─────────────────────────────────────────────────
    let cx = tableX;
    columns.forEach(col => {
      doc.rect(cx, tableY, col.width, headerHeight)
        .fillAndStroke('#1a3c6e', '#000000');
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold')
        .text(col.label, cx + 2, tableY + 4, {
          width:   col.width - 4,
          align:   'center',
          lineGap: 1,
        });
      doc.fillColor('#000000');
      cx += col.width;
    });

    tableY += headerHeight;

    // ─── Data Rows ────────────────────────────────────────────────────────
    records.forEach((row, i) => {
      const rowTotalLabour = cleanNum(row.Number_Of_Labour_1_3) 
                           + cleanNum(row.Number_Of_Labour_2_3);
      const companyAmt     = cleanNum(row.Revised_Company_Head_Amount_4);
      const contractorAmt  = cleanNum(row.Revised_Contractor_Head_Amount_4);

      const rowData = [
        (i + 1).toString(),
        row.dateRequired         || '-',
        row.uid                  || '-',
        row.workDescription      || '-',
        row.contractorFirmName   || '-',
        row.Labour_Category_1_3  || '-',
        row.Number_Of_Labour_1_3 || '-',
        row.Labour_Category_2_3  || '-',
        row.Number_Of_Labour_2_3 || '-',
        rowTotalLabour > 0 ? rowTotalLabour.toString() : '-',
        companyAmt    > 0  ? companyAmt.toFixed(2)     : '-',
        contractorAmt > 0  ? contractorAmt.toFixed(2)  : '-',
      ];

      const bgColor = i % 2 === 0 ? '#f0f5ff' : '#ffffff';
      cx = tableX;

      rowData.forEach((cell, j) => {
        doc.rect(cx, tableY, columns[j].width, rowHeight)
          .fillAndStroke(bgColor, '#cccccc');
        doc.fillColor('#000000').fontSize(9.5).font('Helvetica')
          .text(String(cell), cx + 2, tableY + 6, {
            width:     columns[j].width - 4,
            align:     'center',
            ellipsis:  true,
            lineBreak: false,
          });
        cx += columns[j].width;
      });

      tableY += rowHeight;
    });

    // ─── Total Row ────────────────────────────────────────────────────────
    const totalCompanyHead    = records.reduce(
      (s, r) => s + cleanNum(r.Revised_Company_Head_Amount_4), 0
    );
    const totalContractorHead = records.reduce(
      (s, r) => s + cleanNum(r.Revised_Contractor_Head_Amount_4), 0
    );
    const totalLabourAll      = records.reduce(
      (s, r) => s + cleanNum(r.Number_Of_Labour_1_3) 
                   + cleanNum(r.Number_Of_Labour_2_3), 0
    );

    const totalRowData = [
      '', '', '', '', '', '', '', '', '',
      totalLabourAll.toString(),
      totalCompanyHead.toFixed(2),
      totalContractorHead.toFixed(2),
    ];

    cx = tableX;
    totalRowData.forEach((cell, j) => {
      doc.rect(cx, tableY, columns[j].width, rowHeight)
        .fillAndStroke('#cfe2ff', '#000000');
      doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold')
        .text(cell || '', cx + 2, tableY + 7, {
          width:     columns[j].width - 4,
          align:     'center',
          lineBreak: false,
        });
      cx += columns[j].width;
    });

    tableY += rowHeight + 12;

    // ─── Summary Box ──────────────────────────────────────────────────────
     // ─── Summary Box ──────────────────────────────────────────────────────
    const boxWidth = 290;
    const boxX     = margin + contentWidth - boxWidth;
    const boxRowH  = 22;

    // Company Head Row
    doc.rect(boxX, tableY, boxWidth / 2, boxRowH)
      .fillAndStroke('#0d2b4e', '#000000');
    doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold')
      .text('Total Company Head Amt', boxX + 5, tableY + 6, {
        width: boxWidth / 2 - 10, align: 'left', lineBreak: false,
      });
    doc.rect(boxX + boxWidth / 2, tableY, boxWidth / 2, boxRowH)
      .fillAndStroke('#cfe2ff', '#000000');
    // ✅ Font size 8 → 10
    doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold')
      .text(totalCompanyHead.toFixed(2), boxX + boxWidth / 2 + 5, tableY + 5, {
        width: boxWidth / 2 - 10, align: 'right', lineBreak: false,
      });

    tableY += boxRowH;

    // Contractor Head Row
    doc.rect(boxX, tableY, boxWidth / 2, boxRowH)
      .fillAndStroke('#0d2b4e', '#000000');
    doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold')
      .text('Total Contractor Head Amt', boxX + 5, tableY + 6, {
        width: boxWidth / 2 - 10, align: 'left', lineBreak: false,
      });
    doc.rect(boxX + boxWidth / 2, tableY, boxWidth / 2, boxRowH)
      .fillAndStroke('#d4edda', '#000000');
    // ✅ Font size 8 → 10
    doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold')
      .text(totalContractorHead.toFixed(2), boxX + boxWidth / 2 + 5, tableY + 5, {
        width: boxWidth / 2 - 10, align: 'right', lineBreak: false,
      });

    tableY += boxRowH + 30;

    // ─── Signatures ───────────────────────────────────────────────────────
    doc.fontSize(9).font('Helvetica-Bold')
      .text('Prepared By: _____________________', margin,       tableY)
      .text('Checked By:  _____________________', margin + 240, tableY)
      .text('Approved By: _____________________', margin + 490, tableY);

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
      name:     fileName,
      mimeType: 'application/pdf',
      parents:  [process.env.GOOGLE_DRIVE_FOLDER_ID],
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
        const planned3 = (row[57] || '').toString().trim();
        const actual3  = (row[58] || '').toString().trim();
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
        contractorFirmName:               row[26] || '',
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
        Deployed_Category_1_Labour_No_4:  row[53] || '',
        Deployed_Category_2_Labour_No_4:  row[54] || '',
        Revised_Company_Head_Amount_4:    row[55] || '',
        Revised_Contractor_Head_Amount_4: row[56] || '',
        remark4:                          row[56] || '',
        planned5:                         row[57] || '',
        actua5:                           row[58] || '',
      }));

    res.json({ success: true, count: pendingLabour.length, data: pendingLabour });
  } catch (error) {
    console.error('Error fetching pending labour:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch pending labour approvals' 
    });
  }
});

// ─── POST Generate PDF ─────────────────────────────────────────────────────────
router.post('/Generate-PDF', async (req, res) => {
  try {
    const { uids, paidName } = req.body;

    if (!uids || !Array.isArray(uids) || uids.length === 0)
      return res.status(400).json({ 
        success: false, error: 'uids array is required' 
      });
    if (!paidName)
      return res.status(400).json({ 
        success: false, error: 'paidName is required' 
      });

    const billNo = await generateUniqueBillNo();

    const sheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Labour_FMS!A7:BL',
    });

    const rows             = sheetResponse.data.values || [];
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
          contractorFirmName:               row[26] || '',
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
          Revised_Company_Head_Amount_4:    row[55] || '',
          Revised_Contractor_Head_Amount_4: row[56] || '',
        });
        matchedSheetRows.push(index + 7);
      }
    });

    if (matchedRecords.length === 0)
      return res.status(404).json({ 
        success: false, error: 'No matching UIDs found in sheet' 
      });

    const pdfBuffer           = await generateLabourPDF(matchedRecords, billNo, paidName);
    const fileName            = `Labour_Bill_${billNo}_${Date.now()}.pdf`;
    const { fileId, fileUrl } = await uploadPDFToDrive(pdfBuffer, fileName);

    const updateRequests = matchedSheetRows.map(sheetRow => ({
      range:  `Labour_FMS!BH${sheetRow}:BK${sheetRow}`,
      values: [['Done', paidName, billNo, fileUrl]],
    }));

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SiteExpeseSheetId,
      requestBody: { 
        valueInputOption: 'USER_ENTERED', 
        data: updateRequests 
      },
    });

    res.json({
      success:     true,
      message:     `PDF generated for ${matchedRecords.length} UID(s)`,
      pdfUrl:      fileUrl,
      fileId,
      billNo,
      updatedUids: matchedRecords.map(r => r.uid),
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success:  false,
      error:    'Failed to generate PDF or update sheet',
      details:  error.message,
    });
  }
});

module.exports = router;