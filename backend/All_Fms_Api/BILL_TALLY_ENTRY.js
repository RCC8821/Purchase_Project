

const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');

const router = express.Router();

router.get('/Bill_Tally', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:ZZ',
    });

    let data = response.data.values || [];

    const filteredData = data
      .filter(row => {
        const planned16 = row[47] ? String(row[47]).trim() : '';
        const actual16 = row[48] ? String(row[48]).trim() : '';
        return planned16 && !actual16;
      })
      .map(row => ({
        planned16: row[47] ? String(row[47]).trim() : '',
        UID: row[1] ? String(row[1]).trim() : '',
        siteName: row[3] ? String(row[3]).trim() : '',
        materialType: row[5] ? String(row[5]).trim() : '',
        skuCode: row[6] ? String(row[6]).trim() : '',
        materialName: row[7] ? String(row[7]).trim() : '',
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
        vendorFirmName: row[23] ? String(row[23]).trim() : '',
        invoice13: row[36] ? String(row[36]).trim() : '',
      }))
      .filter(row => row.planned16);

    if (filteredData.length === 0) {
      return res.json({
        success: true,
        data: [],
        warning: 'No rows found where PLANNED 16 has non-empty data and ACTUAL 16 is empty.'
      });
    }

    res.json({
      success: true,
      data: filteredData
    });
  } catch (error) {
    console.error('Error fetching Bill_Tally data:', error);
    res.status(500).json({ error: 'Failed to fetch Bill_Tally data' });
  }
});





/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// router.post('/bill_tally_entry', async (req, res) => {
//   const data = req.body;

//   if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
//     return res.status(400).json({ success: false, message: 'Invalid or empty items array' });
//   }

//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Billing_FMS!A8:BQ',
//     });

//     const rows = response.data.values || [];
//     if (rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'No data found in sheet' });
//     }

//     const requests = [];

//     const COL = {
//       STATUS_16: 'AX',
//       VENDOR_FIRM: 'AZ',
//       BILL_NO: 'BA',
//       BILL_DATE: 'BB',
//       AMOUNT: 'BC',
//       GST_PERCENT: 'BD',
//       IGST_PERCENT: 'BE',
//       CGST: 'BF',
//       SGST: 'BG',
//       IGST: 'BH',
//       TOTAL: 'BI',
//       TRANSPORT_WO_GST: 'BN',
//       NET_TRANSPORT: 'BO',
//       GRAND_TOTAL: 'BP',
//       REMARK: 'BQ',
//     };

//     const transportBase = parseFloat(data.transportWOGST) || 0;
//     const gstRate = parseFloat(data.gstRate) || 0;
//     const netTransport = (transportBase * (1 + gstRate / 100)).toFixed(2);
//     const grandTotal = data.netAmount || '0.00';

//     // Store row numbers for all valid UIDs
//     const itemRows = [];

//     data.items.forEach((item) => {
//       const rowIndex = rows.findIndex(
//         (row) => row[1] && String(row[1]).trim() === String(item.uid).trim()
//       );

//       if (rowIndex !== -1) {
//         const rowNumber = 8 + rowIndex;
//         itemRows.push({ item, rowNumber });

//         const addUpdate = (colLetter, value) => {
//           if (value !== undefined && value !== null && value !== '') {
//             requests.push({
//               range: `Billing_FMS!${colLetter}${rowNumber}`,
//               values: [[value]],
//             });
//           }
//         };

//         // Common fields for ALL rows
//         addUpdate(COL.STATUS_16, data.status16);
//         addUpdate(COL.VENDOR_FIRM, data.vendorFirmName);
//         addUpdate(COL.BILL_NO, data.billNo);
//         addUpdate(COL.BILL_DATE, data.billDate);
//         addUpdate(COL.AMOUNT, item.amount);
//         addUpdate(COL.TOTAL, item.total);
//         addUpdate(COL.REMARK, data.remark);

//         // GST
//         addUpdate(COL.GST_PERCENT, item.gstPercent);
//         addUpdate(COL.IGST_PERCENT, item.igst !== '0' ? item.igst : '0');
//         addUpdate(COL.CGST, item.cgstAmt);
//         addUpdate(COL.SGST, item.sgstAmt);
//         addUpdate(COL.IGST, item.igstAmt);

//         // Transport fields: ONLY in last row, others get '-'
//         // We'll handle BJ, BK, BL later
//       } else {
//         console.warn(`UID ${item.uid} not found in sheet.`);
//       }
//     });

//     // If no valid rows, exit
//     if (itemRows.length === 0) {
//       return res.status(400).json({ success: false, message: 'No matching UIDs found in sheet' });
//     }

//     // Find the LAST row (highest rowNumber)
//     const lastRow = itemRows.reduce((max, curr) => curr.rowNumber > max.rowNumber ? curr : max);

