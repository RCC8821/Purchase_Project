const express = require('express');
const { sheets, SiteExpeseSheetId } = require('../../config/googleSheet');

const router = express.Router();

router.get('/Debit-Approvel-1', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Debit_FMS!A7:O',           // ← CHANGE to correct sheet name
    });

    const rows = response.data.values || [];
    const dataRows = rows.slice(1);     // skip header

    const filteredData = dataRows
      .filter(row => {
        const planned = (row[13] || '').trim();
        const actual  = (row[14] || '').trim();
        return planned && !actual;
      })
      .map(row => ({
        timestamp:          row[0]  || '',
        uid:                row[1]  || '',
        siteName:           row[2]  || '',
        siteEngineer:       row[3]  || '',
        contractorName:     row[4]  || '',
        contractorFirm:     row[5]  || '',
        workType:           row[6]  || '',
        workDate:           row[7]  || '',
        description:        row[8]  || '',
        particular:         row[9]  || '',
        qty:                row[10] || '',
        rate:               row[11] || '',
        amount:             row[12] || '',
        planned:            row[13] || '',
        actual:             row[14] || '',
      }));

    res.json({ success: true, data: filteredData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});



router.post('/Post-Debit-Approvel-1', async (req, res) => {
  const { uid, status, Revised_Amount, remark } = req.body;

  if (!uid) {
    return res.status(400).json({
      success: false,
      message: 'UID is required'
    });
  }

  // Optional: require at least one field
  if (status === undefined && Revised_Amount === undefined && remark === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Provide at least one field to update (status, Revised_Amount, remark)'
    });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Debit_FMS!A7:S',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data found in sheet'
      });
    }

    const rowIndex = rows.findIndex(row =>
      row[1] && String(row[1]).trim() === String(uid).trim()
    );

    if (rowIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `UID not found: ${uid}`
      });
    }

    // ────────────────────────────────────────────────
    // MOST IMPORTANT FIX ──────────────────────────────
    const sheetRowNumber = 7 + rowIndex;   // ← changed from 8 to 7
    // ────────────────────────────────────────────────

    console.log(`Found UID ${uid} at array index ${rowIndex} → sheet row ${sheetRowNumber}`);

    const batchData = [];

    if (status !== undefined && String(status).trim() !== '') {
      batchData.push({
        range: `Debit_FMS!P${sheetRowNumber}`,
        values: [[status]],
      });
    }

    if (Revised_Amount !== undefined) {
      batchData.push({
        range: `Debit_FMS!Q${sheetRowNumber}`,
        values: [[Revised_Amount]],
      });
    }

    if (remark !== undefined && String(remark).trim() !== '') {
      batchData.push({
        range: `Debit_FMS!S${sheetRowNumber}`,
        values: [[remark]],
      });
    }

    if (batchData.length === 0) {
      return res.json({
        success: true,
        message: 'No non-empty values to update'
      });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SiteExpeseSheetId,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: batchData,
      },
    });

    return res.json({
      success: true,
      message: 'Row updated successfully',
      rowNumber: sheetRowNumber,
      updatedColumns: batchData.map(d => d.range.match(/!([A-Z]+)/)?.[1]),
    });

  } catch (error) {
    console.error('Update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Update failed',
      error: error.message
    });
  }
});




///////// Approvel 2 step 


router.get('/Debit-Approvel-2', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Debit_FMS!A7:U',           // ← CHANGE to correct sheet name
    });

    const rows = response.data.values || [];
    const dataRows = rows.slice(1);     // skip header

    const filteredData = dataRows
      .filter(row => {
        const planned = (row[19] || '').trim();
        const actual  = (row[20] || '').trim();
        return planned && !actual;
      })
      .map(row => ({
        timestamp:          row[0]  || '',
        uid:                row[1]  || '',
        siteName:           row[2]  || '',
        siteEngineer:       row[3]  || '',
        contractorName:     row[4]  || '',
        contractorFirm:     row[5]  || '',
        workType:           row[6]  || '',
        workDate:           row[7]  || '',
        description:        row[8]  || '',
        particular:         row[9]  || '',
        qty:                row[10] || '',
        rate:               row[11] || '',
        Revised_Amount:     row[16] || '',
        remark: row[18] || '',
        planned:            row[19] || '',
        actual:             row[20] || '',
      }));

    res.json({ success: true, data: filteredData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});




