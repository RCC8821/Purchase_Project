

const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');

const router = express.Router();

router.get('/Bill_Tally', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:ZZ',
    });

    let data = response.data.values || [];

    const filteredData = data
      .filter(row => {
        const planned16 = row[47] ? String(row[47]).trim() : '';
        const actual16 = row[48] ? String(row[48]).trim() : '';
        return planned16 && !actual16;
      })
      .map(row => ({
        planned16: row[47] ? String(row[47]).trim() : '',
        UID: row[1] ? String(row[1]).trim() : '',
        siteName: row[3] ? String(row[3]).trim() : '',
        materialType: row[5] ? String(row[5]).trim() : '',
        skuCode: row[6] ? String(row[6]).trim() : '',
        materialName: row[7] ? String(row[7]).trim() : '',
        revisedQuantity: row[25] ? String(row[25]).trim() : '',
        finalReceivedQuantity: row[26] ? String(row[26]).trim() : '',
        unitName: row[9] ? String(row[9]).trim() : '',
        finalIndentNo: row[12] ? String(row[12]).trim() : '',
        finalIndentPDF: row[13] ? String(row[13]).trim() : '',
        approvalQuotationNo: row[14] ? String(row[14]).trim() : '',
        approvalQuotationPDF: row[15] ? String(row[15]).trim() : '',
        poNumber: row[16] ? String(row[16]).trim() : '',
        poPDF: row[17] ? String(row[17]).trim() : '',
        mrnNo: row[18] ? String(row[18]).trim() : '',
        mrnPDF: row[19] ? String(row[19]).trim() : '',
        vendorFirmName: row[23] ? String(row[23]).trim() : '',
        invoice13: row[36] ? String(row[36]).trim() : '',
      }))
      .filter(row => row.planned16);

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



router.post('/bill_tally_entry', async (req, res) => {
  const data = req.body;

  try {
    // Fetch the current sheet data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:ZZ',
    });
    let sheetData = response.data.values || [];

    // Update each row by UID
    data.items.forEach((item) => {
      const rowIndex = sheetData.findIndex((row) => row[1] && String(row[1]).trim() === item.uid); // Column B (UID)
      if (rowIndex !== -1) {
        // Map all provided fields to corresponding columns with the same indices as your code
        sheetData[rowIndex][49] = data.status16 || ''; // AX - STATUS 16
        // sheetData[rowIndex][48] = new Date().toISOString().split('T')[0] || ''; // AY - TIME DELAY 16 (current date, commented out)
        sheetData[rowIndex][51] = data.vendorFirmName || ''; // AZ - VENDOR FIRM NAME 16
        sheetData[rowIndex][52] = data.billNo || ''; // BA - BILL NO. 16
        sheetData[rowIndex][53] = data.billDate || ''; // BB - BILL DATE 16
        sheetData[rowIndex][54] = item.amount || ''; // BC - AMOUNT 16
        sheetData[rowIndex][55] = item.cgst || ''; // BD - CGST 16 (as received)
        sheetData[rowIndex][56] = item.sgstAmt || ''; // BE - SGST 16 (as received)
        sheetData[rowIndex][57] = item.igst || ''; // BF - IGST 16 (as received)
        sheetData[rowIndex][58] = data.transportLoading || ''; // New: Transport Loading at index 58
        sheetData[rowIndex][59] = data.transportWOGST || ''; // BG - Transport Loading & Unloading Charges Without GST 16 (shifted to 59)
        sheetData[rowIndex][61] = data.remark || ''; // BH - REMARK 16
        sheetData[rowIndex][60] = item.total || ''; // Row index 60 for TOTAL 16 (as received from frontend)

        // Update ACTUAL 16 (column AW) to indicate data entry (commented out as per your code)
        // sheetData[rowIndex][48] = 'Completed'; // AW - ACTUAL 16
      } else {
        console.warn(`UID ${item.uid} not found in sheet data.`);
      }
    });

    // Write updated data back to the sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Billing_FMS!A8:ZZ',
      valueInputOption: 'RAW',
      resource: { values: sheetData },
    });

    res.json({ success: true, message: 'Data updated successfully' });
  } catch (error) {
    console.error('Error updating bill tally entry:', error);
    res.status(500).json({ error: 'Failed to update bill tally entry' });
  }
});

module.exports = router;