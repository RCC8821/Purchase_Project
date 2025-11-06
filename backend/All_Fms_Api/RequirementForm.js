
// const express = require('express');
// const { sheets, spreadsheetId } = require('../config/googleSheet');

// const router = express.Router();

// // GET endpoint to fetch dropdown data (unchanged)
// router.get('/dropdowns', async (req, res) => {
//   try {
//     const ranges = [
//       'Sheet1!A2:A', // Site Names
//       'Sheet1!B2:B', // Supervisor Names
//       'Sheet1!C2:C', // Material Types
//       'Sheet1!D2:D', // Material Names
//       'Sheet1!E2:E', // Units
//       'Sheet1!F2:F', // SKU Code
//       'Sheet1!J2:J', // SKU Code
//     ];

//     const response = await sheets.spreadsheets.values.batchGet({
//       spreadsheetId,
//       ranges,
//     });

//     const [siteNames, supervisorNames, materialTypes, materialNames, units, skuCodes] = response.data.valueRanges.map(
//       (range) => range.values?.flat() || []
//     );

//     res.json({
//       siteNames: siteNames || [],
//       supervisorNames: supervisorNames || [],
//       materialTypes: materialTypes || [],
//       materialNames: materialNames || [],
//       units: units || [],
//       skuCodes: skuCodes || [],
//     });
//   } catch (error) {
//     console.error('Error fetching Google Sheet data:', error);
//     res.status(500).json({ error: 'Failed to fetch dropdown data' });
//   }
// });

// // Helper function to get the next sequential req_no (based on max value in Column C)
// async function getNextReqNo() {
//   try {
//     // Fetch existing req_no values from Column C (ReactFormData!C2:C)
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'ReactFormData!C2:C', // Start from C2 to skip header
//     });

//     const reqNos = response.data.values ? response.data.values.flat() : [];
    
//     // Extract numeric parts from req_no (e.g., "req_01" -> 1)
//     const numbers = reqNos
//       .map((reqNo) => {
//         const match = reqNo.match(/^req_(\d+)$/);
//         return match ? parseInt(match[1], 10) : null;
//       })
//       .filter((num) => num !== null);

//     // Use the maximum number + 1, or start with 1 if no req_no exists
//     const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

//     // Generate the next req_no
//     return `req_${String(nextNumber).padStart(2, '0')}`;
//   } catch (error) {
//     console.error('Error fetching existing req_no values:', error);
//     throw new Error('Failed to generate req_no');
//   }
// }

// // Helper function to get the next available UIDs by filling gaps
// async function getNextUIDs(count) {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'ReactFormData!B2:B', // Fetch UIDs starting from M2 to skip header
//     });
//     const uids = response.data.values ? response.data.values.flat().map(Number).filter(num => !isNaN(num)) : [];
    
//     // Get unique sorted UIDs
//     const existing = new Set(uids);
    
//     let nextUIDs = [];
//     let current = 1;
    
//     while (nextUIDs.length < count) {
//       if (!existing.has(current)) {
//         nextUIDs.push(current);
//       }
//       current++;
//     }
    
//     return nextUIDs;
//   } catch (error) {
//     console.error('Error fetching existing UID values:', error);
//     throw new Error('Failed to generate UIDs');
//   }
// }

// // Helper function to flatten submission data for Google Sheet
// async function flattenDataForSheet(submissionData) {
//   const { siteName, supervisorName, remark, items } = submissionData;

//   // Validate required top-level fields
//   if (!siteName || !supervisorName) {
//     throw new Error('Site Name and Supervisor Name are required');
//   }

//   // Validate items array
//   if (!Array.isArray(items) || items.length === 0) {
//     throw new Error('Items array is missing or empty');
//   }

//   // Get the next sequential req_no
//   const reqNumber = await getNextReqNo();

//   // Get the next available UIDs (filling gaps)
//   const uids = await getNextUIDs(items.length);

