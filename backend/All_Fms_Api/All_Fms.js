const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');
const router = express.Router();

// GET: Fetch all get-approve-Requied 

router.get('/get-approve-Requied', async (req, res) => {
  try {
    const range = 'Purchase_FMS!B7:P'; // Updated range to include column P (STATUS_2)
    console.log(`Fetching data from sheet: ${spreadsheetId}, range: ${range}`);

    // Fetch data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID || spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    console.log('Raw rows fetched:', JSON.stringify(rows, null, 2));

    if (!rows.length) {
      console.log('No data found in the sheet');
      return res.status(404).json({ error: 'No data found in the sheet' });
    }

    // Define fallback headers (including Remark, excluding STATUS_2 from output)
    const fallbackHeaders = [
      'Req_No',
      'Site_Name',
      'Supervisor_Name',
      'Material_Type',
      'SKU_Code',
      'Material_Name',
      'Quantity',
      'Unit_Name',
      'Purpose',
      'Require_Date',
      'PLANNED_2',
      'Remark',
      'Action',
      'STATUS_2', // Included for filtering, excluded from output
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
      console.log('No data rows found starting from row 2');
      return res.status(404).json({ error: 'No data found starting from row 2' });
    }

    // Map data rows to objects, excluding APPROVED rows and STATUS_2 from output
    const formData = dataRows
      .map((row, index) => {
        // Skip completely empty rows
        if (!row || row.every((cell) => !cell || cell.trim() === '')) {
          console.log(`Skipping empty row ${index + 8}:`, row); // Row number adjusted for B7 start
          return null;
        }

        // Check STATUS_2 (column P, index 14 since B=0)
        const status = row[14] ? row[14].trim().toUpperCase() : '';
        if (status === 'APPROVED') {
          console.log(`Skipping row ${index + 8} with STATUS_2=APPROVED:`, row);
          return null;
        }

        // Create object with headers, excluding STATUS_2
        const obj = {};
        headers.forEach((header, i) => {
          if (header === 'Action') {
            obj[header] = ''; // Empty string for frontend Action column
          } else if (header !== 'STATUS_2') {
            obj[header] = row[i] ? row[i].trim() : ''; // Trim and handle missing values
          }
        });
        return obj;
      })
      .filter((obj) => obj !== null);

    console.log('Form data after filtering APPROVED rows:', formData);

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

    console.log('Final form data:', finalFormData);

    if (!finalFormData.length) {
      console.log('No valid data found after filtering');
      return res.status(404).json({ error: 'No valid data found starting from row 2' });
    }

    return res.json({ data: finalFormData });
  } catch (error) {
    console.error('Error fetching data:', error.message);
    return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});


// router.get('/get-approve-Requied', async (req, res) => {
//   try {
//     const range = 'Purchase_FMS!B7:Z'; // Extended range to include potential ACTUAL_2 column
//     console.log(`Fetching data from sheet: ${spreadsheetId}, range: ${range}`);

//     // Fetch data from Google Sheets
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: process.env.SPREADSHEET_ID || spreadsheetId,
//       range,
//     });

//     const rows = response.data.values || [];
//     console.log('Raw rows fetched:', JSON.stringify(rows, null, 2));

//     if (!rows.length) {
//       console.log('No data found in the sheet');
//       return res.status(404).json({ error: 'No data found in the sheet' });
//     }

//     // Define fallback headers
//     const fallbackHeaders = [
//       'Req_No',
//       'Site_Name',
//       'Supervisor_Name',
//       'Material_Type',
//       'SKU_Code',
//       'Material_Name',
//       'Quantity',
//       'Unit_Name',
//       'Purpose',
//       'Require_Date',
//       'PLANNED_2',
//       'Remark',
//       'Action',
//       'STATUS_2',
//       'ACTUAL_2', // Added ACTUAL_2 to fallback headers
//     ];

//     // Get headers from row 1 (index 0), with fallback
//     let headers = rows[0] || [];
//     console.log('Headers from row 1:', headers);
//     if (!headers.length || headers.some((h) => !h || h.trim() === '')) {
//       console.log('Using fallback headers:', fallbackHeaders);
//       headers = fallbackHeaders;
//     } else {
//       headers = headers.map((header) => header.trim().replace(/\s+/g, '_'));
//       console.log('Normalized headers:', headers);
//     }

//     // Find PLANNED_2 and ACTUAL_2 column indices
//     const plannedIndex = headers.indexOf('PLANNED_2');
//     const actualIndex = headers.indexOf('ACTUAL_2');
//     if (plannedIndex === -1) {
//       console.log('PLANNED_2 column not found in headers');
//       return res.status(400).json({ error: 'PLANNED_2 column not found in sheet' });
//     }
//     if (actualIndex === -1) {
//       console.log('ACTUAL_2 column not found in headers');
//       return res.status(400).json({ error: 'ACTUAL_2 column not found in sheet' });
//     }

//     // Process data rows (skip header row)
//     const dataRows = rows.slice(1);
//     console.log('Data rows (from row 2):', dataRows);

//     if (!dataRows.length) {
//       console.log('No data rows found starting from row 2');
//       return res.status(404).json({ error: 'No data found starting from row 2' });
//     }

//     // Map data rows to objects, filtering based on PLANNED_2 and ACTUAL_2
//     const formData = dataRows
//       .map((row, index) => {
//         // Skip completely empty rows
//         if (!row || row.every((cell) => !cell || cell.trim() === '')) {
//           console.log(`Skipping empty row ${index + 8}:`, row);
//           return null;
//         }

//         // Check row length to avoid undefined errors
//         if (row.length <= plannedIndex || row.length <= actualIndex) {
//           console.log(`Row ${index + 8} is too short, missing PLANNED_2 or ACTUAL_2:`, row);
//           return null;
//         }

//         // Check PLANNED_2 (must have data)
//         const plannedValue = row[plannedIndex] ? row[plannedIndex].trim() : '';
//         if (!plannedValue) {
//           console.log(`Skipping row ${index + 8} with empty PLANNED_2:`, row);
//           return null;
//         }

//         // Check ACTUAL_2 (must be empty)
//         const actualValue = row[actualIndex] ? row[actualIndex].trim() : '';
//         if (actualValue) {
//           console.log(`Skipping row ${index + 8} with non-empty ACTUAL_2:`, row);
//           return null;
//         }

//         // Create object with headers, excluding ACTUAL_2 and STATUS_2
//         const obj = {};
//         headers.forEach((header, i) => {
//           if (header === 'Action') {
//             obj[header] = ''; // Empty string for frontend Action column
//           } else if (!['ACTUAL_2', 'STATUS_2'].includes(header)) {
//             obj[header] = row[i] ? row[i].trim() : ''; // Include PLANNED_2 in output
//           }
//         });
//         return obj;
//       })
//       .filter((obj) => obj !== null);

//     console.log('Form data after filtering:', formData);

//     // Filter out rows where all values (except Action) are empty
//     const finalFormData = formData.filter((obj, index) => {
//       const hasData = Object.entries(obj).some(
//         ([key, value]) => key !== 'Action' && value !== ''
//       );
//       if (!hasData) {
//         console.log(`Filtered out row ${index + 8} (all values empty except Action):`, obj);
//       }
//       return hasData;
//     });

//     console.log('Final form data:', finalFormData);

//     if (!finalFormData.length) {
//       console.log('No valid data found after filtering');
//       return res.status(404).json({ error: 'No valid data found starting from row 2' });
//     }

//     return res.json({ data: finalFormData });
//   } catch (error) {
//     console.error('Error fetching data:', error.message, error.stack);
//     return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
//   }
// });

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