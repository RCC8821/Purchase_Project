const express = require('express');
const { sheets, spreadsheetId , drive} = require('../config/googleSheet');
const router = express.Router();
require('dotenv').config();

router.get('/get-vendor-follow-up-material', async (req, res) => {
  try {
    const range = 'Purchase_FMS!B7:BR';
    console.log(`Fetching data from sheet: ${process.env.SPREADSHEET_ID || spreadsheetId}, range: ${range}`);

    // Fetch data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID || spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    console.log(`Raw rows fetched (length: ${rows.length})`);

    if (!rows.length) {
      console.log('No data found in the sheet for range:', range);
      return res.status(404).json({ error: 'No data found in the sheet', details: 'Sheet or range is empty' });
    }

    // Define required headers with their expected column positions (0-based index relative to B)
    const headers = [
      { key: 'UID', column: 0 }, // B
      { key: 'Req_No', column: 1 }, // C
      { key: 'Site_Name', column: 2 }, // D
      { key: 'Supervisor_Name', column: 3 }, // E
      { key: 'Material_Type', column: 4 }, // F
      { key: 'SKU_Code', column: 5 }, // G
      { key: 'Material_Name', column: 6 }, // H
      { key: 'Quantity', column: 7 }, // I
      { key: 'Unit_Name', column: 8 }, // J
      { key: 'Purpose', column: 9 }, // K
      { key: 'Require_Date', column: 10 }, // L
      { key: 'REVISED_QUANTITY_2', column: 15 }, // Q
      { key: 'DECIDED_BRAND/COMPANY_NAME_2', column: 16 }, // R
      { key: 'INDENT_NUMBER_3', column: 23 }, // Y
      { key: 'PDF_URL_3', column: 24 }, // Z
      { key: 'REMARK_3', column: 25 }, // AA
      { key: 'PLANNED_8', column: 63 }, // BM
      { key: 'ACTUAL_8', column: 64 }, // BN
      { key: 'STATUS_8', column: 65 }, // BO
      { key: 'FOLLOW-UP_COUNT_8', column: 67 }, // BP
      { key: 'EXPECTED_DELIVERY_DATE_8', column: 68 }, // BQ
      { key: 'REMARK_RECEIVED_VENDOR_8', column: 69 }, // BR
      { key: 'PDF_URL_5', column: 54 }, // AK
      { key: 'PDF_URL_7', column: 60 }, // AQ
      { key: 'Vendor_Firm_Name_5', column: 38 }, // AM
      { key: 'Vendor_Contact', column: 40 }, // AN
      { key: 'EXPECTED_DELIVERY_DATE_7', column: 61 }, // AR
    ];

    // Normalize sheet headers
    const sheetHeadersRaw = rows[0]?.map(h => h?.trim().replace(/\s+/g, '_').toUpperCase()) || [];
    console.log('Raw sheet headers:', sheetHeadersRaw);

    // Map sheet headers to expected headers
    const headerMap = {};
    headers.forEach(({ key, column }) => {
      headerMap[key] = { column, sheetHeader: sheetHeadersRaw[column] || key };
    });

    // Validate headers
    const missingHeaders = headers.filter(({ key, column }) => !sheetHeadersRaw[column] || sheetHeadersRaw[column].toUpperCase() !== key.toUpperCase());
    if (missingHeaders.length) {
      console.warn('Header mismatches detected:', missingHeaders.map(h => ({
        key: h.key,
        expectedColumn: String.fromCharCode(66 + h.column), // B=66
        found: sheetHeadersRaw[h.column] || 'missing',
      })));
    }

    // Find ACTUAL_8 and PLANNED_8 column indices dynamically
    const actual8Index = headers.find(h => h.key === 'ACTUAL_8')?.column;
    const planned8Index = headers.find(h => h.key === 'PLANNED_8')?.column;
    if (actual8Index === undefined || planned8Index === undefined) {
      console.error('Required columns not found in headers');
      return res.status(500).json({ error: 'Invalid sheet structure', details: 'ACTUAL_8 or PLANNED_8 column missing' });
    }

    // Process data rows (skip header row)
    const dataRows = rows.slice(1);
    if (!dataRows.length) {
      console.log('No data rows found starting from row 8');
      return res.status(404).json({ error: 'No data found starting from row 8', details: 'No rows after header' });
    }

    // Map and filter rows
    let validRowCount = 0;
    const formData = dataRows
      .map((row, index) => {
        if (!row || row.every(cell => !cell || cell.trim() === '')) {
          console.log(`Skipping empty row ${index + 8}`);
          return null;
        }

        // Check if ACTUAL_8 is empty
        const actual8 = row[actual8Index]?.trim() || '';
        const planned8 = row[planned8Index]?.trim() || '';
        console.log(
          `Row ${index + 8} - ACTUAL_8: "${actual8}", PLANNED_8: "${planned8}", Full row: ${JSON.stringify(row)}`
        );

        if (actual8) {
          console.log(`Skipping row ${index + 8} with non-empty ACTUAL_8="${actual8}"`);
          return null;
        }

        validRowCount++;
        const obj = {};
        headers.forEach(({ key, column }) => {
          if (key === 'Action') {
            obj[key] = '';
          } else {
            const rawValue = row[column];
            const trimmed = rawValue?.trim() ?? '';
            obj[key] = trimmed;
          }
        });
        return obj;
      })
      .filter(obj => obj && Object.entries(obj).some(([key, value]) => key !== 'Action' && value !== ''));

    console.log(`Rows with ACTUAL_8 empty: ${validRowCount}`);
    console.log('Final formData:', JSON.stringify(formData, null, 2));

    if (!formData.length) {
      console.log('No valid data found after filtering');
      return res.status(404).json({
        error: 'No valid data found after filtering',
        details: validRowCount === 0
          ? 'All rows have ACTUAL_8 non-empty in column BN'
          : 'All rows with empty ACTUAL_8 are empty in other columns',
      });
    }

    // Sort object keys for consistent output
    const sortedFormData = formData.map(obj => {
      const sortedObj = {};
      Object.keys(obj).sort().forEach(key => {
        sortedObj[key] = obj[key];
      });
      return sortedObj;
    });

    return res.json({ data: sortedFormData });
  } catch (error) {
    console.error('Error fetching data:', error.message, error.stack);
    return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});

// Function to get column letter based on 0-based index relative to B (B=0 -> 'B')
function getColumnLetter(relativeIndex) {
  let index = relativeIndex; // 0-based relative to B
  let columnLetter = '';
  while (index >= 0) {
    const remainder = index % 26;
    columnLetter = String.fromCharCode(65 + remainder) + columnLetter; // 65 is 'A'
    index = Math.floor(index / 26) - 1;
  }
  if (relativeIndex < 0) return 'A';
  if (relativeIndex === 0) return 'B';
  return columnLetter;
}



router.post('/update-vendor-follow-up-material', async (req, res) => {
  try {
    const { uid, status, expected_delivery_date, remark, follow_up_count } = req.body;
    if (!uid || !status || !expected_delivery_date || !remark || follow_up_count === undefined) {
      return res.status(400).json({ error: 'Missing required fields: uid, status, expected_delivery_date, remark, follow_up_count' });
    }

    const range = 'Purchase_FMS!B7:BR'; // Range includes BO-BR
    console.log(`Fetching data from sheet: ${process.env.SPREADSHEET_ID || spreadsheetId}, range: ${range}`);

    // Fetch data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID || spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    console.log(`Raw rows fetched (length: ${rows.length})`);

    if (!rows.length) {
      console.log('No data found in the sheet for range:', range);
      return res.status(404).json({ error: 'No data found in the sheet', details: 'Sheet or range is empty' });
    }

    // Process data rows (skip header row)
    const dataRows = rows.slice(1);
    if (!dataRows.length) {
      console.log('No data rows found starting from row 8');
      return res.status(404).json({ error: 'No data found starting from row 8', details: 'No rows after header' });
    }

    // Find the row index based on UID (column 0 relative to B)
    const rowIndex = dataRows.findIndex(row => (row[0] || '').trim() === uid.trim());
    if (rowIndex === -1) {
      console.log(`UID "${uid}" not found`);
      return res.status(404).json({ error: 'UID not found' });
    }

    const sheetRowNumber = 8 + rowIndex; // 1-based row number starting from row 8
    console.log(`Found UID "${uid}" at sheet row ${sheetRowNumber}`);

    // Define correct column indices (0-based relative to B)
    const statusColumnIndex = 66;   // STATUS_8 (BO)
    const followUpCountColumnIndex = 67; // FOLLOW_UP_COUNT_8 (BP)
    const expectedDateColumnIndex = 68; // EXPECTED_DELIVERY_DATE_8 (BQ)
    const remarkColumnIndex = 69;   // REMARK_RECEIVED_VENDOR_8 (BR)

    // Use the follow_up_count from the frontend directly
    const newFollowUpCount = parseInt(follow_up_count, 10);
    if (isNaN(newFollowUpCount) || newFollowUpCount < 0) {
      console.log(`Invalid follow_up_count received: ${follow_up_count}`);
      return res.status(400).json({ error: 'Invalid follow_up_count: must be a non-negative number' });
    }
    console.log(`Received FOLLOW_UP_COUNT_8 for UID "${uid}": ${newFollowUpCount}`);

    // Prepare batch update data
    const updateData = [
      {
        range: `Purchase_FMS!${getColumnLetter(statusColumnIndex)}${sheetRowNumber}`,
        values: [[status]],
      },
      {
        range: `Purchase_FMS!${getColumnLetter(followUpCountColumnIndex)}${sheetRowNumber}`,
        values: [[newFollowUpCount]],
      },
      {
        range: `Purchase_FMS!${getColumnLetter(expectedDateColumnIndex)}${sheetRowNumber}`,
        values: [[expected_delivery_date]],
      },
      {
        range: `Purchase_FMS!${getColumnLetter(remarkColumnIndex)}${sheetRowNumber}`,
        values: [[remark]],
      },
    ];

    // Perform batch update
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: process.env.SPREADSHEET_ID || spreadsheetId,
      resource: {
        valueInputOption: 'RAW',
        data: updateData,
      },
    });

    console.log(`Updated row ${sheetRowNumber} for UID "${uid}" with FOLLOW_UP_COUNT_8: ${newFollowUpCount}`);
    return res.json({ success: true, message: 'Data updated successfully', followUpCount: newFollowUpCount });
  } catch (error) {
    console.error('Error updating data:', error.message, error.stack);
    return res.status(500).json({ error: 'Failed to update data', details: error.message });
  }
});
module.exports = router