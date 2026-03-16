
// const express = require('express');
// const { sheets, SiteExpeseSheetId } = require('../config/googleSheet');
// const router = express.Router();

// // ============================================================
// // HELPER: Current timestamp — format: 15/03/2026 17:46:41
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
// // HELPER: Find next empty row starting from row 7
// // Looks at columns A to P (adjust if your sheet uses different columns)
// // ============================================================
// const getNextEmptyRow = async (sheetName) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: SiteExpeseSheetId,
//       range: `${sheetName}!A7:P10000`,  // Safe upper limit
//       majorDimension: 'ROWS',
//     });

//     const allRows = response.data.values || [];

//     let lastUsedRow = 6; // before data starts

//     for (let i = 0; i < allRows.length; i++) {
//       const row = allRows[i];
//       if (row && row.some(cell => cell !== '' && cell !== null && cell !== undefined)) {
//         lastUsedRow = 7 + i;
//       }
//     }

//     const nextRow = lastUsedRow + 1;
//     return Math.max(nextRow, 7);
//   } catch (err) {
//     console.error(`Error finding next row in ${sheetName}:`, err);
//     throw err;
//   }
// };

// // ============================================================
// // HELPER: Generate next unique UID (prefix + 4-digit number)
// // ============================================================
// const generateUID = async (sheetName, prefix = '') => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: SiteExpeseSheetId,
//       range: `${sheetName}!B7:B10000`,
//     });

//     const existing = (response.data.values || [])
//       .flat()
//       .filter(Boolean);

//     let count = 1;
//     let newUID;

//     do {
//       newUID = prefix + String(count).padStart(4, '0');
//       count++;
//     } while (existing.includes(newUID));

//     return newUID;
//   } catch (err) {
//     console.error(`Error generating UID for ${sheetName}:`, err);
//     throw err;
//   }
// };

// // ============================================================
// // HELPER: Generate next RCC Bill No (e.g. RCC/2026/0001)
// // ============================================================
// const generateRccBillNo = async () => {
//   try {
//     const year = new Date().getFullYear();
//     const prefix = `RCC/${year}/`;

//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: SiteExpeseSheetId,
//       range: `Site_Exp_FMS!C7:C10000`,
//     });

//     const existing = (response.data.values || [])
//       .flat()
//       .filter(v => v && v.startsWith(prefix));

//     let count = 1;
//     let newBillNo;

//     do {
//       newBillNo = prefix + String(count).padStart(4, '0');
//       count++;
//     } while (existing.includes(newBillNo));

//     return newBillNo;
//   } catch (err) {
//     console.error('Error generating RCC Bill No:', err);
//     throw err;
//   }
// };


// router.post('/site-expense', async (req, res) => {
//   try {
//     const { items = [], ...common } = req.body;

//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({ success: false, message: 'Items array bhejna zaroori hai' });
//     }

//     const Rcc_Bill_No_1 = await generateRccBillNo();
//     const timestamp = getTimestamp();

//     const entries = [];

//     for (const item of items) {
//       const {
//         Exp_Head_1       = '',
//         Details_of_Work_1 = '',
//         Amount_1         = '',
//       } = item;

//       // Exp_Head aur Amount dono zaroori hain
//       if (!Exp_Head_1 || !Amount_1) continue;

//       const nextRow = await getNextEmptyRow('Site_Exp_FMS');
//       const UID     = await generateUID('Site_Exp_FMS', 'SITE');

//       // Sheet columns:
//       // A=Timestamp  B=UID           C=Rcc_Bill_No
//       // D=Vendor     E=Project       F=Engineer
//       // G=Head_Type  H=Details       I=Amount
//       // J=Bill_No    K=Bill_Date     L=Bill_Photo
//       // M=Exp_Head   N=Contractor    O=Firm         P=Remark
//       const rowValues = [
//         timestamp,                                  // A - Timestamp
//         UID,                                        // B - UID
//         Rcc_Bill_No_1,                              // C - Rcc_Bill_No._1
//         common.Vendor_Payee_Name_1     || '',       // D - Vendor/Payee_Name_1
//         common.Project_Name_1          || '',       // E - Project_Name_1
//         common.Project_Engineer_Name_1 || '',       // F - Project_Engineer_Name_1
//         common.Head_Type_1             || '',       // G - Head_Type_1
//         Details_of_Work_1,                          // H - Details_of_Work_1
//         Amount_1,                                   // I - Amount_1
//         common.Bill_No_1               || '',       // J - Bill_No._1
//         common.Bill_Date_1             || '',       // K - Bill_Date_1
//         common.Bill_Photo_1            || '',       // L - Bill_Photo_1
//         Exp_Head_1,                                 // M - Exp._Head_1
//         common.Contractor_Name_1       || '',       // N - Contractor_Name_1
//         common.Contractor_Firm_Name_1  || '',       // O - Contractor_Firm_Name_1
//         common.Remark_1                || '',       // P - Remark_1
//       ];

//       entries.push({ nextRow, UID, values: [rowValues] });
//     }

