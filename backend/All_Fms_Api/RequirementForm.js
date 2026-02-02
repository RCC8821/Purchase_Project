


const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');

const router = express.Router();

// GET: Fetch all dropdown data including Remarks from Sheet1!J2:J
// router.get('/dropdowns', async (req, res) => {
//   try {
//     const ranges = [
//       'Project_Data!D3:D', // Site Names
//       'Project_Data!A3:A', // Supervisor Names
//       'Project_Data!H3:H', // Material Types
//       'Project_Data!I3:I', // Material Names
//       'Project_Data!J3:J', // Units
//       'Project_Data!K3:K', // SKU Codes
//       'Project_Data!F3:F', // Remarks (New)
//     ];

//     const response = await sheets.spreadsheets.values.batchGet({
//       spreadsheetId,
//       ranges,
//     });

//     const [
//       siteNames = [],
//       supervisorNames = [],
//       materialTypes = [],
//       materialNames = [],
//       units = [],
//       skuCodes = [],
//       remarks = [],
//     ] = response.data.valueRanges.map(range => range.values?.flat() || []);

//     // Remove duplicates
//     const uniqueSiteNames = [...new Set(siteNames.filter(Boolean))];
//     const uniqueSupervisorNames = [...new Set(supervisorNames.filter(Boolean))];
//     const uniqueMaterialTypes = [...new Set(materialTypes.filter(Boolean))];
//     const uniqueRemarks = [...new Set(remarks.filter(Boolean))];

//     // Build materialMap: type → [materialNames]
//     const materialMap = {};
//     materialTypes.forEach((type, i) => {
//       const normType = type.toLowerCase();
//       if (!materialMap[normType]) materialMap[normType] = [];
//       const name = materialNames[i];
//       if (name && !materialMap[normType].includes(name)) {
//         materialMap[normType].push(name);
//       }
//     });

//     // Build unitMap: materialName → { unit, skuCode }
//     const unitMap = {};
//     materialNames.forEach((name, i) => {
//       if (name && units[i]) {
//         unitMap[name.toLowerCase()] = {
//           unit: units[i],
//           skuCode: skuCodes[i] || '',
//         };
//       }
//     });

//     res.json({
//       siteNames: uniqueSiteNames,
//       supervisorNames: uniqueSupervisorNames,
//       materialTypes: uniqueMaterialTypes,
//       materialNames: materialNames.filter(Boolean),
//       units: units.filter(Boolean),
//       skuCodes: skuCodes.filter(Boolean),
//       remarks: uniqueRemarks, // Sent to frontend
//       materialMap,
//       unitMap,
//     });
//   } catch (error) {
//     console.error('Error fetching dropdowns:', error);
//     res.status(500).json({ error: 'Failed to load dropdown data' });
//   }
// });




router.get('/dropdowns', async (req, res) => {
  try {
    const ranges = [
      'Project_Data!D3:D', // Site Names         (column D)
      'Project_Data!A3:A', // Supervisor Names   (column A)
      'Project_Data!H3:H', // Material Types
      'Project_Data!I3:I', // Material Names
      'Project_Data!J3:J', // Units
      'Project_Data!K3:K', // SKU Codes
      'Project_Data!F3:F', // Remarks (New)
    ];

    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
    });

    const [
      siteNamesRaw     = [],
      supervisorNamesRaw = [],
      materialTypesRaw   = [],
      materialNamesRaw   = [],
      unitsRaw         = [],
      skuCodesRaw      = [],
      remarksRaw       = [],
    ] = response.data.valueRanges.map(range => range.values?.flat() || []);

    // Remove empty rows
    const rows = siteNamesRaw
      .map((site, i) => ({
        site:     (site || '').trim(),
        supervisor: (supervisorNamesRaw[i] || '').trim(),
      }))
      .filter(row => row.site && row.supervisor); // only keep valid rows

    // ── Unique lists ────────────────────────────────────────
    const uniqueSiteNames      = [...new Set(siteNamesRaw.filter(Boolean))].sort();
    const uniqueMaterialTypes  = [...new Set(materialTypesRaw.filter(Boolean))].sort();
    const uniqueRemarks        = [...new Set(remarksRaw.filter(Boolean))].sort();

    // ── Site → Supervisors map ──────────────────────────────
    const siteToSupervisors = {};
    rows.forEach(({ site, supervisor }) => {
      const normSite = site.toLowerCase();
      if (!siteToSupervisors[normSite]) {
        siteToSupervisors[normSite] = new Set();
      }
      siteToSupervisors[normSite].add(supervisor);
    });

    // Convert Sets → sorted arrays
    const siteSupervisorMap = {};
    Object.keys(siteToSupervisors).forEach(siteLower => {
      siteSupervisorMap[siteLower] = [...siteToSupervisors[siteLower]].sort();
    });

    // ── Material related maps (unchanged logic) ─────────────
    const materialMap = {}; // type → [names]
    materialTypesRaw.forEach((type, i) => {
      if (!type) return;
      const normType = type.toLowerCase().trim();
      if (!materialMap[normType]) materialMap[normType] = [];
      const name = (materialNamesRaw[i] || '').trim();
      if (name && !materialMap[normType].includes(name)) {
        materialMap[normType].push(name);
      }
    });

    const unitMap = {}; // materialName (lower) → {unit, sku}
    materialNamesRaw.forEach((name, i) => {
      if (!name) return;
      const normName = name.toLowerCase().trim();
      if (unitsRaw[i]) {
        unitMap[normName] = {
          unit: unitsRaw[i].trim(),
          skuCode: (skuCodesRaw[i] || '').trim(),
        };
      }
    });

    // ── Final response ──────────────────────────────────────
    res.json({
      siteNames: uniqueSiteNames,
      // supervisorNames: removed → frontend will use map
      materialTypes: uniqueMaterialTypes,
      materialNames: materialNamesRaw.filter(Boolean), // if still needed
      units:        unitsRaw.filter(Boolean),
      skuCodes:     skuCodesRaw.filter(Boolean),
      remarks:      uniqueRemarks,

      materialMap,
      unitMap,

      // ── New: this is what frontend needs for auto-fill ──
      siteSupervisorMap,           // key = site.toLowerCase()
      // Optional: also send original mapping if you want case-sensitive display
      siteToSupervisorsRaw: siteToSupervisors, 
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