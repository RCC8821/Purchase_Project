const express = require("express");
const { sheets, SiteExpeseSheetId } = require("../../config/googleSheet");

const router = express.Router();

router.get("/Site-Approvel-1", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: "Site_Exp_FMS!A7:V", // starts from row 7
    });

    const rows = response.data.values || [];

  
    const dataRows = rows.slice(1); 
    const pendingApprovals = dataRows
      .filter((row) => {
        // Make sure row has at least 15 columns (A to O)
        if (row.length < 15) return false;

        const planned = (row[20] || "").toString().trim();
        const actual = (row[21] || "").toString().trim();

        return planned !== "" && actual === "";
      })
      .map((row) => ({
        timestamp: row[0] || "",
        uid: row[1] || "",
        RccBillNo: row[2] || "",
        payeeName: row[3] || "",
        projectName: row[4] || "",
        projectEngineerName: row[5] || "",
        headType: row[6] || "",
        detailsOfWork: row[7] || "",
        costAmount: row[8] || "",
        BillNO: row[9] || "",
        BillDate: row[10] || "",
        billPhoto: row[11] || "",
        EXPHead: row[12] || "",
        ContractorName: row[13] || "",
        ContractorFirmName: row[14] || "",
        remark: row[15] || "",
        planned2: row[20] || "",
        actual2: row[21] || "",
      }));

    res.json({
      success: true,
      count: pendingApprovals.length,
      data: pendingApprovals,
    });
  } catch (error) {
    console.error("Error in /Site-Approvel-1:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch pending site approvals",
    });
  }
});


router.post("/Post-Site-Approvel-1", async (req, res) => {
  const { 
    uid, 
    status, 
    Approve_Amount, 
    Confirm_Head, 
    Name_Of_Contractor,      // ✅ NEW - Column Z
    Contractor_Firm_Name,    // ✅ NEW - Column AA
    remark                   // ✅ MOVED - Column AC (was AA)
  } = req.body;

  if (!uid) {
    return res.status(400).json({
      success: false,
      message: "UID is required",
    });
  }

  // Optional: require at least one field
  if (
    status === undefined &&
    Approve_Amount === undefined &&
    Confirm_Head === undefined &&
    Name_Of_Contractor === undefined &&
    Contractor_Firm_Name === undefined &&
    remark === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: "Provide at least one field to update (status, Approve_Amount, Confirm_Head, Name_Of_Contractor, Contractor_Firm_Name, remark)",
    });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: "Site_Exp_FMS!A7:AC",  // ✅ Extended range to include AC column
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No data found in sheet",
      });
    }

    const rowIndex = rows.findIndex(
      (row) => row[1] && String(row[1]).trim() === String(uid).trim()
    );

    if (rowIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `UID not found: ${uid}`,
      });
    }

    const sheetRowNumber = 7 + rowIndex;

    console.log(
      `Found UID ${uid} at array index ${rowIndex} → sheet row ${sheetRowNumber}`
    );

    const batchData = [];

    // Column W - Status
    if (status !== undefined && String(status).trim() !== "") {
      batchData.push({
        range: `Site_Exp_FMS!W${sheetRowNumber}`,
        values: [[status]],
      });
    }

    // Column X - Approve Amount
    if (Approve_Amount !== undefined && String(Approve_Amount).trim() !== "") {
      batchData.push({
        range: `Site_Exp_FMS!X${sheetRowNumber}`,
        values: [[Approve_Amount]],
      });
    }

    // Column Y - Confirm Head
    if (Confirm_Head !== undefined && String(Confirm_Head).trim() !== "") {
      batchData.push({
        range: `Site_Exp_FMS!Y${sheetRowNumber}`,
        values: [[Confirm_Head]],
      });
    }

    // ✅ Column Z - Name of Contractor (NEW)
    if (Name_Of_Contractor !== undefined && String(Name_Of_Contractor).trim() !== "") {
      batchData.push({
        range: `Site_Exp_FMS!Z${sheetRowNumber}`,
        values: [[Name_Of_Contractor]],
      });
    }

    // ✅ Column AA - Contractor Firm Name (NEW)
    if (Contractor_Firm_Name !== undefined && String(Contractor_Firm_Name).trim() !== "") {
      batchData.push({
        range: `Site_Exp_FMS!AA${sheetRowNumber}`,
        values: [[Contractor_Firm_Name]],
      });
    }

    // ✅ Column AC - Remark (MOVED from AA to AC)
    if (remark !== undefined && String(remark).trim() !== "") {
      batchData.push({
        range: `Site_Exp_FMS!AC${sheetRowNumber}`,
        values: [[remark]],
      });
    }

    if (batchData.length === 0) {
      return res.json({
        success: true,
        message: "No non-empty values to update",
      });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SiteExpeseSheetId,
      resource: {
        valueInputOption: "USER_ENTERED",
        data: batchData,
      },
    });

    return res.json({
      success: true,
      message: "Row updated successfully",
      rowNumber: sheetRowNumber,
      updatedColumns: batchData.map((d) => d.range.match(/!([A-Z]+)/)?.[1]),
    });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
});


////////  site Approvel paid amount 2

