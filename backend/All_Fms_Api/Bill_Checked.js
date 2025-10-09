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
        const planned14 = row[49] || ''; 
        const actual14 = row[50] || ''; //
        return planned14 && !actual14; // 
      })
      .map(row => ({
        planned14: row[49] || '', // Column AF for PLANNED 14
        UID: row[1] || '', // Column B
        siteName: row[3] || '', // Column D
        materialType: row[5] || '', // Column F
        skuCode: row[6] || '', // Column G
        materialName: row[7] || '', // Column H
        revisedQuantity: row[25] || '', // Column Z for Revised Qty
        finalReceivedQuantity: row[26] || '', // Column AA for Final Received Qty
        unitName: row[9] || '', // Column J
        finalIndentNo: row[13] || '', // Column N for Final Indent No
        finalIndentPDF: row[14] || '', // Column O for Final Indent PDF
        approvalQuotationNo: row[15] || '', // Column P for Approval Quotation No
        approvalQuotationPDF: row[16] || '', // Column Q for Approval Quotation PDF
        poNumber: row[16] || '', // Column Q for PO Number
        poPDF: row[17] || '', // Column R for PO PDF
        mrnNo: row[18] || '', // Column S for MRN No
        mrnPDF: row[19] || '', // Column T for MRN PDF
        vendorFirmName: row[23] || '', // Column X for Vendor Firm Name
        vendorContact: row[24] || '', // Column Y for Vendor_contact
        invoice13: row[44] || '', // Column AB (assumed for INVOICE 13, same as PLANNED 12 in original)
        invoicePhoto13: row[45] || '', // Column AC (assumed for INVOICE PHOTO 13, next to INVOICE 13)
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

module.exports = router;