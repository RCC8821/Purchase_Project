const express = require('express');
const { sheets, SiteExpeseSheetId } = require('../../config/googleSheet');

const router = express.Router();



router.get('/Site-Approvel-1', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Site_Exp_FMS!A7:O',   // starts from row 7
    });

    const rows = response.data.values || [];

    // If row 7 (index 0) is header → we skip it
    // Adjust slice(0) or slice(1) depending on whether A7 is header or data
    const dataRows = rows.slice(1);   // most common case: skip header row

    const pendingApprovals = dataRows
      .filter(row => {
        // Make sure row has at least 15 columns (A to O)
        if (row.length < 15) return false;

        const planned = (row[13] || '').toString().trim();
        const actual  = (row[14] || '').toString().trim();

        return planned !== '' && actual === '';
      })
      .map(row => ({
        timestamp:             row[0]  || '',
        uid:                   row[1]  || '',
        payeeName:             row[2]  || '',
        projectName:           row[3]  || '',
        projectEngineerName:   row[4]  || '',
        headType:              row[5]  || '',
        detailsOfWork:         row[6]  || '',
        costAmount:            row[7]  || '',
        remark:                row[8]  || '',
        billPhoto:             row[9]  || '',          // ← link or filename
        // blanks skipped (10,11,12)
        planned2:              row[13] || '',
        actual2:               row[14] || '',
        
        // Optional: useful extras for frontend
        // rowIndex: rows.indexOf(row) + 7 + 1,   // actual spreadsheet row number
        // hasBillPhoto: !!row[9],
      }));

    res.json({
      success: true,
      count: pendingApprovals.length,
      data: pendingApprovals
    });
  } catch (error) {
    console.error('Error in /Site-Approvel-1:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending site approvals'
    });
  }
});





router.post('/Post-Site-Approvel-1', async (req, res) => {
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
      range: 'Site_Exp_FMS!A7:S',
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
        range: `Site_Exp_FMS!P${sheetRowNumber}`,
        values: [[status]],
      });
    }

    if (Revised_Amount !== undefined) {
      batchData.push({
        range: `Site_Exp_FMS!Q${sheetRowNumber}`,
        values: [[Revised_Amount]],
      });
    }

    if (remark !== undefined && String(remark).trim() !== '') {
      batchData.push({
        range: `Site_Exp_FMS!S${sheetRowNumber}`,
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




////////  site Approvel paid amount 2 


router.get('/Site-Approvel-2', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Site_Exp_FMS!A7:U',   // starts from row 7
    });

    const rows = response.data.values || [];

    // If row 7 (index 0) is header → we skip it
    // Adjust slice(0) or slice(1) depending on whether A7 is header or data
    const dataRows = rows.slice(1);   // most common case: skip header row

    const pendingApprovals = dataRows
      .filter(row => {
        // Make sure row has at least 15 columns (A to O)
        if (row.length < 15) return false;

        const planned = (row[19] || '').toString().trim();
        const actual  = (row[20] || '').toString().trim();

        return planned !== '' && actual === '';
      })
      .map(row => ({
        timestamp:             row[0]  || '',
        uid:                   row[1]  || '',
        payeeName:             row[2]  || '',
        projectName:           row[3]  || '',
        projectEngineerName:   row[4]  || '',
        headType:              row[5]  || '',
        detailsOfWork:         row[6]  || '',
        costAmount:            row[7]  || '',
        remark:                row[8]  || '',
        billPhoto:             row[9]  || '', 
         Revised_Amount:     row[16] || '',
        remark: row[18] || '',         // ← link or filename
        // blanks skipped (10,11,12)
        planned2:              row[19] || '',
        actual2:               row[20] || '',
        
        // Optional: useful extras for frontend
        // rowIndex: rows.indexOf(row) + 7 + 1,   // actual spreadsheet row number
        // hasBillPhoto: !!row[9],
      }));

    res.json({
      success: true,
      count: pendingApprovals.length,
      data: pendingApprovals
    });
  } catch (error) {
    console.error('Error in /Site-Approvel-2:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending site approvals'
    });
  }
});



