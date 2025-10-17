const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');

const router = express.Router();

router.get('/Bill_Checked', async (req, res) => {
  try {
    // Fetch data from Billing_FMS sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:CE', // Range from A8 to CE
    });

    let data = response.data.values || [];

    // Filter and transform data based on PLANNED 14 and ACTUAL 14
    const filteredData = data
      .filter(row => {
        const planned14 = row[41] || ''; 
        const actual14 = row[42] || ''; //
        return planned14 && !actual14; // 
      })
      .map(row => ({
        planned14: row[41] || '', // Column AF for PLANNED 14
        UID: row[1] || '', // Column B
        siteName: row[3] || '', // Column D
        materialType: row[5] || '', // Column F
        skuCode: row[6] || '', // Column G
        materialName: row[7] || '', // Column H
        revisedQuantity: row[25] || '', // Column Z for Revised Qty
        finalReceivedQuantity: row[26] || '', // Column AA for Final Received Qty
        unitName: row[9] || '', // Column J
        finalIndentNo: row[12] || '', // Column N for Final Indent No
        finalIndentPDF: row[13] || '', // Column O for Final Indent PDF
        approvalQuotationNo: row[14] || '', // Column P for Approval Quotation No
        approvalQuotationPDF: row[15] || '', // Column Q for Approval Quotation PDF
        poNumber: row[16] || '', // Column Q for PO Number
        poPDF: row[17] || '', // Column R for PO PDF
        mrnNo: row[18] || '', // Column S for MRN No
        mrnPDF: row[19] || '', // Column T for MRN PDF
        vendorFirmName: row[23] || '', // Column X for Vendor Firm Name
        vendorContact: row[24] || '', // Column Y for Vendor_contact
        invoice13: row[36] || '', // Column AB (assumed for INVOICE 13, same as PLANNED 12 in original)
        invoicePhoto13: row[37] || '', // Column AC (assumed for INVOICE PHOTO 13, next to INVOICE 13)
      }));

    res.json({
      success: true,
      data: filteredData
    });
  } catch (error) {
    console.error('Error fetching Bill_Checked data:', error);
    res.status(500).json({ error: 'Failed to fetch Bill_Checked data' });
  }
});


router.post('/bill_checked_status', async (req, res) => {
  const { updates } = req.body;

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid or empty updates array' });
  }

  try {
    // Fetch the current sheet data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:ZZ',
    });
    let sheetData = response.data.values || [];

    // Update each row by UID
    updates.forEach(({ uid, STATUS_14, REMARK_14 }) => {
      const rowIndex = sheetData.findIndex((row) => row[1] && String(row[1]).trim() === uid); // Column B (UID)
      if (rowIndex !== -1) {
        sheetData[rowIndex][45] = REMARK_14 || ''; // AU - REMARK_14 (index 46)
        sheetData[rowIndex][43] = STATUS_14 || ''; // AV - STATUS_14 (index 47)
      } else {
        console.warn(`UID ${uid} not found in sheet data.`);
      }
    });

    // Write updated data back to the sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Billing_FMS!A8:ZZ',
      valueInputOption: 'RAW',
      resource: { values: sheetData },
    });

    res.json({ success: true, message: 'STATUS_14 and REMARK_14 updated successfully' });
  } catch (error) {
    console.error('Error updating bill checked status:', error);
    res.status(500).json({ success: false, message: 'Failed to update bill checked status' });
  }
});

module.exports = router;