//   // Flatten each item into a row
//   const flattenedRows = items.map((item, index) => {
//     if (
//       !item.materialType ||
//       !item.materialName ||
//       !item.quantity ||
//       !item.units ||
//       !item.reqDays ||
//       !item.reason ||
//       !item.skuCode
//     ) {
//       throw new Error(`Missing required fields in Item ${index + 1}`);
//     }

//     const now = new Date();
//     const istOptions = {
//       timeZone: 'Asia/Kolkata',
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//       hour12: false,
//     };
//     const istFormatter = new Intl.DateTimeFormat('en-IN', istOptions);
//     const parts = istFormatter.formatToParts(now);

//     const year = parts.find((p) => p.type === 'year').value;
//     const month = parts.find((p) => p.type === 'month').value;
//     const day = parts.find((p) => p.type === 'day').value;
//     const hour = parts.find((p) => p.type === 'hour').value;
//     const minute = parts.find((p) => p.type === 'minute').value;
//     const second = parts.find((p) => p.type === 'second').value;

//     const timestamp = `${day}/${month}/${year} ${hour}:${minute}:${second}`;
//     const uid = uids[index]; // Assign unique UID for each item

//     return [
//       timestamp, // Column L: Timestamp
//       uid, // Column M: UID
//       reqNumber, // Column C: Req No
//       siteName, // Column A: Site Name
//       supervisorName, // Column B: Supervisor Name
//       item.materialType, // Column D: Material Type
//       item.skuCode, // Column F: SKU Code
//       item.materialName, // Column E: Material Name
//       item.quantity, // Column G: Quantity
//       item.units, // Column H: Units
//       item.reason, // Column I: Reason
//       item.reqDays, // Column K: Required Days
//       remark || '', // Column J: Remark
      
//     ];
//   });

//   return flattenedRows;
// }

// // POST endpoint to submit requirement
// router.post('/submit-requirement', async (req, res) => {
//   try {
//     const submissionData = req.body;

//     // Validate basic fields
//     if (!submissionData || !submissionData.siteName || !submissionData.supervisorName) {
//       return res.status(400).json({ error: 'Missing required fields: siteName or supervisorName' });
//     }

//     // Validate and flatten data
//     const values = await flattenDataForSheet(submissionData);

//     // Append to Google Sheet
//     const response = await sheets.spreadsheets.values.append({
//       spreadsheetId,
//       range: 'ReactFormData!A:M',
//       valueInputOption: 'USER_ENTERED',
//       resource: {
//         values,
//       },
//     });

//     console.log('Data appended to sheet:', response.data);
//     res.status(200).json({ message: 'Data submitted to Google Sheets successfully!', updates: response.data.updates });
//   } catch (error) {
//     console.error('Error submitting to Sheets:', error);
//     res.status(500).json({ error: 'Failed to submit data: ' + error.message });
//   }
// });

// module.exports = router;




const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');

const router = express.Router();

