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

    // If row 7 (index 0) is header → we skip it
    // Adjust slice(0) or slice(1) depending on whether A7 is header or data
    const dataRows = rows.slice(1); // most common case: skip header row

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
  const { uid, status, Approve_Amount, Confirm_Head, remark } = req.body;

  if (!uid) {
    return res.status(400).json({
      success: false,
      message: "UID is required",
    });
  }

  // Optional: require at least one field
  if (
    (status === undefined &&
      Approve_Amount === undefined &&
      remark === undefined) ||
    Confirm_Head === undefined
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Provide at least one field to update (status, Revised_Amount, remark)",
    });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: "Site_Exp_FMS!A7:AA",
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No data found in sheet",
      });
    }

    const rowIndex = rows.findIndex(
      (row) => row[1] && String(row[1]).trim() === String(uid).trim(),
    );

    if (rowIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `UID not found: ${uid}`,
      });
    }

    // ────────────────────────────────────────────────
    // MOST IMPORTANT FIX ──────────────────────────────
    const sheetRowNumber = 7 + rowIndex; // ← changed from 8 to 7
    // ────────────────────────────────────────────────

    console.log(
      `Found UID ${uid} at array index ${rowIndex} → sheet row ${sheetRowNumber}`,
    );

    const batchData = [];

    if (status !== undefined && String(status).trim() !== "") {
      batchData.push({
        range: `Site_Exp_FMS!W${sheetRowNumber}`,
        values: [[status]],
      });
    }

    if (Approve_Amount !== undefined) {
      batchData.push({
        range: `Site_Exp_FMS!X${sheetRowNumber}`,
        values: [[Approve_Amount]],
      });
    }

    if (Confirm_Head !== undefined) {
      batchData.push({
        range: `Site_Exp_FMS!Y${sheetRowNumber}`,
        values: [[Confirm_Head]],
      });
    }

    if (remark !== undefined && String(remark).trim() !== "") {
      batchData.push({
        range: `Site_Exp_FMS!AA${sheetRowNumber}`,
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
    uid,
    STATUS_3, // W
    TIME_DELAY_3, // X
    TOTAL_PAID_AMOUNT_3, // Y
    BASIC_AMOUNT_WITHOUT_GST_3, // Z
    CGST_3, // AA
    SGST_3, // AB
    NET_AMOUNT_3, // AC
    PAYMENT_MODE_3, // AD
    BANK_DETAILS_3, // AE
    PAYMENT_DETAILS_3, // AF
    PAYMENT_DATE_3, // AG
    Remark_3, // AH
  } = req.body;

  if (!uid) {
    return res.status(400).json({
      success: false,
      message: "UID is required",
    });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: "Site_Exp_FMS!A7:AH", // extended to AH
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No data found in Site_Exp_FMS sheet",
      });
    }

    const rowIndex = rows.findIndex(
      (row) => row[1] && String(row[1]).trim() === String(uid).trim(),
    );

    if (rowIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `UID not found: ${uid}`,
      });
    }

    const sheetRowNumber = 7 + rowIndex;

    console.log(
      `Found UID ${uid} at array index ${rowIndex} → sheet row ${sheetRowNumber}`,
    );

    const batchData = [];

    // Only new fields — columns W:AH
    if (STATUS_3 !== undefined && String(STATUS_3).trim() !== "") {
      batchData.push({
        range: `Site_Exp_FMS!W${sheetRowNumber}`,
        values: [[STATUS_3]],
      });
    }
    if (TIME_DELAY_3 !== undefined && String(TIME_DELAY_3).trim() !== "") {
      batchData.push({
        range: `Site_Exp_FMS!X${sheetRowNumber}`,
        values: [[TIME_DELAY_3]],
      });
    }
    if (
      TOTAL_PAID_AMOUNT_3 !== undefined &&
      String(TOTAL_PAID_AMOUNT_3).trim() !== ""
    ) {
      batchData.push({
        range: `Site_Exp_FMS!Y${sheetRowNumber}`,
        values: [[TOTAL_PAID_AMOUNT_3]],
      });
    }
    if (
      BASIC_AMOUNT_WITHOUT_GST_3 !== undefined &&
      String(BASIC_AMOUNT_WITHOUT_GST_3).trim() !== ""
    ) {
      batchData.push({
        range: `Site_Exp_FMS!Z${sheetRowNumber}`,
        values: [[BASIC_AMOUNT_WITHOUT_GST_3]],
      });
    }
    if (CGST_3 !== undefined && String(CGST_3).trim() !== "") {
      batchData.push({
        range: `Site_Exp_FMS!AA${sheetRowNumber}`,
        values: [[CGST_3]],
      });
    }
    if (SGST_3 !== undefined && String(SGST_3).trim() !== "") {
      batchData.push({
        range: `Site_Exp_FMS!AB${sheetRowNumber}`,
        values: [[SGST_3]],
      });
    }
    if (NET_AMOUNT_3 !== undefined && String(NET_AMOUNT_3).trim() !== "") {
      batchData.push({
        range: `Site_Exp_FMS!AC${sheetRowNumber}`,
        values: [[NET_AMOUNT_3]],
      });
    }
    if (PAYMENT_MODE_3 !== undefined && String(PAYMENT_MODE_3).trim() !== "") {
      batchData.push({
        range: `Site_Exp_FMS!AD${sheetRowNumber}`,
        values: [[PAYMENT_MODE_3]],
      });
    }
    if (BANK_DETAILS_3 !== undefined && String(BANK_DETAILS_3).trim() !== "") {
      batchData.push({
        range: `Site_Exp_FMS!AE${sheetRowNumber}`,
        values: [[BANK_DETAILS_3]],
      });
    }
    if (
      PAYMENT_DETAILS_3 !== undefined &&
      String(PAYMENT_DETAILS_3).trim() !== ""
    ) {
      batchData.push({
        range: `Site_Exp_FMS!AF${sheetRowNumber}`,
        values: [[PAYMENT_DETAILS_3]],
      });
    }
    if (PAYMENT_DATE_3 !== undefined && String(PAYMENT_DATE_3).trim() !== "") {
      batchData.push({
        range: `Site_Exp_FMS!AG${sheetRowNumber}`,
        values: [[PAYMENT_DATE_3]],
      });
    }
    if (Remark_3 !== undefined && String(Remark_3).trim() !== "") {
      batchData.push({
        range: `Site_Exp_FMS!AH${sheetRowNumber}`,
        values: [[Remark_3]],
      });
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
        valueInputOption: "USER_ENTERED", // important for dates & numbers
        data: batchData,
      },
    });

    return res.json({
      success: true,
      message: "Payment fields updated successfully in Site_Exp_FMS",
      rowNumber: sheetRowNumber,
      updatedColumns: batchData.map((d) => d.range.match(/!([A-Z]+)$/)[1]),
      updatedCount: batchData.length,
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

module.exports = router;
