

const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');
const router = express.Router();

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