// GET: Fetch all dropdown data including Remarks from Sheet1!J2:J
router.get('/dropdowns', async (req, res) => {
  try {
    const ranges = [
      'Sheet1!A2:A', // Site Names
      'Sheet1!B2:B', // Supervisor Names
      'Sheet1!C2:C', // Material Types
      'Sheet1!D2:D', // Material Names
      'Sheet1!E2:E', // Units
      'Sheet1!F2:F', // SKU Codes
      'Sheet1!J2:J', // Remarks (New)
    ];

    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
    });

    const [
      siteNames = [],
      supervisorNames = [],
      materialTypes = [],
      materialNames = [],
      units = [],
      skuCodes = [],
      remarks = [],
    ] = response.data.valueRanges.map(range => range.values?.flat() || []);

    // Remove duplicates
    const uniqueSiteNames = [...new Set(siteNames.filter(Boolean))];
    const uniqueSupervisorNames = [...new Set(supervisorNames.filter(Boolean))];
    const uniqueMaterialTypes = [...new Set(materialTypes.filter(Boolean))];
    const uniqueRemarks = [...new Set(remarks.filter(Boolean))];

    // Build materialMap: type → [materialNames]
    const materialMap = {};
    materialTypes.forEach((type, i) => {
      const normType = type.toLowerCase();
      if (!materialMap[normType]) materialMap[normType] = [];
      const name = materialNames[i];
      if (name && !materialMap[normType].includes(name)) {
        materialMap[normType].push(name);
      }
    });

    // Build unitMap: materialName → { unit, skuCode }
    const unitMap = {};
    materialNames.forEach((name, i) => {
      if (name && units[i]) {
        unitMap[name.toLowerCase()] = {
          unit: units[i],
          skuCode: skuCodes[i] || '',
        };
      }
    });

    res.json({
      siteNames: uniqueSiteNames,
      supervisorNames: uniqueSupervisorNames,
      materialTypes: uniqueMaterialTypes,
      materialNames: materialNames.filter(Boolean),
      units: units.filter(Boolean),
      skuCodes: skuCodes.filter(Boolean),
      remarks: uniqueRemarks, // Sent to frontend
      materialMap,
      unitMap,
    });
  } catch (error) {
    console.error('Error fetching dropdowns:', error);
    res.status(500).json({ error: 'Failed to load dropdown data' });
  }
});

// Helper: Get next req_no (req_01, req_02...)
async function getNextReqNo() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'ReactFormData!C2:C',
    });
    const reqNos = response.data.values?.flat() || [];
    const numbers = reqNos
      .map(no => no.match(/^req_(\d+)$/)?.[1])
      .filter(Boolean)
      .map(Number);
    const next = numbers.length ? Math.max(...numbers) + 1 : 1;
    return `req_${String(next).padStart(2, '0')}`;
  } catch (err) {
    throw new Error('Failed to generate req_no');
  }
}

// Helper: Get next available UIDs (fill gaps)
async function getNextUIDs(count) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'ReactFormData!B2:B',
    });
    const existing = new Set(
      response.data.values?.flat().map(Number).filter(n => !isNaN(n)) || []
    );
    const uids = [];
    let uid = 1;
    while (uids.length < count) {
      if (!existing.has(uid)) uids.push(uid);
      uid++;
    }
    return uids;
  } catch (err) {
    throw new Error('Failed to generate UIDs');
  }
}

// Helper: Flatten form data for sheet
async function flattenDataForSheet(data) {
  const { siteName, supervisorName, remark, items } = data;

  if (!siteName || !supervisorName) throw new Error('Site & Supervisor required');
  if (!Array.isArray(items) || items.length === 0) throw new Error('No items');

  const reqNo = await getNextReqNo();
  const uids = await getNextUIDs(items.length);

  const now = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).replace(',', '');

  return items.map((item, i) => {
    if (!item.materialType || !item.materialName || !item.quantity ||
        !item.units || !item.reqDays || !item.reason || !item.skuCode) {
      throw new Error(`Item ${i + 1} incomplete`);
    }
    return [
      now,                    // L: Timestamp
      uids[i],                // B: UID
      reqNo,                  // C: Req No
      siteName,               // A: Site
      supervisorName,         // D: Supervisor
      item.materialType,      // E: Material Type
      item.skuCode,           // F: SKU Code
      item.materialName,      // G: Material Name
      item.quantity,          // H: Quantity
      item.units,             // I: Units
      item.reason,            // K: Reason
      item.reqDays,           // M: Req Days
      remark || '',           // J: Remark (from dropdown)
    ];
  });
}

// POST: Submit requirement
router.post('/submit-requirement', async (req, res) => {
  try {
    const values = await flattenDataForSheet(req.body);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'ReactFormData!A:M',
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });

    res.json({ message: 'Requirement submitted successfully!' });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;