//     // Now update BJ, BK, BL
//     itemRows.forEach(({ rowNumber }) => {
//       const isLastRow = rowNumber === lastRow.rowNumber;

//       // Transport fields
//       requests.push({
//         range: `Billing_FMS!${COL.TRANSPORT_WO_GST}${rowNumber}`,
//         values: [[isLastRow ? data.transportWOGST : '-']],
//       });
//       requests.push({
//         range: `Billing_FMS!${COL.NET_TRANSPORT}${rowNumber}`,
//         values: [[isLastRow ? netTransport : '-']],
//       });
//       requests.push({
//         range: `Billing_FMS!${COL.GRAND_TOTAL}${rowNumber}`,
//         values: [[isLastRow ? grandTotal : '-']],
//       });
//     });

//     // Execute batch update
//     if (requests.length > 0) {
//       await sheets.spreadsheets.values.batchUpdate({
//         spreadsheetId,
//         resource: {
//           valueInputOption: 'RAW',
//           data: requests,
//         },
//       });
//     }

//     res.json({ success: true, message: 'Bill tally entry updated successfully' });
//   } catch (error) {
//     console.error('Error updating bill tally entry:', error);
//     res.status(500).json({ success: false, message: 'Failed to update bill tally entry' });
//   }
// });


// router.post('/bill_tally_entry', async (req, res) => {
//   const data = req.body;

//   if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
//     return res.status(400).json({ success: false, message: 'Invalid or empty items array' });
//   }

//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Billing_FMS!A8:BQ',
//     });

//     const rows = response.data.values || [];
//     if (rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'No data found in sheet' });
//     }

//     const requests = [];

//     const COL = {
//       STATUS_16: 'AX',
//       VENDOR_FIRM: 'AZ',
//       BILL_NO: 'BA',
//       BILL_DATE: 'BB',
//       AMOUNT: 'BC',
//       GST_PERCENT: 'BD',
//       IGST_PERCENT: 'BE',
//       CGST: 'BF',
//       SGST: 'BG',
//       IGST: 'BH',
//       TOTAL: 'BI',

//       // NEW COLUMNS
//       TOTAL_BILL_AMOUNT_16: 'BJ',
//       CGST_16: 'BK',
//       SGST_16: 'BL',
//       IGST_16: 'BM',

//       TRANSPORT_WO_GST: 'BN',
//       NET_TRANSPORT: 'BO',
//       GRAND_TOTAL: 'BP',
//       REMARK: 'BQ',
//     };

//     const transportBase = parseFloat(data.transportWOGST) || 0;
//     const gstRate = parseFloat(data.gstRate) || 0;
//     const netTransport = (transportBase * (1 + gstRate / 100)).toFixed(2);
//     const grandTotal = data.netAmount || '0.00';

//     // Extract totals from frontend
//     const totalBillAmount = data.totalBillAmount || '0.00';
//     const totalCGST = data.totalCGST || '0.00';
//     const totalSGST = data.totalSGST || '0.00';
//     const totalIGST = data.totalIGST || '0.00';

//     const itemRows = [];

//     // Process all items (including TOTAL row)
//     data.items.forEach((item) => {
//       const isTotalRow = item.uid === 'TOTAL';

//       let rowIndex = -1;
//       if (!isTotalRow) {
//         rowIndex = rows.findIndex(
//           (row) => row[1] && String(row[1]).trim() === String(item.uid).trim()
//         );
//       }

//       if (rowIndex !== -1 || isTotalRow) {
//         const rowNumber = isTotalRow ? null : 8 + rowIndex;
//         itemRows.push({ item, rowNumber, isTotalRow });

//         const addUpdate = (colLetter, value, targetRow) => {
//           if (value !== undefined && value !== null && value !== '' && targetRow !== null) {
//             requests.push({
//               range: `Billing_FMS!${colLetter}${targetRow}`,
//               values: [[value]],
//             });
//           }
//         };

//         if (!isTotalRow) {
//           // Normal item rows
//           addUpdate(COL.STATUS_16, data.status16, rowNumber);
//           addUpdate(COL.VENDOR_FIRM, data.vendorFirmName, rowNumber);
//           addUpdate(COL.BILL_NO, data.billNo, rowNumber);
//           addUpdate(COL.BILL_DATE, data.billDate, rowNumber);
//           addUpdate(COL.AMOUNT, item.amount, rowNumber);
//           addUpdate(COL.TOTAL, item.total, rowNumber);
//           addUpdate(COL.REMARK, data.remark, rowNumber);

//           addUpdate(COL.GST_PERCENT, item.gstPercent, rowNumber);
//           addUpdate(COL.IGST_PERCENT, item.igst !== '0' ? item.igst : '0', rowNumber);
//           addUpdate(COL.CGST, item.cgstAmt, rowNumber);
//           addUpdate(COL.SGST, item.sgstAmt, rowNumber);
//           addUpdate(COL.IGST, item.igstAmt, rowNumber);
//         }
//       }
//     });

