const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');
const router = express.Router();

router.get('/get-Final-material-received', async (req, res) => {
  try {
    // Fetch data from the first sheet (Material_Received)
    const response1 = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Material_Received!A2:T', // Adjust range as needed
    });

    let data1 = response1.data.values || [];
    if (!data1.length) {
      console.log('No data found in Material_Received sheet for range: A2:BW');
      return res.status(404).json({ error: 'No data found in Material_Received sheet', details: 'Sheet or range is empty' });
    }

    // Fetch data from Purchase_FMS sheet, including PLANNED_9 and ACTUAL_9
    const response3 = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!A8:BV', // Extended range to include BP (PLANNED_9) and BQ (ACTUAL_9)
    });

    let data3 = response3.data.values || [];
    if (!data3.length) {
      console.log('No data found in Purchase_FMS sheet for range: A8:BQ');
      return res.status(404).json({ error: 'No data found in Purchase_FMS sheet', details: 'Sheet or range is empty' });
    }

    // Define headers for Purchase_FMS with their expected column positions (0-based index relative to A)
    const headers = [
      { key: 'Req_No', column: 2 }, // C
      { key: 'REVISED_QUANTITY_2', column: 16 }, // Q
      { key: 'PLANNED_9', column: 72 }, 
      { key: 'ACTUAL_9', column: 73 }, 
    ];

    // Create a map for Purchase_FMS data using reqNo as the key
    const purchaseDataMap = new Map();
    let validRowCount = 0;

    data3.forEach((row, index) => {
      const reqNo = row[2]?.trim() || ''; // Column C for Req_No
      const revisedQuantity = row[16]?.trim() || ''; // Column Q for REVISED_QUANTITY_2
      const planned9 = row[72]?.trim() || ''; // Column BP for PLANNED_9 (adjust if needed)
      const actual9 = row[73]?.trim() || ''; // Column BQ for ACTUAL_9 (adjust if needed)

      // Skip empty rows
      if (!row || row.every(cell => !cell || cell.trim() === '')) {
        console.log(`Skipping empty row ${index + 8} in Purchase_FMS`);
        return;
      }

      // Check if ACTUAL_9 is empty and PLANNED_9 is non-empty
      if (actual9 || !planned9) {
        console.log(
          `Skipping row ${index + 8} - Reason: ${actual9 ? `Non-empty ACTUAL_9="${actual9}"` : ''}${
            actual9 && !planned9 ? ' and ' : ''
          }${!planned9 ? `Empty PLANNED_9="${planned9}"` : ''}`
        );
        return;
      }

      if (reqNo) {
        validRowCount++;
        purchaseDataMap.set(reqNo, { revisedQuantity, planned9, actual9 });
      }
    });

    console.log(`Rows with ACTUAL_9 empty and PLANNED_9 non-empty: ${validRowCount}`);

    if (!purchaseDataMap.size) {
      console.log('No valid data found in Purchase_FMS after filtering');
      return res.status(404).json({
        error: 'No valid data found in Purchase_FMS after filtering',
        details: 'No rows have ACTUAL_9 empty and PLANNED_9 non-empty in columns BQ and BP'
      });
    }

    // Transform and filter data from Material_Received sheet
    const filteredData = data1
      .map((row, index) => {
        const reqNo = row[2]?.trim() || '';
        const purchaseData = purchaseDataMap.get(reqNo);

        // Only include rows where reqNo matches a valid Purchase_FMS row
        if (!purchaseData) {
          console.log(`Skipping row ${index + 2} in Material_Received - No matching reqNo=${reqNo} in Purchase_FMS`);
          return null;
        }

        return {
          Timestamp: row[0]?.trim() || '',
          uid: row[1]?.trim() || '',
          reqNo: reqNo,
          siteName: row[3]?.trim() || '',
          supervisorName: row[4]?.trim() || '',
          vendorName: row[12]?.trim() || '',
          materialType: row[5]?.trim() || '',
          skuCode: row[6]?.trim() || '',
          materialName: row[7]?.trim() || '',
          unitName: row[8]?.trim() || '',
          totalReceivedQuantity: row[9]?.trim() || '',
          status: row[10]?.trim() || '',
          Challan_url: row[11]?.trim() || '',
          revisedQuantity: purchaseData.revisedQuantity || '',
          planned9: purchaseData.planned9 || '',
          actual9: purchaseData.actual9 || ''
        };
      })
      .filter(row => row !== null);

    if (!filteredData.length) {
      console.log('No valid data found after matching Material_Received with Purchase_FMS');
      return res.status(404).json({
        error: 'No valid data found after matching',
        details: 'No rows in Material_Received match filtered Purchase_FMS rows'
      });
    }

    // Sort object keys for consistent output
    const sortedFilteredData = filteredData.map(obj => {
      const sortedObj = {};
      Object.keys(obj).sort().forEach(key => {
        sortedObj[key] = obj[key];
      });
      return sortedObj;
    });

    res.json({
      success: true,
      data: sortedFilteredData
    });
  } catch (error) {
    console.error('Error fetching filtered data:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch filtered data', details: error.message });
  }
});

router.post('/save-final-receipt', async (req, res) => {
  try {
    const { uid, totalReceivedQuantity, status, challan_urls } = req.body;

    if (!uid || !totalReceivedQuantity || !status || !challan_urls) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const spreadsheetId = process.env.SPREADSHEET_ID;
    const uidRange = 'Purchase_FMS!B8:B'; // Adjust if UID is in a different column
    const dataRange = 'Purchase_FMS!BW:BZ'; // STATUS 9, FINAL RECEIVED QUANTITY 9, CHALLAN PHOTO 9

    // Fetch existing UIDs
    const uidResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: uidRange,
    });

    const uids = uidResponse.data.values || [];
    console.log('UIDs from sheet:', uids);

    const rowIndex = uids.findIndex(row => row[0] === uid);
    console.log('Row index found:', rowIndex);

    if (rowIndex === -1) {
      return res.status(404).json({ success: false, message: 'UID not found in the sheet' });
    }

    // Ensure challan_urls is treated as an array and store URLs directly
    const challanUrls = Array.isArray(challan_urls) ? challan_urls : [challan_urls];
    const values = [[status, totalReceivedQuantity, '', challanUrls[0]]]; // Store first URL (or modify for multiple URLs)

    const updateRange = `Purchase_FMS!BW${rowIndex + 8}:BZ${rowIndex + 8}`; // +8 for header and 0-based index
    console.log('Update range:', updateRange);
    console.log('Values to update:', values);

    const updateResponse = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    console.log('Update response:', updateResponse.data);

    if (updateResponse.status === 200) {
      res.status(200).json({ success: true, message: 'Data saved successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to update sheet' });
    }
  } catch (error) {
    console.error('Error saving to Google Sheet:', error);
    res.status(500).json({ success: false, message: 'Error saving data' });
  }
});



module.exports =  router