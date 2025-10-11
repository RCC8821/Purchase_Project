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

    // Find ACTUAL_4 and PLANNED_4 column indices dynamically
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

        // Check if ACTUAL_4 is empty and PLANNED_4 is non-empty
        const actual4 = row[actual4Index]?.trim() || '';
        const planned4 = row[planned4Index]?.trim() || '';
        console.log(
          `Row ${index + 8} - ACTUAL_4: "${actual4}", PLANNED_4: "${planned4}", Full row: ${JSON.stringify(row)}`
        );

        if (actual4 || !planned4) {
          console.log(
            `Skipping row ${index + 8} - Reason: ${actual4 ? `Non-empty ACTUAL_4="${actual4}"` : ''}${
              actual4 && !planned4 ? ' and ' : ''
            }${!planned4 ? `Empty PLANNED_4="${planned4}"` : ''}`
          );
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

    console.log(`Rows with ACTUAL_4 empty and PLANNED_4 non-empty: ${validRowCount}`);
    console.log('Final formData:', JSON.stringify(formData, null, 2));

    if (!formData.length) {
      console.log('No valid data found after filtering');
      return res.status(404).json({
        error: 'No valid data found after filtering',
        details: validRowCount === 0
          ? 'No rows have ACTUAL_4 empty and PLANNED_4 non-empty in columns AC and AB'
          : 'All rows with ACTUAL_4 empty and PLANNED_4 non-empty are empty in other columns',
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

  console.log('Received payload:', JSON.stringify(req.body, null, 2));

  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    console.log('Validation failed - entries:', entries);
    return res.status(400).json({ error: 'Entries array is required and must not be empty' });
  }

  // Validate UID, REVISED_QUANTITY_2, Indent_No, and Final_Rate in each entry
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
    if (!entry.Indent_No || typeof entry.Indent_No !== 'string') {
      console.log(`Invalid Indent_No in entry ${i + 1}:`, entry.Indent_No);
      return res.status(400).json({ error: `Invalid or missing Indent_No in entry ${i + 1}` });
    }
    if (!entry.Final_Rate || isNaN(parseFloat(entry.Final_Rate))) {
      console.log(`Invalid or missing Final_Rate in entry ${i + 1}:`, entry.Final_Rate);
      return res.status(400).json({ error: `Invalid or missing Final_Rate in entry ${i + 1}` });
    }
  }

  try {
    // Get sheet metadata for both sheets
    const sheetMetadata = await sheets.spreadsheets.get({
      spreadsheetId,
      ranges: ['Quotation_Master', 'Purchase_FMS'],
      fields: 'sheets(properties(sheetId,gridProperties,title))',
    });

    const quotationMasterSheet = sheetMetadata.data.sheets?.find(
      sheet => sheet.properties?.title === 'Quotation_Master'
    );
    const purchaseFMSSheet = sheetMetadata.data.sheets?.find(
      sheet => sheet.properties?.title === 'Purchase_FMS'
    );

    if (!quotationMasterSheet) {
      console.error('Quotation_Master sheet not found in spreadsheet');
      return res.status(400).json({ error: 'Quotation_Master sheet not found in spreadsheet' });
    }
    if (!purchaseFMSSheet) {
      console.error('Purchase_FMS sheet not found in spreadsheet');
      return res.status(400).json({ error: 'Purchase_FMS sheet not found in spreadsheet' });
    }

    const quotationSheetProperties = quotationMasterSheet.properties;
    const purchaseSheetProperties = purchaseFMSSheet.properties;
    let maxRowsQuotation = quotationSheetProperties.gridProperties.rowCount;
    let maxRowsPurchase = purchaseSheetProperties.gridProperties.rowCount;
    console.log('Current max rows in Quotation_Master:', maxRowsQuotation);
    console.log('Current max rows in Purchase_FMS:', maxRowsPurchase);

    // Fetch headers from Quotation_Master
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Quotation_Master!A1:AE1',
    });

    const headers = headerResponse.data.values ? headerResponse.data.values[0] || [] : [];
    console.log('Fetched Quotation_Master headers:', headers);

    // Find existing quotation numbers in column AC (Quotation_No)
    const dataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Quotation_Master!AC2:AC',
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

    // Update headers for Quotation_Master
    const headerUpdates = [];
    if (!headers[28]) {
      headerUpdates.push({
        range: 'Quotation_Master!AC1',
        values: [['Quotation_No']],
      });
    }
    if (!headers[29]) {
      headerUpdates.push({
        range: 'Quotation_Master!AD1',
        values: [['Total_Quantity']],
      });
    }
    if (!headers[30]) {
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
      console.log('Updated Quotation_Master headers:', headerUpdates.map(update => update.range));
    }

    // Function to convert column index to letter
    function getColumnLetter(index) {
      let column = '';
      let num = index + 1; // 1-based
      while (num > 0) {
        const mod = (num - 1) % 26;
        column = String.fromCharCode(65 + mod) + column;
        num = Math.floor((num - 1) / 26);
      }
      return column;
    }

    // Fetch headers from Purchase_FMS
    const purchaseHeaderResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!A7:AF7',
    });

    const purchaseHeaders = purchaseHeaderResponse.data.values ? purchaseHeaderResponse.data.values[0] || [] : [];
    console.log('Fetched Purchase_FMS headers:', purchaseHeaders);

    // Find column indices
    const uidColumnIndex = purchaseHeaders.findIndex(header => header && header.toLowerCase().trim() === 'uid');
    if (uidColumnIndex === -1) {
      console.error('UID column not found in Purchase_FMS');
      return res.status(400).json({ error: 'UID column not found in Purchase_FMS' });
    }

    const indentColumnIndex = purchaseHeaders.findIndex(header => header && header.trim() === 'INDENT NUMBER 3');
    if (indentColumnIndex === -1) {
      console.error('INDENT NUMBER 3 column not found in Purchase_FMS');
      return res.status(400).json({ error: 'INDENT NUMBER 3 column not found in Purchase_FMS' });
    }

    const status4ColumnIndex = purchaseHeaders.findIndex(header => header && header.trim() === 'STATUS 4');
    if (status4ColumnIndex === -1) {
      console.error('STATUS 4 column not found in Purchase_FMS');
      return res.status(400).json({ error: 'STATUS 4 column not found in Purchase_FMS' });
    }

    const noOfQuotationColumnIndex = purchaseHeaders.findIndex(header => header && header.trim() === 'No. Of Quotation 4');
    if (noOfQuotationColumnIndex === -1) {
      console.error('No. Of Quotation 4 column not found in Purchase_FMS');
      return res.status(400).json({ error: 'No. Of Quotation 4 column not found in Purchase_FMS' });
    }

    console.log(`UID at column ${getColumnLetter(uidColumnIndex)} (index ${uidColumnIndex})`);
    console.log(`INDENT NUMBER 3 at column ${getColumnLetter(indentColumnIndex)} (index ${indentColumnIndex})`);
    console.log(`STATUS 4 at column ${getColumnLetter(status4ColumnIndex)} (index ${status4ColumnIndex})`);
    console.log(`No. Of Quotation 4 at column ${getColumnLetter(noOfQuotationColumnIndex)} (index ${noOfQuotationColumnIndex})`);

    // Fetch Purchase_FMS data
    const purchaseResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!A8:AF',
    });

    const purchaseRows = purchaseResponse.data.values || [];
    console.log('Fetched Purchase_FMS rows (first 5 for brevity):', purchaseRows.slice(0, 5));

    // Create UID to row map, accounting for data starting at row 8
    const uidToRowMap = new Map();
    purchaseRows.forEach((row, i) => {
      const uid = row[uidColumnIndex];
      if (uid) {
        uidToRowMap.set(uid, i + 8); // Data starts at row 8
      }
    });
    console.log('UID to row map:', Object.fromEntries(uidToRowMap));

    // Validate all entries: same Indent_No, UID exists, and matches Indent_No in row
    const indentNo = entries[0].Indent_No;
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (entry.Indent_No !== indentNo) {
        return res.status(400).json({ error: `All entries must have the same Indent_No (${indentNo})` });
      }
      const rowNumber = uidToRowMap.get(entry.UID);
      if (!rowNumber) {
        return res.status(400).json({ error: `UID ${entry.UID} not found in Purchase_FMS` });
      }
      const rowIndex = rowNumber - 8; // Adjust for data starting at row 8
      const row = purchaseRows[rowIndex];
      if (!row || row[indentColumnIndex] !== indentNo) {
        return res.status(400).json({ error: `UID ${entry.UID} does not match Indent_No ${indentNo} in Purchase_FMS` });
      }
    }

    // Proceed with Quotation_Master updates
    const rowsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Quotation_Master!A2:AE',
    });

    const rows = rowsResponse.data.values || [];
    let nextRow = 2 + rows.length;

    const rowsNeeded = nextRow + entries.length - 1;
    if (rowsNeeded > maxRowsQuotation) {
      const additionalRows = rowsNeeded - maxRowsQuotation + 100;
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            appendDimension: {
              sheetId: quotationSheetProperties.sheetId,
              dimension: 'ROWS',
              length: additionalRows,
            },
          }],
        },
      });
      maxRowsQuotation += additionalRows;
      console.log(`Extended Quotation_Master by ${additionalRows} rows. New max rows: ${maxRowsQuotation}`);
    }

    const updateData = [];
    entries.forEach((entry, index) => {
      const revisedQuantity = parseFloat(entry.REVISED_QUANTITY_2);
      const finalRate = parseFloat(entry.Final_Rate);
      const totalValue = (revisedQuantity * finalRate).toFixed(2);

      if (isNaN(revisedQuantity) || isNaN(finalRate) || parseFloat(totalValue) <= 0) {
        return res.status(400).json({
          error: `Invalid data in entry ${index + 1}`,
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
      const year = parts.find(p => p.type === "year").value;
      const month = parts.find(p => p.type === "month").value;
      const day = parts.find(p => p.type === "day").value;
      const hour = parts.find(p => p.type === "hour").value;
      const minute = parts.find(p => p.type === "minute").value;
      const second = parts.find(p => p.type === "second").value;
      const timestamp = `${day}/${month}/${year} ${hour}:${minute}:${second}`;

      const rowData = [
        timestamp,
        entry.Req_No || '',
        entry.UID,
        entry.site_name || '',
        entry.Indent_No,
        entry.Material_name || '',
        entry.Vendor_Name || '',
        entry.Vendor_Ferm_Name || '',
        entry.Vendor_Address || '',
        entry.Contact_Number || '',
        entry.Vendor_GST_No || '',
        parseFloat(entry.RATE) || 0,
        parseFloat(entry.Discount) || 0,
        parseFloat(entry.CGST) || 0,
        parseFloat(entry.SGST) || 0,
        parseFloat(entry.IGST) || 0,
        finalRate,
        entry.Delivery_Expected_Date || '',
        entry.Payment_Terms_Condistion_Advacne_Credit || '',
        parseInt(entry.Credit_in_Days) || 0,
        entry.Bill_Type || '',
        entry.IS_TRANSPORT_REQUIRED || '',
        parseFloat(entry.EXPECTED_TRANSPORT_CHARGES) || 0,
        parseFloat(entry.FRIGHET_CHARGES) || 0,
        parseFloat(entry.EXPECTED_FRIGHET_CHARGES) || 0,
        entry.PLANNED_4 || '',
        entry.NO_OF_QUOTATION_4 || '',
        entry.REMARK_4 || '',
        newQuoNumber,
        revisedQuantity.toFixed(2),
        totalValue,
      ];

      const updateRange = `Quotation_Master!A${nextRow}:AE${nextRow}`;
      updateData.push({
        range: updateRange,
        values: [rowData],
      });

      nextRow++;
    });

    if (updateData.length === 0) {
      return res.status(400).json({ error: 'No valid entries to save' });
    }

    const batchUpdateRequest = {
      spreadsheetId,
      resource: {
        valueInputOption: 'RAW',
        data: updateData,
      },
    };

    const updateResponse = await sheets.spreadsheets.values.batchUpdate(batchUpdateRequest);
    console.log('Quotation_Master updated:', JSON.stringify(updateResponse.data, null, 2));

    // Update Purchase_FMS: STATUS 4 to 'Done' and No. Of Quotation 4 to frontend value, per UID
    const purchaseUpdates = [];
    const statusCol = getColumnLetter(status4ColumnIndex);
    const noQuotCol = getColumnLetter(noOfQuotationColumnIndex);

    entries.forEach((entry) => {
      const rowNumber = uidToRowMap.get(entry.UID);
      if (rowNumber) {
        console.log(`Updating row ${rowNumber} for UID ${entry.UID}: STATUS 4 to 'Done', No. Of Quotation 4 to '${entry.NO_OF_QUOTATION_4 || ''}'`);
        // Update STATUS 4 to 'Done'
        purchaseUpdates.push({
          range: `Purchase_FMS!${statusCol}${rowNumber}`,
          values: [['Done']],
        });
        // Update No. Of Quotation 4
        purchaseUpdates.push({
          range: `Purchase_FMS!${noQuotCol}${rowNumber}`,
          values: [[entry.NO_OF_QUOTATION_4 || '']],
        });
      } else {
        console.warn(`No row found in Purchase_FMS for UID: ${entry.UID}`);
      }
    });

    // Check if Purchase_FMS has enough rows
    let maxRowNeededPurchase = maxRowsPurchase;
    if (purchaseUpdates.length > 0) {
      maxRowNeededPurchase = Math.max(
        ...Array.from(uidToRowMap.values()),
        ...purchaseUpdates.map(u => parseInt(u.range.match(/\d+$/)[0]) || 0)
      );
    }
    if (maxRowNeededPurchase > maxRowsPurchase) {
      const additionalRows = maxRowNeededPurchase - maxRowsPurchase + 100;
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            appendDimension: {
              sheetId: purchaseSheetProperties.sheetId,
              dimension: 'ROWS',
              length: additionalRows,
            },
          }],
        },
      });
      maxRowsPurchase += additionalRows;
      console.log(`Extended Purchase_FMS by ${additionalRows} rows. New max rows: ${maxRowsPurchase}`);
    }

    if (purchaseUpdates.length > 0) {
      console.log('Purchase_FMS updates:', JSON.stringify(purchaseUpdates, null, 2));
      const purchaseBatchUpdateRequest = {
        spreadsheetId,
        resource: {
          valueInputOption: 'RAW',
          data: purchaseUpdates,
        },
      };
      const purchaseUpdateResponse = await sheets.spreadsheets.values.batchUpdate(purchaseBatchUpdateRequest);
      console.log('Purchase_FMS batch update response:', JSON.stringify(purchaseUpdateResponse.data, null, 2));
      if (purchaseUpdateResponse.data.totalUpdatedCells === 0) {
        console.error('No cells updated in Purchase_FMS despite successful API call');
      }
    } else {
      console.warn('No updates prepared for Purchase_FMS');
    }

    return res.json({
      message: 'Data appended to Google Sheet successfully',
      quotationNumber: newQuoNumber,
      totalQuantity: entries.reduce((sum, e) => sum + parseFloat(e.REVISED_QUANTITY_2 || 0), 0),
      totalValue: entries.reduce((sum, e) => sum + (parseFloat(e.REVISED_QUANTITY_2 || 0) * parseFloat(e.Final_Rate || 0)), 0).toFixed(2)
    });
  } catch (error) {
    console.error('Error:', error.message, error.stack);
    return res.status(500).json({
      error: 'Server error',
      details: error.message,
    });
  }
});

module.exports = router;