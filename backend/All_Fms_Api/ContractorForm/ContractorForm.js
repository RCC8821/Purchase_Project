


const express = require('express');
const { sheets, spreadsheetId ,drive} = require('../../config/googleSheet');
const { Readable } = require('stream');
const router = express.Router();

router.get('/dropdowns', async (req, res) => {
  try {
    const ranges = [
      'Project_Data!D3:D',   // 0 → Site Names
      'Project_Data!A3:A',   // 1 → Supervisor Names
      'Project_Data!H3:H',   // 2 → Material Types
      'Project_Data!I3:I',   // 3 → Material Names
      'Project_Data!J3:J',   // 4 → Units
      'Project_Data!K3:K',   // 5 → SKU Codes
      'Project_Data!P3:P',   // 6 → Contractor Names (from P column)
      'Project_Data!Q3:Q',   // 7 → Contractor Firms (from Q column)
    ];

    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
    });

    const valueRanges = response.data.valueRanges || [];

    const [
      siteNamesRaw       = [],
      supervisorNamesRaw = [],
      materialTypesRaw   = [],
      materialNamesRaw   = [],
      unitsRaw           = [],
      skuCodesRaw        = [],
      contractorNamesRaw = [],  // ← P column
      contractorFirmsRaw = [],  // ← Q column
    ] = valueRanges.map(range => range.values?.flat() || []);

    // ── Clean & filter valid site-supervisor pairs ────────────────
    const rows = siteNamesRaw
      .map((site, i) => ({
        site: (site || '').trim(),
        supervisor: (supervisorNamesRaw[i] || '').trim(),
      }))
      .filter(row => row.site && row.supervisor);

    // ── Unique sorted lists ────────────────────────────────────────
    const uniqueSiteNames     = [...new Set(siteNamesRaw.filter(Boolean))].sort();
    const uniqueMaterialTypes = [...new Set(materialTypesRaw.filter(Boolean))].sort();
    const uniqueContractorNames = [...new Set(contractorNamesRaw.filter(Boolean))].sort();  // ← from P

    // ── Site → Supervisors map (case-insensitive key) ──────────────
    const siteToSupervisors = {};
    rows.forEach(({ site, supervisor }) => {
      const normSite = site.toLowerCase().trim();
      if (!siteToSupervisors[normSite]) {
        siteToSupervisors[normSite] = new Set();
      }
      siteToSupervisors[normSite].add(supervisor);
    });

    const siteSupervisorMap = {};
    Object.keys(siteToSupervisors).forEach(key => {
      siteSupervisorMap[key] = [...siteToSupervisors[key]].sort();
    });

    // ── Material Type → Names map ──────────────────────────────────
    const materialMap = {};
    materialTypesRaw.forEach((type, i) => {
      if (!type?.trim()) return;
      const normType = type.toLowerCase().trim();
      if (!materialMap[normType]) materialMap[normType] = [];
      const name = (materialNamesRaw[i] || '').trim();
      if (name && !materialMap[normType].includes(name)) {
        materialMap[normType].push(name);
      }
    });

    // ── Material Name → {unit, sku} map ────────────────────────────
    const unitMap = {};
    materialNamesRaw.forEach((name, i) => {
      if (!name?.trim()) return;
      const normName = name.toLowerCase().trim();
      if (unitsRaw[i]?.trim()) {
        unitMap[normName] = {
          unit: unitsRaw[i].trim(),
          skuCode: (skuCodesRaw[i] || '').trim(),
        };
      }
    });

    // ── NEW: Contractor Name (P) → Firm (Q) map ───────────────────────────
    const contractorToFirmMap = {};
    contractorNamesRaw.forEach((name, i) => {
      if (!name?.trim()) return;
      const key = name.trim();
      const value = (contractorFirmsRaw[i] || '').trim();
      contractorToFirmMap[key] = value;  // Last occurrence wins
    });

    // ── Final response ─────────────────────────────────────────────
    res.json({
      siteNames: uniqueSiteNames,
      materialTypes: uniqueMaterialTypes,
      remarks: uniqueContractorNames,  // ← unique from P

      materialMap,
      unitMap,
      siteSupervisorMap,

      remarksList: uniqueContractorNames,  // plain array of names from P
      remarksToAutoFillMap: contractorToFirmMap,  // name → firm
    });

  } catch (error) {
    console.error('Error in /dropdowns:', error);
    res.status(500).json({ error: 'Failed to load dropdown data' });
  }
});


// Helper: Get next req_no (req_01, req_02...)
async function getNextReqNo() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contractor_Material_Purchse!C2:C',
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
      range: 'Contractor_Material_Purchse!B2:B',
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


