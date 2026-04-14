

// const express = require('express');
// const { sheets, spreadsheetId } = require('../config/googleSheet');
// const router = express.Router();



// router.get('/Payment', async (req, res) => {
//   try {
//     // Billing_FMS aur Payment_Sheet pehle fetch karo (SAME AS ORIGINAL)
//     const [billingResponse, paymentSheetResponse] = await Promise.all([
//       sheets.spreadsheets.values.get({
//         spreadsheetId,
//         range: 'Billing_FMS!A8:CC',
//       }),
//       sheets.spreadsheets.values.get({
//         spreadsheetId,
//         range: "Payment_Sheet!A:O",
//       })
//     ]);

//     // Advance_Payment_Sheet ALAG se fetch karo
//     // Agar yeh fail ho toh bhi baaki poora flow NORMAL chalega - koi break nahi
//     let advanceRows = [];
//     try {
//       const advancePaymentResponse = await sheets.spreadsheets.values.get({
//         spreadsheetId,
//         range: "Advance_Payment_Sheet!A:I",
//       });
//       advanceRows = advancePaymentResponse.data.values || [];
//     } catch (advErr) {
//       console.warn("Advance_Payment_Sheet fetch failed (ignored):", advErr.message);
//     }

//     const billingRows = billingResponse.data.values || [];
//     const paymentRows = paymentSheetResponse.data.values || [];

//     // Advance Payment map: key = "siteName|||vendorName" → total advance amount
//     const advanceMap = new Map();
//     for (let i = 1; i < advanceRows.length; i++) {
//       const aRow = advanceRows[i];
//       if (!aRow || aRow.length < 4) continue;
//       const aSite   = (aRow[1] || "").toString().trim();   // B - Site Name
//       const aVendor = (aRow[2] || "").toString().trim();   // C - Vendor Firm Name
//       const aAmount = parseFloat((aRow[3] || "0").toString().replace(/,/g, "").trim()) || 0; // D - PAID_AMOUNT_17
//       if (!aSite || !aVendor || !aAmount) continue;
//       const key = `${aSite.toLowerCase()}|||${aVendor.toLowerCase()}`;
//       advanceMap.set(key, (advanceMap.get(key) || 0) + aAmount);
//     }

//     const processedData = billingRows
//       .filter(row => {
//         const netAmount17 = (row[73] || "").toString().trim();
//         if (!netAmount17 || netAmount17 === '-' || netAmount17 === '') return false;

//         const balanceStr = (row[75] || "").toString().trim();
//         if (balanceStr !== '') {
//           const balanceNum = parseFloat(balanceStr);
//           if (!isNaN(balanceNum) && balanceNum === 0) return false;
//         }
//         return true;
//       })
//       .map(row => {
//         const currentInvoiceNo = (row[52] || "").toString().trim();
//         const currentVendor = row[51] ? String(row[51]).trim() : (row[23] ? String(row[23]).trim() : '');
//         const currentSite = row[3] ? String(row[3]).trim() : '';

//         let latestPaidAmount = "0";
//         let latestBalanceAmount = "0";

//         if (currentInvoiceNo && paymentRows.length > 0) {
//           for (let i = paymentRows.length - 1; i >= 0; i--) {
//             const pRow = paymentRows[i];
//             const pInvoiceNo = (pRow[4] || "").toString().trim();
//             const pVendor    = (pRow[2] || "").toString().trim();
//             if (pInvoiceNo === currentInvoiceNo && pVendor === currentVendor) {
//               latestPaidAmount    = (pRow[7] || "0").toString().trim();
//               latestBalanceAmount = (pRow[8] || "0").toString().trim();
//               break;
//             }
//           }
//         }

//         // Advance amount for this site+vendor
//         const advanceKey    = `${currentSite.toLowerCase()}|||${currentVendor.toLowerCase()}`;
//         const advanceAmount = advanceMap.get(advanceKey) || 0;

//         return {
//           planned17:              row[69]  ? String(row[69]).trim()  : '',
//           UID:                    row[1]   ? String(row[1]).trim()   : '',
//           siteName:               currentSite,
//           materialType:           row[5]   ? String(row[5]).trim()   : '',
//           skuCode:                row[6]   ? String(row[6]).trim()   : '',
//           materialName:           row[7]   ? String(row[7]).trim()   : '',
//           netAmount17:            row[73]  ? String(row[73]).trim()  : '0',
//           netAmount16:            row[67]  ? String(row[67]).trim()  : '0',
//           revisedQuantity:        row[25]  ? String(row[25]).trim()  : '',
//           finalReceivedQuantity:  row[26]  ? String(row[26]).trim()  : '',
//           unitName:               row[9]   ? String(row[9]).trim()   : '',
//           finalIndentNo:          row[12]  ? String(row[12]).trim()  : '',
//           finalIndentPDF:         row[13]  ? String(row[13]).trim()  : '',
//           approvalQuotationNo:    row[14]  ? String(row[14]).trim()  : '',
//           approvalQuotationPDF:   row[15]  ? String(row[15]).trim()  : '',
//           poNumber:               row[16]  ? String(row[16]).trim()  : '',
//           poPDF:                  row[17]  ? String(row[17]).trim()  : '',
//           mrnNo:                  row[18]  ? String(row[18]).trim()  : '',
//           mrnPDF:                 row[19]  ? String(row[19]).trim()  : '',
//           vendorFirmName:         currentVendor,
//           invoice13:              currentInvoiceNo,
//           invoicePhoto:           row[37]  ? String(row[37]).trim()  : '',
//           billDate:               row[53]  ? String(row[53]).trim()  : '',
//           latestPaidAmount,
//           latestBalanceAmount,
//           advanceAmount,  // 0 if no advance found
//         };
//       });

