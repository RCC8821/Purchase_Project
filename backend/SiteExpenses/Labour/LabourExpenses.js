const express = require('express');
const { sheets, SiteExpeseSheetId } = require('../../config/googleSheet');

const router = express.Router();


router.get('/get-Labour-Approve', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Labour_FMS!A7:R',   // starts from row 7 (data)
    });

    const rows = response.data.values || [];


    const dataRows = rows;   
    const pendingLabour = dataRows
      .filter(row => {
        if (row.length < 18) return false; // need up to R (index 17)

        const planned = (row[16] || '').toString().trim(); // Planned_2 → Q
        const actual  = (row[17] || '').toString().trim(); // Actual_2  → R

        return planned !== '' && actual === '';
      })
      .map(row => ({
        timestamp:              row[0]  || '',
        uid:                    row[1]  || '',
        projectName:            row[2]  || '',
        projectEngineer:        row[3]  || '',
        workType:               row[4]  || '',
        workDescription:        row[5]  || '',
        labourCategory:         row[6]  || '',
        numberOfLabour:         row[7]  || '',
        dateRequired:           row[8]  || '',
        headOfContractor:       row[9]  || '',
        nameOfContractor:       row[10] || '',
        remark:                 row[11] || '',
        // blanks (12–15) skipped
        planned2:               row[16] || '',
        actual2:                row[17] || '',

        // Very useful for later update/approval:
        // sheetRow: 7 + rows.indexOf(row),   // real row number in spreadsheet
      }));

    res.json({
      success: true,
      count: pendingLabour.length,
      data: pendingLabour
    });
  } catch (error) {
    console.error('Error fetching pending labour approvals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending labour approvals'
    });
  }
});




router.post('/Post-labour-Approvel-1', async (req, res) => {
  const { uid, status, Approved_Head_2, remark } = req.body;

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
      range: 'Labour_FMS!A7:V',
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
        range: `Labour_FMS!S${sheetRowNumber}`,
        values: [[status]],
      });
    }

    if (Approved_Head_2 !== undefined) {
      batchData.push({
        range: `Labour_FMS!U${sheetRowNumber}`,
        values: [[Approved_Head_2]],
      });
    }

    if (remark !== undefined && String(remark).trim() !== '') {
      batchData.push({
        range: `Labour_FMS!V${sheetRowNumber}`,
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



/////////  labour management step 


router.get('/get-Labour-management', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Labour_FMS!A7:X',   // starts from row 7 (data)
    });

    const rows = response.data.values || [];


    const dataRows = rows;   
    const pendingLabour = dataRows
      .filter(row => {
        if (row.length < 18) return false; // need up to R (index 17)

        const planned = (row[22] || '').toString().trim(); // Planned_2 → Q
        const actual  = (row[23] || '').toString().trim(); // Actual_2  → R

        return planned !== '' && actual === '';
      })
      .map(row => ({
        timestamp:              row[0]  || '',
        uid:                    row[1]  || '',
        projectName:            row[2]  || '',
        projectEngineer:        row[3]  || '',
        workType:               row[4]  || '',
        workDescription:        row[5]  || '',
        labourCategory:         row[6]  || '',
        numberOfLabour:         row[7]  || '',
        dateRequired:           row[8]  || '',
        headOfContractor:       row[9]  || '',
        nameOfContractor:       row[10] || '',
        Approved_Head_2:       row[20] || '',
        remark:                 row[21] || '',

        // blanks (12–15) skipped
        planned2:               row[22] || '',
        actual2:                row[23] || '',

        // Very useful for later update/approval:
        // sheetRow: 7 + rows.indexOf(row),   // real row number in spreadsheet
      }));

    res.json({
      success: true,
      count: pendingLabour.length,
      data: pendingLabour
    });
  } catch (error) {
    console.error('Error fetching pending labour approvals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending labour approvals'
    });
  }
});



router.post('/Post-labour-management', async (req, res) => {
  const {
    uid,
    Status_3,                  // → Y
              
    Labouar_Contractor_Name_3, // → AA
    Number_Of_Labour_3,        // → AB
    Labour_Rate_3,             // → AC
    Total_Wages_3,             // → AD
    Conveyanance_3,            // → AE
    Total_Paid_Amount_3,       // → AF
    Company_Head_Amount_3,     // → AG
    Contractor_Head_Amount_3,  // → AH
    Remark_3                   // → AI
  } = req.body;

  if (!uid) {
    return res.status(400).json({
      success: false,
      message: 'UID is required'
    });
  }

  // Require at least one field to update
  if (
    Status_3 === undefined &&
    
    Labouar_Contractor_Name_3 === undefined &&
    Number_Of_Labour_3 === undefined &&
    Labour_Rate_3 === undefined &&
    Total_Wages_3 === undefined &&
    Conveyanance_3 === undefined &&
    Total_Paid_Amount_3 === undefined &&
    Company_Head_Amount_3 === undefined &&
    Contractor_Head_Amount_3 === undefined &&
    Remark_3 === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: 'Provide at least one field to update'
    });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Labour_FMS!A7:AI',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data found in Labour_FMS sheet'
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

    // New fields only (Y → AI)
    if (Status_3 !== undefined && String(Status_3).trim() !== '') {
      batchData.push({ range: `Labour_FMS!Y${sheetRowNumber}`, values: [[Status_3]] });
    }
  
    if (Labouar_Contractor_Name_3 !== undefined && String(Labouar_Contractor_Name_3).trim() !== '') {
      batchData.push({ range: `Labour_FMS!AA${sheetRowNumber}`, values: [[Labouar_Contractor_Name_3]] });
    }
    if (Number_Of_Labour_3 !== undefined) {
      batchData.push({ range: `Labour_FMS!AB${sheetRowNumber}`, values: [[Number_Of_Labour_3]] });
    }
    if (Labour_Rate_3 !== undefined) {
      batchData.push({ range: `Labour_FMS!AC${sheetRowNumber}`, values: [[Labour_Rate_3]] });
    }
    if (Total_Wages_3 !== undefined) {
      batchData.push({ range: `Labour_FMS!AD${sheetRowNumber}`, values: [[Total_Wages_3]] });
    }
    if (Conveyanance_3 !== undefined) {
      batchData.push({ range: `Labour_FMS!AE${sheetRowNumber}`, values: [[Conveyanance_3]] });
    }
    if (Total_Paid_Amount_3 !== undefined) {
      batchData.push({ range: `Labour_FMS!AF${sheetRowNumber}`, values: [[Total_Paid_Amount_3]] });
    }
    if (Company_Head_Amount_3 !== undefined) {
      batchData.push({ range: `Labour_FMS!AG${sheetRowNumber}`, values: [[Company_Head_Amount_3]] });
    }
    if (Contractor_Head_Amount_3 !== undefined) {
      batchData.push({ range: `Labour_FMS!AH${sheetRowNumber}`, values: [[Contractor_Head_Amount_3]] });
    }
    if (Remark_3 !== undefined && String(Remark_3).trim() !== '') {
      batchData.push({ range: `Labour_FMS!AI${sheetRowNumber}`, values: [[Remark_3]] });
    }

    if (batchData.length === 0) {
      return res.json({
        success: true,
        message: 'No valid/non-empty values to update'
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
      message: 'Labour_FMS updated successfully (columns Y to AI)',
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