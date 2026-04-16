

// const express = require('express');
// const { sheets, spreadsheetId } = require('../config/googleSheet');

// const router = express.Router();


// router.get('/dropdowns', async (req, res) => {
//   try {
//     const ranges = [
//       'Project_Data!D3:D', // Site Names         (column D)
//     //   'Project_Data!A3:A', // Supervisor Names   (column A)
//     //   'Project_Data!H3:H', // Material Types
//     //   'Project_Data!I3:I', // Material Names
//     //   'Project_Data!J3:J', // Units
//     //   'Project_Data!K3:K', // SKU Codes
//     //   'Project_Data!F3:F', // Remarks (New)
//     ];

//     const response = await sheets.spreadsheets.values.batchGet({
//       spreadsheetId,
//       ranges,
//     });

//     const [
//       siteNamesRaw     = [],
//     //   supervisorNamesRaw = [],
//     //   materialTypesRaw   = [],
//     //   materialNamesRaw   = [],
//     //   unitsRaw         = [],
//     //   skuCodesRaw      = [],
//     //   remarksRaw       = [],
//     ] = response.data.valueRanges.map(range => range.values?.flat() || []);

//     // Remove empty rows
//     const rows = siteNamesRaw
//       .map((site, i) => ({
//         site:     (site || '').trim(),
        
//       }))
//       .filter(row => row.site); // only keep valid rows

//     // ── Unique lists ────────────────────────────────────────
//     const uniqueSiteNames      = [...new Set(siteNamesRaw.filter(Boolean))].sort();

//     res.json({
//       siteNames: uniqueSiteNames,
   
//     });

//   } catch (error) {
//     console.error('Error fetching dropdowns:', error);
//     res.status(500).json({ error: 'Failed to load dropdown data' });
//   }
// });







// // Helper function to find first completely empty row in Purchase_Outstanding sheet
// async function findFirstEmptyRow() {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Purchase_Outstanding!A:K',   // poora range jahan data ja raha hai
//       majorDimension: 'ROWS',
//     });

//     const rows = response.data.values || [];

//     // Pehli row jo completely empty ho (sab cells empty)
//     for (let i = 0; i < rows.length; i++) {
//       const row = rows[i];
//       // Agar row mein koi bhi value hai (string, number, etc.)
//       const isEmpty = !row || row.every(cell => !cell || String(cell).trim() === '');
//       if (isEmpty) {
//         return i + 1;   // row number (1-based)
//       }
//     }

//     // Agar koi empty row nahi mila toh last row ke baad
//     return rows.length + 1;
//   } catch (err) {
//     console.error('Error finding empty row:', err);
//     throw err;
//   }
// }

// // Updated prepareBillRow - ab date ka issue bhi fix kar dete hain
// async function prepareBillRow(data) {
//   const {
//     siteName,
//     vendorName,
//     billNo,
//     billDate,
//     billPdf,
//     expHead,
//     basicAmount,
//     cgst,
//     sgst,
//     netAmount,
//   } = data;

//   if (!siteName || !vendorName || !billNo || !netAmount) {
//     throw new Error('Required fields missing: siteName, vendorName, billNo, netAmount');
//   }

//   const finalBillDate = (billDate && billDate.trim()) || new Date().toLocaleDateString('en-IN');

//   const now = new Date().toLocaleString('en-IN', {
//     timeZone: 'Asia/Kolkata',
//     day: '2-digit',
//     month: '2-digit',
//     year: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit',
//     hour12: false,
//   }).replace(/,/, '');

//   return [
//     now,                          // A - Submitted At
//     siteName.trim(),              // B
//     vendorName.trim(),            // C
//     billNo.trim(),                // D
//     finalBillDate,                // E
//     billPdf?.trim() || '',        // F
//     expHead?.trim() || '',        // G
//     basicAmount || '0',           // H
//     cgst || '0',                  // I
//     sgst || '0',                  // J
//     netAmount || '0',             // K
//   ];
// }

// // POST Route - Ab sahi logic ke saath
// router.post('/submit-Outstanding-data', async (req, res) => {
//   try {
//     const rowData = await prepareBillRow(req.body);
//     const emptyRowNumber = await findFirstEmptyRow();

