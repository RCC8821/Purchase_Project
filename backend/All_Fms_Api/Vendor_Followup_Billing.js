const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');
const router = express.Router();


router.get('/vendor-FollowUp-Billing', async (req, res) => {
  try {
    // Fetch data from Purchase_FMS sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:CE', // Range from A8 to CE
    });

    let data = response.data.values || [];

    // Filter and transform data based on PLANNED 12 and ACTUAL 12
    const filteredData = data
      .filter(row => {
        const planned12 = row[27] || ''; // Column CF (84th column, 0-based index) for PLANNED 12
        const actual12 = row[28] || ''; // Column CG (85th column, 0-based index) for ACTUAL 12
        return planned12 && !actual12; // Include row if PLANNED 12 has data and ACTUAL 12 is empty
      })
      .map(row => ({
        UID: row[1] || '', // Column B
        siteName: row[3] || '', // Column D
        supervisorName: row[4] || '', // Column E
        materialName: row[7] || '', // Column H
        revisedQuantity: row[25] || '', // Column Q for REVISED QTY
        finalReceivedQuantity: row[26] || '', // Column J for FINAL RECEIVED QTY
        unitName: row[9] || '', // Column I
        vendorFirmName: row[23] || '', // Column M for Vendor Firm Name
        poNumber: row[16] || '', // Column Q for PO Number
        planned12: row[27] || '', // Column CF for PLANNED 12
        status12: row[29] || '', // Column CH for STATUS 12 (assumed next to ACTUAL 12)
        followUpCount12: row[30] || '', // Column CI for FOLLOW-UP COUNT 12 (assumed next to STATUS 12)
        remark12: row[32] || '', // Column CJ for REMARK 12 (assumed next to FOLLOW-UP COUNT 12)
        vendorContact: row[24] || '', // Column N (assumed next to Vendor Firm Name)
      }));

    res.json({
      success: true,
      data: filteredData
    });
  } catch (error) {
    console.error('Error fetching Vendor-FollowUp-Billing data:', error);
    res.status(500).json({ error: 'Failed to fetch Vendor-FollowUp-Billing data' });
  }
});



// POST endpoint to update follow-up details
router.post('/update-followup-Billing', async (req, res) => {
  try {
    console.log('Raw request body:', req.body); // Log raw body to debug

    const { data } = req.body;
    
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: 'Invalid data: Expected non-empty array' });
    }

    // Validate each item in the array
    const invalidItems = data.filter(item => 
      !item.UID || !item.UID.trim() || 
      !item.status12 || !item.status12.trim() || 
      !item.remark12 || !item.remark12.trim()
    );

    if (invalidItems.length > 0) {
      console.warn('Invalid items found:', invalidItems);
      return res.status(400).json({ error: 'Invalid data: Expected array of objects with UID, status12, and remark12 as non-empty strings' });
    }

    console.log('Validated data:', data);

    // Initialize Sheets API
    // const sheets = await initializeSheets(); // Ensure this function is in scope
    // const spreadsheetId = 'your-spreadsheet-id'; // Replace with your actual Google Sheet ID

    // console.log('Fetching sheet data with spreadsheetId:', spreadsheetId);

    // Fetch current sheet data to find rows by UID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:CK', // Wide range to cover up to CK (index 32+)
    });

    let values = response.data.values || [];
    if (values.length === 0) {
      return res.status(400).json({ error: 'No data found in sheet' });
    }

    console.log('Found', values.length, 'rows in sheet');

    // Prepare updates: Find rows by UID (column B, index 1) and build update values
    const updates = [];
    let updatedCount = 0;

    for (const item of data) {
      const uid = item.UID;
      const status12 = item.status12;
      const remark12 = item.remark12;

      if (!uid) {
        console.warn('Skipping item due to missing UID');
        continue;
      }

      // Find the row index (0-based in values array)
      const rowIndex = values.findIndex(row => row[1] === uid); // row[1] = Column B (UID)
      
      if (rowIndex === -1) {
        console.warn(`UID ${uid} not found in sheet`);
        continue;
      }

      const row = values[rowIndex];
      const fullRowNumber = 8 + rowIndex; // Sheet row number (A8 is row 8)

      // Current Follow-up Count (AE, index 30)
      let currentFollowUpCount = parseInt(row[30] || '0', 10);
      const newFollowUpCount = currentFollowUpCount + 1;

      console.log(`Updating row ${fullRowNumber} for UID ${uid}: Status=${status12}, Follow-up Count=${newFollowUpCount}, Remark=${remark12}`);

      // Prepare the full row update (only update columns AD, AE, AG; keep others same)
      const updatedRow = [...row]; // Copy existing row
      updatedRow[29] = status12; // AD: Status 12
      updatedRow[30] = newFollowUpCount; // AE: Follow-up Count 12
      updatedRow[32] = remark12; // AG: Remark 12

      // Add to batch update
      updates.push({
        range: `Billing_FMS!A${fullRowNumber}:CK${fullRowNumber}`,
        values: [updatedRow],
      });

      updatedCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid rows to update' });
    }

    console.log('Preparing to update', updates.length, 'rows');

    // Batch update all rows
    const updateResponse = await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW', // Use 'USER_ENTERED' if you need formatting
        data: updates,
      },
    });

    console.log('Batch update response:', updateResponse.data);

    res.json({
      success: true,
      message: `Updated ${updatedCount} rows successfully`,
      updatedRows: updateResponse.data.totalUpdatedRows || updatedCount,
    });

  } catch (error) {
    console.error('Error updating follow-up details:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to update follow-up details: ' + error.message });
  }
});


module.exports=router