//     if (entries.length === 0) {
//       return res.status(400).json({ success: false, message: 'Koi valid item nahi mila (Exp Head aur Amount zaroori hain)' });
//     }

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
//       message: `${entries.length} item${entries.length > 1 ? 's' : ''} save ho gaye`,
//       billNo: Rcc_Bill_No_1,
//       saved,
//     });

//   } catch (error) {
//     console.error('❌ Site Expense Error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error: ' + error.message,
//     });
//   }
// });

// // ============================================================
// // POST /api/labour/labour-request   → Sheet: Labour_FMS
// // ============================================================
// router.post('/labour-request', async (req, res) => {
//   try {
//     const {
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
//     const UID = await generateUID('Labour_FMS', 'LAB');

//     const values = [[
//       getTimestamp(),                       // A
//       UID,                                  // B
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
// // POST /api/labour/contractor-debit → Sheet: Contractor_Debit_FMS
// // ============================================================
// router.post('/contractor-debit', async (req, res) => {
//   try {
//     const {
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

//     if (!Project_Name_1 || !Contractor_Name_1 || !Amount_1) {
//       return res.status(400).json({
//         success: false,
//         message: 'Project Name, Contractor Name aur Amount required hain',
//       });
//     }

//     const nextRow = await getNextEmptyRow('Contractor_Debit_FMS');
//     const UID = await generateUID('Contractor_Debit_FMS', 'DEBIT');

//     const values = [[
//       getTimestamp(),                 // A
//       UID,                            // B
//       Project_Name_1 || '',           // C
//       Project_Engineer_1 || '',       // D
//       Contractor_Name_1 || '',        // E
//       Contractor_Firm_Name_1 || '',   // F
//       Work_Type_1 || '',              // G
//       Work_Date_1 || '',              // H
//       Work_Description_1 || '',       // I
//       Particular_1 || '',             // J
//       Qty_1 || '',                    // K
//       Rate_Wages_1 || '',             // L
//       Amount_1 || '',                 // M
//     ]];

//     await sheets.spreadsheets.values.update({
//       spreadsheetId: SiteExpeseSheetId,
//       range: `Contractor_Debit_FMS!A${nextRow}`,   // ← Corrected & fixed
//       valueInputOption: 'USER_ENTERED',
//       requestBody: { values },
//     });

//     return res.status(200).json({
//       success: true,
//       message: 'Contractor debit entry successfully save ho gayi!',
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






//////////////////////////////////////






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


// ✅ REPLACE the entire router.post('/site-expense', ...) with this:

router.post('/site-expense', async (req, res) => {
  try {
    const { items = [], ...common } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items array bhejna zaroori hai' });
    }

    const Rcc_Bill_No_1 = await generateRccBillNo();
    const timestamp = getTimestamp();

    // ✅ FIX: Pehle sirf valid items filter karo
    const validItems = items.filter(item => item.Exp_Head_1 && item.Amount_1);

    if (validItems.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Koi valid item nahi mila (Exp Head aur Amount zaroori hain)' 
      });
    }

    // ✅ FIX: Starting row ek baar lo, phir manually increment karo
    const startRow = await getNextEmptyRow('Site_Exp_FMS');
    const saved = [];

    for (let i = 0; i < validItems.length; i++) {
      const item = validItems[i];
      const {
        Exp_Head_1        = '',
        Details_of_Work_1 = '',
        Amount_1          = '',
      } = item;

      const currentRow = startRow + i;  // ✅ Har item alag row pe
      const UID = await generateUID('Site_Exp_FMS', 'SITE');

      const rowValues = [[
        timestamp,                                  // A - Timestamp
        UID,                                        // B - UID
        Rcc_Bill_No_1,                              // C - Rcc_Bill_No._1
        common.Vendor_Payee_Name_1     || '',       // D - Vendor/Payee_Name_1
        common.Project_Name_1          || '',       // E - Project_Name_1
        common.Project_Engineer_Name_1 || '',       // F - Project_Engineer_Name_1
        common.Head_Type_1             || '',       // G - Head_Type_1  ✅ ab aayega
        Details_of_Work_1,                          // H - Details_of_Work_1
        Amount_1,                                   // I - Amount_1
        common.Bill_No_1               || '',       // J - Bill_No._1
        common.Bill_Date_1             || '',       // K - Bill_Date_1
        common.Bill_Photo_1            || '',       // L - Bill_Photo_1
        Exp_Head_1,                                 // M - Exp._Head_1
        common.Contractor_Name_1       || '',       // N - Contractor_Name_1
        common.Contractor_Firm_Name_1  || '',       // O - Contractor_Firm_Name_1
        common.Remark_1                || '',       // P - Remark_1
      ]];

      await sheets.spreadsheets.values.update({
        spreadsheetId: SiteExpeseSheetId,
        range: `Site_Exp_FMS!A${currentRow}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: rowValues },
      });

      saved.push({ uid: UID, row: currentRow });
    }

    return res.status(200).json({
      success: true,
      message: `${validItems.length} item${validItems.length > 1 ? 's' : ''} save ho gaye`,
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