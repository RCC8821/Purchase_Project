
const express = require('express');
const { sheets, drive, spreadsheetId } = require('../config/googleSheet');
const { Readable } = require('stream');
const router = express.Router();

router.get('/dropdowns', async (req, res) => {
  try {
    const ranges = [
      'Sheet1!A2:A', // Site Names
      'Sheet1!B2:B', // Supervisor Names
    ];

    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
    });

    const [siteNames, supervisorNames] = response.data.valueRanges.map(
      (range) => range.values?.flat() || []
    );

    res.json({
      siteNames: siteNames || [],
      supervisorNames: supervisorNames || [],
    });
  } catch (error) {
    console.error('Error fetching Google Sheet data:', error);
    res.status(500).json({ error: 'Failed to fetch dropdown data' });
  }
});





router.post('/save-material-receipt', async (req, res) => {
  try {
    console.log('Received request body:', req.body);

    if (!req.body) {
      console.log('Request body is undefined or empty');
      return res.status(400).json({ error: 'Request body is missing or invalid' });
    }

    const {
      uid,
      reqNo,
      siteName,
      supervisorName,
      materialType,
      skuCode,
      materialName,
      unitName,
      receivedQty,
      status,
      challanNo,
      qualityApproved,
      truckDelivery,
      googleFormCompleted,
      photo,
      vendorName,
    } = req.body;

    if (!uid || !reqNo || !siteName || !materialType || !skuCode || !materialName || !unitName || !receivedQty || !status) {
      console.log('Missing required fields:', req.body);
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const receivedQtyNum = parseFloat(receivedQty);
    if (isNaN(receivedQtyNum)) {
      console.log(`Invalid receivedQty: ${receivedQty}`);
      return res.status(400).json({ error: 'Invalid receivedQty value' });
    }

    let challanUrl = '';

    if (photo) {
      if (!photo.startsWith('data:image/')) {
        console.log('Invalid base64 image format');
        return res.status(400).json({ error: 'Invalid base64 image format' });
      }

      const base64Data = photo.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const bufferStream = new Readable();
      bufferStream.push(buffer);
      bufferStream.push(null);

      const folderId = '1vma3YPHosdy4SGCI5_sORVCElk85Wflz';
      console.log('Attempting to upload to folder ID:', folderId);

      const fileMetadata = {
        name: `challan_${uid}_${Date.now()}.jpg`,
        parents: [folderId],
      };

      const media = {
        mimeType: 'image/jpeg',
        body: bufferStream,
      };

      try {
        const file = await drive.files.create({
          resource: fileMetadata,
          media: media,
          fields: 'id, webViewLink',
          supportsAllDrives: true,
        });
        console.log('File created successfully, ID:', file.data.id);

        await drive.permissions.create({
          fileId: file.data.id,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
          supportsAllDrives: true,
        });

        challanUrl = file.data.webViewLink;
        console.log(`Uploaded file to Drive: ${challanUrl}`);
      } catch (uploadError) {
        console.error('Upload error details:', uploadError.message, uploadError.stack);
        return res.status(500).json({ error: 'Failed to upload file', details: uploadError.message });
      }
    }

    console.log('Appending to Material_Received sheet...');
    const sheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Material_Received!A2:AM1000',
    });

    const rows = sheetResponse.data.values || [];
    const now = new Date();
    const timestamp = now.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).replace(/, /g, ' ');

    const values = [
      timestamp,
      uid,
      reqNo,
      siteName,
      supervisorName || '',
      materialType,
      skuCode,
      materialName,
      unitName,
      receivedQtyNum,
      status,
      challanUrl || '',
      vendorName || '',
      truckDelivery || '',
      googleFormCompleted || '',
      challanNo || '',
      qualityApproved || '',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Material_Received!A2:Q',
      valueInputOption: 'RAW',
      resource: { values: [values] },
    });
    console.log(`Appended new row to Material_Received sheet`);

    return res.json({ success: true, message: 'Receipt saved successfully', challanUrl });
  } catch (error) {
    console.error('Error saving material receipt:', error.message, error.stack);
    return res.status(500).json({ error: 'Failed to save receipt', details: error.message });
  }
});