//     // Unique vendors & sites
//     const vendorSeen = new Set();
//     const siteSeen   = new Set();
//     const uniqueVendors = [];
//     const uniqueSites   = [];

//     processedData.forEach(item => {
//       if (item.vendorFirmName && !vendorSeen.has(item.vendorFirmName)) {
//         vendorSeen.add(item.vendorFirmName);
//         uniqueVendors.push({ vendorFirmName: item.vendorFirmName });
//       }
//       if (item.siteName && !siteSeen.has(item.siteName)) {
//         siteSeen.add(item.siteName);
//         uniqueSites.push({ siteName: item.siteName });
//       }
//     });

//     res.json({
//       success: true,
//       count: processedData.length,
//       data: processedData,
//       uniqueVendors,
//       uniqueSites
//     });

//   } catch (error) {
//     console.error('Error in /Payment API:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });




// router.post("/Update-Payment", async (req, res) => {
//   try {
//     const paymentDataArray = req.body;

//     if (!Array.isArray(paymentDataArray) || paymentDataArray.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: "Request body must be a non-empty array of payment objects.",
//       });
//     }

//     const normalize = (str) =>
//       (str || "").toString().trim().toLowerCase().replace(/\s+/g, " ");

//     // Billing_FMS se AZ (Vendor) aur BA (Bill No) read karo - SAME AS ORIGINAL
//     const findRowRes = await sheets.spreadsheets.values.get({
//       spreadsheetId: spreadsheetId,
//       range: 'Billing_FMS!AZ8:BA',
//     });

//     const sheetRows = findRowRes.data.values || [];

//     const VENDOR_INDEX  = 0;  // AZ
//     const BILL_NO_INDEX = 1;  // BA

//     const rowMap       = new Map();
//     const missingBills = [];

//     for (const item of paymentDataArray) {
//       const billNo = (item.billNo || "").toString().trim();
//       const vendor = normalize(item.vendorFirmName16);

//       if (!billNo || !vendor) {
//         missingBills.push({ billNo: billNo || "missing", vendor: vendor || "missing" });
//         continue;
//       }

//       let foundRowNumber = null;

//       for (let i = 0; i < sheetRows.length; i++) {
//         const row = sheetRows[i];
//         if (row.length < 2) continue;
//         const sheetVendor = normalize(row[VENDOR_INDEX]);
//         const sheetBillNo = (row[BILL_NO_INDEX] || "").toString().trim();
//         if (sheetBillNo === billNo && sheetVendor === vendor) {
//           foundRowNumber = 8 + i;
//           console.log(`MATCH FOUND → Row ${foundRowNumber} | Bill: ${billNo} | Vendor: ${vendor}`);
//         }
//       }

//       if (foundRowNumber) {
//         rowMap.set(billNo, foundRowNumber);
//       } else {
//         missingBills.push({
//           billNo,
//           vendor: item.vendorFirmName16,
//           reason: "Bill number + Vendor name not found in Billing_FMS",
//           normalizedVendorSent: vendor
//         });
//       }
//     }

//     console.log(`Total matches found: ${rowMap.size} out of ${paymentDataArray.length}`);
//     if (missingBills.length > 0) console.log("Missing bills:", missingBills);

//     const fmsUpdates     = [];
//     const newPaymentRows = [];

//     const now = new Date().toLocaleString('en-IN', {
//       timeZone: 'Asia/Kolkata',
//       day: '2-digit', month: '2-digit', year: 'numeric',
//       hour: '2-digit', minute: '2-digit', second: '2-digit',
//       hour12: false,
//     }).replace(',', '');

//     for (const item of paymentDataArray) {
//       const {
//         timestamp        = now,
//         planned17        = "",
//         siteName         = "",
//         vendorFirmName16 = "",
//         billNo           = "",
//         billDate16       = "",
//         netAmount16      = "",
//         currentPaid      = "",
//         paidAmount17     = "",
//         balanceAmount17  = "",
//         bankDetails17    = "",
//         paymentMode17    = "",
//         paymentDetails17 = "",
//         paymentDate18    = "",
//         grandTotal       = ""
//       } = item;