router.get("/Site-Paid-Step", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: "Site_Exp_Payment_FMS!A7:V", // starts from row 7
    });

    const rows = response.data.values || [];


    const dataRows = rows.slice(1); 

    const pendingApprovals = dataRows
      .filter((row) => {
        // Make sure row has at least 15 columns (A to O)
        if (row.length < 15) return false;

        const planned = (row[20] || "").toString().trim();
        const actual = (row[21] || "").toString().trim();

        return planned !== "" && actual === "";
      })
      .map((row) => ({
        timestamp: row[0] || "",
        uid: row[1] || "",
        RccBillNo: row[2] || "",
        payeeName: row[3] || "",
        projectName: row[4] || "",
        projectEngineerName: row[5] || "",
        headType: row[6] || "",
        detailsOfWork: row[7] || "",
        costAmount: row[8] || "",
        BillNO: row[9] || "",
        BillDate: row[10] || "",
        billPhoto: row[11] || "",
        EXPHead: row[12] || "",
        ContractorName: row[13] || "",
        ContractorFirmName: row[14] || "",
        remark: row[15] || "",
        planned2: row[20] || "",
        actual2: row[21] || "",
      }));

    res.json({
      success: true,
      count: pendingApprovals.length,
      data: pendingApprovals,
    });
  } catch (error) {
    console.error("Error in /Site-Approvel-1:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch pending site approvals",
    });
  }
});



router.post("/Post-Site-Paid-Step", async (req, res) => {
  const {
    RccBillNo,
    STATUS_3,           // W  (col 23)
    PAYMENT_MODE_3,     // X  (col 24)
    BANK_DETAILS_3,     // Y  (col 25)
    PAYMENT_DETAILS_3,  // Z  (col 26)
    PAYMENT_DATE_3,     // AA (col 27)
    Receiver_Name,      // AB (col 28)
    Remark_Blank,       // AC (col 29)
    // ⚠️ Sheet max = 30 cols (AD), so AC is last safe writable column
  } = req.body;

  if (!RccBillNo) {
    return res.status(400).json({
      success: false,
      message: "RccBillNo is required",
    });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: "Site_Exp_Payment_FMS!A7:AD",
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No data found in Site_Exp_FMS sheet",
      });
    }

    // RccBillNo is at row[2] (column C)
    const rowIndex = rows.findIndex(
      (row) => row[2] && String(row[2]).trim() === String(RccBillNo).trim()
    );

    if (rowIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `RccBillNo not found: ${RccBillNo}`,
      });
    }

    const sheetRowNumber = 7 + rowIndex;

    console.log(
      `Found RccBillNo ${RccBillNo} at array index ${rowIndex} → sheet row ${sheetRowNumber}`
    );

    const batchData = [];

    // W - STATUS_3
    if (STATUS_3 !== undefined && String(STATUS_3).trim() !== "") {
      batchData.push({ range: `Site_Exp_Payment_FMS!W${sheetRowNumber}`, values: [[STATUS_3]] });
    }

    // X - PAYMENT_MODE_3
    if (PAYMENT_MODE_3 !== undefined && String(PAYMENT_MODE_3).trim() !== "") {
      batchData.push({ range: `Site_Exp_Payment_FMS!Z${sheetRowNumber}`, values: [[PAYMENT_MODE_3]] });
    }

    // Y - BANK_DETAILS_3
    if (BANK_DETAILS_3 !== undefined && String(BANK_DETAILS_3).trim() !== "") {
      batchData.push({ range: `Site_Exp_Payment_FMS!AA${sheetRowNumber}`, values: [[BANK_DETAILS_3]] });
    }

    // Z - PAYMENT_DETAILS_3
    if (PAYMENT_DETAILS_3 !== undefined && String(PAYMENT_DETAILS_3).trim() !== "") {
      batchData.push({ range: `Site_Exp_Payment_FMS!AB${sheetRowNumber}`, values: [[PAYMENT_DETAILS_3]] });
    }

    // AA - PAYMENT_DATE_3
    if (PAYMENT_DATE_3 !== undefined && String(PAYMENT_DATE_3).trim() !== "") {
      batchData.push({ range: `Site_Exp_Payment_FMS!AC${sheetRowNumber}`, values: [[PAYMENT_DATE_3]] });
    }

    // AB - Receiver_Name
    if (Receiver_Name !== undefined && String(Receiver_Name).trim() !== "") {
      batchData.push({ range: `Site_Exp_Payment_FMS!AD${sheetRowNumber}`, values: [[Receiver_Name]] });
    }

    // AC - Remark_Blank
    if (Remark_Blank !== undefined && String(Remark_Blank).trim() !== "") {
      batchData.push({ range: `Site_Exp_Payment_FMS!AE${sheetRowNumber}`, values: [[Remark_Blank]] });
    }

    if (batchData.length === 0) {
      return res.json({
        success: true,
        message: "No valid / non-empty fields to update",
      });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SiteExpeseSheetId,
      resource: {
        valueInputOption: "USER_ENTERED",
        data: batchData,
      },
    });

    // ✅ Safe column extraction with null check
    const updatedColumns = batchData.map((d) => {
      const match = d.range.match(/!([A-Z]+)/);
      return match ? match[1] : "Unknown";
    });

    return res.json({
      success: true,
      message: "Payment fields updated successfully in Site_Exp_FMS",
      rowNumber: sheetRowNumber,
      updatedColumns: updatedColumns,
      updatedCount: batchData.length,
    });

  } catch (error) {
    console.error("Site paid update error:", error);
    return res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
});



module.exports = router;