router.get('/get-material-received-filter-data', async (req, res) => {
  try {
    const { siteName, supervisorName } = req.query;
    console.log('Query parameters:', { siteName, supervisorName });

    // Fetch all data from the Purchase_FMS sheet
    const purchaseResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!B8:BW', // Ensure this range includes column AN (Vendor Firm Name 5)
    });

    let data = purchaseResponse.data.values || [];
    console.log(`Fetched ${data.length} rows from Purchase_FMS`);

    // Log the Vendor Firm Name 5 (column AN, index 38) for debugging
    data.forEach((row, index) => {
      console.log(`Row ${index + 8}: Vendor Firm Name 5 (AN) = ${row[38] || 'Empty'}`);
    });

    // Filter data based on parameters, PLANNED 9 (BU, index 74) has data, and ACTUAL 9 (BV, index 75) is empty
    if (siteName || supervisorName) {
      data = data.filter(row => {
        const matchesSite = siteName ? row[2] === siteName : true; // Site Name is in column C
        const matchesSupervisor = supervisorName ? row[3] === supervisorName : true; // Supervisor Name is in column D
        const hasPlanned9 = row[71] && row[71].trim() !== ''; // PLANNED 9 (BU) has data
        const noActual9 = !row[72] || row[72].trim() === ''; // ACTUAL 9 (BV) is empty
        return matchesSite && matchesSupervisor && hasPlanned9 && noActual9;
      });
    } else {
      data = data.filter(row => {
        const hasPlanned9 = row[71] && row[71].trim() !== ''; // PLANNED 9 (BU) has data
        const noActual9 = !row[72] || row[72].trim() === ''; // ACTUAL 9 (BV) is empty
        return hasPlanned9 && noActual9;
      });
    }
    console.log(`Filtered to ${data.length} rows from Purchase_FMS`);

    // Fetch data from Material_Received sheet to get Received_qty
    const materialReceivedResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Material_Received!A2:J',
    });

    const materialReceivedData = materialReceivedResponse.data.values || [];
    console.log(`Fetched ${materialReceivedData.length} rows from Material_Received`);

    // Create a map of UID to sum of Received_qty from Material_Received
    const receivedQtyMap = new Map();
    materialReceivedData.forEach((row, index) => {
      const uid = row[1]; // UID is in column B (index 1)
      const receivedQty = parseFloat(row[9]) || 0; // Received_qty is in column J (index 9)
      if (uid) {
        console.log(`Row ${index + 2}: UID=${uid}, Received_qty=${receivedQty}`);
        if (receivedQtyMap.has(uid)) {
          receivedQtyMap.set(uid, receivedQtyMap.get(uid) + receivedQty);
        } else {
          receivedQtyMap.set(uid, receivedQty);
        }
      }
    });
    console.log('Received_qty map:', Object.fromEntries(receivedQtyMap));

    // Transform data into structured format with specified headers
    const filteredData = data.map(row => {
      const uid = row[0] || '';
      console.log(`Processing UID ${uid}: totalReceivedQuantity=${row[15]}, receivedQty=${receivedQtyMap.get(uid) || 0}, vendorName=${row[38] || 'Empty'}`);
      return {
        uid,
        reqNo: row[1] || '',
        siteName: row[2] || '',
        supervisorName: row[3] || '',
        vendorName: row[38] || '', // Corrected to column AN (index 38)
        materialType: row[4] || '',
        skuCode: row[5] || '',
        materialName: row[6] || '',
        unitName: row[8] || '',
        totalReceivedQuantity: row[15] || '',
        receivedQty: receivedQtyMap.get(uid) || 0
      };
    });

    return res.json({
      success: true,
      data: filteredData
    });
  } catch (error) {
    console.error('Error fetching filtered data:', error.message, error.stack);
    return res.status(500).json({ error: 'Failed to fetch filtered data', details: error.message });
  }
});

module.exports = router;