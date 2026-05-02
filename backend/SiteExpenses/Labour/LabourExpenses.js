const express = require('express');
const { sheets, SiteExpeseSheetId } = require('../../config/googleSheet');

const router = express.Router();



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
      Contractor_Commission,
      Total_Paid_Amount_3,
      Company_Head_Amount_3,
      Contractor_Head_Amount_3,
      Remark_3
    } = req.body;

    // ✅ DEBUG LOG - Check what values are coming
    console.log('=== INCOMING PAYLOAD ===');
    console.log('Contractor_Commission:', Contractor_Commission);
    console.log('Total_Paid_Amount_3:', Total_Paid_Amount_3);
    console.log('========================');

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'UID is required'
      });
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Labour_FMS!A7:AT',
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
    const batchData = [];

    const addIfValid = (colLetter, value) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        batchData.push({
          range: `Labour_FMS!${colLetter}${sheetRowNumber}`,
          values: [[value]]
        });
      }
    };

    // AE - Status_3
    if (Status_3 !== undefined && String(Status_3).trim() !== '') {
      addIfValid('AE', Status_3);
    }

    // AG - Labouar_Contractor_Name_3
    if (Labouar_Contractor_Name_3 !== undefined && String(Labouar_Contractor_Name_3).trim() !== '') {
      addIfValid('AG', Labouar_Contractor_Name_3);
    }

    // AH - Labour_Category_1_3
    if (Labour_Category_1_3 !== undefined && String(Labour_Category_1_3).trim() !== '') {
      addIfValid('AH', Labour_Category_1_3);
    }

    // AI - Number_Of_Labour_1_3
    if (Number_Of_Labour_1_3 !== undefined && String(Number_Of_Labour_1_3).trim() !== '') {
      addIfValid('AI', Number_Of_Labour_1_3);
    }

    // AJ - Labour_Rate_1_3
    if (Labour_Rate_1_3 !== undefined && String(Labour_Rate_1_3).trim() !== '') {
      addIfValid('AJ', Labour_Rate_1_3);
    }

    // AK - Labour_Category_2_3
    if (Labour_Category_2_3 !== undefined && String(Labour_Category_2_3).trim() !== '') {
      addIfValid('AK', Labour_Category_2_3);
    }

    // AL - Number_Of_Labour_2_3
    if (Number_Of_Labour_2_3 !== undefined && String(Number_Of_Labour_2_3).trim() !== '') {
      addIfValid('AL', Number_Of_Labour_2_3);
    }

    // AM - Labour_Rate_2_3
    if (Labour_Rate_2_3 !== undefined && String(Labour_Rate_2_3).trim() !== '') {
      addIfValid('AM', Labour_Rate_2_3);
    }

    // AN - Total_Wages_3
    if (Total_Wages_3 !== undefined && String(Total_Wages_3).trim() !== '') {
      addIfValid('AN', Total_Wages_3);
    }

    // AO - Conveyanance_3
    if (Conveyanance_3 !== undefined && String(Conveyanance_3).trim() !== '') {
      addIfValid('AO', Conveyanance_3);
    }

    // ✅ AP - Contractor_Commission (SIRF Commission ki value - DIRECT PUSH)
    if (Contractor_Commission !== undefined && Contractor_Commission !== null && String(Contractor_Commission).trim() !== '') {
      console.log('✅ Writing to AP (Commission):', Contractor_Commission);
      batchData.push({
        range: `Labour_FMS!AP${sheetRowNumber}`,
        values: [[String(Contractor_Commission).trim()]]
      });
    }

    // ✅ AQ - Total_Paid_Amount_3 (DIRECT PUSH)
    if (Total_Paid_Amount_3 !== undefined && Total_Paid_Amount_3 !== null && String(Total_Paid_Amount_3).trim() !== '') {
      console.log('✅ Writing to AQ (Total Paid):', Total_Paid_Amount_3);
      batchData.push({
        range: `Labour_FMS!AQ${sheetRowNumber}`,
        values: [[String(Total_Paid_Amount_3).trim()]]
      });
    }

    // ✅ AR - Company_Head_Amount_3 (DIRECT PUSH)
    if (Company_Head_Amount_3 !== undefined && Company_Head_Amount_3 !== null && String(Company_Head_Amount_3).trim() !== '') {
      console.log('✅ Writing to AR (Company Head):', Company_Head_Amount_3);
      batchData.push({
        range: `Labour_FMS!AR${sheetRowNumber}`,
        values: [[String(Company_Head_Amount_3).trim()]]
      });
    }

    // ✅ AS - Contractor_Head_Amount_3 (DIRECT PUSH)
    if (Contractor_Head_Amount_3 !== undefined && Contractor_Head_Amount_3 !== null && String(Contractor_Head_Amount_3).trim() !== '') {
      console.log('✅ Writing to AS (Contractor Head):', Contractor_Head_Amount_3);
      batchData.push({
        range: `Labour_FMS!AS${sheetRowNumber}`,
        values: [[String(Contractor_Head_Amount_3).trim()]]
      });
    }

    // ✅ AT - Remark_3 (DIRECT PUSH)
    if (Remark_3 !== undefined && Remark_3 !== null && String(Remark_3).trim() !== '') {
      console.log('✅ Writing to AT (Remark):', Remark_3);
      batchData.push({
        range: `Labour_FMS!AT${sheetRowNumber}`,
        values: [[String(Remark_3).trim()]]
      });
    }

    if (batchData.length === 0) {
      return res.json({
        success: true,
        message: 'No valid/non-empty fields to update',
        rowNumber: sheetRowNumber,
        updatedColumns: [],
        updatedCount: 0
      });
    }

    // ✅ LOG all batch data before writing
    console.log('=== BATCH DATA TO WRITE ===');
    batchData.forEach(item => {
      console.log(`${item.range} → ${item.values[0][0]}`);
    });
    console.log('===========================');

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SiteExpeseSheetId,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: batchData,
      },
    });

    const updatedColumns = batchData.map(update => {
      try {
        const rangeParts = update.range.split('!');
        if (rangeParts.length < 2) return 'unknown';
        const colRowPart = rangeParts[1];
        const colMatch = colRowPart.match(/^[A-Z]+/);
        return colMatch ? colMatch[0] : 'unknown';
      } catch (e) {
        console.error('Column extraction error:', e, update.range);
        return 'error';
      }
    });

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

        const planned4 = (row[49] || '').toString().trim(); // Planned_2 → Q
        const actual4  = (row[50] || '').toString().trim(); // Actual_2  → R

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

        planned4:                row[49] || '',   // U
        actual4:                 row[50] || '',  
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