//     if (itemRows.length === 0) {
//       return res.status(400).json({ success: false, message: 'No matching UIDs found' });
//     }

//     // Find last **valid UID row** (not TOTAL)
//     const validRows = itemRows.filter(r => !r.isTotalRow);
//     const lastValidRow = validRows.length > 0
//       ? validRows.reduce((max, curr) => curr.rowNumber > max.rowNumber ? curr : max)
//       : null;

//     // === UPDATE BJ, BK, BL, BM (Total columns) ===
//     // In: Last UID row AND TOTAL row
//     const totalTargetRows = [];
//     if (lastValidRow) totalTargetRows.push(lastValidRow.rowNumber);
//     const totalRowEntry = itemRows.find(r => r.isTotalRow);
//     if (totalRowEntry && totalRowEntry.rowNumber) totalTargetRows.push(totalRowEntry.rowNumber);

//     totalTargetRows.forEach(rowNum => {
//       requests.push({ range: `Billing_FMS!${COL.TOTAL_BILL_AMOUNT_16}${rowNum}`, values: [[totalBillAmount]] });
//       requests.push({ range: `Billing_FMS!${COL.CGST_16}${rowNum}`, values: [[totalCGST]] });
//       requests.push({ range: `Billing_FMS!${COL.SGST_16}${rowNum}`, values: [[totalSGST]] });
//       requests.push({ range: `Billing_FMS!${COL.IGST_16}${rowNum}`, values: [[totalIGST]] });
//     });

//     // === UPDATE BN, BO, BP (Transport & Grand Total) ===
//     // Only in last UID row
//     if (lastValidRow) {
//       const row = lastValidRow.rowNumber;
//       requests.push({ range: `Billing_FMS!${COL.TRANSPORT_WO_GST}${row}`, values: [[data.transportWOGST]] });
//       requests.push({ range: `Billing_FMS!${COL.NET_TRANSPORT}${row}`, values: [[netTransport]] });
//       requests.push({ range: `Billing_FMS!${COL.GRAND_TOTAL}${row}`, values: [[grandTotal]] });
//     }

//     // === For all other rows: put '-' in BJ-BM, BN-BP ===
//     validRows.forEach(({ rowNumber }) => {
//       const isLast = lastValidRow && rowNumber === lastValidRow.rowNumber;
//       if (!isLast) {
//         ['BJ', 'BK', 'BL', 'BM', 'BN', 'BO', 'BP'].forEach(col => {
//           requests.push({ range: `Billing_FMS!${col}${rowNumber}`, values: [['-']] });
//         });
//       }
//     });

//     // Execute batch update
//     if (requests.length > 0) {
//       await sheets.spreadsheets.values.batchUpdate({
//         spreadsheetId,
//         resource: {
//           valueInputOption: 'RAW',
//           data: requests,
//         },
//       });
//     }

//     res.json({ success: true, message: 'Bill tally entry updated successfully' });
//   } catch (error) {
//     console.error('Error updating bill tally entry:', error);
//     res.status(500).json({ success: false, message: 'Failed to update bill tally entry' });
//   }
// });