//       const targetRow = rowMap.get(billNo.trim());

//       if (targetRow) {
//         // Billing_FMS mein update - SAME AS ORIGINAL (BT, BW, BX, BY, BZ, CA, CB)
//         fmsUpdates.push(
//           { range: `Billing_FMS!BT${targetRow}`, values: [["Done"]] },
//           { range: `Billing_FMS!BW${targetRow}`, values: [[paidAmount17]] },
//           { range: `Billing_FMS!BX${targetRow}`, values: [[balanceAmount17]] },
//           { range: `Billing_FMS!BY${targetRow}`, values: [[bankDetails17]] },
//           { range: `Billing_FMS!BZ${targetRow}`, values: [[paymentMode17]] },
//           { range: `Billing_FMS!CA${targetRow}`, values: [[paymentDetails17]] },
//           { range: `Billing_FMS!CB${targetRow}`, values: [[paymentDate18]] }
//         );
//       }

//       // Payment_Sheet row - SAME AS ORIGINAL (14 columns, order same)
//       newPaymentRows.push([
//         timestamp,
//         planned17,
//         siteName,
//         vendorFirmName16,
//         billNo,
//         billDate16,
//         netAmount16,
//         currentPaid,
//         balanceAmount17,
//         bankDetails17,
//         paymentMode17,
//         paymentDetails17,
//         paymentDate18,
//         grandTotal
//       ]);
//     }

//     // 1. Billing_FMS batch update - SAME AS ORIGINAL
//     if (fmsUpdates.length > 0) {
//       const batchResult = await sheets.spreadsheets.values.batchUpdate({
//         spreadsheetId: spreadsheetId,
//         resource: {
//           valueInputOption: 'USER_ENTERED',
//           data: fmsUpdates
//         }
//       });
//       console.log("Billing_FMS updated. Cells changed:", batchResult.data.totalUpdatedCells || 0);
//     }

//     // 2. Payment_Sheet append - SAME AS ORIGINAL
//     if (newPaymentRows.length > 0) {
//       const existingRes = await sheets.spreadsheets.values.get({
//         spreadsheetId: spreadsheetId,
//         range: 'Payment_Sheet!A:A',
//       });

//       const columnA = existingRes.data.values || [];
//       let firstEmptyRow = 2;

//       for (let i = 1; i < columnA.length; i++) {
//         if (!columnA[i] || !columnA[i][0] || String(columnA[i][0]).trim() === "") {
//           firstEmptyRow = i + 1;
//           break;
//         }
//       }

//       if (firstEmptyRow === 2 && columnA.length > 1 && columnA[columnA.length - 1][0]) {
//         firstEmptyRow = columnA.length + 1;
//       }

//       await sheets.spreadsheets.values.update({
//         spreadsheetId: spreadsheetId,
//         range: `Payment_Sheet!A${firstEmptyRow}`,
//         valueInputOption: 'USER_ENTERED',
//         resource: { values: newPaymentRows }
//       });

//       console.log(`Added ${newPaymentRows.length} rows to Payment_Sheet at row ${firstEmptyRow}`);
//     }

//     res.json({
//       success: true,
//       updatedInFMS: Math.floor(fmsUpdates.length / 7),
//       addedToPaymentSheet: newPaymentRows.length,
//       missingBills: missingBills.length > 0 ? missingBills : undefined
//     });

//   } catch (error) {
//     console.error('Error in /Update-Payment:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || "Internal server error"
//     });
//   }
// });


// module.exports = router;





////




// const express = require('express');
// const { sheets, spreadsheetId } = require('../config/googleSheet');
// const router = express.Router();



// router.get('/Payment', async (req, res) => {
//   try {
//     const [billingResponse, paymentSheetResponse] = await Promise.all([
//       sheets.spreadsheets.values.get({
//         spreadsheetId,
//         range: 'Billing_FMS!A8:CC',
//       }),
//       sheets.spreadsheets.values.get({
//         spreadsheetId,
//         range: "Payment_Sheet!A:P",
//       })
//     ]);

//     let advanceRows = [];
//     try {
//       const advancePaymentResponse = await sheets.spreadsheets.values.get({
//         spreadsheetId,
//         range: "Advance_Payment_Sheet!A:I",
//       });
//       advanceRows = advancePaymentResponse.data.values || [];
//     } catch (advErr) {
//       console.warn("Advance_Payment_Sheet fetch failed (ignored):", advErr.message);
//     }

//     const billingRows = billingResponse.data.values || [];
//     const paymentRows = paymentSheetResponse.data.values || [];

