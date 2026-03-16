const express = require('express');
const { sheets, SiteExpeseSheetId } = require('../../config/googleSheet');

const router = express.Router();




// router.get('/get-project-dropdown', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: SiteExpeseSheetId,
//       range: 'Project_Data!A3:U1000',   // A se U tak (U = 21st column, index 20)
//     });

//     const rows = response.data.values || [];

//     const projectMap = new Map(); // projectName (A column) → object (duplicates avoid)

//     rows.forEach((row, index) => {
//       const projectName = (row[0] || '').trim(); // Column A (index 0)
//       if (!projectName) return; // empty project skip

//       const key = projectName.toLowerCase();

//       if (!projectMap.has(key)) {
//         projectMap.set(key, {
//           id: index + 3, // sheet row number (starts from 3)
//           projectName: projectName,
//           engineer: (row[1] || '').trim(),                    // B - Engineer
//           contractorName: (row[2] || '').trim(),              // C - Contractor Name
//           contractorFirmName: (row[3] || '').trim(),          // D - Firm Name
//           expenseWorkType: (row[8] || '').trim(),             // E - Site Exp / Work Type
//           labourWorkType: (row[14] || '').trim(),              // J (index 9) - Labour Work Type
//           labourCategory: (row[15] || '').trim(),          // K - agar chahiye to uncomment
//           bankName: (row[20] || '').trim(),                   // U column (index 20) - Bank names/accounts
//           label: `${projectName}${row[1] ? ` - ${row[1].trim()}` : ''}`.trim(),
//           value: projectName,
//         });
//       }
//       // Optional: agar same project ke multiple entries hain to latest update karna
//       // else { projectMap.set(key, { ...updated fields }) }
//     });

//     const projects = Array.from(projectMap.values());

//     res.json({
//       success: true,
//       count: projects.length,
//       data: projects
//     });

//   } catch (error) {
//     console.error('Error fetching project dropdown data:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch project data',
//       error: error.message
//     });
//   }
// });



router.get('/get-project-dropdown', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Project_Data!A3:U5000',
    });

    const rows = response.data.values || [];
    console.log('Raw rows fetched from API:', rows.length);

    // Pad rows to 21 columns
    const fullRows = rows.map(row => {
      const padded = [...row];
      while (padded.length < 21) padded.push('');
      return padded;
    });

    // ─── FIX: projectMap nahi, direct array banao ───────────────────────────
    // Pehle wala code projectName ko key maanke duplicate skip karta tha
    // Isliye ek project ke multiple contractors chhoot jaate the
    // Ab har row ek alag entry hogi
    const result = [];

    // Track unique contractors (contractorName lowercase) for deduplication
    // Project entries alag hain, contractor entries alag hain — dono independent
    const seenContractors = new Set();

    fullRows.forEach((row, index) => {
      const projectName       = (row[0]  || '').trim();
      const engineer          = (row[1]  || '').trim();
      const contractorName    = (row[2]  || '').trim();
      const contractorFirmName= (row[3]  || '').trim();
      const expenseWorkType   = (row[8]  || '').trim();
      const labourWorkType    = (row[14] || '').trim();
      const labourCategory    = (row[15] || '').trim();
      const bankName          = (row[20] || '').trim();

      // Completely empty row — skip
      if (!projectName && !contractorName && !contractorFirmName) return;

      const entry = {
        id:               index + 3,
        projectName:      projectName || '(No Project Name)',
        engineer,
        contractorName,
        contractorFirmName,
        expenseWorkType,
        labourWorkType,
        labourCategory,
        bankName,
        label: projectName
          ? `${projectName}${engineer ? ` - ${engineer}` : ''}`.trim()
          : `${contractorName || contractorFirmName || 'Unknown'} (No Project)`,
        value: projectName || contractorName || contractorFirmName || 'unknown',
      };

      result.push(entry);
    });

    console.log('Total entries returned:', result.length);

    // ─── Contractor uniqueness check for debug ──────────────────────────────
    const uniqueContractors = [...new Set(
      result.map(r => r.contractorName).filter(Boolean)
    )];
    console.log('Unique contractors:', uniqueContractors.length);

    res.json({
      success: true,
      count: result.length,
      data: result,
      debug: {
        rawRowsFromApi:    rows.length,
        totalEntries:      result.length,
        uniqueContractors: uniqueContractors.length,
      }
    });

  } catch (error) {
    console.error('Error fetching dropdown:', error);
    res.status(500).json({ success: false, message: 'Failed', error: error.message });
  }
});



