const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');

const router = express.Router();

router.get('/get-Final-material-received', async (req, res) => {
  try {
    // Fetch data from the first sheet (Material_Received)
    const response1 = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Material_Received!A2:BW', // Adjust range as needed
    });

    let data1 = response1.data.values || [];

    // Fetch data from Purchase_FMS sheet
    const response3 = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!A8:Q', // Adjust range to include row 8 onwards and column Q
    });

    let data3 = response3.data.values || [];

    // Create a map for Purchase_FMS data using reqNo as the key
    const revisedQuantityMap = new Map();
    data3.forEach(row => {
      const reqNo = row[2] || ''; // Column C (3rd column, 0-based index) for reqNo
      const revisedQuantity = row[16] || ''; // Column Q (17th column, 0-based index) for REVISED QUANTITY 2
      if (reqNo) {
        revisedQuantityMap.set(reqNo, revisedQuantity);
      }
    });
   
    // Transform data from the first sheet and include both quantities
    const filteredData = data1.map(row => ({
      Timestamp: row[0] || '',
      uid: row[1] || '',
      reqNo: row[2] || '',
      siteName: row[3] || '',
      supervisorName: row[4] || '',
      vendorName: row[12] || '',
      materialType: row[5] || '',
      skuCode: row[6] || '',
      materialName: row[7] || '',
      unitName: row[8] || '',
      totalReceivedQuantity: row[9] || '', // Quantity received
      status: row[10] || '',
      Challan_url: row[11] || '',
      revisedQuantity: revisedQuantityMap.get(row[2] || '') || '' // Revised quantity based on reqNo
    }));

    res.json({
      success: true,
      data: filteredData
    });
  } catch (error) {
    console.error('Error fetching filtered data:', error);
    res.status(500).json({ error: 'Failed to fetch filtered data' });
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