//     const advanceMap = new Map();
//     for (let i = 1; i < advanceRows.length; i++) {
//       const aRow = advanceRows[i];
//       if (!aRow || aRow.length < 4) continue;
//       const aSite   = (aRow[1] || "").toString().trim();
//       const aVendor = (aRow[2] || "").toString().trim();
//       const aAmount = parseFloat((aRow[3] || "0").toString().replace(/,/g, "").trim()) || 0;
//       if (!aSite || !aVendor || !aAmount) continue;
//       const key = `${aSite.toLowerCase()}|||${aVendor.toLowerCase()}`;
//       advanceMap.set(key, (advanceMap.get(key) || 0) + aAmount);
//     }

//     const processedData = billingRows
//       .filter(row => {
//         const netAmount17 = (row[73] || "").toString().trim();
//         if (!netAmount17 || netAmount17 === '-' || netAmount17 === '') return false;
//         const balanceStr = (row[75] || "").toString().trim();
//         if (balanceStr !== '') {
//           const balanceNum = parseFloat(balanceStr);
//           if (!isNaN(balanceNum) && balanceNum === 0) return false;
//         }
//         return true;
//       })
//       .map(row => {
//         const currentInvoiceNo = (row[52] || "").toString().trim();
//         const currentVendor = row[51] ? String(row[51]).trim() : (row[23] ? String(row[23]).trim() : '');
//         const currentSite = row[3] ? String(row[3]).trim() : '';

//         let latestPaidAmount    = "0";
//         let latestBalanceAmount = "0";

//         if (currentInvoiceNo && paymentRows.length > 0) {
//           for (let i = paymentRows.length - 1; i >= 0; i--) {
//             const pRow = paymentRows[i];
//             const pInvoiceNo = (pRow[4] || "").toString().trim();
//             const pVendor    = (pRow[2] || "").toString().trim();
//             if (pInvoiceNo === currentInvoiceNo && pVendor === currentVendor) {
//               latestPaidAmount    = (pRow[7]  || "0").toString().trim(); // H
//               latestBalanceAmount = (pRow[8]  || "0").toString().trim(); // I
//               break;
//             }
//           }
//         }

//         const advanceKey    = `${currentSite.toLowerCase()}|||${currentVendor.toLowerCase()}`;
//         const advanceAmount = advanceMap.get(advanceKey) || 0;

//         return {
//           planned17:              row[69]  ? String(row[69]).trim()  : '',
//           UID:                    row[1]   ? String(row[1]).trim()   : '',
//           siteName:               currentSite,
//           materialType:           row[5]   ? String(row[5]).trim()   : '',
//           skuCode:                row[6]   ? String(row[6]).trim()   : '',
//           materialName:           row[7]   ? String(row[7]).trim()   : '',
//           netAmount17:            row[73]  ? String(row[73]).trim()  : '0',
//           netAmount16:            row[67]  ? String(row[67]).trim()  : '0',
//           revisedQuantity:        row[25]  ? String(row[25]).trim()  : '',
//           finalReceivedQuantity:  row[26]  ? String(row[26]).trim()  : '',
//           unitName:               row[9]   ? String(row[9]).trim()   : '',
//           finalIndentNo:          row[12]  ? String(row[12]).trim()  : '',
//           finalIndentPDF:         row[13]  ? String(row[13]).trim()  : '',
//           approvalQuotationNo:    row[14]  ? String(row[14]).trim()  : '',
//           approvalQuotationPDF:   row[15]  ? String(row[15]).trim()  : '',
//           poNumber:               row[16]  ? String(row[16]).trim()  : '',
//           poPDF:                  row[17]  ? String(row[17]).trim()  : '',
//           mrnNo:                  row[18]  ? String(row[18]).trim()  : '',
//           mrnPDF:                 row[19]  ? String(row[19]).trim()  : '',
//           vendorFirmName:         currentVendor,
//           invoice13:              currentInvoiceNo,
//           invoicePhoto:           row[37]  ? String(row[37]).trim()  : '',
//           billDate:               row[53]  ? String(row[53]).trim()  : '',
//           latestPaidAmount,
//           latestBalanceAmount,
//           advanceAmount,
//         };
//       });

//     const vendorSeen = new Set();
//     const siteSeen   = new Set();
//     const uniqueVendors = [];
//     const uniqueSites   = [];

//     processedData.forEach(item => {
//       if (item.vendorFirmName && !vendorSeen.has(item.vendorFirmName)) {
//         vendorSeen.add(item.vendorFirmName);
//         uniqueVendors.push({ vendorFirmName: item.vendorFirmName });
//       }
//       if (item.siteName && !siteSeen.has(item.siteName)) {
//         siteSeen.add(item.siteName);
//         uniqueSites.push({ siteName: item.siteName });
//       }
//     });

//     res.json({
//       success: true,
//       count: processedData.length,
//       data: processedData,
//       uniqueVendors,
//       uniqueSites
//     });

//   } catch (error) {
//     console.error('Error in /Payment API:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });




// router.post("/Update-Payment", async (req, res) => {
//   try {
//     const paymentDataArray = req.body;

