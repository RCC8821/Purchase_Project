const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');

const router = express.Router();

// GET endpoint to fetch dropdown data
router.get('/dropdowns', async (req, res) => {
  try {
    // Fetch data from specific ranges in the Google Sheet
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

    // Return the data
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

// Helper function to flatten submission data for Google Sheet
let globalCounter = 0; // Static counter to track total items across calls

function flattenDataForSheet(submissionData) {
  const { siteName, supervisorName, remark, items } = submissionData;

  // Validate required top-level fields
  if (!siteName || !supervisorName) {
    throw new Error('Site Name and Supervisor Name are required');
  }

  // Validate items array
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Items array is missing or empty');
  }

  // Flatten each item into a row
  const flattenedRows = items.map((item, index) => {
    if (
      !item.materialType ||
      !item.materialName ||
      !item.quantity ||
      !item.units ||
      !item.reqDays ||
      !item.reason ||
      !item.skuCode // Validate skuCode
    ) {
      throw new Error(`Missing required fields in Item ${index + 1}`);
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
    globalCounter += 1; // Increment global counter for each item
    const uid = globalCounter; // Use global counter for UID
    const reqNumber = `req_${String(globalCounter).padStart(2, '0')}`; // Generate Req No based on global counter

    return [
      timestamp, // Column L: Timestamp
      uid, // Column M: UID
      reqNumber, // Column J: Item Identifier (req_01, req_02, etc.)
      siteName, // Column A: Site Name
      supervisorName, // Column B: Supervisor Name
      item.materialType, // Column D: Material Type
      item.skuCode, // Column F: SKU Code
      item.materialName, // Column E: Material Name
      item.quantity, // Column G: Quantity
      item.units, // Column H: Units
      item.reason, // Column I: Reason
      item.reqDays, // Column K: Required Days
      remark || '', // Column C: Remark
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
    const values = flattenDataForSheet(submissionData);

    // Append to Google Sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'ReactFormData!A:M', // Updated range to match column count
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