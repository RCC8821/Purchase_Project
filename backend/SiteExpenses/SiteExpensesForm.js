// const express = require('express');
// const { sheets, SiteExpeseSheetId } = require('../config/googleSheet');
// const router = express.Router();

// // ============================================================
// // HELPER: Timestamp backend se — format: 15/02/2026 17:46:41
// // ============================================================
// const getTimestamp = () => {
//   const now  = new Date();
//   const dd   = String(now.getDate()).padStart(2, '0');
//   const mm   = String(now.getMonth() + 1).padStart(2, '0');
//   const yyyy = now.getFullYear();
//   const hh   = String(now.getHours()).padStart(2, '0');
//   const min  = String(now.getMinutes()).padStart(2, '0');
//   const ss   = String(now.getSeconds()).padStart(2, '0');
//   return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
// };

// // ============================================================
// // HELPER: Find next empty row starting from A7
// // ============================================================

// const getNextEmptyRow = async (sheetName) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: SiteExpeseSheetId,
//       range: `${sheetName}!A7:P100000`,  // Wide range: A to P (your columns), up to a high safe limit
//       majorDimension: 'ROWS',
//     });

//     const allRows = response.data.values || [];

//     // Find the last row that has ANY data in columns A to P
//     let lastUsedRow = 6; // start before header

//     for (let i = 0; i < allRows.length; i++) {
//       const row = allRows[i];
//       // If the row has at least one non-empty cell
//       if (row && row.some(cell => cell !== '' && cell !== null && cell !== undefined)) {
//         lastUsedRow = 7 + i;
//       }
//     }

//     const nextRow = lastUsedRow + 1;

//     // Safety: never go below row 7
//     return Math.max(nextRow, 7);
//   } catch (err) {
//     console.error(`Error finding next row in ${sheetName}:`, err);
//     throw err; // Let caller handle
//   }
// };

// // ============================================================
// // HELPER: Generate next unique UID for each sheet
// // (Simple increment + prefix — can be improved later)
// // ============================================================
// const generateUID = async (sheetName, prefix = '') => {
//   const range = `${sheetName}!B7:B`; // Column B = UID, starting row 7
//   const response = await sheets.spreadsheets.values.get({
//     spreadsheetId: SiteExpeseSheetId,
//     range,
//   });

//   const existing = (response.data.values || [])
//     .flat()
//     .filter(Boolean);

//   let count = 1;
//   let newUID;

//   do {
//     newUID = prefix + String(count).padStart(4, '0');
//     count++;
//   } while (existing.includes(newUID));

//   return newUID;
// };

// // ============================================================
// // POST /api/labour/site-expense  →  Sheet: Site_Exp_FMS
// // UID generated on backend
// // ============================================================


// // router.post('/site-expense', async (req, res) => {
// //   try {
// //     const {
 
// //       Rcc_Bill_No_1,
// //       Vendor_Payee_Name_1,
// //       Project_Name_1,
// //       Project_Engineer_Name_1,
// //       Head_Type_1,
// //       Exp_Head_1,
// //       Details_of_Work_1,
// //       Amount_1,
// //       Bill_No_1,
// //       Bill_Date_1,
// //       Bill_Photo_1,
// //       Contractor_Name_1,
// //       Contractor_Firm_Name_1,
// //       Remark_1,
// //     } = req.body;

// //     if (!Project_Name_1 || !Amount_1) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Project Name aur Amount required hain',
// //       });
// //     }

// //     const nextRow = await getNextEmptyRow('Site_Exp_FMS');
// //     const UID = await generateUID('Site_Exp_FMS', 'SITE'); // prefix SITE0001, SITE0002...

// //     const values = [[
// //       getTimestamp(),                 // A
// //       UID,                            // B - Generated here
// //       Rcc_Bill_No_1 || '',           // C
// //       Vendor_Payee_Name_1 || '',     // D
// //       Project_Name_1 || '',          // E
// //       Project_Engineer_Name_1 || '', // F
// //       Head_Type_1 || '',             // G
// //       Exp_Head_1 || '',              // H
// //       Details_of_Work_1 || '',       // I
// //       Amount_1 || '',                // J
// //       Bill_No_1 || '',               // K
// //       Bill_Date_1 || '',             // L
// //       Bill_Photo_1 || '',            // M
// //       Contractor_Name_1 || '',       // N
// //       Contractor_Firm_Name_1 || '',  // O
// //       Remark_1 || '',                // P
// //     ]];

