const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');
const router = express.Router();



router.get('/Payment', async (req, res) => {
  try {
    const [billingResponse, paymentSheetResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Billing_FMS!A8:CC',  // CC tak safe (header ke hisaab se)
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Payment_Sheet!A:O",
      })
    ]);

    const billingRows = billingResponse.data.values || [];
    const paymentRows = paymentSheetResponse.data.values || [];

    const processedData = billingRows
      .filter(row => {
        // NET_Amount_17 (BV column - index 73) check
        const netAmount17 = (row[73] || "").toString().trim();
        if (!netAmount17 || netAmount17 === '-' || netAmount17 === '') {
          return false;
        }

        // BALANCE_AMOUNT_17 (BX column - index 75) check
        // Agar BX mein "0", "0.00", ya 0 hai → exclude karo
        const balanceStr = (row[75] || "").toString().trim();
        if (balanceStr !== '') {
          const balanceNum = parseFloat(balanceStr);
          if (!isNaN(balanceNum) && balanceNum === 0) {
            return false; // Fully paid → hide
          }
        }

        // Agar BX empty hai ya >0 hai → include
        return true;
      })
      .map(row => {
        const currentInvoiceNo = (row[52] || "").toString().trim(); // BA column
        const currentVendor = row[51] ? String(row[51]).trim() : (row[23] ? String(row[23]).trim() : '');

        let latestPaidAmount = "0";
        let latestBalanceAmount = "0";

        if (currentInvoiceNo && paymentRows.length > 0) {
          for (let i = paymentRows.length - 1; i >= 0; i--) {
            const pRow = paymentRows[i];
            const pInvoiceNo = (pRow[4] || "").toString().trim(); // E column
            const pVendor = (pRow[2] || "").toString().trim(); // Assuming vendor firm name is in column C (index 2) of Payment_Sheet; adjust index if different

            if (pInvoiceNo === currentInvoiceNo && pVendor === currentVendor) {
              latestPaidAmount = (pRow[7] || "0").toString().trim();     // H
              latestBalanceAmount = (pRow[8] || "0").toString().trim();  // I
              break;
            }
          }
        }

        return {
          planned17: row[69] ? String(row[69]).trim() : '',
          UID: row[1] ? String(row[1]).trim() : '',
          siteName: row[3] ? String(row[3]).trim() : '',
          materialType: row[5] ? String(row[5]).trim() : '',
          skuCode: row[6] ? String(row[6]).trim() : '',
          materialName: row[7] ? String(row[7]).trim() : '',
          netAmount17: row[73] ? String(row[73]).trim() : '0',
          netAmount16: row[67] ? String(row[67]).trim() : '0',
          revisedQuantity: row[25] ? String(row[25]).trim() : '',
          finalReceivedQuantity: row[26] ? String(row[26]).trim() : '',
          unitName: row[9] ? String(row[9]).trim() : '',
          finalIndentNo: row[12] ? String(row[12]).trim() : '',
          finalIndentPDF: row[13] ? String(row[13]).trim() : '',
          approvalQuotationNo: row[14] ? String(row[14]).trim() : '',
          approvalQuotationPDF: row[15] ? String(row[15]).trim() : '',
          poNumber: row[16] ? String(row[16]).trim() : '',
          poPDF: row[17] ? String(row[17]).trim() : '',
          mrnNo: row[18] ? String(row[18]).trim() : '',
          mrnPDF: row[19] ? String(row[19]).trim() : '',
          vendorFirmName: currentVendor,
          invoice13: currentInvoiceNo,
          invoicePhoto: row[37] ? String(row[37].trim()) : '',
          billDate: row[53] ? String(row[53]).trim() : '',
          latestPaidAmount,
          latestBalanceAmount
        };
      });

    // Unique vendors & sites
    const vendorSeen = new Set();
    const siteSeen = new Set();
    const uniqueVendors = [];
    const uniqueSites = [];

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

    // Helper function to normalize vendor names for better matching
    const normalize = (str) =>
      (str || "").toString().trim().toLowerCase().replace(/\s+/g, " ");

    // Read only Vendor (AZ) and Bill No (BA) from row 8 onwards
    const findRowRes = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'Billing_FMS!AZ8:BA',   // AZ = Vendor, BA = Bill/Invoice No
    });

    const sheetRows = findRowRes.data.values || [];

    // In this range: index 0 = AZ (Vendor), index 1 = BA (Bill No)
    const VENDOR_INDEX = 0;
    const BILL_NO_INDEX = 1;

    const rowMap = new Map();       // billNo → actual row number in sheet
    const missingBills = [];

    for (const item of paymentDataArray) {
      const billNo = (item.billNo || "").toString().trim();
      const vendor = normalize(item.vendorFirmName16);

      if (!billNo || !vendor) {
        missingBills.push({
          billNo: billNo || "missing",
          vendor: vendor || "missing"
        });
        continue;
      }

      let foundRowNumber = null;

      for (let i = 0; i < sheetRows.length; i++) {
        const row = sheetRows[i];
        if (row.length < 2) continue;  // Need both vendor and bill no

        const sheetVendor = normalize(row[VENDOR_INDEX]);          // AZ column
        const sheetBillNo = (row[BILL_NO_INDEX] || "").toString().trim(); // BA column

        if (sheetBillNo === billNo && sheetVendor === vendor) {
          foundRowNumber = 8 + i;   // Real row number in Google Sheet
          console.log(`MATCH FOUND → Row ${foundRowNumber} | Bill: ${billNo} | Vendor: ${vendor}`);
          // break;   // Uncomment if you want only the first match
        }
      }

      if (foundRowNumber) {
        rowMap.set(billNo, foundRowNumber);
      } else {
        missingBills.push({
          billNo,
          vendor: item.vendorFirmName16,  // original name for debugging
          reason: "Bill number + Vendor name not found in Billing_FMS",
          normalizedVendorSent: vendor
        });
      }
    }

    console.log(`Total matches found: ${rowMap.size} out of ${paymentDataArray.length}`);
    if (missingBills.length > 0) {
      console.log("Missing bills:", missingBills);
    }

    // ────────────────────────────────────────────────
    // Prepare updates for Billing_FMS + new rows for Payment_Sheet
    // ────────────────────────────────────────────────

    const fmsUpdates = [];
    const newPaymentRows = [];

    const now = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).replace(',', '');

    for (const item of paymentDataArray) {
      const {
        timestamp = now,
        planned17 = "",
        siteName = "",
        vendorFirmName16 = "",
        billNo = "",
        billDate16 = "",
        netAmount16 = "",
        currentPaid = "",
        paidAmount17 = "",
        balanceAmount17 = "",
        bankDetails17 = "",
        paymentMode17 = "",
        paymentDetails17 = "",
        paymentDate18 = "",
        grandTotal = ""
      } = item;

      const targetRow = rowMap.get(billNo.trim());

      if (targetRow) {
        // Update columns in Billing_FMS
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

      // Always add a new row to Payment_Sheet
      newPaymentRows.push([
        timestamp,
        planned17,
        siteName,
        vendorFirmName16,
        billNo,
        billDate16,
        netAmount16,
        currentPaid,
        balanceAmount17,
        bankDetails17,
        paymentMode17,
        paymentDetails17,
        paymentDate18,
        grandTotal
      ]);
    }

    // 1. Batch update Billing_FMS (only if matches were found)
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

    // 2. Append new rows to Payment_Sheet
    if (newPaymentRows.length > 0) {
      // Find first empty row in column A of Payment_Sheet
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

      await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: `Payment_Sheet!A${firstEmptyRow}`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: newPaymentRows }
      });

      console.log(`Added ${newPaymentRows.length} rows to Payment_Sheet at row ${firstEmptyRow}`);
    }

    // Final response
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