//     if (!Array.isArray(paymentDataArray) || paymentDataArray.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: "Request body must be a non-empty array of payment objects.",
//       });
//     }

//     const normalize = (str) =>
//       (str || "").toString().trim().toLowerCase().replace(/\s+/g, " ");

//     const findRowRes = await sheets.spreadsheets.values.get({
//       spreadsheetId: spreadsheetId,
//       range: 'Billing_FMS!A8:BA',
//     });

//     const sheetRows = findRowRes.data.values || [];
//     const rowMap       = new Map();
//     const missingBills = [];

//     for (const item of paymentDataArray) {
//       const billNo       = (item.billNo || "").toString().trim();
//       const vendorFromFE = normalize(item.vendorFirmName16);

//       if (!billNo || !vendorFromFE) {
//         missingBills.push({ billNo: billNo || "missing", vendor: vendorFromFE || "missing" });
//         continue;
//       }

//       let foundRowNumber = null;

//       for (let i = 0; i < sheetRows.length; i++) {
//         const row = sheetRows[i];
//         const sheetVendorRaw = row[51]
//           ? String(row[51]).trim()
//           : (row[23] ? String(row[23]).trim() : '');
//         const sheetVendor = normalize(sheetVendorRaw);
//         const sheetBillNo = (row[52] || "").toString().trim();

//         if (sheetBillNo === billNo && sheetVendor === vendorFromFE) {
//           foundRowNumber = 8 + i;
//           console.log(`MATCH FOUND -> Row ${foundRowNumber} | Bill: ${billNo} | Vendor: ${sheetVendorRaw}`);
//         }
//       }

//       if (foundRowNumber) {
//         rowMap.set(billNo, foundRowNumber);
//       } else {
//         const billExists = sheetRows.find(r => (r[52] || "").toString().trim() === billNo);
//         if (billExists) {
//           const sv = billExists[51] ? String(billExists[51]).trim() : (billExists[23] ? String(billExists[23]).trim() : '');
//           console.log(`NO MATCH - Bill found but vendor mismatch! Sheet: "${normalize(sv)}" vs Sent: "${vendorFromFE}"`);
//         } else {
//           console.log(`NO MATCH - Bill NOT found in sheet: ${billNo}`);
//         }
//         missingBills.push({ billNo, vendor: item.vendorFirmName16, reason: "Not found in Billing_FMS" });
//       }
//     }

//     console.log(`Total matches found: ${rowMap.size} out of ${paymentDataArray.length}`);

//     const fmsUpdates     = [];
//     const newPaymentRows = [];

//     const now = new Date().toLocaleString('en-IN', {
//       timeZone: 'Asia/Kolkata',
//       day: '2-digit', month: '2-digit', year: 'numeric',
//       hour: '2-digit', minute: '2-digit', second: '2-digit',
//       hour12: false,
//     }).replace(',', '');

//     for (const item of paymentDataArray) {
//       const {
//         timestamp        = now,
//         planned17        = "",
//         siteName         = "",
//         vendorFirmName16 = "",
//         billNo           = "",
//         billDate16       = "",
//         netAmount16      = "",
//         currentPaid      = "",   // H = sirf input box ki value
//         paidAmount17     = "",   // BW = Billing_FMS mein total paid
//         balanceAmount17  = "",   // BX / I = balance
//         bankDetails17    = "",
//         paymentMode17    = "",
//         paymentDetails17 = "",
//         paymentDate18    = "",
//         grandTotal       = "",
//         advanceAmount    = "0"   // P = advance
//       } = item;

//       const targetRow = rowMap.get(billNo.trim());

//       if (targetRow) {
//         fmsUpdates.push(
//           { range: `Billing_FMS!BT${targetRow}`, values: [["Done"]] },
//           { range: `Billing_FMS!BW${targetRow}`, values: [[paidAmount17]] },
//           { range: `Billing_FMS!BX${targetRow}`, values: [[balanceAmount17]] },
//           { range: `Billing_FMS!BY${targetRow}`, values: [[bankDetails17]] },
//           { range: `Billing_FMS!BZ${targetRow}`, values: [[paymentMode17]] },
//           { range: `Billing_FMS!CA${targetRow}`, values: [[paymentDetails17]] },
//           { range: `Billing_FMS!CB${targetRow}`, values: [[paymentDate18]] }
//         );
//       }

//       // Payment_Sheet:
//       // A=timestamp B=planned17 C=siteName D=vendor E=billNo
//       // F=billDate  G=netAmount H=currentPaid(input only) I=balance
//       // J=bankDetails K=paymentMode L=paymentDetails M=paymentDate
//       // N=grandTotal  O=blank  P=advanceAmount
//       newPaymentRows.push([
//         timestamp,          // A
//         planned17,          // B
//         siteName,           // C
//         vendorFirmName16,   // D
//         billNo,             // E
//         billDate16,         // F
//         netAmount16,        // G
//         currentPaid,        // H - sirf jo input mein dala (advance nahi)
//         balanceAmount17,    // I - H+P = netAmount toh 0, warna remaining
//         bankDetails17,      // J
//         paymentMode17,      // K
//         paymentDetails17,   // L
//         paymentDate18,      // M
//         grandTotal,         // N
//         "",                 // O - blank
//         advanceAmount       // P - advance amount
//       ]);
//     }

