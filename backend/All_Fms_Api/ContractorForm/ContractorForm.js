


const express = require('express');
const { sheets, spreadsheetId ,drive} = require('../../config/googleSheet');
const { Readable } = require('stream');
const router = express.Router();


// router.get('/dropdowns', async (req, res) => {
//   try {
//     const ranges = [
//       'Project_Data!D3:D',   // 0 → Site Names
//       'Project_Data!A3:A',   // 1 → Supervisor Names
//       'Project_Data!H3:H',   // 2 → Material Types
//       'Project_Data!I3:I',   // 3 → Material Names
//       'Project_Data!J3:J',   // 4 → Units
//       'Project_Data!K3:K',   // 5 → SKU Codes
//       'Project_Data!P3:N',   // 6 → Remarks (dropdown options)
//       'Project_Data!Q3:O',   // 7 → Auto-fill value when remark selected
//     ];

//     const response = await sheets.spreadsheets.values.batchGet({
//       spreadsheetId,
//       ranges,
//     });

//     const valueRanges = response.data.valueRanges || [];

//     const [
//       siteNamesRaw       = [],
//       supervisorNamesRaw = [],
//       materialTypesRaw   = [],
//       materialNamesRaw   = [],
//       unitsRaw           = [],
//       skuCodesRaw        = [],
//       remarksRaw         = [],
//       autoFillRaw        = [],      // ← Column O
//     ] = valueRanges.map(range => range.values?.flat() || []);

//     // ── Clean & filter valid site-supervisor pairs ────────────────
//     const rows = siteNamesRaw
//       .map((site, i) => ({
//         site: (site || '').trim(),
//         supervisor: (supervisorNamesRaw[i] || '').trim(),
//       }))
//       .filter(row => row.site && row.supervisor);

//     // ── Unique sorted lists ────────────────────────────────────────
//     const uniqueSiteNames     = [...new Set(siteNamesRaw.filter(Boolean))].sort();
//     const uniqueMaterialTypes = [...new Set(materialTypesRaw.filter(Boolean))].sort();
//     const uniqueRemarks       = [...new Set(remarksRaw.filter(Boolean))].sort();

//     // ── Site → Supervisors map (case-insensitive key) ──────────────
//     const siteToSupervisors = {};
//     rows.forEach(({ site, supervisor }) => {
//       const normSite = site.toLowerCase().trim();
//       if (!siteToSupervisors[normSite]) {
//         siteToSupervisors[normSite] = new Set();
//       }
//       siteToSupervisors[normSite].add(supervisor);
//     });

//     const siteSupervisorMap = {};
//     Object.keys(siteToSupervisors).forEach(key => {
//       siteSupervisorMap[key] = [...siteToSupervisors[key]].sort();
//     });

//     // ── Material Type → Names map ──────────────────────────────────
//     const materialMap = {};
//     materialTypesRaw.forEach((type, i) => {
//       if (!type?.trim()) return;
//       const normType = type.toLowerCase().trim();
//       if (!materialMap[normType]) materialMap[normType] = [];
//       const name = (materialNamesRaw[i] || '').trim();
//       if (name && !materialMap[normType].includes(name)) {
//         materialMap[normType].push(name);
//       }
//     });

//     // ── Material Name → {unit, sku} map ────────────────────────────
//     const unitMap = {};
//     materialNamesRaw.forEach((name, i) => {
//       if (!name?.trim()) return;
//       const normName = name.toLowerCase().trim();
//       if (unitsRaw[i]?.trim()) {
//         unitMap[normName] = {
//           unit: unitsRaw[i].trim(),
//           skuCode: (skuCodesRaw[i] || '').trim(),
//         };
//       }
//     });

//     // ── NEW: Remark → Column O value map ───────────────────────────
//     const remarksToAutoFillMap = {};
//     remarksRaw.forEach((remark, i) => {
//       if (!remark?.trim()) return;
//       // Using trimmed string as key (case-sensitive)
//       // If you want case-insensitive → remark.toLowerCase().trim()
//       const key = remark.trim();
//       const value = (autoFillRaw[i] || '').trim();

//       // Last occurrence wins (or use if (!(key in remarksToAutoFillMap)) for first)
//       remarksToAutoFillMap[key] = value;
//     });

//     // ── Final response ─────────────────────────────────────────────
//     res.json({
//       siteNames: uniqueSiteNames,
//       materialTypes: uniqueMaterialTypes,
//       remarks: uniqueRemarks,

//       materialMap,          // type → [material names]
//       unitMap,              // material name (lower) → {unit, skuCode}
//       siteSupervisorMap,    // site (lower) → [supervisors]

