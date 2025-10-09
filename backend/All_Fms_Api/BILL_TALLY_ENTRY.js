const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');

const router = express.Router();

router.get('/Bill_Tally', async (req, res) => {
  try {
    // Fetch data from Billing_FMS sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:ZZ', // Extended range to include potential columns
    });

    let data = response.data.values || [];

    // Filter and transform data based on PLANNED 16 and ACTUAL 16
    const filteredData = data
      .filter(row => {
        const planned16 = row[47] ? String(row[47]).trim() : ''; // Column AV (48th column, 0-based index) for PLANNED 16
        const actual16 = row[48] ? String(row[48]).trim() : ''; // Column AW (49th column, 0-based index) for ACTUAL 16
        return planned16 && !actual16; // Include row if PLANNED 16 has non-empty data and ACTUAL 16 is empty
      })
      .map(row => ({
        planned16: row[47] ? String(row[47]).trim() : '', // Column AV for PLANNED 16
        UID: row[1] ? String(row[1]).trim() : '', // Column B
        siteName: row[3] ? String(row[3]).trim() : '', // Column D
        materialType: row[5] ? String(row[5]).trim() : '', // Column F
        skuCode: row[6] ? String(row[6]).trim() : '', // Column G
        materialName: row[7] ? String(row[7]).trim() : '', // Column H
        revisedQuantity: row[25] ? String(row[25]).trim() : '', // Column Z for Revised Qty
        finalReceivedQuantity: row[26] ? String(row[26]).trim() : '', // Column AA for Final Received Qty
        unitName: row[9] ? String(row[9]).trim() : '', // Column J
        finalIndentNo: row[12] ? String(row[12]).trim() : '', // Column M for Final Indent No
        finalIndentPDF: row[13] ? String(row[13]).trim() : '', // Column N for Final Indent PDF
        approvalQuotationNo: row[14] ? String(row[14]).trim() : '', // Column O for Approval Quotation No
        approvalQuotationPDF: row[15] ? String(row[15]).trim() : '', // Column P for Approval Quotation PDF
        poNumber: row[16] ? String(row[16]).trim() : '', // Column Q for PO Number
        poPDF: row[17] ? String(row[17]).trim() : '', // Column R for PO PDF
        mrnNo: row[18] ? String(row[18]).trim() : '', // Column S for MRN No
        mrnPDF: row[19] ? String(row[19]).trim() : '', // Column T for MRN PDF
        // expectedFreightCharges: row[21] ? String(row[21]).trim() : '', // Column U for Expected Freight Charges
        // transportChargesWithoutGST: row[58] ? String(row[58]).trim() : '', // Column V for Transport Charges (w/o GST)
        // transportGSTAmount: row[59] ? String(row[59]).trim() : '', // Column W for Transport GST Amount
        vendorFirmName: row[23] ? String(row[23]).trim() : '', // Column X for Vendor Firm Name
        invoice13: row[44] ? String(row[44]).trim() : '', // Column AP for INVOICE 13
      }))
      .filter(row => row.planned16); // Ensure no rows with empty planned16 are included

    // Check if filtered data is empty
    if (filteredData.length === 0) {
      return res.json({
        success: true,
        data: [],
        warning: 'No rows found where PLANNED 16 has non-empty data and ACTUAL 16 is empty.'
      });
    }

    res.json({
      success: true,
      data: filteredData
    });
  } catch (error) {
    console.error('Error fetching Bill_Tally data:', error);
    res.status(500).json({ error: 'Failed to fetch Bill_Tally data' });
  }
});

module.exports = router;