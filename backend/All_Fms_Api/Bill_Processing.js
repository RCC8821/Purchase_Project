

// const express = require('express');
// const { sheets, spreadsheetId } = require('../config/googleSheet');
// const { google } = require('googleapis'); // Assume this exports sheets and spreadsheetId
// const router = express.Router();
// const cloudinary = require('cloudinary').v2;



// // GET /api/BILL-PROCESSING (unchanged)
// router.get('/BILL-PROCESSING', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Billing_FMS!A8:CE',
//     });

//     let data = response.data.values || [];

//     const filteredData = data
//       .filter(row => {
//         const planned13 = row[33] || '';
//         const actual13 = row[34] || '';
//         return planned13 && !actual13;
//       })
//       .map(row => ({
//         planned13: row[33] || '',
//         UID: row[1] || '',
//         siteName: row[3] || '',
//         materialType: row[5] || '',
//         skuCode: row[6] || '',
//         materialName: row[7] || '',
//         revisedQuantity: row[25] || '',
//         finalReceivedQuantity: row[26] || '',
//         unitName: row[9] || '',
//         finalIndentNo: row[12] || '',
//         finalIndent: row[13] || '',
//         approvalQuotationNo: row[14] || '',
//         approvalQuotation: row[15] || '',
//         poNumber: row[16] || '',
//         poPDF: row[17] || '',
//         mrnNo: row[18] || '',
//         mrnPDF: row[19] || '',
//         vendorFerm: row[23] || '',
//         vendorContact: row[24] || '',
//       }));

//     res.json({
//       success: true,
//       data: filteredData
//     });
//   } catch (error) {
//     console.error('Error fetching BILL-PROCESSING data:', error);
//     res.status(500).json({ error: 'Failed to fetch BILL-PROCESSING data' });
//   }
// });



// async function uploadToCloudinary(base64Image, fileName) {
//   try {
//     // Step 1: Validate base64 string
//     if (!base64Image || typeof base64Image !== 'string') {
//       throw new Error('Invalid base64 image: not a string');
//     }

//     // Step 2: Extract MIME type safely
//     const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z0-9+\-.]+);base64,/);
//     if (!mimeMatch) {
//       throw new Error('Invalid base64 format: missing data URI header');
//     }

//     const mimeType = mimeMatch[1]; // e.g., image/jpeg, image/png, image/webp
//     const base64Data = base64Image.replace(/^data:image\/[a-zA-Z0-9+\-.]+;base64,/, '');

//     // Step 3: Optional: Validate base64 data length
//     if (base64Data.length === 0) {
//       throw new Error('Base64 data is empty after parsing');
//     }

//     // Step 4: Upload with dynamic MIME type
//     const result = await cloudinary.uploader.upload(
//       `data:${mimeType};base64,${base64Data}`,
//       {
//         public_id: fileName,
//         folder: 'bill_invoices',
//         resource_type: 'image',
//         // Optional: Auto optimize image
//         quality: 'auto',
//         fetch_format: 'auto',
//         // Optional: Limit size if needed (e.g., max 5MB)
//         // transformation: [{ width: 2000, height: 2000, crop: 'limit' }]
//       }
//     );

//     return result.secure_url;
//   } catch (error) {
//     console.error('Cloudinary Upload Failed:', {
//       error: error.message,
//       fileName,
//       hasBase64: !!base64Image,
//       length: base64Image?.length || 0
//     });
//     throw new Error(`Image upload failed: ${error.message}`);
//   }
// }



// router.post('/submit-bill', async (req, res) => {
//   try {
//     const { uids, invoiceNumber, status, remark, image } = req.body;

//     // Detailed validation
//     let missing = [];
//     if (!uids || !Array.isArray(uids) || uids.length === 0) missing.push('uids (non-empty array)');
//     if (!invoiceNumber) missing.push('invoiceNumber');
//     if (!status) missing.push('status');
//     if (!remark) missing.push('remark');
//     if (!image) missing.push('image');