router.get('/get-Labour-Approve', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Labour_FMS!A7:V',   // Now A:V (22 columns)
    });

    const rows = response.data.values || [];

    const pendingLabour = rows
      .filter(row => {
        const planned2 = row[20] || '';
        const actual2 = row[21] || '';
        return planned2 && !actual2;
      })
      .map((row, index) => ({
        timestamp:               row[0]  || '',
        uid:                     row[1]  || '',
        projectName:             row[2]  || '',
        projectEngineer:         row[3]  || '',
        workType:                row[4]  || '',
        workDescription:         row[5]  || '',
        labourCategory1:         row[6]  || '',
        numberOfLabour1:         row[7]  || '',
        labourCategory2:         row[8]  || '',
        numberOfLabour2:         row[9]  || '',
        totalLabour:             row[10] || '',
        dateRequired:            row[11] || '',
        headOfContractor:        row[12] || '',
        nameOfContractor:        row[13] || '',
        contractorFirmName:      row[14] || '',
        remark:                  row[15] || '',
        
        // blanks at 16–19 (P–S) are skipped in object

        planned2:                row[20] || '',   // U
        actual2:                 row[21] || '',   // V
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
      message: 'Failed to fetch pending labour approvals',
      error: error.message
    });
  }
});





router.post('/Post-labour-Approvel-1', async (req, res) => {
  const { 
    uid, 
    Status_2, 

    Approved_Head_2, 
    Name_Of_Contractor_2,
    Contractor_Firm_Name_2,
    Remark_2 
  } = req.body;

  if (!uid) {
    return res.status(400).json({
      success: false,
      message: 'UID is required'
    });
  }

  // Check if at least one field is provided
  if (
    Status_2 === undefined && 
    
    Approved_Head_2 === undefined &&
    Name_Of_Contractor_2 === undefined &&
    Contractor_Firm_Name_2 === undefined &&
    Remark_2 === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: 'Provide at least one field to update (Status_2, Time_Delay_2, Approved_Head_2, Name_Of_Contractor_2, Contractor_Firm_Name_2, Remark_2)'
    });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Labour_FMS!A7:AB',
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

    const sheetRowNumber = 7 + rowIndex;

    console.log(`Found UID ${uid} at array index ${rowIndex} → sheet row ${sheetRowNumber}`);

    const batchData = [];

    // W - Status_2
    if (Status_2 !== undefined && String(Status_2).trim() !== '') {
      batchData.push({
        range: `Labour_FMS!W${sheetRowNumber}`,
        values: [[Status_2]],
      });
    }


    // Y - Approved_Head_2
    if (Approved_Head_2 !== undefined && String(Approved_Head_2).trim() !== '') {
      batchData.push({
        range: `Labour_FMS!Y${sheetRowNumber}`,
        values: [[Approved_Head_2]],
      });
    }

    // Z - Name_Of_Contractor_2
    if (Name_Of_Contractor_2 !== undefined && String(Name_Of_Contractor_2).trim() !== '') {
      batchData.push({
        range: `Labour_FMS!Z${sheetRowNumber}`,
        values: [[Name_Of_Contractor_2]],
      });
    }

    // AA - Contractor_Firm_Name_2
    if (Contractor_Firm_Name_2 !== undefined && String(Contractor_Firm_Name_2).trim() !== '') {
      batchData.push({
        range: `Labour_FMS!AA${sheetRowNumber}`,
        values: [[Contractor_Firm_Name_2]],
      });
    }

    // AB - Remark_2
    if (Remark_2 !== undefined && String(Remark_2).trim() !== '') {
      batchData.push({
        range: `Labour_FMS!AB${sheetRowNumber}`,
        values: [[Remark_2]],
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
      message: 'Labour approval updated successfully (W to AB)',
      rowNumber: sheetRowNumber,
      updatedColumns: batchData.map(d => d.range.match(/!([A-Z]+)/)?.[1]),
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



/////////  labour management step 


router.get('/get-Labour-management', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Labour_FMS!A7:AD',   // starts from row 7 (data)
    });

    const rows = response.data.values || [];


    const dataRows = rows;   
    const pendingLabour = dataRows
      .filter(row => {
        if (row.length < 18) return false; // need up to R (index 17)

        const planned3 = (row[28] || '').toString().trim(); // Planned_2 → Q
        const actual3  = (row[29] || '').toString().trim(); // Actual_2  → R

        return planned3 !== '' && actual3 === '';
      })
      .map(row => ({
        timestamp:               row[0]  || '',
        uid:                     row[1]  || '',
        projectName:             row[2]  || '',
        projectEngineer:         row[3]  || '',
        workType:                row[4]  || '',
        workDescription:         row[5]  || '',
        labourCategory1:         row[6]  || '',
        numberOfLabour1:         row[7]  || '',
        labourCategory2:         row[8]  || '',
        numberOfLabour2:         row[9]  || '',
        totalLabour:             row[10] || '',
        dateRequired:            row[11] || '',
        headOfContractor:        row[12] || '',
        nameOfContractor:        row[13] || '',
        contractorFirmName:      row[14] || '',
        Approved_Head_2:         row[24] || '',

      
        Name_Of_Contractor_2:         row[25] || '',
        Contractor_Firm_Name_2:         row[26] || '',

        remark:                  row[27] || '',
        
        // blanks at 16–19 (P–S) are skipped in object

        planned3:                row[28] || '',   // U
        actual3:                 row[29] || '',  
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
  try {
    const {
      uid,
      Status_3,
      Labouar_Contractor_Name_3,
      Labour_Category_1_3,
      Number_Of_Labour_1_3,
      Labour_Rate_1_3,
      Labour_Category_2_3,
      Number_Of_Labour_2_3,
      Labour_Rate_2_3,
      Total_Wages_3,
      Conveyanance_3,
      Total_Paid_Amount_3,
      Company_Head_Amount_3,
      Contractor_Head_Amount_3,
      Remark_3    } = req.body;

    // Validate required UID
    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'UID is required'
      });
    }

    // Get data from spreadsheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Labour_FMS!A7:AS',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data found in Labour_FMS sheet'
      });
    }

    // Find matching UID row (column B = index 1)
    const rowIndex = rows.findIndex(row => 
      row[1] && String(row[1]).trim() === String(uid).trim()
    );

    if (rowIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `UID not found: ${uid}`
      });
    }

    const sheetRowNumber = 7 + rowIndex; // Convert to 1-based sheet row    // Prepare batch update data (columns AE to AS)
    const batchData = [];

    // Helper to safely add non-empty values
    const addIfValid = (colLetter, value) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        batchData.push({ 
          range: `Labour_FMS!${colLetter}${sheetRowNumber}`, 
          values: [[value]] 
        });
      }
    };

    // Add fields with proper validation
    if (Status_3 !== undefined && String(Status_3).trim() !== '') {
      addIfValid('AE', Status_3);
    }
    
    if (Labouar_Contractor_Name_3 !== undefined && String(Labouar_Contractor_Name_3).trim() !== '') {
      addIfValid('AG', Labouar_Contractor_Name_3);
    }
    
    if (Labour_Category_1_3 !== undefined && String(Labour_Category_1_3).trim() !== '') {
      addIfValid('AH', Labour_Category_1_3);
    }
        if (Number_Of_Labour_1_3 !== undefined && !isNaN(Number_Of_Labour_1_3)) {
      addIfValid('AI', Number_Of_Labour_1_3);
    }
    
    if (Labour_Rate_1_3 !== undefined && !isNaN(Labour_Rate_1_3)) {
      addIfValid('AJ', Labour_Rate_1_3);
    }
    
    if (Labour_Category_2_3 !== undefined && String(Labour_Category_2_3).trim() !== '') {
      addIfValid('AK', Labour_Category_2_3);
    }
    
    if (Number_Of_Labour_2_3 !== undefined && !isNaN(Number_Of_Labour_2_3)) {
      addIfValid('AL', Number_Of_Labour_2_3);
    }
    
    if (Labour_Rate_2_3 !== undefined && !isNaN(Labour_Rate_2_3)) {
      addIfValid('AM', Labour_Rate_2_3);
    }
    
    if (Total_Wages_3 !== undefined && !isNaN(Total_Wages_3)) {
      addIfValid('AN', Total_Wages_3);
    }
    
    if (Conveyanance_3 !== undefined && !isNaN(Conveyanance_3)) {
      addIfValid('AO', Conveyanance_3);
    }
    
    if (Total_Paid_Amount_3 !== undefined && !isNaN(Total_Paid_Amount_3)) {
      addIfValid('AP', Total_Paid_Amount_3);
    }
    
    if (Company_Head_Amount_3 !== undefined && !isNaN(Company_Head_Amount_3)) {
      addIfValid('AQ', Company_Head_Amount_3);
    }
    
    if (Contractor_Head_Amount_3 !== undefined && !isNaN(Contractor_Head_Amount_3)) {
      addIfValid('AR', Contractor_Head_Amount_3);
    }
    
    if (Remark_3 !== undefined && String(Remark_3).trim() !== '') {
      addIfValid('AS', Remark_3);
    }

    // Handle case with no valid updates
    if (batchData.length === 0) {
      return res.json({
        success: true,
        message: 'No valid/non-empty fields to update',
        rowNumber: sheetRowNumber,
        updatedColumns: [],
        updatedCount: 0
      });
    }

    // Execute batch update
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SiteExpeseSheetId,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: batchData,
      },
    });

    // SAFE column extraction (no regex risks)
    const updatedColumns = batchData.map(update => {
      try {
        // Extract column letters from range like "Labour_FMS!AE5" → "AE"
        const rangeParts = update.range.split('!');
        if (rangeParts.length < 2) return 'unknown';
        
        const colRowPart = rangeParts[1]; // e.g., "AE5"
        // Get leading alphabetic characters only
        const colMatch = colRowPart.match(/^[A-Z]+/);
        return colMatch ? colMatch[0] : 'unknown';
      } catch (e) {
        console.error('Column extraction error:', e, update.range);
        return 'error';
      }
    });

    // Return successful response
    return res.json({
      success: true,
      message: 'Labour_FMS payment/management fields updated successfully',
      rowNumber: sheetRowNumber,
      updatedColumns: updatedColumns,
      updatedCount: batchData.length
    });

  } catch (error) {
    console.error('=== BACKEND ERROR ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
    
    return res.status(500).json({
      success: false,
      message: 'Update failed - see server logs for details',
      error: error.message || 'Unknown error'
    });
  }
});




