
const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');
const { google } = require('googleapis'); // Assume this exports sheets and spreadsheetId
const router = express.Router();
const cloudinary = require('cloudinary').v2;


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'djncr1nay',
  api_key: process.env.CLOUDINARY_API_KEY || '747683146821287',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'WysvIFMUrulOtry9Cmux5IiCWqo',
});
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
        planned13: row[41] || '',
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




// NEW POST /api/submit-bill (combines update and URL save)
async function uploadToCloudinary(base64Image, fileName) {
  try {
    const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${base64Data}`,
      {
        public_id: fileName,
        folder: 'bill_invoices', // Same folder as frontend
      }
    );
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error.message);
    throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
  }
}



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

    // Upload image to Cloudinary
    let imageUrl = null;
    if (image) {
      const fileName = `invoice_${invoiceNumber}_${Date.now()}`;
      imageUrl = await uploadToCloudinary(image, fileName);
    }

    // Fetch Google Sheet data
    const values = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:CE',
    });
    const rows = values.data.values || [];
    const batchUpdates = [];

    // Update rows for each UID
    uids.forEach(uid => {
      const rowIndex = rows.findIndex(row => row[1] === uid);
      if (rowIndex !== -1) {
        const sheetRow = rowIndex + 8; // Starting from row 8
        batchUpdates.push(
          { range: `Billing_FMS!AJ${sheetRow}`, values: [[status]] }, // Status → AJ
          { range: `Billing_FMS!AK${sheetRow}`, values: [[invoiceNumber]] }, // invoiceNumber → AK
          { range: `Billing_FMS!AL${sheetRow}`, values: [[imageUrl]] }, // url → AL
          { range: `Billing_FMS!AN${sheetRow}`, values: [[remark]] } // remark → AN
        );
      }
    });

    if (batchUpdates.length === 0) {
      return res.status(400).json({ error: 'No matching UIDs found in the spreadsheet' });
    }

    // Perform batch update
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

    res.json({ success: true });
  } catch (error) {
    console.error('Error submitting bill:', error);
    res.status(500).json({ error: 'Failed to submit bill', details: error.message });
  }
});

module.exports = router;