// //     await sheets.spreadsheets.values.update({
// //       spreadsheetId: SiteExpeseSheetId,
// //       range: `Site_Exp_FMS!A${nextRow}`,
// //       valueInputOption: 'USER_ENTERED',
// //       requestBody: { values },
// //     });

// //     return res.status(200).json({
// //       success: true,
// //       message: 'Site Expense successfully save ho gaya!',
// //       uid: UID,           // ← frontend ko yahi UID return kar rahe hain
// //       row: nextRow,
// //     });
// //   } catch (error) {
// //     console.error('❌ Site Expense Error:', error);
// //     return res.status(500).json({
// //       success: false,
// //       message: 'Server error: ' + error.message,
// //     });
// //   }
// // });


// // Helper: Generate next RCC Bill No (e.g. RCC/2026/0001, RCC/2026/0002 ...)
// // ============================================================
// // HELPER: RCC Bill No backend se generate (ek request = ek bill no)
// // ============================================================
// const generateRccBillNo = async () => {
//   const year = new Date().getFullYear();
//   const prefix = `RCC/${year}/`;
  
//   const response = await sheets.spreadsheets.values.get({
//     spreadsheetId: SiteExpeseSheetId,
//     range: `Site_Exp_FMS!C7:C`,
//   });

//   const existing = (response.data.values || [])
//     .flat()
//     .filter(v => v?.startsWith(prefix));

//   let count = 1;
//   let newBillNo;

//   do {
//     newBillNo = prefix + String(count).padStart(4, '0');
//     count++;
//   } while (existing.includes(newBillNo));

//   return newBillNo;
// };

// // ============================================================
// // POST /api/labour/site-expense
// // ============================================================
// router.post('/site-expense', async (req, res) => {
//   try {
//     const { items = [], ...common } = req.body;

//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({ success: false, message: 'Items array bhejna zaroori hai' });
//     }

//     // Backend se ek hi bill number generate karo (sab items ke liye same)
//     const Rcc_Bill_No_1 = await generateRccBillNo();
//     const timestamp = getTimestamp();

//     console.log(`New Bill No: ${Rcc_Bill_No_1} | Items count: ${items.length}`);

//     const entries = [];

//     for (let i = 0; i < items.length; i++) {
//       const item = items[i];

//       const {
//         Head_Type_1 = '',
//         Exp_Head_1 = '',
//         Details_of_Work_1 = '',
//         Amount_1 = '',
//         Bill_Photo_1 = '',
//       } = item;

//       if (!Exp_Head_1 || !Amount_1) {
//         console.log(`Item ${i+1} invalid: Exp_Head or Amount missing`);
//         continue; // skip invalid item
//       }

//       const nextRow = await getNextEmptyRow('Site_Exp_FMS');
//       const UID = await generateUID('Site_Exp_FMS', 'SITE');

//       console.log(`Item ${i+1}: Row ${nextRow} | UID ${UID} | Amount ${Amount_1}`);

//       const rowValues = [
//         timestamp,
//         UID,
//         Rcc_Bill_No_1,
//         common.Vendor_Payee_Name_1 || 'Unknown',
//         common.Project_Name_1 || 'Default',
//         common.Project_Engineer_Name_1 || '',
//         Head_Type_1,
//         Exp_Head_1,
//         Details_of_Work_1 || '',
//         Amount_1,
//         common.Bill_No_1 || '',
//         common.Bill_Date_1 || new Date().toLocaleDateString('en-GB'),
//         Bill_Photo_1 || '',
//         common.Contractor_Name_1 || '',
//         common.Contractor_Firm_Name_1 || '',
//         common.Remark_1 || '',
//       ];

//       entries.push({ nextRow, UID, values: [rowValues] });
//     }

//     if (entries.length === 0) {
//       return res.status(400).json({ success: false, message: 'Koi valid item nahi mila' });
//     }

//     // Ab saari rows write karo
//     const saved = [];
//     for (const entry of entries) {
//       await sheets.spreadsheets.values.update({
//         spreadsheetId: SiteExpeseSheetId,
//         range: `Site_Exp_FMS!A${entry.nextRow}`,
//         valueInputOption: 'USER_ENTERED',
//         requestBody: { values: entry.values },
//       });
//       saved.push({ uid: entry.UID, row: entry.nextRow });
//     }

//     return res.status(200).json({
//       success: true,
//       message: `${entries.length} items save ho gaye (Bill: ${Rcc_Bill_No_1})`,
//       billNo: Rcc_Bill_No_1,
//       saved,
//     });