///////   Approvel labour ashok pandey sir 



router.get('/get-Approvel-ashokSir', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Labour_FMS!A7:BT',   // starts from row 7 (data)
    });

    const rows = response.data.values || [];


    const dataRows = rows;   
    const pendingLabour = dataRows
      .filter(row => {
        if (row.length < 18) return false; // need up to R (index 17)

        const planned4 = (row[48] || '').toString().trim(); // Planned_2 → Q
        const actual4  = (row[49] || '').toString().trim(); // Actual_2  → R

        return planned4 !== '' && actual4 === '';
      })
      .map(row => ({
        timestamp:               row[0]  || '',
        uid:                     row[1]  || '',
        projectName:             row[2]  || '',
        projectEngineer:         row[3]  || '',
        workType:                row[4]  || '',
        workDescription:         row[5]  || '',
        labourCategory1:         row[6]  || '',
        numberOfLabour1:         row[7]  || '',
        labourCategory2:         row[8]  || '',
        numberOfLabour2:         row[9]  || '',
        totalLabour:             row[10] || '',
        dateRequired:            row[11] || '',
        headOfContractor:        row[12] || '',
        nameOfContractor:        row[25] || '',
        contractorFirmName:      row[26] || '',
        Approved_Head_2:         row[24] || '',

        Labouar_Contractor_Name_3:         row[32] || '',
        Labour_Category_1_3:         row[33] || '',
        Number_Of_Labour_1_3:         row[34] || '',
        Labour_Rate_1_3:         row[35] || '',
        Labour_Category_2_3:         row[36] || '',

        Number_Of_Labour_2_3:         row[37] || '',
        Labour_Rate_2_3:         row[38] || '',
        Total_Wages_3:         row[39] || '',
        Conveyanance_3:         row[40] || '',
        Total_Paid_Amount_3:         row[41] || '',
        Company_Head_Amount_3:         row[42] || '',
        Contractor_Head_Amount_3:         row[43] || '',
        remark3:                  row[44] || '',
        
        // blanks at 16–19 (P–S) are skipped in object

        planned4:                row[48] || '',   // U
        actual4:                 row[49] || '',  
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

router.post('/Post-labour-Approvel-AshokSir', async (req, res) => {
  const { 
    uid, 
    status, 
    Deployed_Category_1_Labour_No_4,
    Deployed_Category_2_Labour_No_4,
    Revised_Company_Head_Amount_4,
    Revised_Contractor_Head_Amount_4, 
    remark4 
  } = req.body;

  if (!uid) {
    return res.status(400).json({
      success: false,
      message: 'UID is required'
    });
  }

  // Require at least one field to update
  if (
    status === undefined && 
    Time_Delay_4 === undefined &&
    Deployed_Category_1_Labour_No_4 === undefined &&
    Deployed_Category_2_Labour_No_4 === undefined &&
    Revised_Company_Head_Amount_4 === undefined && 
    Revised_Contractor_Head_Amount_4 === undefined &&
    remark4 === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: 'Provide at least one field to update'
    });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Labour_FMS!A7:BE',
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

    const sheetRowNumber = 7 + rowIndex;

    console.log(`Found UID ${uid} at array index ${rowIndex} → sheet row ${sheetRowNumber}`);

    const batchData = [];

    // AY - Status_4
    if (status !== undefined && String(status).trim() !== '') {
      batchData.push({
        range: `Labour_FMS!AY${sheetRowNumber}`,
        values: [[status]],
      });
    }

    // AZ - Time Delay 4
    // if (Time_Delay_4 !== undefined && String(Time_Delay_4).trim() !== '') {
    //   batchData.push({
    //     range: `Labour_FMS!AZ${sheetRowNumber}`,
    //     values: [[Time_Delay_4]],
    //   });
    // }

    // BA - Deployed_Category_1_Labour_No._4
    if (Deployed_Category_1_Labour_No_4 !== undefined && String(Deployed_Category_1_Labour_No_4).trim() !== '') {
      batchData.push({
        range: `Labour_FMS!BA${sheetRowNumber}`,
        values: [[Deployed_Category_1_Labour_No_4]],
      });
    }

    // BB - Deployed_Category_2_Labour_No._4
    if (Deployed_Category_2_Labour_No_4 !== undefined && String(Deployed_Category_2_Labour_No_4).trim() !== '') {
      batchData.push({
        range: `Labour_FMS!BB${sheetRowNumber}`,
        values: [[Deployed_Category_2_Labour_No_4]],
      });
    }

    // BC - Revised_Company_Head_Amount_4
    if (Revised_Company_Head_Amount_4 !== undefined && String(Revised_Company_Head_Amount_4).trim() !== '') {
      batchData.push({
        range: `Labour_FMS!BC${sheetRowNumber}`,
        values: [[Revised_Company_Head_Amount_4]],
      });
    }

    // BD - Revised_Contractor_Head_Amount_4
    if (Revised_Contractor_Head_Amount_4 !== undefined && String(Revised_Contractor_Head_Amount_4).trim() !== '') {
      batchData.push({
        range: `Labour_FMS!BD${sheetRowNumber}`,
        values: [[Revised_Contractor_Head_Amount_4]],
      });
    }

    // BE - Remark_4
    if (remark4 !== undefined && String(remark4).trim() !== '') {
      batchData.push({
        range: `Labour_FMS!BE${sheetRowNumber}`,
        values: [[remark4]],
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


///////// Paid Amount step 



router.get('/get-paid-step', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Labour_FMS!A7:BL',   // starts from row 7 (data)
    });

    const rows = response.data.values || [];


    const dataRows = rows;   
    const pendingLabour = dataRows
      .filter(row => {
        if (row.length < 18) return false; // need up to R (index 17)

        const planned3 = (row[62] || '').toString().trim(); // Planned_2 → Q
        const actual3  = (row[63] || '').toString().trim(); // Actual_2  → R

        return planned3 !== '' && actual3 === '';
      })
      .map(row => ({
        timestamp:               row[0]  || '',
        uid:                     row[1]  || '',
        projectName:             row[2]  || '',
        projectEngineer:         row[3]  || '',
        workType:                row[4]  || '',
        workDescription:         row[5]  || '',
        labourCategory1:         row[6]  || '',
        numberOfLabour1:         row[7]  || '',
        labourCategory2:         row[8]  || '',
        numberOfLabour2:         row[9]  || '',
        totalLabour:             row[10] || '',
        dateRequired:            row[11] || '',
        headOfContractor:        row[12] || '',
        nameOfContractor:        row[13] || '',
        contractorFirmName:      row[14] || '',
        Approved_Head_2:         row[24] || '',

        Labouar_Contractor_Name_3:         row[32] || '',
        Labour_Category_1_3:         row[33] || '',
        Number_Of_Labour_1_3:         row[34] || '',
        Labour_Rate_1_3:         row[35] || '',
        Labour_Category_2_3:         row[36] || '',

        Number_Of_Labour_2_3:         row[37] || '',
        Labour_Rate_2_3:         row[38] || '',
        Total_Wages_3:         row[39] || '',
        Conveyanance_3:         row[40] || '',
        Total_Paid_Amount_3:         row[41] || '',
        
  
        Deployed_Category_1_Labour_No_4:	row[52] || '',
        Deployed_Category_2_Labour_No_4:	row[53] || '',
        Revised_Company_Head_Amount_4:   row[54] || '',
        Revised_Contractor_Head_Amount_4:  row[55] || '',



        remark4:                  row[56] || '',
        planned5:                row[62] || '',   // U
        actua5:                 row[63] || '',  
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



// router.post('/Post-labour-Paid', async (req, res) => {
//   const {
//     uid,
//     Status_5,
//     Company_Head_Paid_Amount_5,
//     PAYMENT_MODE_5,
//     BANK_DETAILS_5,
//     PAYMENT_DETAILS_5,
//     Payment_Date_5,  
//     Remark_5
//   } = req.body;

//   if (!uid) {
//     return res.status(400).json({
//       success: false,
//       message: 'UID is required'
//     });
//   }

//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: SiteExpeseSheetId,
//       range: 'Labour_FMS!A7:BT',   // extended to BR
//     });

//     const rows = response.data.values || [];
//     if (rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'No data found in Labour_FMS sheet'
//       });
//     }

//     const rowIndex = rows.findIndex(row =>
//       row[1] && String(row[1]).trim() === String(uid).trim()
//     );

//     if (rowIndex === -1) {
//       return res.status(404).json({
//         success: false,
//         message: `UID not found: ${uid}`
//       });
//     }

//     const sheetRowNumber = 7 + rowIndex;

//     console.log(`Found UID ${uid} at array index ${rowIndex} → sheet row ${sheetRowNumber}`);

//     const batchData = [];

//     // BK → BR updates (only non-empty values)
//     if (Status_5 !== undefined && String(Status_5).trim() !== '') {
//       batchData.push({ range: `Labour_FMS!BM${sheetRowNumber}`, values: [[Status_5]] });
//     }

   
//     if (Company_Head_Paid_Amount_5 !== undefined) {
//       batchData.push({ range: `Labour_FMS!BO${sheetRowNumber}`, values: [[Company_Head_Paid_Amount_5]] });
//     }

//     if (PAYMENT_MODE_5 !== undefined && String(PAYMENT_MODE_5).trim() !== '') {
//       batchData.push({ range: `Labour_FMS!BP${sheetRowNumber}`, values: [[PAYMENT_MODE_5]] });
//     }

//     if (BANK_DETAILS_5 !== undefined && String(BANK_DETAILS_5).trim() !== '') {
//       batchData.push({ range: `Labour_FMS!BQ${sheetRowNumber}`, values: [[BANK_DETAILS_5]] });
//     }

//     if (PAYMENT_DETAILS_5 !== undefined && String(PAYMENT_DETAILS_5).trim() !== '') {
//       batchData.push({ range: `Labour_FMS!BR${sheetRowNumber}`, values: [[PAYMENT_DETAILS_5]] });
//     }

//     if (Payment_Date_5 !== undefined && String(Payment_Date_5).trim() !== '') {
//       batchData.push({ range: `Labour_FMS!BS${sheetRowNumber}`, values: [[Payment_Date_5]] });
//     }

//     if (Remark_5 !== undefined && String(Remark_5).trim() !== '') {
//       batchData.push({ range: `Labour_FMS!BT${sheetRowNumber}`, values: [[Remark_5]] });
//     }

//     if (batchData.length === 0) {
//       return res.json({
//         success: true,
//         message: 'No valid / non-empty fields to update'
//       });
//     }

//     await sheets.spreadsheets.values.batchUpdate({
//       spreadsheetId: SiteExpeseSheetId,
//       resource: {
//         valueInputOption: 'USER_ENTERED',   // good for dates & numbers
//         data: batchData,
//       },
//     });

//     return res.json({
//       success: true,
//       message: 'Labour payment fields updated successfully (BK to BR)',
//       rowNumber: sheetRowNumber,
//       updatedColumns: batchData.map(d => d.range.match(/!([A-Z]+)$/)[1]),
//       updatedCount: batchData.length
//     });

//   } catch (error) {
//     console.error('Labour paid update error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Update failed',
//       error: error.message
//     });
//   }
// });


router.post('/Post-labour-Paid', async (req, res) => {
  const {
    uid,
    Status_5,
    PAYMENT_MODE_5,
    BANK_DETAILS_5,
    PAYMENT_DETAILS_5,
    Payment_Date_5,  
    Remark_5
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
      range: 'Labour_FMS!A7:BT',
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

    // BM - Status_5
    if (Status_5 !== undefined && String(Status_5).trim() !== '') {
      batchData.push({ range: `Labour_FMS!BM${sheetRowNumber}`, values: [[Status_5]] });
    }

    // BP - PAYMENT_MODE_5
    if (PAYMENT_MODE_5 !== undefined && String(PAYMENT_MODE_5).trim() !== '') {
      batchData.push({ range: `Labour_FMS!BP${sheetRowNumber}`, values: [[PAYMENT_MODE_5]] });
    }

    // BQ - BANK_DETAILS_5
    if (BANK_DETAILS_5 !== undefined && String(BANK_DETAILS_5).trim() !== '') {
      batchData.push({ range: `Labour_FMS!BQ${sheetRowNumber}`, values: [[BANK_DETAILS_5]] });
    }

    // BR - PAYMENT_DETAILS_5
    if (PAYMENT_DETAILS_5 !== undefined && String(PAYMENT_DETAILS_5).trim() !== '') {
      batchData.push({ range: `Labour_FMS!BR${sheetRowNumber}`, values: [[PAYMENT_DETAILS_5]] });
    }

    // BS - Payment_Date_5
    if (Payment_Date_5 !== undefined && String(Payment_Date_5).trim() !== '') {
      batchData.push({ range: `Labour_FMS!BS${sheetRowNumber}`, values: [[Payment_Date_5]] });
    }

    // BT - Remark_5
    if (Remark_5 !== undefined && String(Remark_5).trim() !== '') {
      batchData.push({ range: `Labour_FMS!BT${sheetRowNumber}`, values: [[Remark_5]] });
    }

    if (batchData.length === 0) {
      return res.json({
        success: true,
        message: 'No valid / non-empty fields to update'
      });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SiteExpeseSheetId,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: batchData,
      },
    });

    // ✅ FIXED: Safe column extraction with null check
    const updatedColumns = batchData.map(d => {
      const match = d.range.match(/!([A-Z]+)/);
      return match ? match[1] : 'Unknown';
    });

    return res.json({
      success: true,
      message: 'Labour payment fields updated successfully',
      rowNumber: sheetRowNumber,
      updatedColumns: updatedColumns,
      updatedCount: batchData.length
    });

  } catch (error) {
    console.error('Labour paid update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Update failed',
      error: error.message
    });
  }
});

module.exports = router;