//     // Agar empty row mila toh update karo, warna append
//     if (emptyRowNumber <= 10000) {   // safety limit
//       await sheets.spreadsheets.values.update({
//         spreadsheetId,
//         range: `Purchase_Outstanding!A${emptyRowNumber}:K${emptyRowNumber}`,
//         valueInputOption: 'USER_ENTERED',
//         resource: { values: [rowData] },
//       });

//       res.json({
//         success: true,
//         message: `Bill saved in row ${emptyRowNumber} (overwritten empty row)`
//       });
//     } else {
//       // fallback append
//       await sheets.spreadsheets.values.append({
//         spreadsheetId,
//         range: 'Purchase_Outstanding!A:K',
//         valueInputOption: 'USER_ENTERED',
//         resource: { values: [rowData] },
//       });

//       res.json({
//         success: true,
//         message: 'Bill appended at the bottom'
//       });
//     }

//   } catch (error) {
//     console.error('Bill submit error:', error);
//     res.status(400).json({
//       success: false,
//       error: error.message || 'Failed to save bill'
//     });
//   }
// });

// module.exports = router;





/////



const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');

const router = express.Router();

router.get('/dropdowns', async (req, res) => {
  try {
    const ranges = [
      'Project_Data!D3:D', // Site Names (column D)
    ];

    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
    });

    const [siteNamesRaw = []] = response.data.valueRanges.map(
      (range) => range.values?.flat() || []
    );

    const uniqueSiteNames = [...new Set(siteNamesRaw.filter(Boolean))].sort();

    res.json({
      siteNames: uniqueSiteNames,
    });
  } catch (error) {
    console.error('Error fetching dropdowns:', error);
    res.status(500).json({ error: 'Failed to load dropdown data' });
  }
});

// Helper function to find first completely empty row
async function findFirstEmptyRow() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_Outstanding!A:N', // ✅ A to N (extended for remark)
      majorDimension: 'ROWS',
    });

    const rows = response.data.values || [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const isEmpty =
        !row || row.every((cell) => !cell || String(cell).trim() === '');
      if (isEmpty) {
        return i + 1;
      }
    }

    return rows.length + 1;
  } catch (err) {
    console.error('Error finding empty row:', err);
    throw err;
  }
}

// ✅ Updated prepareBillRow - remark added in column N
async function prepareBillRow(data) {
  const {
    siteName,
    vendorName,
    billNo,
    billDate,
    billPdf,
    expHead,
    basicAmount,
    cgst,
    sgst,
    netAmount,
    remark, // ✅ New field
  } = data;

  if (!siteName || !vendorName || !billNo || !netAmount) {
    throw new Error(
      'Required fields missing: siteName, vendorName, billNo, netAmount'
    );
  }

  const finalBillDate =
    billDate && billDate.trim()
      ? billDate.trim()
      : new Date().toLocaleDateString('en-IN');

  const now = new Date()
    .toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    .replace(/,/, '');

  return [
    now,                        // A - Submitted At
    siteName.trim(),            // B
    vendorName.trim(),          // C
    billNo.trim(),              // D
    finalBillDate,              // E
    billPdf?.trim() || '',      // F
    expHead?.trim() || '',      // G
    basicAmount || '0',         // H
    cgst || '0',                // I
    sgst || '0',                // J
    netAmount || '0',           // K
    '',                         // L - (empty placeholder)
    '',                         // M - (empty placeholder)
    remark?.trim() || '',       // N - ✅ Remark
  ];
}

// POST Route
router.post('/submit-Outstanding-data', async (req, res) => {
  try {
    const rowData = await prepareBillRow(req.body);
    const emptyRowNumber = await findFirstEmptyRow();

    if (emptyRowNumber <= 10000) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Purchase_Outstanding!A${emptyRowNumber}:N${emptyRowNumber}`, // ✅ A to N
        valueInputOption: 'USER_ENTERED',
        resource: { values: [rowData] },
      });

      res.json({
        success: true,
        message: `Bill saved in row ${emptyRowNumber} (overwritten empty row)`,
      });
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Purchase_Outstanding!A:N', // ✅ A to N
        valueInputOption: 'USER_ENTERED',
        resource: { values: [rowData] },
      });

      res.json({
        success: true,
        message: 'Bill appended at the bottom',
      });
    }
  } catch (error) {
    console.error('Bill submit error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to save bill',
    });
  }
});

module.exports = router;