




const express = require('express');
const { sheets, SiteExpeseSheetId ,drive} = require('../config/googleSheet');
const { Readable } = require('stream');

const router = express.Router();

// ============================================================
// HELPER: Current timestamp — format: 15/03/2026 17:46:41
// ============================================================
const getTimestamp = () => {
  const now = new Date();

  const options = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };

  const formatter = new Intl.DateTimeFormat('en-IN', options);
  const parts = formatter.formatToParts(now);

  const dd   = parts.find(p => p.type === 'day').value;
  const mm   = parts.find(p => p.type === 'month').value;
  const yyyy = parts.find(p => p.type === 'year').value;
  const hh   = parts.find(p => p.type === 'hour').value;
  const min  = parts.find(p => p.type === 'minute').value;
  const ss   = parts.find(p => p.type === 'second').value;

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




async function uploadToGoogleDrive(base64Data, fileName) {
  console.log(`[DRIVE UPLOAD START] ${fileName}`);

  if (!base64Data || typeof base64Data !== 'string') {
    console.warn(`[DRIVE FAILED] ${fileName} → No base64 data provided`);
    return '';
  }

  let mimeType = 'image/jpeg'; // Default
  let base64Content = base64Data;
  let fileExtension = 'jpg';   // Default extension

  // ✅ Data URI format check
  const match = base64Data.match(/^data:([a-zA-Z0-9\/\-\+\.]+);base64,(.+)$/);
  if (match) {
    mimeType = match[1];
    base64Content = match[2];

    // ✅ mimeType se extension detect karo
    const mimeToExt = {
      'image/jpeg'               : 'jpg',
      'image/jpg'                : 'jpg',
      'image/png'                : 'png',
      'image/gif'                : 'gif',
      'image/webp'               : 'webp',
      'image/bmp'                : 'bmp',
      'image/svg+xml'            : 'svg',
      'image/tiff'               : 'tiff',
      'image/heic'               : 'heic',
      'image/heif'               : 'heif',
      'application/pdf'          : 'pdf',
      'application/msword'       : 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel' : 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'     : 'xlsx',
    };

    fileExtension = mimeToExt[mimeType] || 'bin';
    console.log(`[DRIVE] Data URI detected → mimeType: ${mimeType}, extension: .${fileExtension}`);

  } else {
    // ✅ Plain base64 - file signature se type detect karo
    const sample = base64Data.substring(0, 16);
    const decoded = Buffer.from(sample, 'base64').toString('hex');

    if (decoded.startsWith('ffd8ff')) {
      mimeType = 'image/jpeg'; fileExtension = 'jpg';
    } else if (decoded.startsWith('89504e47')) {
      mimeType = 'image/png';  fileExtension = 'png';
    } else if (decoded.startsWith('47494638')) {
      mimeType = 'image/gif';  fileExtension = 'gif';
    } else if (decoded.startsWith('25504446')) {
      mimeType = 'application/pdf'; fileExtension = 'pdf';
    } else if (decoded.startsWith('52494646')) {
      mimeType = 'image/webp'; fileExtension = 'webp';
    } else {
      mimeType = 'application/octet-stream'; fileExtension = 'bin';
    }

    console.log(`[DRIVE] Plain base64 detected → mimeType: ${mimeType}, extension: .${fileExtension}`);
  }

  // ✅ fileName me sahi extension lagao
  const baseName = fileName.replace(/\.[^/.]+$/, ''); // purani extension hatao
  const finalFileName = `${baseName}.${fileExtension}`;
  console.log(`[DRIVE] Final file name: ${finalFileName}`);

  try {
    const buffer = Buffer.from(base64Content, 'base64');

    const fileStream = new Readable();
    fileStream.push(buffer);
    fileStream.push(null);

    const fileMetadata = {
      name: finalFileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType,
      body: fileStream,
    };

    const res = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
      supportsAllDrives: true,
    });

    const fileId = res.data.id;

    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
      supportsAllDrives: true,
    });

const viewUrl = `https://drive.google.com/file/d/${fileId}/view?usp=drivesdk`;
    console.log(`[DRIVE SUCCESS] ${finalFileName} → ${viewUrl}`);
    return viewUrl;

  } catch (error) {
    console.error(`[DRIVE ERROR] ${finalFileName}:`, error.message);
    if (error.response?.data) console.error(error.response.data);
    return '';
  }
}