// router.get('/Payment', async (req, res) => {
//   try {
//     const [billingResponse, paymentSheetResponse] = await Promise.all([
//       sheets.spreadsheets.values.get({
//         spreadsheetId,
//         range: 'Billing_FMS!A8:CC',  // CC tak safe (header ke hisaab se)
//       }),
//       sheets.spreadsheets.values.get({
//         spreadsheetId,
//         range: "Payment_Sheet!A:O",
//       })
//     ]);

//     const billingRows = billingResponse.data.values || [];
//     const paymentRows = paymentSheetResponse.data.values || [];

//     const processedData = billingRows
//       .filter(row => {
//         // NET_Amount_17 (BV column - index 73) check
//         const netAmount17 = (row[73] || "").toString().trim();
//         if (!netAmount17 || netAmount17 === '-' || netAmount17 === '') {
//           return false;
//         }

//         // BALANCE_AMOUNT_17 (BX column - index 75) check
//         // Agar BX mein "0", "0.00", ya 0 hai → exclude karo
//         const balanceStr = (row[75] || "").toString().trim();
//         if (balanceStr !== '') {
//           const balanceNum = parseFloat(balanceStr);
//           if (!isNaN(balanceNum) && balanceNum === 0) {
//             return false; // Fully paid → hide
//           }
//         }

