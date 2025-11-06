

const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');
const router = express.Router();


// router.get('/vendor-FollowUp-Billing', async (req, res) => {
//   try {
//     // Fetch data from Purchase_FMS sheet
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Billing_FMS!A8:CE', // Range from A8 to CE
//     });

//     let data = response.data.values || [];

//     // Filter and transform data based on PLANNED 12 and ACTUAL 12
//     const filteredData = data
//       .filter(row => {
//         const planned12 = row[27] || ''; // Column CF (84th column, 0-based index) for PLANNED 12
//         const actual12 = row[28] || ''; // Column CG (85th column, 0-based index) for ACTUAL 12
//         return planned12 && !actual12; // Include row if PLANNED 12 has data and ACTUAL 12 is empty
//       })
//       .map(row => ({
//         UID: row[1] || '', // Column B
//         siteName: row[3] || '', // Column D
//         supervisorName: row[4] || '', // Column E
//         materialName: row[7] || '', // Column H
//         revisedQuantity: row[25] || '', // Column Q for REVISED QTY
//         finalReceivedQuantity: row[26] || '', // Column J for FINAL RECEIVED QTY
//         unitName: row[9] || '', // Column I
//         vendorFirmName: row[23] || '', // Column M for Vendor Firm Name
//         poNumber: row[16] || '', // Column Q for PO Number
//         planned12: row[27] || '', // Column CF for PLANNED 12
//         status12: row[29] || '', // Column CH for STATUS 12 (assumed next to ACTUAL 12)
//         followUpCount12: row[30] || '', // Column CI for FOLLOW-UP COUNT 12 (assumed next to STATUS 12)
//         remark12: row[32] || '', // Column CJ for REMARK 12 (assumed next to FOLLOW-UP COUNT 12)
//         vendorContact: row[24] || '', // Column N (assumed next to Vendor Firm Name)
//       }));

//     res.json({
//       success: true,
//       data: filteredData
//     });
//   } catch (error) {
//     console.error('Error fetching Vendor-FollowUp-Billing data:', error);
//     res.status(500).json({ error: 'Failed to fetch Vendor-FollowUp-Billing data' });
//   }
// });

router.get('/vendor-FollowUp-Billing', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A9:CE',
    });

    let data = response.data.values || [];
    console.log('Total data rows:', data.length);

    let totalMatches = 0;

    const filteredData = data
      .map((row, idx) => {
        const padded = Array(32).fill('');
        row.forEach((cell, i) => {
          if (i < 32) padded[i] = cell || '';
        });

        const planned12 = String(padded[27] || '').trim();     // CF → index 27
        const status12 = String(padded[29] || '').trim();      // CH → index 29 (STATUS 12)

        return { row: padded, planned12, status12, originalIndex: idx + 9 };
      })
      .filter(item => {
        const { planned12, status12 } = item;

        const hasPlanned = planned12 !== '';
        const notReceived = !status12.toLowerCase().includes('received');

        const match = hasPlanned && notReceived;

        if (match) {
          totalMatches++;
          console.log(`MATCH #${totalMatches} (Row ${item.originalIndex}): PLANNED12="${item.planned12}", STATUS12="${item.status12}"`);
        }

        return match;
      })
      .map(item => ({
        UID: item.row[1] || '',
        siteName: item.row[3] || '',
        supervisorName: item.row[4] || '',
        materialName: item.row[7] || '',
        revisedQuantity: item.row[25] || '',
        finalReceivedQuantity: item.row[26] || '',
        unitName: item.row[9] || '',
        vendorFirmName: item.row[23] || '',
        poNumber: item.row[16] || '',
        planned12: item.planned12,
        status12: item.status12,           // SIRF YEHI DIKHEGA
        followUpCount12: item.row[30] || '',
        remark12: item.row[32] || '',
        vendorContact: item.row[24] || '',
      }));

    console.log('TOTAL MATCHES:', totalMatches);

    res.json({
      success: true,
      data: filteredData
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed',
      details: error.message
    });
  }
});

router.post('/update-followup-Billing', async (req, res) => {
  try {
    const data = req.body;
    if (!Array.isArray(data) || data.length === 0)
      return res.status(400).json({ error: 'Invalid data: Expected non-empty array' });

    // ---- VALIDATE ----
    const invalid = data.filter(i => !i.UID?.trim() || !i.status12?.trim() || !i.remark12?.trim());
    if (invalid.length)
      return res.status(400).json({ error: 'UID, status12, remark12 required' });

    // ---- READ SHEET ----
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:CK',   // keep wide enough to read the count column
    });
    const values = resp.data.values || [];

    const updates = [];
    let updatedCount = 0;

    // ---- CONFIG ----
    const COL_STATUS = 'AD';   // <-- adjust
    const COL_COUNT  = 'AE';   // <-- adjust
    const COL_REMARK = 'AG';   // <-- adjust

    for (const item of data) {
      const { UID, status12, remark12 } = item;
      const rowIdx = values.findIndex(r => r[1] === UID);
      if (rowIdx === -1) continue;

      const sheetRow = 8 + rowIdx;
      const curCount = parseInt(values[rowIdx][30] || '0', 10); // AE = index 30
      const newCount = curCount + 1;

      updates.push(
        { range: `Billing_FMS!${COL_STATUS}${sheetRow}`, values: [[status12]] },
        { range: `Billing_FMS!${COL_COUNT}${sheetRow}`,  values: [[newCount]] },
        { range: `Billing_FMS!${COL_REMARK}${sheetRow}`, values: [[remark12]] }
      );
      updatedCount++;
    }

    if (!updates.length)
      return res.status(400).json({ error: 'No rows to update' });

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: { valueInputOption: 'RAW', data: updates },
    });

    res.json({ success: true, updatedRows: updatedCount });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update: ' + err.message });
  }
});

module.exports=router