///////// Paid Amount step 6



router.get('/get-paid-step', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Labour_FMS!A7:BM',   // starts from row 7 (data)
    });

    const rows = response.data.values || [];


    const dataRows = rows;   
    const pendingLabour = dataRows
      .filter(row => {
        if (row.length < 18) return false; // need up to R (index 17)

        const planned3 = (row[63] || '').toString().trim(); // Planned_2 → Q
        const actual3  = (row[64] || '').toString().trim(); // Actual_2  → R

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
        Total_Paid_Amount_3:         row[42] || '',
        
  
        Deployed_Category_1_Labour_No_4:	row[51] || '',
        Deployed_Category_2_Labour_No_4:	row[52] || '',
        Revised_Company_Head_Amount_4:   row[55] || '',
        Revised_Contractor_Head_Amount_4:  row[56] || '',


        Paid_Name: row[60] || '',
        Bill_No: row[61] || '',
        Bill_Url: row[62] || '',


        remark4:                  row[56] || '',
        planned5:                row[63] || '',   // U
        actua5:                 row[64] || '',  
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
//       range: 'Labour_FMS!A7:BT',
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

//     // BM - Status_5
//     if (Status_5 !== undefined && String(Status_5).trim() !== '') {
//       batchData.push({ range: `Labour_FMS!BM${sheetRowNumber}`, values: [[Status_5]] });
//     }

//     // BP - PAYMENT_MODE_5
//     if (PAYMENT_MODE_5 !== undefined && String(PAYMENT_MODE_5).trim() !== '') {
//       batchData.push({ range: `Labour_FMS!BP${sheetRowNumber}`, values: [[PAYMENT_MODE_5]] });
//     }

//     // BQ - BANK_DETAILS_5
//     if (BANK_DETAILS_5 !== undefined && String(BANK_DETAILS_5).trim() !== '') {
//       batchData.push({ range: `Labour_FMS!BQ${sheetRowNumber}`, values: [[BANK_DETAILS_5]] });
//     }

//     // BR - PAYMENT_DETAILS_5
//     if (PAYMENT_DETAILS_5 !== undefined && String(PAYMENT_DETAILS_5).trim() !== '') {
//       batchData.push({ range: `Labour_FMS!BR${sheetRowNumber}`, values: [[PAYMENT_DETAILS_5]] });
//     }

//     // BS - Payment_Date_5
//     if (Payment_Date_5 !== undefined && String(Payment_Date_5).trim() !== '') {
//       batchData.push({ range: `Labour_FMS!BS${sheetRowNumber}`, values: [[Payment_Date_5]] });
//     }

//     // BT - Remark_5
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
//         valueInputOption: 'USER_ENTERED',
//         data: batchData,
//       },
//     });

//     // ✅ FIXED: Safe column extraction with null check
//     const updatedColumns = batchData.map(d => {
//       const match = d.range.match(/!([A-Z]+)/);
//       return match ? match[1] : 'Unknown';
//     });

//     return res.json({
//       success: true,
//       message: 'Labour payment fields updated successfully',
//       rowNumber: sheetRowNumber,
//       updatedColumns: updatedColumns,
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

    // ==================== STATUS SKIPPED ====================
    // Status_5 ko completely skip kar diya hai jaise aapne kaha
    // Koi value nahi jaayegi (na Done, na Reject)
    // =======================================================

    // Payment Mode
    if (PAYMENT_MODE_5 !== undefined && PAYMENT_MODE_5 !== null && PAYMENT_MODE_5 !== '') {
      batchData.push({ range: `Labour_FMS!BP${sheetRowNumber}`, values: [[PAYMENT_MODE_5]] });
    }

    // Bank Details
    if (BANK_DETAILS_5 !== undefined && BANK_DETAILS_5 !== null && BANK_DETAILS_5 !== '') {
      batchData.push({ range: `Labour_FMS!BQ${sheetRowNumber}`, values: [[BANK_DETAILS_5]] });
    }

    // Payment Details
    if (PAYMENT_DETAILS_5 !== undefined && PAYMENT_DETAILS_5 !== null && PAYMENT_DETAILS_5 !== '') {
      batchData.push({ range: `Labour_FMS!BR${sheetRowNumber}`, values: [[PAYMENT_DETAILS_5]] });
    }

    // Payment Date
    if (Payment_Date_5 !== undefined && Payment_Date_5 !== null && Payment_Date_5 !== '') {
      batchData.push({ range: `Labour_FMS!BS${sheetRowNumber}`, values: [[Payment_Date_5]] });
    }

    // Remark (Reject ya Done dono case mein ja sakta hai)
    if (Remark_5 !== undefined && Remark_5 !== null && Remark_5 !== '') {
      batchData.push({ range: `Labour_FMS!BT${sheetRowNumber}`, values: [[Remark_5]] });
    }

    if (batchData.length === 0) {
      return res.json({
        success: true,
        message: 'No fields to update'
      });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SiteExpeseSheetId,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: batchData,
      },
    });

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