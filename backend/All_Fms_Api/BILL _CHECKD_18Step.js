const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');

const router = express.Router();

router.get('/Bill_Checked_Step18', async (req, res) => {
  try {
    // Fetch data from Billing_FMS sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:CK', // Range from A8 to CE
    });

    let data = response.data.values || [];

    // Filter and transform data based on PLANNED 14 and ACTUAL 14
    const filteredData = data
      .filter(row => {
        const planned14 = row[82] || ''; 
        const actual14 = row[83] || ''; 
        return planned14 && !actual14; 
      })
      .map(row => ({
        planned14: row[82] || '', // Column AF for PLANNED 14
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
        PODate: row[88] || '',
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




router.post('/bill_checked_status_18Step', async (req, res) => {
  const { updates } = req.body;

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid or empty updates array' });
  }

  try {
    // Step 1: Fetch only necessary columns: UID (B), STATUS_14 (AS?), REMARK_14 (AU?)
    // Let's assume:
    // Column B = UID (index 1)
    // Column AS = STATUS_14 (index 44? wait — check your sheet)
    // Column AU = REMARK_14 (index 46)

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:CJ', // Only up to AU to reduce data
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No data found in sheet' });
    }

    // Prepare batch update requests
    const requests = [];

    updates.forEach(({ uid, STATUS_18, REMARK_18 }) => {
      const rowIndex = rows.findIndex(row => row[1] && String(row[1]).trim() === String(uid).trim());
      if (rowIndex !== -1) {
        const rowNumber = 8 + rowIndex; // Actual row number in sheet

        // Only push updates if value is provided
        if (STATUS_18 !== undefined) {
          requests.push({
            range: `Billing_FMS!CG${rowNumber}`, // Adjust column if needed
            values: [[STATUS_18]],
          });
        }
        if (REMARK_18 !== undefined) {
          requests.push({
            range: `Billing_FMS!CI${rowNumber}`, // Adjust column if needed
            values: [[REMARK_18]],
          });
        }
      } else {
        console.warn(`UID ${uid} not found in sheet.`);
      }
    });

    // Step 2: If there are updates, send batchUpdate
    if (requests.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        resource: {
          valueInputOption: 'RAW',
          data: requests,
        },
      });
    }

    res.json({ success: true, message: 'STATUS_18 and REMARK_18 updated successfully' });
  } catch (error) {
    console.error('Error updating bill checked status:', error);
    res.status(500).json({ success: false, message: 'Failed to update bill checked status' });
  }
});


module.exports = router;