//       // ── NEW keys for your auto-fill feature ─────────────────────
//       remarksList: uniqueRemarks,               // just in case you need plain array
//       remarksToAutoFillMap,                     // ← the most important one
//       // Optional: also send raw lists if you need them on frontend
//       // remarksRaw,
//       // autoFillRaw,
//     });

//   } catch (error) {
//     console.error('Error in /dropdowns:', error);
//     res.status(500).json({ error: 'Failed to load dropdown data' });
//   }
// });


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


// router.post('/submit-requirement', async (req, res) => {
//   try {
//     const body = req.body;

//     if (!body || Object.keys(body).length === 0) {
//       return res.status(400).json({ error: 'Request body missing or empty' });
//     }

//     const {
//       siteName,
//       supervisorName,
//       remark = '',           // optional
//       items,                 // required array
//       contractorName = '',
//       contractorFirm = '',
//       challanNo = '',
//       challanPhoto,          // base64 string (optional)
//     } = body;

//     // Basic top-level required checks
//     if (!siteName?.trim()) return res.status(400).json({ error: 'Site Name required' });
//     if (!supervisorName?.trim()) return res.status(400).json({ error: 'Supervisor Name required' });
//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({ error: 'At least one item required' });
//     }

//     const reqNo = await getNextReqNo();
//     const uids = await getNextUIDs(items.length);

//     const now = new Date();
//     const timestamp = now.toLocaleString('en-IN', {
//       timeZone: 'Asia/Kolkata',
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//       hour12: false,
//     }).replace(',', '');

//     let photoUrl = '';

//     // Optional photo upload
//     if (challanPhoto && typeof challanPhoto === 'string' && challanPhoto.startsWith('data:image/')) {
//       try {
//         const base64Data = challanPhoto.replace(/^data:image\/\w+;base64,/, '');
//         const buffer = Buffer.from(base64Data, 'base64');

//         const readableStream = new Readable();
//         readableStream.push(buffer);
//         readableStream.push(null);

//         const folderId = '1vma3YPHosdy4SGCI5_sORVCElk85Wflz';

//         const fileMetadata = {
//           name: `req_challan_${reqNo.replace(/\s+/g, '_')}_${Date.now()}.jpg`,
//           parents: [folderId],
//         };

//         const media = {
//           mimeType: 'image/jpeg',
//           body: readableStream,
//         };

//         const file = await drive.files.create({
//           resource: fileMetadata,
//           media: media,
//           fields: 'id, webViewLink',
//           supportsAllDrives: true,
//         });

//         await drive.permissions.create({
//           fileId: file.data.id,
//           requestBody: {
//             role: 'reader',
//             type: 'anyone',
//           },
//           supportsAllDrives: true,
//         });

//         photoUrl = file.data.webViewLink || `https://drive.google.com/file/d/${file.data.id}/view`;

//       } catch (uploadErr) {
//         console.error('Photo upload failed:', uploadErr.message);
//         photoUrl = ''; // don't fail the whole submission
//       }
//     }

//     // Create rows — exactly 16 columns as per your header
//     const values = items.map((item, index) => {
//       // Required per item
//       if (!item.materialType?.trim()) throw new Error(`Item ${index+1}: Material Type required`);
//       if (!item.materialName?.trim()) throw new Error(`Item ${index+1}: Material Name required`);
//       if (!item.quantity || isNaN(Number(item.quantity))) throw new Error(`Item ${index+1}: Valid Quantity required`);
//       if (!item.units?.trim()) throw new Error(`Item ${index+1}: Units required`);
//       if (!item.reason?.trim()) throw new Error(`Item ${index+1}: Use For Purpose required`);
//       if (!item.skuCode?.trim()) throw new Error(`Item ${index+1}: SKU Code required`);

//       return [
//         timestamp,                    // Timestamp
//         uids[index],                  // UID
//         reqNo,                        // Req_No._1
//         siteName.trim(),              // Project_Name_1
//         supervisorName.trim(),        // Project_Engineer_1
//         item.materialType.trim(),     // Material_Type_1
//         item.skuCode.trim(),          // SKU_Code_1
//         item.materialName.trim(),     // Material_Name_1
//         Number(item.quantity),        // Received_Quantity_1
//         item.units.trim(),            // Unit_Name_1
//         item.reason.trim(),           // Use_For_Purpose
//         contractorName.trim(),        // Contractor_Name_1
//         contractorFirm.trim(),        // Contractor_Firm_Name_1
//         challanNo.trim(),             // Challan_No._1
//         photoUrl,                     // Challan_Photo_1
//         remark.trim()                 // Remark_1
//       ];
//     });