//     if (missing.length > 0) {
//       return res.status(400).json({ error: 'Missing required fields', details: missing });
//     }

//     // Upload image to Cloudinary
//     let imageUrl = null;
//     if (image) {
//       const fileName = `invoice_${invoiceNumber}_${Date.now()}`;
//       imageUrl = await uploadToCloudinary(image, fileName);
//     }

//     // Fetch Google Sheet data
//     const values = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Billing_FMS!A8:CE',
//     });
//     const rows = values.data.values || [];
//     const batchUpdates = [];

//     // Update rows for each UID
//     uids.forEach(uid => {
//       const rowIndex = rows.findIndex(row => row[1] === uid);
//       if (rowIndex !== -1) {
//         const sheetRow = rowIndex + 8; // Starting from row 8
//         batchUpdates.push(
//           { range: `Billing_FMS!AJ${sheetRow}`, values: [[status]] }, // Status → AJ
//           { range: `Billing_FMS!AK${sheetRow}`, values: [[invoiceNumber]] }, // invoiceNumber → AK
//           { range: `Billing_FMS!AL${sheetRow}`, values: [[imageUrl]] }, // url → AL
//           { range: `Billing_FMS!AN${sheetRow}`, values: [[remark]] } // remark → AN
//         );
//       }
//     });

//     if (batchUpdates.length === 0) {
//       return res.status(400).json({ error: 'No matching UIDs found in the spreadsheet' });
//     }

//     // Perform batch update
//     await sheets.spreadsheets.values.batchUpdate({
//       spreadsheetId,
//       resource: {
//         valueInputOption: 'RAW',
//         data: batchUpdates.map(update => ({
//           range: update.range,
//           majorDimension: 'ROWS',
//           values: update.values,
//         })),
//       },
//     });

//     res.json({ success: true });
//   } catch (error) {
//     console.error('Error submitting bill:', error);
//     res.status(500).json({ error: 'Failed to submit bill', details: error.message });
//   }
// });

// module.exports = router;


///////////////////////////////////////////////////////////



const express = require('express');
const { sheets, drive, spreadsheetId } = require('../config/googleSheet'); // Make sure 'drive' is exported
const { Readable } = require('stream');
const router = express.Router();

// === UPLOAD TO GOOGLE DRIVE (Supports Images & PDFs) ===
async function uploadToGoogleDrive(base64Data, fileName) {
  console.log(`[DRIVE UPLOAD START] ${fileName}`);

  if (!base64Data || typeof base64Data !== 'string') {
    console.warn(`[DRIVE FAILED] ${fileName} → No base64 data provided`);
    return '';
  }

  // Match data URI: data:mime/type;base64,content
  const match = base64Data.match(/^data:([a-zA-Z0-9\/\-\+\.]+);base64,(.+)$/);
  if (!match) {
    console.warn(`[DRIVE FAILED] ${fileName} → Invalid data URI format`);
    return '';
  }

  const mimeType = match[1]; // e.g., image/jpeg, image/png, application/pdf
  const base64Content = match[2];

  try {
    const buffer = Buffer.from(base64Content, 'base64');

    const fileStream = new Readable();
    fileStream.push(buffer);
    fileStream.push(null); // End stream

    const fileMetadata = {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // Ensure this env var is set
    };

    const media = {
      mimeType,
      body: fileStream,
    };

    const res = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
      supportsAllDrives: true,
      // Optional: if using shared drive
      // driveId: process.env.GOOGLE_DRIVE_FOLDER_ID,
      // corpora: 'drive'
    });

    const fileId = res.data.id;

    // Make file publicly viewable
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
      supportsAllDrives: true,
    });

    const viewUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;

    console.log(`[DRIVE SUCCESS] ${fileName} → ${viewUrl}`);
    return viewUrl;
  } catch (error) {
    console.error(`[DRIVE ERROR] ${fileName}:`, error.message);
    if (error.response?.data) console.error(error.response.data);
    return '';
  }
}

