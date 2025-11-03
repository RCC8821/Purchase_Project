

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





// router.post('/bill_tally_entry', async (req, res) => {
//   const data = req.body;

//   if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
//     return res.status(400).json({ success: false, message: 'Invalid or empty items array' });
//   }

//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Billing_FMS!A8:BM',
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
//       CGST: 'BF',      // ← Amount
//       SGST: 'BG',      // ← Amount
//       IGST: 'BH',      // ← Amount
//       TOTAL: 'BI',
//       TRANSPORT_WO_GST: 'BJ',
//       NET_TRANSPORT: 'BK',
//       GRAND_TOTAL: 'BL',
//       REMARK: 'BM',
//     };

//     const transportBase = parseFloat(data.transportWOGST) || 0;
//     const gstRate = parseFloat(data.gstRate) || 0;
//     const netTransport = (transportBase * (1 + gstRate / 100)).toFixed(2);
//     const grandTotal = data.netAmount || '0.00';

//     data.items.forEach((item) => {
//       const rowIndex = rows.findIndex(
//         (row) => row[1] && String(row[1]).trim() === String(item.uid).trim()
//       );

//       if (rowIndex !== -1) {
//         const rowNumber = 8 + rowIndex;

//         const addUpdate = (colLetter, value) => {
//           if (value !== undefined && value !== null && value !== '') {
//             requests.push({
//               range: `Billing_FMS!${colLetter}${rowNumber}`,
//               values: [[value]],
//             });
//           }
//         };

//         // Common
//         addUpdate(COL.STATUS_16, data.status16);
//         addUpdate(COL.VENDOR_FIRM, data.vendorFirmName);
//         addUpdate(COL.BILL_NO, data.billNo);
//         addUpdate(COL.BILL_DATE, data.billDate);
//         addUpdate(COL.AMOUNT, item.amount);
//         addUpdate(COL.TOTAL, item.total);
//         addUpdate(COL.REMARK, data.remark);

//         // GST % (BD)
//         addUpdate(COL.GST_PERCENT, item.gstPercent);

//         // IGST % (BE)
//         addUpdate(COL.IGST_PERCENT, item.igst !== '0' ? item.igst : '0');

//         // CGST Amount (BF)
//         addUpdate(COL.CGST, item.cgstAmt);

//         // SGST Amount (BG)
//         addUpdate(COL.SGST, item.sgstAmt);

//         // IGST Amount (BH)
//         addUpdate(COL.IGST, item.igstAmt);

//         // Transport
//         addUpdate(COL.TRANSPORT_WO_GST, data.transportWOGST);
//         addUpdate(COL.NET_TRANSPORT, netTransport);
//         addUpdate(COL.GRAND_TOTAL, grandTotal);
//       } else {
//         console.warn(`UID ${item.uid} not found in sheet.`);
//       }
//     });

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
      range: 'Billing_FMS!A8:BM',
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
      TRANSPORT_WO_GST: 'BJ',
      NET_TRANSPORT: 'BK',
      GRAND_TOTAL: 'BL',
      REMARK: 'BM',
    };

    const transportBase = parseFloat(data.transportWOGST) || 0;
    const gstRate = parseFloat(data.gstRate) || 0;
    const netTransport = (transportBase * (1 + gstRate / 100)).toFixed(2);
    const grandTotal = data.netAmount || '0.00';

    // Store row numbers for all valid UIDs
    const itemRows = [];

    data.items.forEach((item) => {
      const rowIndex = rows.findIndex(
        (row) => row[1] && String(row[1]).trim() === String(item.uid).trim()
      );

      if (rowIndex !== -1) {
        const rowNumber = 8 + rowIndex;
        itemRows.push({ item, rowNumber });

        const addUpdate = (colLetter, value) => {
          if (value !== undefined && value !== null && value !== '') {
            requests.push({
              range: `Billing_FMS!${colLetter}${rowNumber}`,
              values: [[value]],
            });
          }
        };

        // Common fields for ALL rows
        addUpdate(COL.STATUS_16, data.status16);
        addUpdate(COL.VENDOR_FIRM, data.vendorFirmName);
        addUpdate(COL.BILL_NO, data.billNo);
        addUpdate(COL.BILL_DATE, data.billDate);
        addUpdate(COL.AMOUNT, item.amount);
        addUpdate(COL.TOTAL, item.total);
        addUpdate(COL.REMARK, data.remark);

        // GST
        addUpdate(COL.GST_PERCENT, item.gstPercent);
        addUpdate(COL.IGST_PERCENT, item.igst !== '0' ? item.igst : '0');
        addUpdate(COL.CGST, item.cgstAmt);
        addUpdate(COL.SGST, item.sgstAmt);
        addUpdate(COL.IGST, item.igstAmt);

        // Transport fields: ONLY in last row, others get '-'
        // We'll handle BJ, BK, BL later
      } else {
        console.warn(`UID ${item.uid} not found in sheet.`);
      }
    });

    // If no valid rows, exit
    if (itemRows.length === 0) {
      return res.status(400).json({ success: false, message: 'No matching UIDs found in sheet' });
    }

    // Find the LAST row (highest rowNumber)
    const lastRow = itemRows.reduce((max, curr) => curr.rowNumber > max.rowNumber ? curr : max);

    // Now update BJ, BK, BL
    itemRows.forEach(({ rowNumber }) => {
      const isLastRow = rowNumber === lastRow.rowNumber;

      // Transport fields
      requests.push({
        range: `Billing_FMS!${COL.TRANSPORT_WO_GST}${rowNumber}`,
        values: [[isLastRow ? data.transportWOGST : '-']],
      });
      requests.push({
        range: `Billing_FMS!${COL.NET_TRANSPORT}${rowNumber}`,
        values: [[isLastRow ? netTransport : '-']],
      });
      requests.push({
        range: `Billing_FMS!${COL.GRAND_TOTAL}${rowNumber}`,
        values: [[isLastRow ? grandTotal : '-']],
      });
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