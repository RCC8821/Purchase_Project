

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
    // Fetch data from Purchase_FMS sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:CE', // Range from A8 to CE
    });

    let data = response.data.values || [];

    // Filter and transform data
    const filteredData = data
      .filter(row => {
        const planned12 = (row[27] || '').toString().trim();     // CF - PLANNED 12
        const status12 = (row[29] || '').toString().trim();      // CH - STATUS 12

        // Condition: PLANNED 12 filled AND STATUS 12 is exactly "Hold"
        return planned12 !== '' && status12 === 'Hold';
      })
      .map(row => ({
        UID: row[1] || '',                    // B
        siteName: row[3] || '',               // D
        supervisorName: row[4] || '',         // E
        materialName: row[7] || '',           // H
        revisedQuantity: row[25] || '',       // Z (REVISED QTY)
        finalReceivedQuantity: row[26] || '', // AA (FINAL RECEIVED QTY)
        unitName: row[9] || '',               // J
        vendorFirmName: row[23] || '',        // X (Vendor Firm Name)
        poNumber: row[16] || '',              // Q (PO Number)
        planned12: row[27] || '',             // CF
        status12: row[29] || '',              // CH
        followUpCount12: row[30] || '',       // CI
        remark12: row[32] || '',              // CK (assuming skip CJ if needed)
        vendorContact: row[24] || '',         // Y (next to Vendor Firm Name)
      }));

    res.json({
      success: true,
      data: filteredData
    });
  } catch (error) {
    console.error('Error fetching Vendor-FollowUp-Billing data:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch Vendor-FollowUp-Billing data' 
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