//         // Agar BX empty hai ya >0 hai → include
//         return true;
//       })
//       .map(row => {
//         const currentInvoiceNo = (row[52] || "").toString().trim(); // BA column

//         let latestPaidAmount = "0";
//         let latestBalanceAmount = "0";

//         if (currentInvoiceNo && paymentRows.length > 0) {
//           for (let i = paymentRows.length - 1; i >= 0; i--) {
//             const pRow = paymentRows[i];
//             const pInvoiceNo = (pRow[4] || "").toString().trim(); // E column
//             if (pInvoiceNo === currentInvoiceNo) {
//               latestPaidAmount = (pRow[7] || "0").toString().trim();     // H
//               latestBalanceAmount = (pRow[8] || "0").toString().trim();  // I
//               break;
//             }
//           }
//         }

//         return {
//           planned17: row[69] ? String(row[69]).trim() : '',
//           UID: row[1] ? String(row[1]).trim() : '',
//           siteName: row[3] ? String(row[3]).trim() : '',
//           materialType: row[5] ? String(row[5]).trim() : '',
//           skuCode: row[6] ? String(row[6]).trim() : '',
//           materialName: row[7] ? String(row[7]).trim() : '',
//           netAmount17: row[73] ? String(row[73]).trim() : '0',
//           netAmount16: row[67] ? String(row[67]).trim() : '0',
//           revisedQuantity: row[25] ? String(row[25]).trim() : '',
//           finalReceivedQuantity: row[26] ? String(row[26]).trim() : '',
//           unitName: row[9] ? String(row[9]).trim() : '',
//           finalIndentNo: row[12] ? String(row[12]).trim() : '',
//           finalIndentPDF: row[13] ? String(row[13]).trim() : '',
//           approvalQuotationNo: row[14] ? String(row[14]).trim() : '',
//           approvalQuotationPDF: row[15] ? String(row[15]).trim() : '',
//           poNumber: row[16] ? String(row[16]).trim() : '',
//           poPDF: row[17] ? String(row[17]).trim() : '',
//           mrnNo: row[18] ? String(row[18]).trim() : '',
//           mrnPDF: row[19] ? String(row[19]).trim() : '',
//           vendorFirmName: row[51] ? String(row[51]).trim() : (row[23] ? String(row[23]).trim() : ''),
//           invoice13: currentInvoiceNo,
//           invoicePhoto: row[37] ? String(row[37].trim() ): '',
//           billDate: row[53] ? String(row[53]).trim() : '',
//           latestPaidAmount,
//           latestBalanceAmount
//         };
//       });

//     // Unique vendors & sites
//     const vendorSeen = new Set();
//     const siteSeen = new Set();
//     const uniqueVendors = [];
//     const uniqueSites = [];

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

//     // चेक: बॉडी array होनी चाहिए और खाली नहीं
//     if (!Array.isArray(paymentDataArray) || paymentDataArray.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: "Request body must be a non-empty array of payment objects.",
//       });
//     }

//     // Google Sheets से Billing_FMS के जरूरी कॉलम पढ़ें
//     // X = Vendor Firm Name, BA = Bill No
//     const findRowRes = await sheets.spreadsheets.values.get({
//       spreadsheetId: spreadsheetId,
//       range: 'Billing_FMS!X7:BA',   // ← सिर्फ X से BA तक पढ़ रहे हैं (कम डेटा = तेज़)
//     });

//     const sheetRows = findRowRes.data.values || [];  // sheet की rows (array of arrays)

//     // BA कॉलम का इंडेक्स (X से शुरू होने पर)
//     // X → index 0, Y → 1, Z → 2, AA → 3, ..., BA → 29
//     const BILL_NO_INDEX_IN_RANGE = 29;  // X=0 से BA तक 30 कॉलम → BA का इंडेक्स = 29

//     const rowMap = new Map();       // billNo → row number (जिस row पर update करना है)
//     const missingBills = [];        // जो bill नहीं मिले

//     // हर payment item के लिए सही row ढूंढो
//     for (const item of paymentDataArray) {
//       const billNo = item.billNo?.toString().trim();
//       const vendor = item.vendorFirmName16?.toString().trim().toLowerCase(); // case-insensitive

