const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');
const router = express.Router();

// GET: Fetch all get-approve-Requied 

router.get('/get-approve-Requied', async (req, res) => {
  try {
    const range = 'Purchase_FMS!B7:O'; // Updated range to exclude STATUS_2 (column P)
    console.log(`Fetching data from sheet: ${process.env.SPREADSHEET_ID || spreadsheetId}, range: ${range}`);

    // Fetch data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID || spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    console.log('Raw rows fetched:', JSON.stringify(rows, null, 2));

    if (!rows.length) {
      console.log('No data found in the sheet');
      return res.status(404).json({ error: 'No data found in the sheet', details: 'Sheet or range is empty' });
    }

    // Define fallback headers (excluding STATUS_2)
    const fallbackHeaders = [
      'Req_No',           // C
      'Site_Name',        // D
      'Supervisor_Name',  // E
      'Material_Type',    // F
      'SKU_Code',         // G
      'Material_Name',    // H
      'Quantity',         // I
      'Unit_Name',        // J
      'Purpose',          // K
      'Require_Date',     // L
      'Remark',           // M
      'PLANNED_2',        // N
      'ACTUAL_2',         // O
      'Action',           // Frontend column
    ];

    // Get headers from row 1 (index 0), with fallback
    let headers = rows[0] || [];
    console.log('Headers from row 1:', headers);
    if (!headers.length || headers.some((h) => !h || h.trim() === '')) {
      console.log('Using fallback headers:', fallbackHeaders);
      headers = fallbackHeaders;
    } else {
      headers = headers.map((header) => header.trim().replace(/\s+/g, '_')); // Normalize headers
      console.log('Normalized headers:', headers);
    }

    // Process data rows (skip header row)
    const dataRows = rows.slice(1);
    console.log('Data rows (from row 2):', dataRows);

    if (!dataRows.length) {
      console.log('No data rows found starting from row 8');
      return res.status(404).json({ error: 'No data found starting from row 8', details: 'No rows after header' });
    }

    // Map data rows to objects, filtering by PLANNED_2 and ACTUAL_2
    let validRowCount = 0;
    const formData = dataRows
      .map((row, index) => {
        // Skip completely empty rows
        if (!row || row.every((cell) => !cell || cell.trim() === '')) {
          console.log(`Skipping empty row ${index + 8}:`, row);
          return null;
        }

        // Check PLANNED_2 (column N, index 12) and ACTUAL_2 (column O, index 13)
        const planned2 = row[12] ? row[12].trim() : '';
        const actual2 = row[13] ? row[13].trim() : '';
        console.log(
          `Row ${index + 8} - PLANNED_2: "${planned2}", ACTUAL_2: "${actual2}", Full row: ${JSON.stringify(row)}`
        );

        if (!planned2 || actual2) {
          console.log(
            `Skipping row ${index + 8} - Reason: ${
              !planned2 ? `Empty PLANNED_2="${planned2}"` : ''
            }${!planned2 && actual2 ? ' and ' : ''}${
              actual2 ? `Non-empty ACTUAL_2="${actual2}"` : ''
            }`
          );
          return null;
        }

        validRowCount++;
        // Create object with headers
        const obj = {};
        headers.forEach((header, i) => {
          if (header === 'Action') {
            obj[header] = ''; // Empty string for frontend Action column
          } else {
            obj[header] = row[i] ? row[i].trim() : ''; // Trim and handle missing values
          }
        });
        return obj;
      })
      .filter((obj) => obj !== null);

    console.log(`Rows with PLANNED_2 non-empty and ACTUAL_2 empty: ${validRowCount}`);
    console.log('Form data after filtering:', JSON.stringify(formData, null, 2));

    // Filter out rows where all values (except Action) are empty
    const finalFormData = formData.filter((obj, index) => {
      const hasData = Object.entries(obj).some(
        ([key, value]) => key !== 'Action' && value !== ''
      );
      if (!hasData) {
        console.log(`Filtered out row ${index + 8} (all values empty except Action):`, obj);
      }
      return hasData;
    });

    console.log('Final form data:', JSON.stringify(finalFormData, null, 2));

    if (!finalFormData.length) {
      console.log('No valid data found after filtering');
      return res.status(404).json({
        error: 'No valid data found after filtering',
        details: validRowCount === 0
          ? 'No rows have PLANNED_2 non-empty and ACTUAL_2 empty in columns N and O'
          : 'All rows with PLANNED_2 non-empty and ACTUAL_2 empty are empty in other columns',
      });
    }

    return res.json({ data: finalFormData });
  } catch (error) {
    console.error('Error fetching data:', error.message, error.stack);
    return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});

////////////////// ApproveRequied update Api Done //////////////////

router.post('/approve-Requied-save', async (req, res) => {
  const { UID, STATUS_2, REVISED_QUANTITY_2, DECIDED_BRAND_COMPANY_NAME_2, REMARKS_2 } = req.body;

  console.log('Received payload:', req.body);
  console.log('Type of REVISED_QUANTITY_2:', typeof REVISED_QUANTITY_2);
  console.log('DECIDED_BRAND_COMPANY_NAME_2 value:', DECIDED_BRAND_COMPANY_NAME_2);

  // Validate input
  if (!UID || !STATUS_2 || REVISED_QUANTITY_2 === undefined || !DECIDED_BRAND_COMPANY_NAME_2 || !REMARKS_2) {
    console.log('Validation failed - UID:', UID, 'STATUS_2:', STATUS_2, 'REVISED_QUANTITY_2:', REVISED_QUANTITY_2, 
                'DECIDED_BRAND/COMPANY_NAME_2:', DECIDED_BRAND_COMPANY_NAME_2, 'REMARKS_2:', REMARKS_2);
    return res.status(400).json({ error: 'UID, STATUS_2, REVISED_QUANTITY_2, DECIDED_BRAND/COMPANY_NAME_2, and REMARKS_2 are required' });
  }

  // Convert REVISED_QUANTITY_2 to number and validate
  const revisedQty = Number(REVISED_QUANTITY_2);
  if (isNaN(revisedQty) || revisedQty < 0) {
    console.log('Invalid REVISED_QUANTITY_2 value:', REVISED_QUANTITY_2, 'Converted to:', revisedQty);
    return res.status(400).json({ error: 'REVISED_QUANTITY_2 must be a non-negative number' });
  }

  try {
    // Fetch the data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!A7:Z', // Start from row 7 as specified
    });

    const rows = response.data.values || [];
    console.log('Fetched rows:', rows);

    if (!rows.length) {
      return res.status(404).json({ error: 'No data found in the sheet' });
    }

    const headerRow = rows[0];
    console.log('Header row:', headerRow);

    const uidIndex = headerRow.indexOf('UID');
    if (uidIndex === -1) {
      console.log('UID column not found in header row');
      return res.status(400).json({ error: 'UID column not found in sheet' });
    }

    const dataRows = rows.slice(1);
    const rowIndex = dataRows.findIndex((row) => row[uidIndex] && row[uidIndex].toString().trim() === UID.toString().trim());
    if (rowIndex === -1) {
      return res.status(404).json({ error: `No matching row found for UID: ${UID}` });
    }

    const actualRowIndex = rowIndex + 8; // Adjust for starting row 7 (header at 7, data starts at 8)
    console.log('Actual row index:', actualRowIndex);

    // Find column indices for the four fields to update
    const statusIndex = headerRow.indexOf('STATUS 2');
    const revisedQtyIndex = headerRow.indexOf('REVISED QUANTITY 2');
    const brandIndex = headerRow.indexOf('DECIDED BRAND/COMPANY NAME 2');
    const remarksIndex = headerRow.indexOf('REMARKS 2');

    console.log('Column indices:', { statusIndex, revisedQtyIndex, brandIndex, remarksIndex });

    // Verify REMARKS 2 is in column R (index 17)
    if (remarksIndex !== 17) {
      console.warn('REMARKS 2 column is not in column R (index 17). Current index:', remarksIndex);
    }

    if (statusIndex === -1 || revisedQtyIndex === -1 || brandIndex === -1 || remarksIndex === -1) {
      console.log('Required columns not found - STATUS 2:', statusIndex, 'REVISED QUANTITY 2:', revisedQtyIndex, 
                  'DECIDED BRAND/COMPANY NAME 2:', brandIndex, 'REMARKS 2:', remarksIndex);
      return res.status(400).json({ error: 'Required columns (STATUS 2, REVISED QUANTITY 2, DECIDED BRAND/COMPANY NAME 2, REMARKS 2) not found' });
    }

    // Prepare data for the four columns only
    const columnIndices = [statusIndex, revisedQtyIndex, brandIndex, remarksIndex];
    const values = [
      STATUS_2,
      revisedQty.toString(),
      DECIDED_BRAND_COMPANY_NAME_2,
      REMARKS_2,
    ];

    console.log('Values to be written:', values);

    // Map column indices to column letters
    const getColumnLetter = (index) => String.fromCharCode(65 + index); // A=0, B=1, etc.
    const updateRanges = columnIndices.map((index, i) => ({
      range: `Purchase_FMS!${getColumnLetter(index)}${actualRowIndex}`,
      value: values[i],
    }));

    // Perform batch update for only the specified columns
    const batchUpdateRequest = {
      spreadsheetId,
      resource: {
        valueInputOption: 'RAW',
        data: updateRanges.map(({ range, value }) => ({
          range,
          values: [[value]],
        })),
      },
    };

    console.log('Batch update request:', batchUpdateRequest);
    const updateResponse = await sheets.spreadsheets.values.batchUpdate(batchUpdateRequest);
    console.log('Update response:', updateResponse.data);

    return res.json({ message: 'Data updated in Google Sheet successfully' });
  } catch (error) {
    console.error('Error updating Google Sheet:', error.message, error.stack);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
});


module.exports = router;