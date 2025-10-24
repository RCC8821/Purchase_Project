
const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');
const router = express.Router();

router.get('/get-Final-material-received', async (req, res) => {
  try {
    // Define range for Purchase_FMS sheet
    const range = 'Purchase_FMS!A8:CJ';
    console.log(`Fetching data from sheet: ${process.env.SPREADSHEET_ID || spreadsheetId}, range: ${range}`);

    // Fetch data from Purchase_FMS sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID || spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    console.log(`Raw rows fetched from Purchase_FMS (length: ${rows.length})`);

    if (!rows.length) {
      console.log('No data found in Purchase_FMS sheet for range:', range);
      return res.status(404).json({ error: 'No data found in Purchase_FMS sheet', details: 'Sheet or range is empty' });
    }

    // Filter rows from Purchase_FMS where PLANNED_9 is non-empty and ACTUAL_9 is empty
    const filteredPurchaseData = rows
      .slice(1) // Skip header row
      .filter(row => {
        const planned9 = row[72]?.trim() || ''; // PLANNED_9 at column BU (index 73)
        const actual9 = row[73]?.trim() || '';  // ACTUAL_9 at column BV (index 74)
        console.log(`Row ${rows.indexOf(row) + 8} - PLANNED_9: "${planned9}", ACTUAL_9: "${actual9}"`);
        return planned9 && !actual9;
      })
      .map(row => ({
        UID: row[1]?.trim() || '', // B
        reqNo: row[2]?.trim() || '', // C
        siteName: row[3]?.trim() || '', // D
        supervisorName: row[4]?.trim() || '', // E
        materialType: row[5]?.trim() || '', // F
        skuCode: row[6]?.trim() || '', // G
        materialName: row[7]?.trim() || '', // H
        revisedQuantity: row[16]?.trim() || '', // Q
        unitName: row[9]?.trim() || '', // J
        purpose: row[10]?.trim() || '', // K
        pdfUrl3: row[25]?.trim() || '', // Z
        pdfUrl5: row[55]?.trim() || '', // BD
        pdfUrl7: row[61]?.trim() || '', // BJ
        finalReceivedQuantity9: row[75]?.trim() || '', // BW
        vendorFirmName5: row[39]?.trim() || '', // AN
        indentNumber3: row[24]?.trim() || '', // Y
        poNumber7: row[60]?.trim() || '', // BI
        deliveryDate: row[62]?.trim() || '', // BK
        planned9: row[72]?.trim() || '', // BU
        actual9: row[73]?.trim() || '' // BV
      }));

    if (!filteredPurchaseData.length) {
      console.log('No valid data found in Purchase_FMS after filtering');
      return res.status(404).json({
        error: 'No valid data found in Purchase_FMS after filtering',
        details: 'No rows have PLANNED_9 non-empty and ACTUAL_9 empty in columns BU and BV'
      });
    }

    // Create a map for quick lookup by UID
    const purchaseDataMap = new Map();
    filteredPurchaseData.forEach(row => {
      const uid = row.UID;
      if (uid) {
        purchaseDataMap.set(uid, row);
      }
    });
    console.log(`Rows with PLANNED_9 non-empty and ACTUAL_9 empty: ${filteredPurchaseData.length}`);

    // Fetch data from Material_Received sheet
    const materialResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Material_Received!A2:T',
    });

    let materialData = materialResponse.data.values || [];
    if (!materialData.length) {
      console.log('No data found in Material_Received sheet for range: A2:T');
      return res.status(404).json({ error: 'No data found in Material_Received sheet', details: 'Sheet or range is empty' });
    }

    // Transform and filter data from Material_Received sheet
    const filteredData = materialData
      .map((row, index) => {
        const uid = row[1]?.trim() || '';
        const purchaseData = purchaseDataMap.get(uid);

        // Only include rows where uid matches a valid Purchase_FMS row
        if (!purchaseData) {
          console.log(`Skipping row ${index + 2} in Material_Received - No matching uid=${uid} in Purchase_FMS`);
          return null;
        }

        return {
          Timestamp: row[0]?.trim() || '',
          uid: uid,
          reqNo: row[2]?.trim() || '',
          siteName: row[3]?.trim() || '',
          supervisorName: row[4]?.trim() || '',
          vendorName: row[39]?.trim() || purchaseData.vendorFirmName5 || '',
          materialType: row[5]?.trim() || '',
          skuCode: row[6]?.trim() || '',
          materialName: row[7]?.trim() || '',
          unitName: row[8]?.trim() || '',
          totalReceivedQuantity: row[9]?.trim() || '',
          status: row[10]?.trim() || '',
          Challan_url: row[11]?.trim() || '',
          revisedQuantity: purchaseData.revisedQuantity || '',
          planned9: purchaseData.planned9 || '',
          actual9: purchaseData.actual9 || '',
          purpose: purchaseData.purpose || '',
          pdfUrl3: purchaseData.pdfUrl3 || '',
          pdfUrl5: purchaseData.pdfUrl5 || '',
          pdfUrl7: purchaseData.pdfUrl7 || '',
          finalReceivedQuantity9: purchaseData.finalReceivedQuantity9 || '',
          indentNumber3: purchaseData.indentNumber3 || '',
          poNumber7: purchaseData.poNumber7 || '',
          deliveryDate: purchaseData.deliveryDate || ''
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
    const uidRange = 'Purchase_FMS!B8:B';
    const dataRange = 'Purchase_FMS!BW8:BZ';

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
    const values = [[status, totalReceivedQuantity, '', challanUrls[0]]];

    const updateRange = `Purchase_FMS!BW${rowIndex + 8}:BZ${rowIndex + 8}`;
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

module.exports = router;