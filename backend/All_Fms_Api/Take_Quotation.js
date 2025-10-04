const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');
const router = express.Router();

//  Get vender sheet data for showing dropdown 
router.get('/vendors', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `Vendor_Master!A2:D`, // A2 se shuru (header skip), D column tak (tumhare data ke hisab se adjust)
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'No data found in sheet' });
    }

    // Rows ko structured data mein convert karo (Vendor Firm, GST Number, Contact No, Vendor Name)
    const vendorData = rows.map(row => ({
      vendorFirm: row[0] || '',
      gstNumber: row[1] || '',
      contactNo: row[2] || '',
      vendorName: row[3] || '',
    }));

    res.json(vendorData);
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    res.status(500).json({ error: 'Failed to fetch data from Google Sheet' });
  }
});



// GET: Fetch get-indent-data

router.get('/get-take-Quotation', async (req, res) => {
  try {
    const range = 'Purchase_FMS!B7:AD';
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
      { key: 'REVISED_QUANTITY_2', column: 15 }, // M
      { key: 'DECIDED_BRAND/COMPANY_NAME_2', column: 16 }, // N
      { key: 'INDENT_NUMBER_3', column: 23 }, // Y
      { key: 'PDF_URL_3', column: 24 }, // Z
      { key: 'REMARK_3', column: 25 }, // AA
      { key: 'PLANNED_4', column: 26 }, // AB
      { key: 'ACTUAL_4', column: 27 }, // AC
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

    // Find ACTUAL_4 column index dynamically
    const actual4Index = headers.find(h => h.key === 'ACTUAL_4')?.column;
    const planned4Index = headers.find(h => h.key === 'PLANNED_4')?.column;
    if (actual4Index === undefined || planned4Index === undefined) {
      console.error('Required columns not found in headers');
      return res.status(500).json({ error: 'Invalid sheet structure', details: 'ACTUAL_4 or PLANNED_4 column missing' });
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

        // Check if ACTUAL_4 is empty
        const actual4 = row[actual4Index]?.trim() || '';
        const planned4 = row[planned4Index]?.trim() || '';
        console.log(
          `Row ${index + 8} - ACTUAL_4: "${actual4}", PLANNED_4: "${planned4}", Full row: ${JSON.stringify(row)}`
        );

        if (actual4) {
          console.log(`Skipping row ${index + 8} with non-empty ACTUAL_4="${actual4}"`);
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

    console.log(`Rows with ACTUAL_4 empty: ${validRowCount}`);
    console.log('Final formData:', JSON.stringify(formData, null, 2));

    if (!formData.length) {
      console.log('No valid data found after filtering');
      return res.status(404).json({
        error: 'No valid data found after filtering',
        details: validRowCount === 0
          ? 'All rows have ACTUAL_4 non-empty in column AC'
          : 'All rows with empty ACTUAL_4 are empty in other columns',
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

////////////////// ApproveRequied update Api Done //////////////////


router.post('/save-take-Quotation', async (req, res) => {
  const { entries } = req.body;

  console.log('Received payload:', req.body);

  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    console.log('Validation failed - entries:', entries);
    return res.status(400).json({ error: 'entries array is required and must not be empty' });
  }

  // Validate UID and REVISED_QUANTITY_2 in each entry
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!entry.UID || typeof entry.UID !== 'string') {
      console.log(`Invalid UID in entry ${i + 1}:`, entry.UID);
      return res.status(400).json({ error: `Invalid or missing UID in entry ${i + 1}` });
    }
    if (!entry.REVISED_QUANTITY_2 || isNaN(parseFloat(entry.REVISED_QUANTITY_2))) {
      console.log(`Invalid or missing REVISED_QUANTITY_2 in entry ${i + 1}:`, entry.REVISED_QUANTITY_2);
      return res.status(400).json({ error: `Invalid or missing REVISED_QUANTITY_2 in entry ${i + 1}` });
    }
  }

  try {
    // Get sheet metadata to check current row count
    const sheetMetadata = await sheets.spreadsheets.get({
      spreadsheetId,
      ranges: ['Quotation_Master'],
      fields: 'sheets(properties(sheetId,gridProperties,title))',
    });

    const quotationMasterSheet = sheetMetadata.data.sheets?.find(
      sheet => sheet.properties?.title === 'Quotation_Master'
    );

    if (!quotationMasterSheet) {
      console.error('Quotation_Master sheet not found in spreadsheet');
      return res.status(400).json({ error: 'Quotation_Master sheet not found in spreadsheet' });
    }

    const sheetProperties = quotationMasterSheet.properties;
    let maxRows = sheetProperties.gridProperties.rowCount;
    console.log('Current max rows in Quotation_Master:', maxRows);

    // Fetch headers from Quotation_Master
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Quotation_Master!A1:AE1', // Extended range to A:AE
    });

    const headers = headerResponse.data.values ? headerResponse.data.values[0] || [] : [];
    console.log('Fetched headers:', headers);

    // Find existing quotation numbers in column AC (Quotation_No)
    const dataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Quotation_Master!AC2:AC', // Fetch Quotation_No column
    });

    const quoValues = dataResponse.data.values ? dataResponse.data.values.map(row => row[0]).filter(val => val && val.startsWith('QUO_')) : [];
    let nextQuoNumber = 1;
    if (quoValues.length > 0) {
      const numbers = quoValues
        .map(val => parseInt(val.replace('QUO_', '')))
        .filter(num => !isNaN(num));
      nextQuoNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    }

    // Generate new quotation number (e.g., QUO_001)
    const newQuoNumber = `QUO_${nextQuoNumber.toString().padStart(3, '0')}`;
    console.log('Generated quotation number:', newQuoNumber);

    // Update headers for Quotation_No (AC1), Total_Quantity (AD1), and Total_Value (AE1) if not already set
    const headerUpdates = [];
    if (!headers[28]) { // AC is index 28 (0-based)
      headerUpdates.push({
        range: 'Quotation_Master!AC1',
        values: [['Quotation_No']],
      });
    }
    if (!headers[29]) { // AD is index 29
      headerUpdates.push({
        range: 'Quotation_Master!AD1',
        values: [['Total_Quantity']],
      });
    }
    if (!headers[30]) { // AE is index 30
      headerUpdates.push({
        range: 'Quotation_Master!AE1',
        values: [['Total_Value']],
      });
    }

    if (headerUpdates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        resource: {
          valueInputOption: 'RAW',
          data: headerUpdates,
        },
      });
      console.log('Updated headers:', headerUpdates.map(update => update.range));
    }

    // Fetch Purchase_FMS data to validate Indent_No
    const purchaseResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!A2:AA', // Extended to A:AA to include INDENT_NUMBER_3
    });

    const purchaseRows = purchaseResponse.data.values || [];
    console.log('Fetched Purchase_FMS rows:', purchaseRows);

    const indentNo = entries[0].Indent_No;
    console.log('Indent_No from request:', indentNo);

    const matchingPurchaseRows = purchaseRows.filter(row => row[24] === indentNo && row[24] !== 'INDENT NUMBER 3'); // Column Y (index 23)
    console.log('Matching Purchase_FMS rows for Indent_No:', matchingPurchaseRows);

    if (matchingPurchaseRows.length === 0) {
      const allIndentNos = purchaseRows.map(row => row[24]).filter(val => val && val !== 'INDENT NUMBER 3');
      console.warn(`No rows found in Purchase_FMS for Indent_No: ${indentNo}`);
      return res.status(400).json({
        error: `No data found in Purchase_FMS for Indent_No: ${indentNo}`,
        availableIndentNos: allIndentNos,
      });
    }

    // Fetch existing rows from Quotation_Master for data appending
    const rowsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Quotation_Master!A2:AE', // Extended range to A:AE
    });

    const rows = rowsResponse.data.values || [];
    console.log('Fetched Quotation_Master rows:', rows);

    let nextRow = 2 + rows.length; // Next available row

    // Check if nextRow exceeds maxRows and extend sheet if necessary
    const rowsNeeded = nextRow + entries.length - 1;
    if (rowsNeeded > maxRows) {
      const additionalRows = rowsNeeded - maxRows + 100; // Add buffer of 100 rows
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            appendDimension: {
              sheetId: sheetProperties.sheetId,
              dimension: 'ROWS',
              length: additionalRows,
            },
          }],
        },
      });
      maxRows += additionalRows;
      console.log(`Extended Quotation_Master by ${additionalRows} rows. New max rows: ${maxRows}`);
    }

    const updateData = [];
    entries.forEach((entry, index) => {
      console.log(`Entry ${index + 1} UID:`, entry.UID);

      // Calculate Total_Quantity and Total_Value for this entry
      const revisedQuantity = parseFloat(entry.REVISED_QUANTITY_2) || 0;
      const finalRate = parseFloat(entry.Final_Rate) || 0;
      const totalValue = (revisedQuantity * finalRate).toFixed(2);

      if (isNaN(revisedQuantity) || isNaN(finalRate) || totalValue <= 0) {
        console.warn(`Invalid data in entry ${index + 1}: REVISED_QUANTITY_2=${entry.REVISED_QUANTITY_2}, Final_Rate=${entry.Final_Rate}, Total_Value=${totalValue}`);
        return res.status(400).json({
          error: `Invalid data in entry ${index + 1}: REVISED_QUANTITY_2 or Final_Rate is invalid`,
        });
      }


          const now = new Date();
    const istOptions = {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const istFormatter = new Intl.DateTimeFormat("en-IN", istOptions);
    const parts = istFormatter.formatToParts(now);

    const year = parts.find((p) => p.type === "year").value;
    const month = parts.find((p) => p.type === "month").value;
    const day = parts.find((p) => p.type === "day").value;
    const hour = parts.find((p) => p.type === "hour").value;
    const minute = parts.find((p) => p.type === "minute").value;
    const second = parts.find((p) => p.type === "second").value;

    const timestamp = `${day}/${month}/${year} ${hour}:${minute}:${second}`;
      const rowData = [
        timestamp || '',
        entry.Req_No || '',
        entry.UID || 'N/A',
        entry.site_name || '',
        entry.Indent_No || '',
        entry.Material_name || '',
        entry.Vendor_Name || '',
        entry.Vendor_Ferm_Name || '',
        entry.Vendor_Address || '',
        entry.Contact_Number || '',
        entry.Vendor_GST_No || '',
        entry.RATE || 0,
        entry.Discount || 0,
        entry.CGST || 0,
        entry.SGST || 0,
        entry.IGST || 0,
        entry.Final_Rate || 0,
        entry.Delivery_Expected_Date || '',
        entry.Payment_Terms_Condistion_Advacne_Credit || '',
        entry.Credit_in_Days || 0,
        entry.Bill_Type || '',
        entry.IS_TRANSPORT_REQUIRED || '',
        entry.EXPECTED_TRANSPORT_CHARGES || 0,
        entry.FRIGHET_CHARGES || 0,
        entry.EXPECTED_FRIGHET_CHARGES || 0,
        entry.PLANNED_4 || '',
        entry.NO_OF_QUOTATION_4 || '',
        entry.REMARK_4 || '',
        newQuoNumber, // Quotation_No
        revisedQuantity.toFixed(2), // Total_Quantity = REVISED_QUANTITY_2
        totalValue, // Total_Value = REVISED_QUANTITY_2 * Final_Rate
      ];

      const updateRange = `Quotation_Master!A${nextRow}:AE${nextRow}`;
      updateData.push({
        range: updateRange,
        values: [rowData],
      });

      nextRow++;
    });

    // If any entry was invalid, updateData might be empty
    if (updateData.length === 0) {
      return res.status(400).json({ error: 'No valid entries to save' });
    }

    console.log('Update data:', updateData);

    const batchUpdateRequest = {
      spreadsheetId,
      resource: {
        valueInputOption: 'RAW',
        data: updateData,
      },
    };

    const updateResponse = await sheets.spreadsheets.values.batchUpdate(batchUpdateRequest);
    console.log('Batch update response:', updateResponse.data);

    // Update Purchase_FMS sheet with status, no of quotation, and remark
    const planned4 = entries[0].PLANNED_4;
    const noOfQuotation4 = entries[0].NO_OF_QUOTATION_4;
    const remark4 = entries[0].REMARK_4;

    const purchaseUpdates = [];
    purchaseRows.forEach((row, i) => {
      if (row[23] === indentNo && row[23] !== 'INDENT NUMBER 3') { // Column Y (index 23) is INDENT_NUMBER_3
        const rowNumber = i + 2;
        purchaseUpdates.push({
          range: `Purchase_FMS!Q${rowNumber}`, // Column Q for PLANNED_4
          values: [[planned4]],
        });
        purchaseUpdates.push({
          range: `Purchase_FMS!R${rowNumber}`, // Column R for NO_OF_QUOTATION_4
          values: [[noOfQuotation4]],
        });
        purchaseUpdates.push({
          range: `Purchase_FMS!S${rowNumber}`, // Column S for REMARK_4
          values: [[remark4]],
        });
      }
    });

    if (purchaseUpdates.length > 0) {
      const purchaseBatchUpdateRequest = {
        spreadsheetId,
        resource: {
          valueInputOption: 'RAW',
          data: purchaseUpdates,
        },
      };
      await sheets.spreadsheets.values.batchUpdate(purchaseBatchUpdateRequest);
      console.log('Purchase_FMS updated successfully');
    }

    return res.json({ 
      message: 'Data appended to Google Sheet successfully', 
      quotationNumber: newQuoNumber,
      totalQuantity: entries[0].REVISED_QUANTITY_2, // Return first entry's quantity for simplicity
      totalValue: (parseFloat(entries[0].REVISED_QUANTITY_2) * parseFloat(entries[0].Final_Rate)).toFixed(2) // Return first entry's total value
    });
  } catch (error) {
    console.error('Error appending to Google Sheet:', error.message, error.stack);
    return res.status(500).json({
      error: 'Server error',
      details: error.message,
    });
  }
});

module.exports = router;