//     if (fmsUpdates.length > 0) {
//       const batchResult = await sheets.spreadsheets.values.batchUpdate({
//         spreadsheetId: spreadsheetId,
//         resource: {
//           valueInputOption: 'USER_ENTERED',
//           data: fmsUpdates
//         }
//       });
//       console.log("Billing_FMS updated. Cells changed:", batchResult.data.totalUpdatedCells || 0);
//     }

//     if (newPaymentRows.length > 0) {
//       const existingRes = await sheets.spreadsheets.values.get({
//         spreadsheetId: spreadsheetId,
//         range: 'Payment_Sheet!A:A',
//       });

//       const columnA = existingRes.data.values || [];
//       let firstEmptyRow = 2;

//       for (let i = 1; i < columnA.length; i++) {
//         if (!columnA[i] || !columnA[i][0] || String(columnA[i][0]).trim() === "") {
//           firstEmptyRow = i + 1;
//           break;
//         }
//       }

//       if (firstEmptyRow === 2 && columnA.length > 1 && columnA[columnA.length - 1][0]) {
//         firstEmptyRow = columnA.length + 1;
//       }

//       await sheets.spreadsheets.values.update({
//         spreadsheetId: spreadsheetId,
//         range: `Payment_Sheet!A${firstEmptyRow}`,
//         valueInputOption: 'USER_ENTERED',
//         resource: { values: newPaymentRows }
//       });

//       console.log(`Added ${newPaymentRows.length} rows to Payment_Sheet at row ${firstEmptyRow}`);
//     }

//     res.json({
//       success: true,
//       updatedInFMS: Math.floor(fmsUpdates.length / 7),
//       addedToPaymentSheet: newPaymentRows.length,
//       missingBills: missingBills.length > 0 ? missingBills : undefined
//     });

//   } catch (error) {
//     console.error('Error in /Update-Payment:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || "Internal server error"
//     });
//   }
// });


// module.exports = router;




//////////

const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');
const router = express.Router();