//   } catch (error) {
//     console.error('❌ Error:', error.message, error.stack);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ============================================================
// // POST /api/labour/labour-request  →  Sheet: Labour_FMS
// // UID generated on backend (LAB prefix)
// // ============================================================
// router.post('/labour-request', async (req, res) => {
//   try {
//     const {
//       // No UID from frontend
//       Project_Name_1,
//       Project_Engineer_1,
//       Work_Type_1,
//       Work_Description_1,
//       Labour_Category_1,
//       Number_Of_Labour_1,
//       Labour_Category_2,
//       Number_Of_Labour_2,
//       Total_Labour_1,
//       Date_Of_Required_1,
//       Head_Of_Contractor_Company_1,
//       Name_Of_Contractor_1,
//       Contractor_Firm_Name_1,
//       Remark_1,
//     } = req.body;

//     if (!Project_Name_1 || !Work_Type_1) {
//       return res.status(400).json({
//         success: false,
//         message: 'Project Name aur Work Type required hain',
//       });
//     }

//     const nextRow = await getNextEmptyRow('Labour_FMS');
//     const UID = await generateUID('Labour_FMS', 'LAB'); // LAB0001, LAB0002...

//     const values = [[
//       getTimestamp(),                       // A
//       UID,                                  // B - Generated
//       Project_Name_1 || '',                 // C
//       Project_Engineer_1 || '',             // D
//       Work_Type_1 || '',                    // E
//       Work_Description_1 || '',             // F
//       Labour_Category_1 || '',              // G
//       Number_Of_Labour_1 || '',             // H
//       Labour_Category_2 || '',              // I
//       Number_Of_Labour_2 || '',             // J
//       Total_Labour_1 || '',                 // K
//       Date_Of_Required_1 || '',             // L
//       Head_Of_Contractor_Company_1 || '',   // M
//       Name_Of_Contractor_1 || '',           // N
//       Contractor_Firm_Name_1 || '',         // O
//       Remark_1 || '',                       // P
//     ]];

//     await sheets.spreadsheets.values.update({
//       spreadsheetId: SiteExpeseSheetId,
//       range: `Labour_FMS!A${nextRow}`,
//       valueInputOption: 'USER_ENTERED',
//       requestBody: { values },
//     });

//     return res.status(200).json({
//       success: true,
//       message: 'Labour Request successfully save ho gaya!',
//       uid: UID,
//       row: nextRow,
//     });
//   } catch (error) {
//     console.error('❌ Labour Request Error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error: ' + error.message,
//     });
//   }
// });



// // ============================================================
// // POST /api/labour/contractor-debit  →  Sheet: Contractor_Debit_FMS
// // UID generated on backend (you can choose prefix)
// // ============================================================
// router.post('/contractor-debit', async (req, res) => {
//   try {
//     const {
//       // No UID from frontend
//       Project_Name_1,
//       Project_Engineer_1,
//       Contractor_Name_1,
//       Contractor_Firm_Name_1,
//       Work_Type_1,
//       Work_Date_1,
//       Work_Description_1,
//       Particular_1,
//       Qty_1,
//       Rate_Wages_1,
//       Amount_1,
//     } = req.body;

//     if (!Project_Name_1 || !Contractor_Name_1) {
//       return res.status(400).json({
//         success: false,
//         message: 'Project Name aur Contractor Name required hain',
//       });
//     }

//     const nextRow = await getNextEmptyRow('Contractor_Debit_FMS');
//     const UID = await generateUID('Contractor_Debit_FMS', 'DEBIT'); // or any prefix you want

//     const values = [[
//       getTimestamp(),                 // A
//       UID,                            // B - Generated
//       Project_Name_1 || '',          // C
//       Project_Engineer_1 || '',      // D
//       Contractor_Name_1 || '',       // E
//       Contractor_Firm_Name_1 || '',  // F
//       Work_Type_1 || '',             // G
//       Work_Date_1 || '',             // H
//       Work_Description_1 || '',      // I
//       Particular_1 || '',            // J
//       Qty_1 || '',                   // K
//       Rate_Wages_1 || '',            // L
//       Amount_1 || '',                // M
//     ]];

//     await sheets.spreadsheets.values.update({
//       spreadsheetId: SiteExpeseSheetId,
//       range: `Contractor_Debit_FMS!A7${nextRow}`,
//       valueInputOption: 'USER_ENTERED',
//       requestBody: { values },
//     });

