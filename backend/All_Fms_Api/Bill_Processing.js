const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');
const router = express.Router();

router.get('/BILL-PROCESSING', async (req, res) => {
  try {
    // Fetch data from Billing_FMS sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:CE', // Range from A8 to CE
    });

    let data = response.data.values || [];

    // Filter and transform data based on PLANNED 13 and ACTUAL 13
    const filteredData = data
      .filter(row => {
        const planned13 = row[41] || ''; // Column AD (30th column, 0-based index) for PLANNED 13
        const actual13 = row[42] || ''; // Column AE (31st column, 0-based index) for ACTUAL 13
        return planned13 && !actual13; // Include row if PLANNED 13 has data and ACTUAL 13 is empty
      })
      .map(row => ({
        planned13: row[41] || '', // Column AD for PLANNED 13
        UID: row[1] || '', // Column B
        siteName: row[3] || '', // Column D
        materialType: row[5] || '', // Column F (from original code)
        skuCode: row[6] || '', // Column G (from original code)
        materialName: row[7] || '', // Column H
        revisedQuantity: row[25] || '', // Column Z for Revised Qty
        finalReceivedQuantity: row[26] || '', // Column AA for Final Received Qty
        unitName: row[9] || '', // Column J
        finalIndentNo: row[12] || '', // Column N (assumed for Final Indent No, based on indentNumber3 context)
        finalIndent: row[13] || '', // Column O (assumed for Final Indent, e.g., PDF URL)
        approvalQuotationNo: row[14] || '', // Column P (assumed for Approval Quotation No)
        approvalQuotation: row[15] || '', // Column Q (assumed for Approval Quotation, e.g., PDF URL)
        poNumber: row[16] || '', // Column Q for PO Number
        poPDF: row[17] || '', // Column R (assumed for PO PDF)
        mrnNo: row[18] || '', // Column S (assumed for MRN No)
        mrnPDF: row[19] || '', // Column T (assumed for MRN PDF)
        vendorFerm: row[23] || '', // Column X for Vendor ferm
        vendorContact: row[24] || '', // Column Y for Vendor Contact
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

module.exports = router