router.get('/Payment', async (req, res) => {
  try {
    const [billingResponse, paymentSheetResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Billing_FMS!A8:CC',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Payment_Sheet!A:P",
      })
    ]);

    let advanceRows = [];
    try {
      const advancePaymentResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Advance_Payment_Sheet!A:I",
      });
      advanceRows = advancePaymentResponse.data.values || [];
    } catch (advErr) {
      console.warn("Advance_Payment_Sheet fetch failed (ignored):", advErr.message);
    }

    const billingRows = billingResponse.data.values || [];
    const paymentRows = paymentSheetResponse.data.values || [];

    const advanceMap = new Map();
    for (let i = 1; i < advanceRows.length; i++) {
      const aRow = advanceRows[i];
      if (!aRow || aRow.length < 4) continue;
      const aSite   = (aRow[1] || "").toString().trim();
      const aVendor = (aRow[2] || "").toString().trim();
      const aAmount = parseFloat((aRow[3] || "0").toString().replace(/,/g, "").trim()) || 0;
      if (!aSite || !aVendor || !aAmount) continue;
      const key = `${aSite.toLowerCase()}|||${aVendor.toLowerCase()}`;
      advanceMap.set(key, (advanceMap.get(key) || 0) + aAmount);
    }

    const processedData = billingRows
      .filter(row => {
        const netAmount17 = (row[73] || "").toString().trim();
        if (!netAmount17 || netAmount17 === '-' || netAmount17 === '') return false;
        const balanceStr = (row[75] || "").toString().trim();
        if (balanceStr !== '') {
          const balanceNum = parseFloat(balanceStr);
          if (!isNaN(balanceNum) && balanceNum === 0) return false;
        }
        return true;
      })
      .map(row => {
        const currentInvoiceNo = (row[52] || "").toString().trim();
        const currentVendor = row[51] ? String(row[51]).trim() : (row[23] ? String(row[23]).trim() : '');
        const currentSite = row[3] ? String(row[3]).trim() : '';

        let latestPaidAmount    = "0";
        let latestBalanceAmount = "0";

        if (currentInvoiceNo && paymentRows.length > 0) {
          for (let i = paymentRows.length - 1; i >= 0; i--) {
            const pRow = paymentRows[i];
            const pInvoiceNo = (pRow[4] || "").toString().trim();
            const pVendor    = (pRow[2] || "").toString().trim();
            if (pInvoiceNo === currentInvoiceNo && pVendor === currentVendor) {
              latestPaidAmount    = (pRow[7]  || "0").toString().trim(); // H
              latestBalanceAmount = (pRow[8]  || "0").toString().trim(); // I
              break;
            }
          }
        }

        const advanceKey    = `${currentSite.toLowerCase()}|||${currentVendor.toLowerCase()}`;
        const advanceAmount = advanceMap.get(advanceKey) || 0;

        return {
          planned17:              row[69]  ? String(row[69]).trim()  : '',
          UID:                    row[1]   ? String(row[1]).trim()   : '',
          siteName:               currentSite,
          materialType:           row[5]   ? String(row[5]).trim()   : '',
          skuCode:                row[6]   ? String(row[6]).trim()   : '',
          materialName:           row[7]   ? String(row[7]).trim()   : '',
          netAmount17:            row[73]  ? String(row[73]).trim()  : '0',
          netAmount16:            row[67]  ? String(row[67]).trim()  : '0',
          revisedQuantity:        row[25]  ? String(row[25]).trim()  : '',
          finalReceivedQuantity:  row[26]  ? String(row[26]).trim()  : '',
          unitName:               row[9]   ? String(row[9]).trim()   : '',
          finalIndentNo:          row[12]  ? String(row[12]).trim()  : '',
          finalIndentPDF:         row[13]  ? String(row[13]).trim()  : '',
          approvalQuotationNo:    row[14]  ? String(row[14]).trim()  : '',
          approvalQuotationPDF:   row[15]  ? String(row[15]).trim()  : '',
          poNumber:               row[16]  ? String(row[16]).trim()  : '',
          poPDF:                  row[17]  ? String(row[17]).trim()  : '',
          mrnNo:                  row[18]  ? String(row[18]).trim()  : '',
          mrnPDF:                 row[19]  ? String(row[19]).trim()  : '',
          vendorFirmName:         currentVendor,
          invoice13:              currentInvoiceNo,
          invoicePhoto:           row[37]  ? String(row[37]).trim()  : '',
          billDate:               row[53]  ? String(row[53]).trim()  : '',
          latestPaidAmount,
          latestBalanceAmount,
          advanceAmount,
        };
      });

    const vendorSeen = new Set();
    const siteSeen   = new Set();
    const uniqueVendors = [];
    const uniqueSites   = [];

    processedData.forEach(item => {
      if (item.vendorFirmName && !vendorSeen.has(item.vendorFirmName)) {
        vendorSeen.add(item.vendorFirmName);
        uniqueVendors.push({ vendorFirmName: item.vendorFirmName });
      }
      if (item.siteName && !siteSeen.has(item.siteName)) {
        siteSeen.add(item.siteName);
        uniqueSites.push({ siteName: item.siteName });
      }
    });

    res.json({
      success: true,
      count: processedData.length,
      data: processedData,
      uniqueVendors,
      uniqueSites
    });

  } catch (error) {
    console.error('Error in /Payment API:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/Update-Payment", async (req, res) => {
  try {
    const paymentDataArray = req.body;

    if (!Array.isArray(paymentDataArray) || paymentDataArray.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Request body must be a non-empty array of payment objects.",
      });
    }

    const normalize = (str) =>
      (str || "").toString().trim().toLowerCase().replace(/\s+/g, " ");

    const findRowRes = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'Billing_FMS!A8:BA',
    });

    const sheetRows = findRowRes.data.values || [];
    const rowMap       = new Map();
    const missingBills = [];

    for (const item of paymentDataArray) {
      const billNo       = (item.billNo || "").toString().trim();
      const vendorFromFE = normalize(item.vendorFirmName16);

      if (!billNo || !vendorFromFE) {
        missingBills.push({ billNo: billNo || "missing", vendor: vendorFromFE || "missing" });
        continue;
      }

      let foundRowNumber = null;

      for (let i = 0; i < sheetRows.length; i++) {
        const row = sheetRows[i];
        const sheetVendorRaw = row[51]
          ? String(row[51]).trim()
          : (row[23] ? String(row[23]).trim() : '');
        const sheetVendor = normalize(sheetVendorRaw);
        const sheetBillNo = (row[52] || "").toString().trim();

        if (sheetBillNo === billNo && sheetVendor === vendorFromFE) {
          foundRowNumber = 8 + i;
          console.log(`MATCH FOUND -> Row ${foundRowNumber} | Bill: ${billNo} | Vendor: ${sheetVendorRaw}`);
        }
      }

      if (foundRowNumber) {
        rowMap.set(billNo, foundRowNumber);
      } else {
        const billExists = sheetRows.find(r => (r[52] || "").toString().trim() === billNo);
        if (billExists) {
          const sv = billExists[51] ? String(billExists[51]).trim() : (billExists[23] ? String(billExists[23]).trim() : '');
          console.log(`NO MATCH - Bill found but vendor mismatch! Sheet: "${normalize(sv)}" vs Sent: "${vendorFromFE}"`);
        } else {
          console.log(`NO MATCH - Bill NOT found in sheet: ${billNo}`);
        }
        missingBills.push({ billNo, vendor: item.vendorFirmName16, reason: "Not found in Billing_FMS" });
      }
    }

    console.log(`Total matches found: ${rowMap.size} out of ${paymentDataArray.length}`);

    const fmsUpdates     = [];
    const newPaymentRows = [];

    const now = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).replace(',', '');

    for (const item of paymentDataArray) {
      const {
        timestamp        = now,
        planned17        = "",
        siteName         = "",
        vendorFirmName16 = "",
        billNo           = "",
        billDate16       = "",
        netAmount16      = "",
        currentPaid      = "",
        paidAmount17     = "",
        balanceAmount17  = "",
        bankDetails17    = "",
        paymentMode17    = "",
        paymentDetails17 = "",
        paymentDate18    = "",
        grandTotal       = "",
        advanceAmount    = "0"
      } = item;

      const targetRow = rowMap.get(billNo.trim());

      if (targetRow) {
        fmsUpdates.push(
          { range: `Billing_FMS!BT${targetRow}`, values: [["Done"]] },
          { range: `Billing_FMS!BW${targetRow}`, values: [[paidAmount17]] },
          { range: `Billing_FMS!BX${targetRow}`, values: [[balanceAmount17]] },
          { range: `Billing_FMS!BY${targetRow}`, values: [[bankDetails17]] },
          { range: `Billing_FMS!BZ${targetRow}`, values: [[paymentMode17]] },
          { range: `Billing_FMS!CA${targetRow}`, values: [[paymentDetails17]] },
          { range: `Billing_FMS!CB${targetRow}`, values: [[paymentDate18]] }
        );
      }

      // A=timestamp B=planned17 C=siteName D=vendor E=billNo
      // F=billDate  G=netAmount H=currentPaid I=balance
      // J=bankDetails K=paymentMode L=paymentDetails M=paymentDate
      // N=grandTotal  O=SKIP  P=advanceAmount
      newPaymentRows.push([
        timestamp,          // A - index 0
        planned17,          // B - index 1
        siteName,           // C - index 2
        vendorFirmName16,   // D - index 3
        billNo,             // E - index 4
        billDate16,         // F - index 5
        netAmount16,        // G - index 6
        currentPaid,        // H - index 7
        balanceAmount17,    // I - index 8
        bankDetails17,      // J - index 9
        paymentMode17,      // K - index 10
        paymentDetails17,   // L - index 11
        paymentDate18,      // M - index 12
        grandTotal,         // N - index 13
        advanceAmount       // P - index 14 (array mein 14, sheet mein P) O SKIP
      ]);
    }

    if (fmsUpdates.length > 0) {
      const batchResult = await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: spreadsheetId,
        resource: {
          valueInputOption: 'USER_ENTERED',
          data: fmsUpdates
        }
      });
      console.log("Billing_FMS updated. Cells changed:", batchResult.data.totalUpdatedCells || 0);
    }

    if (newPaymentRows.length > 0) {
      const existingRes = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: 'Payment_Sheet!A:A',
      });

      const columnA = existingRes.data.values || [];
      let firstEmptyRow = 2;

      for (let i = 1; i < columnA.length; i++) {
        if (!columnA[i] || !columnA[i][0] || String(columnA[i][0]).trim() === "") {
          firstEmptyRow = i + 1;
          break;
        }
      }

      if (firstEmptyRow === 2 && columnA.length > 1 && columnA[columnA.length - 1][0]) {
        firstEmptyRow = columnA.length + 1;
      }

      // A:N alag update karo, P alag update karo - O column bilkul touch nahi hoga
      const aNData = newPaymentRows.map(row => row.slice(0, 14)); // A to N (index 0-13)
      const pData  = newPaymentRows.map(row => [row[14]]);         // P only (index 14)

      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: spreadsheetId,
        resource: {
          valueInputOption: 'USER_ENTERED',
          data: [
            {
              // A se N tak data
              range: `Payment_Sheet!A${firstEmptyRow}:N${firstEmptyRow + newPaymentRows.length - 1}`,
              values: aNData
            },
            {
              // P column - O column ko completely skip kar rahe hain
              range: `Payment_Sheet!P${firstEmptyRow}:P${firstEmptyRow + newPaymentRows.length - 1}`,
              values: pData
            }
          ]
        }
      });

      console.log(`Added ${newPaymentRows.length} rows to Payment_Sheet at row ${firstEmptyRow}`);
    }

    res.json({
      success: true,
      updatedInFMS: Math.floor(fmsUpdates.length / 7),
      addedToPaymentSheet: newPaymentRows.length,
      missingBills: missingBills.length > 0 ? missingBills : undefined
    });

  } catch (error) {
    console.error('Error in /Update-Payment:', error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error"
    });
  }
});

module.exports = router;