//     // Append to sheet (A:P = 16 columns)
//     const appendResponse = await sheets.spreadsheets.values.append({
//       spreadsheetId,
//       range: 'Contractor_Material_Purchse!A:P',
//       valueInputOption: 'USER_ENTERED',
//       insertDataOption: 'INSERT_ROWS',
//       resource: { values },
//     });

//     res.json({
//       success: true,
//       message: 'Requirement submitted successfully',
//       reqNo,
//       rowsAdded: values.length,
//       photoUrl: photoUrl || null,
//     });

//   } catch (error) {
//     console.error('Error in /submit-requirement:', error.message);
//     res.status(400).json({
//       error: error.message || 'Failed to submit requirement',
//     });
//   }
// });


router.post('/submit-requirement', async (req, res) => {
  try {
    const body = req.body;
    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({ error: 'Body missing or empty' });
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
    } = body;

    if (!siteName?.trim())      return res.status(400).json({ error: 'Site Name required' });
    if (!supervisorName?.trim()) return res.status(400).json({ error: 'Supervisor required' });
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one item required' });
    }

    const reqNo   = await getNextReqNo();
    const uids    = await getNextUIDs(items.length);
    const now     = new Date();
    const timestamp = now.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).replace(',', '');

    // ── Photo Upload ───────────────────────────────────────
    let photoUrl = '';
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

        photoUrl = `https://drive.google.com/file/d/${file.data.id}/view?usp=sharing`;
        console.log(`Photo uploaded → ${photoUrl}`);
      } catch (err) {
        console.error('Photo upload fail:', err.message);
        photoUrl = '[Photo upload failed]';
      }
    }

    // ── Find first empty block ─────────────────────────────
    const sheetName = 'Contractor_Material_Purchse';
    const maxRowsToCheck = 5000;
    const rangeToCheck = `${sheetName}!A2:P${maxRowsToCheck}`;

    const { data: { values: rows = [] } } = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: rangeToCheck,
    });

    let startIndex = -1; // 0-based index in the fetched rows array

    for (let i = 0; i <= rows.length - items.length; i++) {
      let isBlockEmpty = true;
      for (let j = 0; j < items.length; j++) {
        const row = rows[i + j] || [];
        if (!row.every(cell => !cell || String(cell).trim() === '')) {
          isBlockEmpty = false;
          break;
        }
      }
      if (isBlockEmpty) {
        startIndex = i;
        break;
      }
    }

    let targetRowNumber; // actual 1-based row number in sheet

    if (startIndex !== -1) {
      targetRowNumber = startIndex + 2; // A2 → row 2
      console.log(`Empty block found starting at row ${targetRowNumber}`);
    } else {
      // No enough empty consecutive rows → go to end
      targetRowNumber = rows.length + 2;
      console.log(`No empty block → writing from row ${targetRowNumber}`);
    }

    // ── Prepare data ───────────────────────────────────────
    const valuesToWrite = items.map((item, idx) => {
      if (!item.materialType?.trim()) throw new Error(`Item ${idx+1}: Material Type missing`);
      if (!item.materialName?.trim()) throw new Error(`Item ${idx+1}: Material Name missing`);
      if (!item.quantity || isNaN(Number(item.quantity))) throw new Error(`Item ${idx+1}: Quantity invalid`);
      if (!item.units?.trim()) throw new Error(`Item ${idx+1}: Units missing`);
      if (!item.reason?.trim()) throw new Error(`Item ${idx+1}: Purpose missing`);
      if (!item.skuCode?.trim()) throw new Error(`Item ${idx+1}: SKU missing`);

      return [
        timestamp,
        uids[idx],
        reqNo,
        siteName.trim(),
        supervisorName.trim(),
        item.materialType.trim(),
        item.skuCode.trim(),
        item.materialName.trim(),
        Number(item.quantity),
        item.units.trim(),
        item.reason.trim(),
        contractorName.trim(),
        contractorFirm.trim(),
        challanNo.trim(),
        photoUrl,
        remark.trim(),
      ];
    });

    // ── Update existing rows (no insert) ───────────────────
    const writeRange = `${sheetName}!A${targetRowNumber}:P${targetRowNumber + valuesToWrite.length - 1}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: writeRange,
      valueInputOption: 'USER_ENTERED',
      resource: { values: valuesToWrite },
    });

    console.log(`Data written to rows ${targetRowNumber} → ${targetRowNumber + valuesToWrite.length - 1}`);

    res.json({
      success: true,
      reqNo,
      rowsWritten: valuesToWrite.length,
      startingRow: targetRowNumber,
      photoUrl: photoUrl || null,
    });

  } catch (error) {
    console.error('Submit error:', error.message, error.stack);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

module.exports = router;