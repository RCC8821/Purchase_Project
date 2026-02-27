

const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');

const router = express.Router();


router.get('/dropdowns', async (req, res) => {
  try {
    const ranges = [
      'Project_Data!D3:D', // Site Names         (column D)
    //   'Project_Data!A3:A', // Supervisor Names   (column A)
    //   'Project_Data!H3:H', // Material Types
    //   'Project_Data!I3:I', // Material Names
    //   'Project_Data!J3:J', // Units
    //   'Project_Data!K3:K', // SKU Codes
    //   'Project_Data!F3:F', // Remarks (New)
    ];

    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
    });

    const [
      siteNamesRaw     = [],
    //   supervisorNamesRaw = [],
    //   materialTypesRaw   = [],
    //   materialNamesRaw   = [],
    //   unitsRaw         = [],
    //   skuCodesRaw      = [],
    //   remarksRaw       = [],
    ] = response.data.valueRanges.map(range => range.values?.flat() || []);

    // Remove empty rows
    const rows = siteNamesRaw
      .map((site, i) => ({
        site:     (site || '').trim(),
        
      }))
      .filter(row => row.site); // only keep valid rows

    // ── Unique lists ────────────────────────────────────────
    const uniqueSiteNames      = [...new Set(siteNamesRaw.filter(Boolean))].sort();
    // const uniqueMaterialTypes  = [...new Set(materialTypesRaw.filter(Boolean))].sort();
    // const uniqueRemarks        = [...new Set(remarksRaw.filter(Boolean))].sort();

    // // ── Site → Supervisors map ──────────────────────────────
    // const siteToSupervisors = {};
    // rows.forEach(({ site, supervisor }) => {
    //   const normSite = site.toLowerCase();
    //   if (!siteToSupervisors[normSite]) {
    //     siteToSupervisors[normSite] = new Set();
    //   }
    //   siteToSupervisors[normSite].add(supervisor);
    // });

    // // Convert Sets → sorted arrays
    // const siteSupervisorMap = {};
    // Object.keys(siteToSupervisors).forEach(siteLower => {
    //   siteSupervisorMap[siteLower] = [...siteToSupervisors[siteLower]].sort();
    // });

    // // ── Material related maps (unchanged logic) ─────────────
    // const materialMap = {}; // type → [names]
    // materialTypesRaw.forEach((type, i) => {
    //   if (!type) return;
    //   const normType = type.toLowerCase().trim();
    //   if (!materialMap[normType]) materialMap[normType] = [];
    //   const name = (materialNamesRaw[i] || '').trim();
    //   if (name && !materialMap[normType].includes(name)) {
    //     materialMap[normType].push(name);
    //   }
    // });

    // const unitMap = {}; // materialName (lower) → {unit, sku}
    // materialNamesRaw.forEach((name, i) => {
    //   if (!name) return;
    //   const normName = name.toLowerCase().trim();
    //   if (unitsRaw[i]) {
    //     unitMap[normName] = {
    //       unit: unitsRaw[i].trim(),
    //       skuCode: (skuCodesRaw[i] || '').trim(),
    //     };
    //   }
    // });

    // ── Final response ──────────────────────────────────────
    res.json({
      siteNames: uniqueSiteNames,
      // supervisorNames: removed → frontend will use map
    //   materialTypes: uniqueMaterialTypes,
    //   materialNames: materialNamesRaw.filter(Boolean), // if still needed
    //   units:        unitsRaw.filter(Boolean),
    //   skuCodes:     skuCodesRaw.filter(Boolean),
    //   remarks:      uniqueRemarks,
    //   materialMap,
    //   unitMap,
    //   siteSupervisorMap,           
    //   siteToSupervisorsRaw: siteToSupervisors, 
    });

  } catch (error) {
    console.error('Error fetching dropdowns:', error);
    res.status(500).json({ error: 'Failed to load dropdown data' });
  }
});

async function prepareBillRow(data) {
  const {
            // ← Yeh frontend se aayega (bill date ya entry date)
    siteName,
    vendorName,
    billNo,
    billDate,      // optional – agar alag chahiye toh, warna date hi use kar lenge
    billPdf,
    expHead,
    basicAmount,
    cgst,
    sgst,
    netAmount,
  } = data;

  // Required fields check
  if ( !siteName || !vendorName || !billNo || !netAmount) {
    throw new Error('Required fields missing: date, siteName, vendorName, billNo, netAmount');
  }

  // Use billDate if provided, else fallback to the main date
  const finalBillDate = billDate?.trim() || date.trim();

  // India (IST) timestamp – jab request aayi us time ka
  const now = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).replace(/,/, '');   // "27/02/2025 15:42:18" format

  return [
                // A - Date (bill/entry date from frontend)
    now,                      // L - Submitted At (India IST timestamp)
    siteName.trim(),          // B - Site Name
    vendorName.trim(),        // C - Vendor Name
    billNo.trim(),            // D - Bill. No
    finalBillDate,            // E - Bill Date
    billPdf?.trim() || '',    // F - Bill pdf (link)
    expHead?.trim() || '',    // G - Exp. Head
    basicAmount || '0',       // H - Basic Amount
    cgst || '0',              // I - CGST
    sgst || '0',              // J - SGST
    netAmount || '0',         // K - Net Amount
  ];
}

// POST: Submit bill entry
router.post('/submit-Outstanding-data', async (req, res) => {
  try {
    const row = await prepareBillRow(req.body);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Purchase_Outstanding!A:K',               // ← Ab L column tak ja raha hai
      valueInputOption: 'USER_ENTERED',
      resource: { values: [row] },
    });

    res.json({
      success: true,
      message: 'Bill entry saved successfully!'
    });

  } catch (error) {
    console.error('Bill submit error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to save bill'
    });
  }
});
module.exports = router;