router.post('/Post-Site-Approvel-2', async (req, res) => {
  const {
    uid,
    status,           // → P
    Revised_Amount,   // → Q
    remark,           // → S
    Status_3,         // → V
    Payment_Mode_3,   // → W
    Payment_Detials_3,// → X   (note: probably typo → should be Details?)
    Payment_Date,     // → Y
    Paid_By_Name_3,   // → Z
    Reciever_Name_3,  // → AB  (note: probably typo → Receiver_Name_3 ?)
    Voucher_Number_3  // → AC
  } = req.body;

  if (!uid) {
    return res.status(400).json({
      success: false,
      message: 'UID is required'
    });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Site_Exp_FMS!A7:AC',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data found in Site_Exp_FMS sheet'
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

    const sheetRowNumber = 7 + rowIndex;

    console.log(`Found UID ${uid} at array index ${rowIndex} → sheet row ${sheetRowNumber}`);

    const batchData = [];

    // Existing fields
    if (status !== undefined && String(status).trim() !== '') {
      batchData.push({ range: `Site_Exp_FMS!P${sheetRowNumber}`, values: [[status]] });
    }
    if (Revised_Amount !== undefined) {
      batchData.push({ range: `Site_Exp_FMS!Q${sheetRowNumber}`, values: [[Revised_Amount]] });
    }
    if (remark !== undefined && String(remark).trim() !== '') {
      batchData.push({ range: `Site_Exp_FMS!S${sheetRowNumber}`, values: [[remark]] });
    }

    // New payment related fields (V → AC)
    if (Status_3 !== undefined && String(Status_3).trim() !== '') {
      batchData.push({ range: `Site_Exp_FMS!V${sheetRowNumber}`, values: [[Status_3]] });
    }
    if (Payment_Mode_3 !== undefined && String(Payment_Mode_3).trim() !== '') {
      batchData.push({ range: `Site_Exp_FMS!W${sheetRowNumber}`, values: [[Payment_Mode_3]] });
    }
    if (Payment_Detials_3 !== undefined && String(Payment_Detials_3).trim() !== '') {
      batchData.push({ range: `Site_Exp_FMS!X${sheetRowNumber}`, values: [[Payment_Detials_3]] });
    }
    if (Payment_Date !== undefined && String(Payment_Date).trim() !== '') {
      batchData.push({ range: `Site_Exp_FMS!Y${sheetRowNumber}`, values: [[Payment_Date]] });
    }
    if (Paid_By_Name_3 !== undefined && String(Paid_By_Name_3).trim() !== '') {
      batchData.push({ range: `Site_Exp_FMS!Z${sheetRowNumber}`, values: [[Paid_By_Name_3]] });
    }
   
    if (Reciever_Name_3 !== undefined && String(Reciever_Name_3).trim() !== '') {
      batchData.push({ range: `Site_Exp_FMS!AB${sheetRowNumber}`, values: [[Reciever_Name_3]] });
    }
    if (Voucher_Number_3 !== undefined && String(Voucher_Number_3).trim() !== '') {
      batchData.push({ range: `Site_Exp_FMS!AC${sheetRowNumber}`, values: [[Voucher_Number_3]] });
    }

    if (batchData.length === 0) {
      return res.json({
        success: true,
        message: 'No valid/non-empty fields to update'
      });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SiteExpeseSheetId,
      resource: {
        valueInputOption: 'USER_ENTERED',   // good for dates & numbers
        data: batchData,
      },
    });

    return res.json({
      success: true,
      message: 'Site_Exp_FMS row updated successfully',
      rowNumber: sheetRowNumber,
      updatedColumns: batchData.map(d => d.range.match(/!([A-Z]+)$/)[1]),
      updatedCount: batchData.length
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