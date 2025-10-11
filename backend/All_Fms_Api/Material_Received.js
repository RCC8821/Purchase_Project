
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

// Updated endpoint for filtered data with specified headers
// router.get('/get-material-received-filter-data', async (req, res) => {
//   try {
//     const { siteName, supervisorName } = req.query;

//     // Fetch all data from the sheet (adjust range to include all relevant columns)
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Purchase_FMS!B8:BW', // Adjusted to include 10 columns (A to J)
//     });

//     let data = response.data.values || [];

//     // Filter data based on parameters and exclude rows where STATUS is 'Done'
//     if (siteName || supervisorName) {
//       data = data.filter(row => {
//         const matchesSite = siteName ? row[2] === siteName : true; // Site Name is in column C
//         const matchesSupervisor = supervisorName ? row[3] === supervisorName : true; // Supervisor Name is in column D
//         const isNotDone = row[67] !== 'Dispatched'; // STATUS is in column 9 (index 8)
//         return matchesSite && matchesSupervisor && isNotDone;
//       });
//     } else {
//       // If no query parameters, only filter out rows where STATUS is 'Done'
//       data = data.filter(row => row[67] !== 'Dispatched');
//     }

//     // Transform data into structured format with specified headers
//     const filteredData = data.map(row => ({
//       uid: row[0] || '',
//       reqNo: row[1] || '',
//       siteName: row[2] || '',
//       supervisorName: row[3] || '',
//       vendorName: row[37] || '',
//       materialType: row[4] || '',
//       skuCode: row[5] || '',
//       materialName: row[6] || '',
//       unitName: row[8] || '',
//       totalReceivedQuantity: row[15] || ''
//     }));

//     res.json({
//       success: true,
//       data: filteredData
//     });
//   } catch (error) {
//     console.error('Error fetching filtered data:', error);
//     res.status(500).json({ error: 'Failed to fetch filtered data' });
//   }
// });



router.get('/get-material-received-filter-data', async (req, res) => {
  try {
    const { siteName, supervisorName } = req.query;

    // Fetch all data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!B8:BW', // Adjusted to include all relevant columns
    });

    let data = response.data.values || [];

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
      // If no query parameters, only filter based on PLANNED 9 and ACTUAL 9
      data = data.filter(row => {
        const hasPlanned9 = row[71] && row[71].trim() !== ''; // PLANNED 9 (BU) has data
        const noActual9 = !row[72] || row[72].trim() === ''; // ACTUAL 9 (BV) is empty
        return hasPlanned9 && noActual9;
      });
    }

    // Transform data into structured format with specified headers
    const filteredData = data.map(row => ({
      uid: row[0] || '',
      reqNo: row[1] || '',
      siteName: row[2] || '',
      supervisorName: row[3] || '',
      vendorName: row[37] || '',
      materialType: row[4] || '',
      skuCode: row[5] || '',
      materialName: row[6] || '',
      unitName: row[8] || '',
      totalReceivedQuantity: row[15] || ''
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

router.post('/save-material-receipt', async (req, res) => {
  try {
    // Check if req.body is defined
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
      photo, // Expecting base64 string
      vendorName // Added vendorName
    } = req.body;

    // Validate required fields
    if (!uid || !reqNo || !siteName || !materialType || !skuCode || !materialName || !unitName || !receivedQty || !status) {
      console.log('Missing required fields:', req.body);
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let challanUrl = '';

    if (photo) {
      // Validate base64 format
      if (!photo.startsWith('data:image/')) {
        console.log('Invalid base64 image format');
        return res.status(400).json({ error: 'Invalid base64 image format' });
      }

      // Remove base64 prefix
      const base64Data = photo.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Convert Buffer to readable stream
      const bufferStream = new Readable();
      bufferStream.push(buffer);
      bufferStream.push(null);

      // Define folder ID (replace with the correct one)
      const folderId = '1vma3YPHosdy4SGCI5_sORVCElk85Wflz'; // Your folder ID
      console.log('Attempting to upload to folder ID:', folderId);

      const fileMetadata = {
        name: `challan_${uid}_${Date.now()}.jpg`,
        parents: [folderId],
      };

      const media = {
        mimeType: 'image/jpeg',
        body: bufferStream,
      };

      // Upload file with detailed error handling
      try {
        const file = await drive.files.create({
          resource: fileMetadata,
          media: media,
          fields: 'id, webViewLink',
          supportsAllDrives: true,
        });
        console.log('File created successfully, ID:', file.data.id);

        // Set permissions
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
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }
    }

    // Find or append row in Material_Received sheet
    const sheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Material_Received!A2:AM1000',
    });

    const rows = sheetResponse.data.values || [];
    let rowIndex = -1;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === uid) {
        rowIndex = i + 2; // Rows start from 2 (A2)
        break;
      }
    }

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
      supervisorName,
      materialType,
      skuCode,
      materialName,
      unitName,
      receivedQty,
      status,
      challanUrl || '',
      vendorName || '' ,  
      truckDelivery || '',
      googleFormCompleted || '',
      challanNo || '',
      qualityApproved || '',
    ];

    let updateRange;
    if (rowIndex !== -1) {
      updateRange = `Material_Received!A${rowIndex}:V${rowIndex}`; // Updated range to include vendorName (column V)
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: updateRange,
        valueInputOption: 'RAW',
        resource: { values: [values] },
      });
      console.log(`Updated row ${rowIndex} in Material_Received sheet`);
    } else {
      updateRange = 'Material_Received!A' + (rows.length + 2); // Append to next row
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Material_Received!A2:V', // Updated range to include vendorName (column V)
        valueInputOption: 'RAW',
        resource: { values: [values] },
      });
      console.log(`Appended new row to Material_Received sheet`);
    }

    res.json({ success: true, message: 'Receipt saved successfully', challanUrl });
  } catch (error) {
    console.error('Error saving material receipt:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to save receipt', details: error.message });
  }
});

module.exports = router;