router.post('/submit-requirement', async (req, res) => {
  try {
    const body = req.body;
    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({ error: 'Request body missing or empty' });
    }

    const {
      siteName,
      supervisorName,
      remark = '',
      items = [],
      contractorName = '',
      contractorFirm = '',
      challanNo = '',
      challanPhoto,
      materialPhoto,          // ← yeh required hai
    } = body;

    // Required fields validation
    if (!siteName?.trim()) return res.status(400).json({ error: 'Site Name required' });
    if (!supervisorName?.trim()) return res.status(400).json({ error: 'Supervisor required' });
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one material item required' });
    }
    if (!materialPhoto || typeof materialPhoto !== 'string' || !materialPhoto.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Material photo is required (base64 image data expected)' });
    }

    // Generate reqNo and UIDs
    const reqNo = await getNextReqNo();
    const uids = await getNextUIDs(items.length);

    const now = new Date();
    const timestamp = now.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).replace(',', '');

    // ── Material Photo Upload (required, single for whole request) ───────
    let materialPhotoUrl = '';
    try {
      const base64Data = materialPhoto.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);

      const file = await drive.files.create({
        resource: {
          name: `material_${reqNo}_${Date.now()}.jpg`,
          parents: ['1vma3YPHosdy4SGCI5_sORVCElk85Wflz'], // your folder ID
        },
        media: {
          mimeType: 'image/jpeg',
          body: stream,
        },
        fields: 'id',
        supportsAllDrives: true,
      });

      await drive.permissions.create({
        fileId: file.data.id,
        requestBody: { role: 'reader', type: 'anyone' },
        supportsAllDrives: true,
      });

      materialPhotoUrl = `https://drive.google.com/file/d/${file.data.id}/view?usp=sharing`;
      console.log(`Material photo uploaded: ${materialPhotoUrl}`);
    } catch (uploadErr) {
      console.error('Material photo upload failed:', uploadErr.message);
      return res.status(500).json({ error: 'Failed to upload material photo' });
    }

    // ── Challan Photo Upload (optional) ─────────────────────────────────
    let challanPhotoUrl = '';
    if (challanPhoto && typeof challanPhoto === 'string' && challanPhoto.startsWith('data:image/')) {
      try {
        const base64Data = challanPhoto.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);

        const file = await drive.files.create({
          resource: {
            name: `challan_${reqNo}_${Date.now()}.jpg`,
            parents: ['1vma3YPHosdy4SGCI5_sORVCElk85Wflz'],
          },
          media: { mimeType: 'image/jpeg', body: stream },
          fields: 'id',
          supportsAllDrives: true,
        });

        await drive.permissions.create({
          fileId: file.data.id,
          requestBody: { role: 'reader', type: 'anyone' },
          supportsAllDrives: true,
        });

        challanPhotoUrl = `https://drive.google.com/file/d/${file.data.id}/view?usp=sharing`;
      } catch (err) {
        console.error('Challan photo upload failed:', err.message);
        challanPhotoUrl = '[Challan upload failed]';
      }
    }

    // ── Find first empty consecutive block ──────────────────────────────
    const sheetName = 'Contractor_Material_Purchse';
    const maxRowsToCheck = 5000;
    const rangeToCheck = `${sheetName}!A2:Q${maxRowsToCheck}`; // A to Q (17 columns)

    const { data: { values: rows = [] } } = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: rangeToCheck,
    });

    let startIndex = -1;
    for (let i = 0; i <= rows.length - items.length; i++) {
      let isBlockEmpty = true;
      for (let j = 0; j < items.length; j++) {
        const row = rows[i + j] || [];
        if (row.some(cell => cell && String(cell).trim() !== '')) {
          isBlockEmpty = false;
          break;
        }
      }
      if (isBlockEmpty) {
        startIndex = i;
        break;
      }
    }

    const targetRowNumber = startIndex !== -1 ? startIndex + 2 : rows.length + 2;

    // ── Prepare values (17 columns: P = materialPhotoUrl, Q = remark) ───
    const valuesToWrite = items.map((item, idx) => {
      // Basic item validation
      if (!item.materialType?.trim()) throw new Error(`Item ${idx+1}: Material Type missing`);
      if (!item.materialName?.trim()) throw new Error(`Item ${idx+1}: Material Name missing`);
      if (!item.quantity || isNaN(Number(item.quantity))) throw new Error(`Item ${idx+1}: Quantity invalid`);
      if (!item.units?.trim()) throw new Error(`Item ${idx+1}: Units missing`);
      if (!item.reason?.trim()) throw new Error(`Item ${idx+1}: Reason missing`);

      return [
        timestamp,                        // A
        uids[idx],                        // B
        reqNo,                            // C
        siteName.trim(),                  // D
        supervisorName.trim(),            // E
        item.materialType.trim(),         // F
        item.skuCode?.trim() || '',       // G
        item.materialName.trim(),         // H
        Number(item.quantity),            // I
        item.units.trim(),                // J
        item.reason.trim(),               // K
        contractorName.trim(),            // L
        contractorFirm.trim(),            // M
        challanNo.trim(),                 // N
        challanPhotoUrl,                  // O
        materialPhotoUrl,                 // P ← Material photo URL (same for all rows)
        remark.trim() || '',              // Q ← Remark
      ];
    });

    // ── Write to sheet ─────────────────────────────────────────────────
    const writeRange = `${sheetName}!A${targetRowNumber}:Q${targetRowNumber + valuesToWrite.length - 1}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: writeRange,
      valueInputOption: 'USER_ENTERED',
      resource: { values: valuesToWrite },
    });

    console.log(`Data written → Req: ${reqNo}, Rows: ${targetRowNumber} to ${targetRowNumber + valuesToWrite.length - 1}`);

    res.json({
      success: true,
      reqNo,
      rowsWritten: valuesToWrite.length,
      startingRow: targetRowNumber,
    });

  } catch (error) {
    console.error('Submit error:', error.message, error.stack);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

module.exports = router;