router.post('/Post-Debit-Approvel-2', async (req, res) => {
  const { uid, status, Revised_Amount, remark } = req.body;

  if (!uid) {
    return res.status(400).json({
      success: false,
      message: 'UID is required'
    });
  }

  // Optional: require at least one field
  if (status === undefined && Revised_Amount === undefined && remark === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Provide at least one field to update (status, Revised_Amount, remark)'
    });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Debit_FMS!A7:Y',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data found in sheet'
      });
    }

    const rowIndex = rows.findIndex(row =>
      row[1] && String(row[1]).trim() === String(uid).trim()
    );

    if (rowIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `UID not found: ${uid}`
      });
    }

    // ────────────────────────────────────────────────
    // MOST IMPORTANT FIX ──────────────────────────────
    const sheetRowNumber = 7 + rowIndex;   // ← changed from 8 to 7
    // ────────────────────────────────────────────────

    console.log(`Found UID ${uid} at array index ${rowIndex} → sheet row ${sheetRowNumber}`);

    const batchData = [];

    if (status !== undefined && String(status).trim() !== '') {
      batchData.push({
        range: `Debit_FMS!V${sheetRowNumber}`,
        values: [[status]],
      });
    }

    if (Revised_Amount !== undefined) {
      batchData.push({
        range: `Debit_FMS!W${sheetRowNumber}`,
        values: [[Revised_Amount]],
      });
    }

    if (remark !== undefined && String(remark).trim() !== '') {
      batchData.push({
        range: `Debit_FMS!Y${sheetRowNumber}`,
        values: [[remark]],
      });
    }

    if (batchData.length === 0) {
      return res.json({
        success: true,
        message: 'No non-empty values to update'
      });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SiteExpeseSheetId,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: batchData,
      },
    });

    return res.json({
      success: true,
      message: 'Row updated successfully',
      rowNumber: sheetRowNumber,
      updatedColumns: batchData.map(d => d.range.match(/!([A-Z]+)/)?.[1]),
    });

  } catch (error) {
    console.error('Update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Update failed',
      error: error.message
    });
  }
});


//////// Total Debit Amount_3 step 


router.get('/total-Debit-Amount', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Debit_FMS!A7:AA',           // ← CHANGE to correct sheet name
    });

    const rows = response.data.values || [];
    const dataRows = rows.slice(1);     // skip header

    const filteredData = dataRows
      .filter(row => {
        const planned = (row[25] || '').trim();
        const actual  = (row[26] || '').trim();
        return planned && !actual;
      })
      .map(row => ({
        timestamp:          row[0]  || '',
        uid:                row[1]  || '',
        siteName:           row[2]  || '',
        siteEngineer:       row[3]  || '',
        contractorName:     row[4]  || '',
        contractorFirm:     row[5]  || '',
        workType:           row[6]  || '',
        workDate:           row[7]  || '',
        description:        row[8]  || '',
        particular:         row[9]  || '',
        qty:                row[10] || '',
        rate:               row[11] || '',
        Revised_Amount:     row[16] || '',
        remark: row[24] || '',
        planned:            row[25] || '',
        actual:             row[26] || '',
      }));

    res.json({ success: true, data: filteredData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});




router.post('/Post-total-Debit-Amount', async (req, res) => {
  const { uid, status,  remark } = req.body;

  if (!uid) {
    return res.status(400).json({
      success: false,
      message: 'UID is required'
    });
  }

  // Optional: require at least one field
  if (status === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Provide at least one field to update (status, remark)'
    });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Debit_FMS!A7:AD',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data found in sheet'
      });
    }

    const rowIndex = rows.findIndex(row =>
      row[1] && String(row[1]).trim() === String(uid).trim()
    );

    if (rowIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `UID not found: ${uid}`
      });
    }

    // ────────────────────────────────────────────────
    // MOST IMPORTANT FIX ──────────────────────────────
    const sheetRowNumber = 7 + rowIndex;   // ← changed from 8 to 7
    // ────────────────────────────────────────────────

    console.log(`Found UID ${uid} at array index ${rowIndex} → sheet row ${sheetRowNumber}`);

    const batchData = [];

    if (status !== undefined && String(status).trim() !== '') {
      batchData.push({
        range: `Debit_FMS!AB${sheetRowNumber}`,
        values: [[status]],
      });
    }

  
    if (remark !== undefined && String(remark).trim() !== '') {
      batchData.push({
        range: `Debit_FMS!AD${sheetRowNumber}`,
        values: [[remark]],
      });
    }

    if (batchData.length === 0) {
      return res.json({
        success: true,
        message: 'No non-empty values to update'
      });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SiteExpeseSheetId,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: batchData,
      },
    });

    return res.json({
      success: true,
      message: 'Row updated successfully',
      rowNumber: sheetRowNumber,
      updatedColumns: batchData.map(d => d.range.match(/!([A-Z]+)/)?.[1]),
    });

  } catch (error) {
    console.error('Update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Update failed',
      error: error.message
    });
  }
});


module.exports = router;