//       if (!billNo || !vendor) {
//         missingBills.push({ billNo: billNo || "missing", vendor: vendor || "missing" });
//         continue;
//       }

//       let foundRowNumber = null;

//       // sheet की हर row चेक करो
//       for (let i = 0; i < sheetRows.length; i++) {
//         const row = sheetRows[i];
//         if (!row || row.length < BILL_NO_INDEX_IN_RANGE + 1) continue;

//         const sheetVendor = (row[0] || "").toString().trim().toLowerCase();         // column X
//         const sheetBillNo = (row[BILL_NO_INDEX_IN_RANGE] || "").toString().trim();  // column BA

//         // दोनों मैच हुए तो ये सही row है
//         if (sheetBillNo === billNo && sheetVendor === vendor) {
//           foundRowNumber = 7 + i;   // row number = 7 + index (क्योंकि 7 से डेटा शुरू)
//           // अगर multiple match हैं तो आखिरी वाला ले लेंगे (या break करके पहला ले सकते हैं)
//         }
//       }

//       if (foundRowNumber) {
//         rowMap.set(billNo, foundRowNumber);
//       } else {
//         missingBills.push({
//           billNo,
//           vendor: item.vendorFirmName16,
//           reason: "Bill number + Vendor name combination not found"
//         });
//       }
//     }

//     // ------------------ अब अपडेट और नई एंट्री ------------------

//     const fmsUpdates = [];
//     const newPaymentRows = [];

//     const now = new Date().toLocaleString('en-IN', {
//       timeZone: 'Asia/Kolkata',
//       day: '2-digit', month: '2-digit', year: 'numeric',
//       hour: '2-digit', minute: '2-digit', second: '2-digit',
//       hour12: false,
//     }).replace(',', '');

//     for (const item of paymentDataArray) {
//       const {
//         timestamp = now,
//         planned17,
//         siteName,
//         vendorFirmName16,
//         billNo,
//         billDate16,
//         netAmount16,
//         currentPaid,
//         paidAmount17,
//         balanceAmount17,
//         bankDetails17,
//         paymentMode17,
//         paymentDetails17,
//         paymentDate18,
//         grandTotal
//       } = item;

//       const targetRow = rowMap.get(billNo);

//       if (targetRow) {
//         // Billing_FMS में अपडेट करने के लिए ranges
//         fmsUpdates.push(
//           { range: `Billing_FMS!BT${targetRow}`, values: [["Done"]] },
//           { range: `Billing_FMS!BW${targetRow}`, values: [[paidAmount17]] },
//           { range: `Billing_FMS!BX${targetRow}`, values: [[balanceAmount17]] },
//           { range: `Billing_FMS!BY${targetRow}`, values: [[bankDetails17]] },
//           { range: `Billing_FMS!BZ${targetRow}`, values: [[paymentMode17]] },
//           { range: `Billing_FMS!CA${targetRow}`, values: [[paymentDetails17]] },
//           { range: `Billing_FMS!CB${targetRow}`, values: [[paymentDate18]] },
//         );
//       }

//       // Payment_Sheet में नई row तैयार करो (चाहे match मिला हो या नहीं)
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

//     // 1. Billing_FMS में batch update (जिन rows का match मिला)
//     if (fmsUpdates.length > 0) {
//       await sheets.spreadsheets.values.batchUpdate({
//         spreadsheetId: spreadsheetId,
//         resource: {
//           valueInputOption: 'USER_ENTERED',
//           data: fmsUpdates
//         }
//       });
//     }

//     // 2. Payment_Sheet में नई rows ऐड करो (सभी items की)
//     if (newPaymentRows.length > 0) {
//       // पहली खाली row ढूंढो (column A से)
//       const existingRes = await sheets.spreadsheets.values.get({
//         spreadsheetId: spreadsheetId,
//         range: 'Payment_Sheet!A:A',
//       });

//       const columnA = existingRes.data.values || [];
//       let firstEmptyRow = 2;

//       for (let i = 1; i < columnA.length; i++) {
//         if (!columnA[i] || !columnA[i][0] || columnA[i][0].toString().trim() === "") {
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
//     }

//     // Response भेजो
//     res.json({
//       success: true,
//       updatedInFMS: Math.floor(fmsUpdates.length / 7),  // 7 updates per bill
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







module.exports = router;