//     return res.status(200).json({
//       success: true,
//       message: 'Contractor Debit Entry successfully save ho gaya!',
//       uid: UID,
//       row: nextRow,
//     });
//   } catch (error) {
//     console.error('❌ Contractor Debit Error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error: ' + error.message,
//     });
//   }
// });

// module.exports = router;





const express = require('express');
const { sheets, SiteExpeseSheetId } = require('../config/googleSheet');
const router = express.Router();

// ============================================================
// HELPER: Current timestamp — format: 15/03/2026 17:46:41
// ============================================================
const getTimestamp = () => {
  const now  = new Date();
  const dd   = String(now.getDate()).padStart(2, '0');
  const mm   = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const hh   = String(now.getHours()).padStart(2, '0');
  const min  = String(now.getMinutes()).padStart(2, '0');
  const ss   = String(now.getSeconds()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
};

// ============================================================
// HELPER: Find next empty row starting from row 7
// Looks at columns A to P (adjust if your sheet uses different columns)
// ============================================================
const getNextEmptyRow = async (sheetName) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: `${sheetName}!A7:P10000`,  // Safe upper limit
      majorDimension: 'ROWS',
    });

    const allRows = response.data.values || [];

    let lastUsedRow = 6; // before data starts

    for (let i = 0; i < allRows.length; i++) {
      const row = allRows[i];
      if (row && row.some(cell => cell !== '' && cell !== null && cell !== undefined)) {
        lastUsedRow = 7 + i;
      }
    }

    const nextRow = lastUsedRow + 1;
    return Math.max(nextRow, 7);
  } catch (err) {
    console.error(`Error finding next row in ${sheetName}:`, err);
    throw err;
  }
};

// ============================================================
// HELPER: Generate next unique UID (prefix + 4-digit number)
// ============================================================
const generateUID = async (sheetName, prefix = '') => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: `${sheetName}!B7:B10000`,
    });

    const existing = (response.data.values || [])
      .flat()
      .filter(Boolean);

    let count = 1;
    let newUID;

    do {
      newUID = prefix + String(count).padStart(4, '0');
      count++;
    } while (existing.includes(newUID));

    return newUID;
  } catch (err) {
    console.error(`Error generating UID for ${sheetName}:`, err);
    throw err;
  }
};

// ============================================================
// HELPER: Generate next RCC Bill No (e.g. RCC/2026/0001)
// ============================================================
const generateRccBillNo = async () => {
  try {
    const year = new Date().getFullYear();
    const prefix = `RCC/${year}/`;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: `Site_Exp_FMS!C7:C10000`,
    });

    const existing = (response.data.values || [])
      .flat()
      .filter(v => v && v.startsWith(prefix));

    let count = 1;
    let newBillNo;

    do {
      newBillNo = prefix + String(count).padStart(4, '0');
      count++;
    } while (existing.includes(newBillNo));

    return newBillNo;
  } catch (err) {
    console.error('Error generating RCC Bill No:', err);
    throw err;
  }
};