router.post('/site-expense', async (req, res) => {
  try {
    const { items = [], ...common } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items array bhejna zaroori hai' });
    }

    const Rcc_Bill_No_1 = await generateRccBillNo();
    const timestamp = getTimestamp();

    const validItems = items.filter(item => item.Exp_Head_1 && item.Amount_1);

    if (validItems.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Koi valid item nahi mila (Exp Head aur Amount zaroori hain)' 
      });
    }

    // ✅ Bill Photo pehle Drive pe upload karo
    let billPhotoUrl = '';
    if (common.Bill_Photo_1) {
      const photoFileName = `Bill_${Rcc_Bill_No_1}_${Date.now()}.jpg`;
      billPhotoUrl = await uploadToGoogleDrive(common.Bill_Photo_1, photoFileName);
      console.log(`[PHOTO URL] ${billPhotoUrl}`);
    }

    const startRow = await getNextEmptyRow('Site_Exp_FMS');
    const saved = [];

    for (let i = 0; i < validItems.length; i++) {
      const item = validItems[i];
      const {
        Exp_Head_1        = '',
        Details_of_Work_1 = '',
        Amount_1          = '',
      } = item;

      const currentRow = startRow + i;
      const UID = await generateUID('Site_Exp_FMS', 'SITE');

      const rowValues = [[
        timestamp,                                  // A - Timestamp
        UID,                                        // B - UID
        Rcc_Bill_No_1,                              // C - Rcc_Bill_No._1
        common.Vendor_Payee_Name_1     || '',       // D - Vendor/Payee_Name_1
        common.Project_Name_1          || '',       // E - Project_Name_1
        common.Project_Engineer_Name_1 || '',       // F - Project_Engineer_Name_1
        common.Head_Type_1             || '',       // G - Head_Type_1
        Details_of_Work_1,                          // H - Details_of_Work_1
        Amount_1,                                   // I - Amount_1
        common.Bill_No_1               || '',       // J - Bill_No._1
        common.Bill_Date_1             || '',       // K - Bill_Date_1
        billPhotoUrl,                               // L - Bill_Photo_1 ✅ Drive URL
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

      saved.push({ uid: UID, row: currentRow, billPhotoUrl });
    }

    return res.status(200).json({
      success: true,
      message: `${validItems.length} item${validItems.length > 1 ? 's' : ''} save ho gaye`,
      billNo: Rcc_Bill_No_1,
      billPhotoUrl,  // ✅ Response me bhi URL
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






// ✅ REPLACE the entire router.post('/site-expense', ...) with this:

// router.post('/site-expense', async (req, res) => {
//   try {
//     const { items = [], ...common } = req.body;

//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({ success: false, message: 'Items array bhejna zaroori hai' });
//     }

//     const Rcc_Bill_No_1 = await generateRccBillNo();
//     const timestamp = getTimestamp();

//     // ✅ FIX: Pehle sirf valid items filter karo
//     const validItems = items.filter(item => item.Exp_Head_1 && item.Amount_1);

//     if (validItems.length === 0) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Koi valid item nahi mila (Exp Head aur Amount zaroori hain)' 
//       });
//     }

//     // ✅ FIX: Starting row ek baar lo, phir manually increment karo
//     const startRow = await getNextEmptyRow('Site_Exp_FMS');
//     const saved = [];

//     for (let i = 0; i < validItems.length; i++) {
//       const item = validItems[i];
//       const {
//         Exp_Head_1        = '',
//         Details_of_Work_1 = '',
//         Amount_1          = '',
//       } = item;

//       const currentRow = startRow + i;  // ✅ Har item alag row pe
//       const UID = await generateUID('Site_Exp_FMS', 'SITE');

//       const rowValues = [[
//         timestamp,                                  // A - Timestamp
//         UID,                                        // B - UID
//         Rcc_Bill_No_1,                              // C - Rcc_Bill_No._1
//         common.Vendor_Payee_Name_1     || '',       // D - Vendor/Payee_Name_1
//         common.Project_Name_1          || '',       // E - Project_Name_1
//         common.Project_Engineer_Name_1 || '',       // F - Project_Engineer_Name_1
//         common.Head_Type_1             || '',       // G - Head_Type_1  ✅ ab aayega
//         Details_of_Work_1,                          // H - Details_of_Work_1
//         Amount_1,                                   // I - Amount_1
//         common.Bill_No_1               || '',       // J - Bill_No._1
//         common.Bill_Date_1             || '',       // K - Bill_Date_1
//         common.Bill_Photo_1            || '',       // L - Bill_Photo_1
//         Exp_Head_1,                                 // M - Exp._Head_1
//         common.Contractor_Name_1       || '',       // N - Contractor_Name_1
//         common.Contractor_Firm_Name_1  || '',       // O - Contractor_Firm_Name_1
//         common.Remark_1                || '',       // P - Remark_1
//       ]];

//       await sheets.spreadsheets.values.update({
//         spreadsheetId: SiteExpeseSheetId,
//         range: `Site_Exp_FMS!A${currentRow}`,
//         valueInputOption: 'USER_ENTERED',
//         requestBody: { values: rowValues },
//       });

//       saved.push({ uid: UID, row: currentRow });
//     }

//     return res.status(200).json({
//       success: true,
//       message: `${validItems.length} item${validItems.length > 1 ? 's' : ''} save ho gaye`,
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