// GET /api/BILL-PROCESSING (unchanged)
router.get('/BILL-PROCESSING', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:CE',
    });

    let data = response.data.values || [];

    const filteredData = data
      .filter(row => {
        const planned13 = row[33] || '';
        const actual13 = row[34] || '';
        return planned13 && !actual13;
      })
      .map(row => ({
        planned13: row[33] || '',
        UID: row[1] || '',
        siteName: row[3] || '',
        materialType: row[5] || '',
        skuCode: row[6] || '',
        materialName: row[7] || '',
        revisedQuantity: row[25] || '',
        finalReceivedQuantity: row[26] || '',
        unitName: row[9] || '',
        finalIndentNo: row[12] || '',
        finalIndent: row[13] || '',
        approvalQuotationNo: row[14] || '',
        approvalQuotation: row[15] || '',
        poNumber: row[16] || '',
        poPDF: row[17] || '',
        mrnNo: row[18] || '',
        mrnPDF: row[19] || '',
        vendorFerm: row[23] || '',
        vendorContact: row[24] || '',
      }));

    res.json({
      success: true,
      data: filteredData
    });
  } catch (error) {
    console.error('Error fetching BILL-PROCESSING data:', error);
    res.status(500).json({ error: 'Failed to fetch BILL-PROCESSING data' });
  }
});

// POST /submit-bill → Now uploads invoice image to Google Drive
router.post('/submit-bill', async (req, res) => {
  try {
    const { uids, invoiceNumber, status, remark, image } = req.body;

    // Detailed validation
    let missing = [];
    if (!uids || !Array.isArray(uids) || uids.length === 0) missing.push('uids (non-empty array)');
    if (!invoiceNumber) missing.push('invoiceNumber');
    if (!status) missing.push('status');
    if (!remark) missing.push('remark');
    if (!image) missing.push('image');

    if (missing.length > 0) {
      return res.status(400).json({ error: 'Missing required fields', details: missing });
    }

    // Upload invoice image to Google Drive
    let imageUrl = '';
    if (image) {
      const fileName = `invoice_${invoiceNumber}_${Date.now()}.jpg`; // You can make extension dynamic if needed
      imageUrl = await uploadToGoogleDrive(image, fileName);

      if (!imageUrl) {
        return res.status(500).json({
          success: false,
          error: 'Failed to upload invoice image to Google Drive'
        });
      }
    }

    // Fetch current sheet data
    const values = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:CE',
    });
    const rows = values.data.values || [];
    const batchUpdates = [];

    // Find rows and prepare updates
    uids.forEach(uid => {
      const rowIndex = rows.findIndex(row => row[1] === uid);
      if (rowIndex !== -1) {
        const sheetRow = rowIndex + 8; // Because data starts at row 8

        batchUpdates.push(
          { range: `Billing_FMS!AJ${sheetRow}`, values: [[status]] },           // Status → Column AJ
          { range: `Billing_FMS!AK${sheetRow}`, values: [[invoiceNumber]] },     // Invoice No → AK
          { range: `Billing_FMS!AL${sheetRow}`, values: [[imageUrl]] },         // Invoice Image URL → AL
          { range: `Billing_FMS!AN${sheetRow}`, values: [[remark]] }            // Remark → AN
        );
      }
    });

    if (batchUpdates.length === 0) {
      return res.status(400).json({ error: 'No matching UIDs found in the spreadsheet' });
    }

    // Perform batch update on Google Sheet
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'RAW',
        data: batchUpdates.map(update => ({
          range: update.range,
          majorDimension: 'ROWS',
          values: update.values,
        })),
      },
    });

    res.json({
      success: true,
      message: 'Bill submitted successfully',
      uploadedInvoiceUrl: imageUrl
    });

  } catch (error) {
    console.error('Error submitting bill:', error);
    res.status(500).json({
      error: 'Failed to submit bill',
      details: error.message
    });
  }
});

module.exports = router;