// ============================================================
// POST /api/labour/site-expense     → Sheet: Site_Exp_FMS
// Supports multiple items under same RCC Bill No
// ============================================================
router.post('/site-expense', async (req, res) => {
  try {
    const { items = [], ...common } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items array bhejna zaroori hai' });
    }

    const Rcc_Bill_No_1 = await generateRccBillNo();
    const timestamp = getTimestamp();

    const entries = [];

    for (const item of items) {
      const {
        Head_Type_1 = '',
        Exp_Head_1 = '',
        Details_of_Work_1 = '',
        Amount_1 = '',
        Bill_Photo_1 = '',
      } = item;

      if (!Exp_Head_1 || !Amount_1) {
        continue; // skip invalid items
      }

      const nextRow = await getNextEmptyRow('Site_Exp_FMS');
      const UID = await generateUID('Site_Exp_FMS', 'SITE');

      const rowValues = [
        timestamp,                          // A
        UID,                                // B
        Rcc_Bill_No_1,                      // C
        common.Vendor_Payee_Name_1 || '',   // D
        common.Project_Name_1 || '',        // E
        common.Project_Engineer_Name_1 || '', // F
        Head_Type_1,                        // G
        Exp_Head_1,                         // H
        Details_of_Work_1 || '',            // I
        Amount_1,                           // J
        common.Bill_No_1 || '',             // K
        common.Bill_Date_1 || '',           // L
        Bill_Photo_1 || '',                 // M
        common.Contractor_Name_1 || '',     // N
        common.Contractor_Firm_Name_1 || '',// O
        common.Remark_1 || '',              // P
      ];

      entries.push({ nextRow, UID, values: [rowValues] });
    }

    if (entries.length === 0) {
      return res.status(400).json({ success: false, message: 'Koi valid item nahi mila' });
    }

    const saved = [];
    for (const entry of entries) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SiteExpeseSheetId,
        range: `Site_Exp_FMS!A${entry.nextRow}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: entry.values },
      });
      saved.push({ uid: entry.UID, row: entry.nextRow });
    }

    return res.status(200).json({
      success: true,
      message: `${entries.length} items save ho gaye (Bill: ${Rcc_Bill_No_1})`,
      billNo: Rcc_Bill_No_1,
      saved,
    });

  } catch (error) {
    console.error('❌ Site Expense Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
});

// ============================================================
// POST /api/labour/labour-request   → Sheet: Labour_FMS
// ============================================================
router.post('/labour-request', async (req, res) => {
  try {
    const {
      Project_Name_1,
      Project_Engineer_1,
      Work_Type_1,
      Work_Description_1,
      Labour_Category_1,
      Number_Of_Labour_1,
      Labour_Category_2,
      Number_Of_Labour_2,
      Total_Labour_1,
      Date_Of_Required_1,
      Head_Of_Contractor_Company_1,
      Name_Of_Contractor_1,
      Contractor_Firm_Name_1,
      Remark_1,
    } = req.body;

    if (!Project_Name_1 || !Work_Type_1) {
      return res.status(400).json({
        success: false,
        message: 'Project Name aur Work Type required hain',
      });
    }

    const nextRow = await getNextEmptyRow('Labour_FMS');
    const UID = await generateUID('Labour_FMS', 'LAB');

    const values = [[
      getTimestamp(),                       // A
      UID,                                  // B
      Project_Name_1 || '',                 // C
      Project_Engineer_1 || '',             // D
      Work_Type_1 || '',                    // E
      Work_Description_1 || '',             // F
      Labour_Category_1 || '',              // G
      Number_Of_Labour_1 || '',             // H
      Labour_Category_2 || '',              // I
      Number_Of_Labour_2 || '',             // J
      Total_Labour_1 || '',                 // K
      Date_Of_Required_1 || '',             // L
      Head_Of_Contractor_Company_1 || '',   // M
      Name_Of_Contractor_1 || '',           // N
      Contractor_Firm_Name_1 || '',         // O
      Remark_1 || '',                       // P
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SiteExpeseSheetId,
      range: `Labour_FMS!A${nextRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    return res.status(200).json({
      success: true,
      message: 'Labour Request successfully save ho gaya!',
      uid: UID,
      row: nextRow,
    });
  } catch (error) {
    console.error('❌ Labour Request Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
});

// ============================================================
// POST /api/labour/contractor-debit → Sheet: Contractor_Debit_FMS
// ============================================================
router.post('/contractor-debit', async (req, res) => {
  try {
    const {
      Project_Name_1,
      Project_Engineer_1,
      Contractor_Name_1,
      Contractor_Firm_Name_1,
      Work_Type_1,
      Work_Date_1,
      Work_Description_1,
      Particular_1,
      Qty_1,
      Rate_Wages_1,
      Amount_1,
    } = req.body;

    if (!Project_Name_1 || !Contractor_Name_1 || !Amount_1) {
      return res.status(400).json({
        success: false,
        message: 'Project Name, Contractor Name aur Amount required hain',
      });
    }

    const nextRow = await getNextEmptyRow('Contractor_Debit_FMS');
    const UID = await generateUID('Contractor_Debit_FMS', 'DEBIT');

    const values = [[
      getTimestamp(),                 // A
      UID,                            // B
      Project_Name_1 || '',           // C
      Project_Engineer_1 || '',       // D
      Contractor_Name_1 || '',        // E
      Contractor_Firm_Name_1 || '',   // F
      Work_Type_1 || '',              // G
      Work_Date_1 || '',              // H
      Work_Description_1 || '',       // I
      Particular_1 || '',             // J
      Qty_1 || '',                    // K
      Rate_Wages_1 || '',             // L
      Amount_1 || '',                 // M
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SiteExpeseSheetId,
      range: `Contractor_Debit_FMS!A${nextRow}`,   // ← Corrected & fixed
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    return res.status(200).json({
      success: true,
      message: 'Contractor debit entry successfully save ho gayi!',
      uid: UID,
      row: nextRow,
    });
  } catch (error) {
    console.error('❌ Contractor Debit Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
});

module.exports = router;