router.post('/bill_tally_entry', async (req, res) => {
  const data = req.body;

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid or empty items array' });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:BQ',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No data found in sheet' });
    }

    const requests = [];

    const COL = {
      STATUS_16: 'AX',
      VENDOR_FIRM: 'AZ',
      BILL_NO: 'BA',
      BILL_DATE: 'BB',
      AMOUNT: 'BC',
      GST_PERCENT: 'BD',
      IGST_PERCENT: 'BE',
      CGST: 'BF',
      SGST: 'BG',
      IGST: 'BH',
      TOTAL: 'BI',

      // NEW COLUMNS
      TOTAL_BILL_AMOUNT_16: 'BJ',
      CGST_16: 'BK',
      SGST_16: 'BL',
      IGST_16: 'BM',

      TRANSPORT_WO_GST: 'BN',
      NET_TRANSPORT: 'BO',    // <-- Sirf GST amount jayega
      GRAND_TOTAL: 'BP',
      REMARK: 'BQ',
    };

    const transportBase = parseFloat(data.transportWOGST) || 0;
    const gstRate = parseFloat(data.gstRate) || 0;

    // Sirf GST amount calculate karo
    const transportGstOnly = (transportBase * (gstRate / 100)).toFixed(2);
    const grandTotal = data.netAmount || '0.00';

    // Extract totals from frontend
    const totalBillAmount = data.totalBillAmount || '0.00';
    const totalCGST = data.totalCGST || '0.00';
    const totalSGST = data.totalSGST || '0.00';
    const totalIGST = data.totalIGST || '0.00';

    const itemRows = [];

    // Process all items (including TOTAL row)
    data.items.forEach((item) => {
      const isTotalRow = item.uid === 'TOTAL';

      let rowIndex = -1;
      if (!isTotalRow) {
        rowIndex = rows.findIndex(
          (row) => row[1] && String(row[1]).trim() === String(item.uid).trim()
        );
      }

      if (rowIndex !== -1 || isTotalRow) {
        const rowNumber = isTotalRow ? null : 8 + rowIndex;
        itemRows.push({ item, rowNumber, isTotalRow });

        const addUpdate = (colLetter, value, targetRow) => {
          if (value !== undefined && value !== null && value !== '' && targetRow !== null) {
            requests.push({
              range: `Billing_FMS!${colLetter}${targetRow}`,
              values: [[value]],
            });
          }
        };

        if (!isTotalRow) {
          // Normal item rows
          addUpdate(COL.STATUS_16, data.status16, rowNumber);
          addUpdate(COL.VENDOR_FIRM, data.vendorFirmName, rowNumber);
          addUpdate(COL.BILL_NO, data.billNo, rowNumber);
          addUpdate(COL.BILL_DATE, data.billDate, rowNumber);
          addUpdate(COL.AMOUNT, item.amount, rowNumber);
          addUpdate(COL.TOTAL, item.total, rowNumber);
          addUpdate(COL.REMARK, data.remark, rowNumber);

          addUpdate(COL.GST_PERCENT, item.gstPercent, rowNumber);
          addUpdate(COL.IGST_PERCENT, item.igst !== '0' ? item.igst : '0', rowNumber);
          addUpdate(COL.CGST, item.cgstAmt, rowNumber);
          addUpdate(COL.SGST, item.sgstAmt, rowNumber);
          addUpdate(COL.IGST, item.igstAmt, rowNumber);
        }
      }
    });

    if (itemRows.length === 0) {
      return res.status(400).json({ success: false, message: 'No matching UIDs found' });
    }

    // Find last valid UID row (not TOTAL)
    const validRows = itemRows.filter(r => !r.isTotalRow);
    const lastValidRow = validRows.length > 0
      ? validRows.reduce((max, curr) => curr.rowNumber > max.rowNumber ? curr : max)
      : null;

    // === UPDATE BJ, BK, BL, BM (Total columns) ===
    // In: Last UID row AND TOTAL row
    const totalTargetRows = [];
    if (lastValidRow) totalTargetRows.push(lastValidRow.rowNumber);
    const totalRowEntry = itemRows.find(r => r.isTotalRow);
    if (totalRowEntry && totalRowEntry.rowNumber) totalTargetRows.push(totalRowEntry.rowNumber);

    totalTargetRows.forEach(rowNum => {
      requests.push({ range: `Billing_FMS!${COL.TOTAL_BILL_AMOUNT_16}${rowNum}`, values: [[totalBillAmount]] });
      requests.push({ range: `Billing_FMS!${COL.CGST_16}${rowNum}`, values: [[totalCGST]] });
      requests.push({ range: `Billing_FMS!${COL.SGST_16}${rowNum}`, values: [[totalSGST]] });
      requests.push({ range: `Billing_FMS!${COL.IGST_16}${rowNum}`, values: [[totalIGST]] });
    });

    // === UPDATE BN, BO, BP (Transport & Grand Total) ===
    // Only in last UID row
    if (lastValidRow) {
      const row = lastValidRow.rowNumber;
      requests.push({ range: `Billing_FMS!${COL.TRANSPORT_WO_GST}${row}`, values: [[data.transportWOGST]] });
      requests.push({ range: `Billing_FMS!${COL.NET_TRANSPORT}${row}`, values: [[transportGstOnly]] }); // Sirf GST
      requests.push({ range: `Billing_FMS!${COL.GRAND_TOTAL}${row}`, values: [[grandTotal]] });
    }

    // === For all other rows: put '-' in BJ-BM, BN-BP ===
    validRows.forEach(({ rowNumber }) => {
      const isLast = lastValidRow && rowNumber === lastValidRow.rowNumber;
      if (!isLast) {
        ['BJ', 'BK', 'BL', 'BM', 'BN', 'BO', 'BP'].forEach(col => {
          requests.push({ range: `Billing_FMS!${col}${rowNumber}`, values: [['-']] });
        });
      }
    });

    // Execute batch update
    if (requests.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        resource: {
          valueInputOption: 'RAW',
          data: requests,
        },
      });
    }

    res.json({ success: true, message: 'Bill tally entry updated successfully' });
  } catch (error) {
    console.error('Error updating bill tally entry:', error);
    res.status(500).json({ success: false, message: 'Failed to update bill tally entry' });
  }
});




module.exports = router;