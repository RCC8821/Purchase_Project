
const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');

const router = express.Router();

// GET endpoint to fetch dropdown data (unchanged)
router.get('/dropdowns', async (req, res) => {
  try {
    const ranges = [
      'Sheet1!A2:A', // Site Names
      'Sheet1!B2:B', // Supervisor Names
      'Sheet1!C2:C', // Material Types
      'Sheet1!D2:D', // Material Names
      'Sheet1!E2:E', // Units
      'Sheet1!F2:F', // SKU Code
    ];

    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
    });

    const [siteNames, supervisorNames, materialTypes, materialNames, units, skuCodes] = response.data.valueRanges.map(
      (range) => range.values?.flat() || []
    );

    res.json({
      siteNames: siteNames || [],
      supervisorNames: supervisorNames || [],
      materialTypes: materialTypes || [],
      materialNames: materialNames || [],
      units: units || [],
      skuCodes: skuCodes || [],
    });
  } catch (error) {
    console.error('Error fetching Google Sheet data:', error);
    res.status(500).json({ error: 'Failed to fetch dropdown data' });
  }
});

// Helper function to get the next sequential req_no (based on max value in Column C)
async function getNextReqNo() {
  try {
    // Fetch existing req_no values from Column C (ReactFormData!C2:C)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'ReactFormData!C2:C', // Start from C2 to skip header
    });

    const reqNos = response.data.values ? response.data.values.flat() : [];
    
    // Extract numeric parts from req_no (e.g., "req_01" -> 1)
    const numbers = reqNos
      .map((reqNo) => {
        const match = reqNo.match(/^req_(\d+)$/);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter((num) => num !== null);

    // Use the maximum number + 1, or start with 1 if no req_no exists
    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

    // Generate the next req_no
    return `req_${String(nextNumber).padStart(2, '0')}`;
  } catch (error) {
    console.error('Error fetching existing req_no values:', error);
    throw new Error('Failed to generate req_no');
  }
}

// Helper function to get the next available UIDs by filling gaps
async function getNextUIDs(count) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'ReactFormData!B2:B', // Fetch UIDs starting from M2 to skip header
    });
    const uids = response.data.values ? response.data.values.flat().map(Number).filter(num => !isNaN(num)) : [];
    
    // Get unique sorted UIDs
    const existing = new Set(uids);
    
    let nextUIDs = [];
    let current = 1;
    
    while (nextUIDs.length < count) {
      if (!existing.has(current)) {
        nextUIDs.push(current);
      }
      current++;
    }
    
    return nextUIDs;
  } catch (error) {
    console.error('Error fetching existing UID values:', error);
    throw new Error('Failed to generate UIDs');
  }
}

// Helper function to flatten submission data for Google Sheet
async function flattenDataForSheet(submissionData) {
  const { siteName, supervisorName, remark, items } = submissionData;

  // Validate required top-level fields
  if (!siteName || !supervisorName) {
    throw new Error('Site Name and Supervisor Name are required');
  }

  // Validate items array
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Items array is missing or empty');
  }

  // Get the next sequential req_no
  const reqNumber = await getNextReqNo();

  // Get the next available UIDs (filling gaps)
  const uids = await getNextUIDs(items.length);

  // Flatten each item into a row
  const flattenedRows = items.map((item, index) => {
    if (
      !item.materialType ||
      !item.materialName ||
      !item.quantity ||
      !item.units ||
      !item.reqDays ||
      !item.reason ||
      !item.skuCode
    ) {
      throw new Error(`Missing required fields in Item ${index + 1}`);
    }

    const now = new Date();
    const istOptions = {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    const istFormatter = new Intl.DateTimeFormat('en-IN', istOptions);
    const parts = istFormatter.formatToParts(now);

    const year = parts.find((p) => p.type === 'year').value;
    const month = parts.find((p) => p.type === 'month').value;
    const day = parts.find((p) => p.type === 'day').value;
    const hour = parts.find((p) => p.type === 'hour').value;
    const minute = parts.find((p) => p.type === 'minute').value;
    const second = parts.find((p) => p.type === 'second').value;

    const timestamp = `${day}/${month}/${year} ${hour}:${minute}:${second}`;
    const uid = uids[index]; // Assign unique UID for each item

    return [
      timestamp, // Column L: Timestamp
      uid, // Column M: UID
      reqNumber, // Column C: Req No
      siteName, // Column A: Site Name
      supervisorName, // Column B: Supervisor Name
      item.materialType, // Column D: Material Type
      item.skuCode, // Column F: SKU Code
      item.materialName, // Column E: Material Name
      item.quantity, // Column G: Quantity
      item.units, // Column H: Units
      item.reason, // Column I: Reason
      item.reqDays, // Column K: Required Days
      remark || '', // Column J: Remark
      
    ];
  });

  return flattenedRows;
}

// POST endpoint to submit requirement
router.post('/submit-requirement', async (req, res) => {
  try {
    const submissionData = req.body;

    // Validate basic fields
    if (!submissionData || !submissionData.siteName || !submissionData.supervisorName) {
      return res.status(400).json({ error: 'Missing required fields: siteName or supervisorName' });
    }

    // Validate and flatten data
    const values = await flattenDataForSheet(submissionData);

    // Append to Google Sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'ReactFormData!A:M',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values,
      },
    });

    console.log('Data appended to sheet:', response.data);
    res.status(200).json({ message: 'Data submitted to Google Sheets successfully!', updates: response.data.updates });
  } catch (error) {
    console.error('Error submitting to Sheets:', error);
    res.status(500).json({ error: 'Failed to submit data: ' + error.message });
  }
});

module.exports = router;