const express = require('express');
const { sheets, spreadsheetId , drive} = require('../config/googleSheet');
const { Readable } = require("stream");
const router = express.Router();
require('dotenv').config();

// Load jsPDF and jspdf-autotable
const { jsPDF } = require('jspdf');

// Apply jspdf-autotable using the same robust method as indentRoutes.js
try {
  require('jspdf-autotable');
  console.log('jspdf-autotable loaded successfully (Method 1)');
} catch (err) {
  console.log('Method 1 failed, trying method 2:', err.message);
  try {
    const autoTable = require('jspdf-autotable').default;
    autoTable(jsPDF);
    console.log('jspdf-autotable loaded successfully (Method 2)');
  } catch (err2) {
    console.log('Method 2 failed, trying method 3:', err2.message);
    try {
      const jspdfAutoTable = require('jspdf-autotable');
      jspdfAutoTable.default(jsPDF);
      console.log('jspdf-autotable loaded successfully (Method 3)');
    } catch (err3) {
      console.error('Failed to load jspdf-autotable:', err3.message, err3.stack);
      throw new Error('jspdf-autotable dependency could not be loaded');
    }
  }
}

// Test jsPDF and autoTable to ensure functionality
try {
  const doc = new jsPDF();
  if (!doc.autoTable) {
    throw new Error('jspdf-autotable plugin not applied');
  }
  doc.autoTable({ head: [['Test']], body: [['Sample']] });
  console.log('jsPDF and autoTable test successful');
} catch (err) {
  console.error('jsPDF autoTable test failed:', err.message, err.stack);
  throw new Error('jsPDF instance initialization with autoTable failed');
}


// GET: Fetch get-indent-data
router.get("/get-indent-data", async (req, res) => {
  try {
    const range = "Purchase_FMS!B7:Y"; // Range B7:Y (columns B to Y)
    console.log(
      `Fetching data from sheet: ${
        process.env.SPREADSHEET_ID || spreadsheetId
      }, range: ${range}`
    );

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID || spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    console.log(`Raw rows fetched (length: ${rows.length})`);
    console.log("Full raw data:", JSON.stringify(rows, null, 2));

    if (!rows.length) {
      console.log("No data found in the sheet for range:", range);
      return res.status(404).json({
        error: "No data found in the sheet",
        details: "Sheet or range is empty",
      });
    }

    // Updated headers with correct column indices
    const headers = [
      { key: "UID", column: 0 }, // B
      { key: "Req_No", column: 1 }, // C
      { key: "Site_Name", column: 2 }, // D
      { key: "Supervisor_Name", column: 3 }, // E
      { key: "Material_Type", column: 4 }, // F
      { key: "SKU_Code", column: 5 }, // G
      { key: "Material_Name", column: 6 }, // H
      { key: "Quantity", column: 7 }, // I
      { key: "Unit_Name", column: 8 }, // J
      { key: "Purpose", column: 9 }, // K
      { key: "Require_Date", column: 10 }, // L
      { key: "REVISED_QUANTITY_2", column: 15 }, // Q
      { key: "DECIDED_BRAND/COMPANY_NAME_2", column: 16 }, // R
      { key: "REMARKS_2", column: 17 }, // S
      { key: "PLANNED_3", column: 19 }, // V
      { key: "ACTUAL_3", column: 20 }, // W
    ];

    const sheetHeadersRaw =
      rows[0]?.map((h) => h?.trim().replace(/\s+/g, "_").toUpperCase()) || [];
    console.log("Raw sheet headers:", sheetHeadersRaw);

    const headerMap = {};
    headers.forEach(({ key, column }) => {
      headerMap[key] = { column, sheetHeader: sheetHeadersRaw[column] || key };
    });

    const missingHeaders = headers.filter(({ key, column }) => {
      const sheetHeader = sheetHeadersRaw[column]?.toUpperCase();
      const expectedHeader = key.toUpperCase().replace("/", "_");
      return !sheetHeader || !sheetHeader.includes(expectedHeader);
    });
    if (missingHeaders.length) {
      console.warn(
        "Header mismatches detected:",
        missingHeaders.map((h) => ({
          key: h.key,
          expectedColumn: String.fromCharCode(66 + h.column), // B=66
          found: sheetHeadersRaw[h.column] || "missing",
        }))
      );
    }

    const actual3Index = headers.find((h) => h.key === "ACTUAL_3")?.column;
    const planned3Index = headers.find((h) => h.key === "PLANNED_3")?.column;
    if (actual3Index === undefined || planned3Index === undefined) {
      console.error("Required columns not found in headers");
      return res.status(500).json({
        error: "Invalid sheet structure",
        details: "ACTUAL_3 or PLANNED_3 column missing",
      });
    }

    const dataRows = rows.slice(1);
    if (!dataRows.length) {
      console.log("No data rows found starting from row 8");
      return res.status(404).json({
        error: "No data found starting from row 8",
        details: "No rows after header",
      });
    }

    let validRowCount = 0;
    const formData = dataRows
      .map((row, index) => {
        if (!row || row.every((cell) => !cell || cell.trim() === "")) {
          console.log(`Skipping empty row ${index + 8}`);
          return null;
        }

        const actual3 = row[actual3Index]?.trim() || "";
        const planned3 = row[planned3Index]?.trim() || "";
        console.log(
          `Row ${index + 8} - PLANNED_3: "${planned3}", ACTUAL_3: "${actual3}", SKU_Code: "${row[5]?.trim() || ""}", Material_Name: "${row[6]?.trim() || ""}", REVISED_QUANTITY_2: "${row[15]?.trim() || ""}", DECIDED_BRAND: "${row[16]?.trim() || ""}", REMARKS_2: "${row[17]?.trim() || ""}"`
        );

        // Filter out rows where PLANNED_3 is empty or ACTUAL_3 has data
        if (!planned3 || actual3) {
          console.log(
            `Skipping row ${index + 8} - Reason: ${
              !planned3 ? `Empty PLANNED_3="${planned3}"` : ""
            }${!planned3 && actual3 ? " and " : ""}${
              actual3 ? `Non-empty ACTUAL_3="${actual3}"` : ""
            }`
          );
          return null;
        }

        validRowCount++;
        const obj = {};
        headers.forEach(({ key, column }) => {
          if (key !== "ACTUAL_3") { // Exclude ACTUAL_3 from response
            const rawValue = row[column];
            const trimmed = rawValue?.trim() ?? "";
            obj[key] = trimmed;
            if (
              [
                "SKU_Code",
                "Material_Name",
                "REVISED_QUANTITY_2",
                "DECIDED_BRAND/COMPANY_NAME_2",
                "REMARKS_2",
                "PLANNED_3",
              ].includes(key) &&
              trimmed === ""
            ) {
              console.log(
                `  -> ${key} is empty (raw: "${rawValue}") in row ${index + 8}`
              );
            }
          }
        });
        return obj;
      })
      .filter(
        (obj) => obj && Object.entries(obj).some(([key, value]) => value !== "")
      );

    console.log(`Rows with PLANNED_3 non-empty and ACTUAL_3 empty: ${validRowCount}`);
    console.log("Final formData:", JSON.stringify(formData, null, 2));

    if (!formData.length) {
      console.log("No valid data found after filtering");
      return res.status(404).json({
        error: "No valid data found after filtering",
        details: validRowCount === 0
          ? "No rows have PLANNED_3 non-empty and ACTUAL_3 empty in columns V and W"
          : "All rows with PLANNED_3 non-empty and ACTUAL_3 empty are empty in other columns",
      });
    }

    const sortedFormData = formData.map((obj) => {
      const sortedObj = {};
      Object.keys(obj)
        .sort()
        .forEach((key) => {
          sortedObj[key] = obj[key];
        });
      return sortedObj;
    });

    return res.json({ data: sortedFormData });
  } catch (error) {
    console.error("Error fetching data:", error.message, error.stack);
    return res
      .status(500)
      .json({ error: "Failed to fetch data", details: error.message });
  }
});

////////////////// update-indent-data  Api  //////////////////
// Import the jspdf-autotable plugin


// Explicitly apply the autoTable plugin to jsPDF
router.post("/update-indent-data", async (req, res) => {
  const { UIDs, STATUS_3, INDENT_NUMBER_3, REMARK_3 } = req.body;

  // Step 1: Input validation
  if (
    !UIDs?.length ||
    !Array.isArray(UIDs) ||
    UIDs.some((uid) => typeof uid !== "string" || !uid.trim()) ||
    typeof STATUS_3 !== "string" ||
    !STATUS_3.trim() ||
    typeof INDENT_NUMBER_3 !== "string" ||
    !INDENT_NUMBER_3.trim() ||
    typeof REMARK_3 !== "string" ||
    !REMARK_3.trim()
  ) {
    console.log("Validation failed:", { UIDs, STATUS_3, INDENT_NUMBER_3, REMARK_3 });
    return res.status(400).json({
      error: "Invalid input",
      details:
        "UIDs (non-empty string array), STATUS_3, INDENT_NUMBER_3, and REMARK_3 (non-empty strings) are required",
    });
  }

  let pdfUrl = "";
  try {
    // Step 2: Fetch data from Google Sheets
    console.log("Fetching data from Google Sheets...");
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Purchase_FMS!A7:AC",
    }).catch((err) => {
      console.error("Google Sheets fetch error:", err.message);
      throw new Error(`Failed to fetch data: ${err.message}`);
    });

    const rows = response.data.values || [];
    if (!rows.length) {
      console.log("No data found in sheet");
      return res.status(404).json({ error: "No data found in the sheet" });
    }

    const headerRow = rows[0].map((cell) => (cell || "").trim());
    const uidIndex = headerRow.indexOf("UID");
    if (uidIndex === -1) {
      console.log("UID column not found");
      return res.status(400).json({ error: "UID column not found in sheet" });
    }

    // Define column indices
    const columnIndices = {
      "STATUS 3": headerRow.indexOf("STATUS 3"),
      "INDENT NUMBER 3": headerRow.indexOf("INDENT NUMBER 3"),
      "PDF URL 3": headerRow.indexOf("PDF URL 3"),
      "REMARK 3": headerRow.indexOf("REMARK 3"),
      "Site Name": headerRow.indexOf("Site Name"),
      "Supervisor Name": headerRow.indexOf("Supervisor Name"),
      "Require Date": headerRow.indexOf("Require Date"),
      "Material Type": headerRow.indexOf("Material Type"),
      "SKU Code": headerRow.indexOf("SKU Code"),
      "Material Name": headerRow.indexOf("Material Name"),
      "REVISED QUANTITY 2": headerRow.indexOf("REVISED QUANTITY 2"),
      Quantity: headerRow.indexOf("Quantity"),
      "Unit Name": headerRow.indexOf("Unit Name"),
      "DECIDED BRAND/COMPANY NAME 2": headerRow.indexOf("DECIDED BRAND/COMPANY NAME 2"),
      "Req No": headerRow.indexOf("Req No"),
      UID: uidIndex,
    };

    // Validate critical columns
    const criticalColumns = ["UID", "STATUS 3", "INDENT NUMBER 3", "PDF URL 3", "REMARK 3"];
    const missingCriticalColumns = criticalColumns.filter((key) => headerRow.indexOf(key) === -1);
    if (missingCriticalColumns.length) {
      console.log("Missing critical columns:", missingCriticalColumns);
      return res.status(400).json({
        error: `Missing columns: ${missingCriticalColumns.join(", ")}`,
      });
    }

    const dataRows = rows.slice(1);
    const selectedItems = [];
    const rowIndices = [];

    // Find rows for provided UIDs and log for debugging
    for (const uid of UIDs) {
      const rowIndex = dataRows.findIndex((row) => row[uidIndex]?.toString().trim() === uid.trim());
      if (rowIndex === -1) {
        console.log(`No matching row for UID: ${uid}`);
        return res.status(404).json({ error: `No matching row for UID: ${uid}` });
      }
      rowIndices.push(rowIndex + 8);

      selectedItems.push({
        UID: dataRows[rowIndex][columnIndices.UID] || "N/A",
        Site_Name: dataRows[rowIndex][columnIndices["Site Name"]] || "N/A",
        Supervisor_Name: dataRows[rowIndex][columnIndices["Supervisor Name"]] || "N/A",
        Require_Date: dataRows[rowIndex][columnIndices["Require Date"]] || "N/A",
        Material_Type: dataRows[rowIndex][columnIndices["Material Type"]] || "N/A",
        SKU_Code: dataRows[rowIndex][columnIndices["SKU Code"]] || "N/A",
        Material_Name: dataRows[rowIndex][columnIndices["Material Name"]] || "N/A",
        REVISED_QUANTITY_2: dataRows[rowIndex][columnIndices["REVISED QUANTITY 2"]] || "",
        Quantity: dataRows[rowIndex][columnIndices["Quantity"]] || "N/A",
        Unit_Name: dataRows[rowIndex][columnIndices["Unit Name"]] || "N/A",
        DECIDED_BRAND_COMPANY_NAME_2: dataRows[rowIndex][columnIndices["DECIDED BRAND/COMPANY NAME 2"]] || "",
        Req_No: dataRows[rowIndex][columnIndices["Req No"]] || "N/A",
      });
    }
    console.log("Selected Items:", selectedItems); // Debug log

    // Step 3: Generate PDF
    console.log("Generating PDF...");
    console.log("selectedItems length:", selectedItems.length);
    if (selectedItems.length === 0) {
      throw new Error("No items to generate PDF for");
    }

    const generatePDF = () => {
      try {
        const doc = new jsPDF();
        if (typeof doc.autoTable !== "function") {
          console.error("autoTable not found on jsPDF instance");
          throw new Error("autoTable plugin not properly loaded");
        }

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Header Section with Better Styling (no background color)
        
        // Company Name - Black text
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("R.C.C Infrastructures", pageWidth / 2, 15, { align: "center" });
        
        // Address and Contact Info
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("310 Saket Nagar, 9B Near Sagar Public School, Bhopal, 462026", pageWidth / 2, 22, { align: "center" });
        doc.text("Contact: 7869962504 | Email: mayank@rcinfrastructure.com", pageWidth / 2, 28, { align: "center" });
        doc.text("GST: 23ABHFR3130L1ZA", pageWidth / 2, 34, { align: "center" });
        
        // Title Section with underline
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(220, 53, 69); // Red color
        doc.text("MATERIAL INDENT REPORT", pageWidth / 2, 60, { align: "center" });
        
        // Decorative line under title
        doc.setDrawColor(220, 53, 69);
        doc.setLineWidth(1);
        doc.line(60, 63, pageWidth - 60, 63);
        
        // Reset color for content
        doc.setTextColor(0, 0, 0);
        
        // Info Section with better layout
        const { Site_Name, Supervisor_Name, Require_Date, Req_No } = selectedItems[0];
        const indentDate = new Date()
          .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
          .replace(/ /g, "-");

        // Enhanced cleaning function to remove special characters
        const cleanText = (text) => {
          return (text || "N/A").toString().trim().replace(/[^a-zA-Z0-9\s\-\/.,]/g, "");
        };

        const cleanSiteName = cleanText(Site_Name);
        const cleanSupervisorName = cleanText(Supervisor_Name);
        const cleanReqNo = cleanText(Req_No);
        const cleanRequireDate = cleanText(Require_Date);

        // Left Column Info (reduced gaps)
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Site Name:", 15, 80);
        doc.setFont("helvetica", "normal");
        doc.text(cleanSiteName, 40, 80);

        doc.setFont("helvetica", "bold");
        doc.text("Supervisor:", 15, 88);
        doc.setFont("helvetica", "normal");
        doc.text(cleanSupervisorName, 40, 88);

        doc.setFont("helvetica", "bold");
        doc.text("Indent Date:", 15, 96);
        doc.setFont("helvetica", "normal");
        doc.text(indentDate, 40, 96);

        // Right Column Info (reduced gaps to 25 units)
        doc.setFont("helvetica", "bold");
        doc.text("Request No:", 120, 80);
        doc.setFont("helvetica", "normal");
        doc.text(`${cleanReqNo}`, 145, 80); // Gap of 25 units

        doc.setFont("helvetica", "bold");
        doc.text("Required Date:", 120, 88);
        doc.setFont("helvetica", "normal");
        doc.text(cleanRequireDate, 145, 88); // Gap of 25 units

        // Indent Number below Required Date (dynamic and reduced gap to 25 units)
        doc.setFont("helvetica", "bold");
        doc.text("Indent No:", 120, 96);
        doc.setFont("helvetica", "normal");
        doc.text(INDENT_NUMBER_3, 145, 96); // Gap of 25 units

        // Indent Details Section Header (no background color, bold text only)
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(220, 53, 69); // Red color
        doc.text("Indent Details", 15, 110);

        // Table Data with cleaned values and added UID
        const tableBody = selectedItems.map((item, index) => [
          index + 1,
          cleanText(item.UID), // Cleaned UID
          cleanText(item.Material_Type),
          cleanText(item.SKU_Code),
          cleanText(item.Material_Name),
          cleanText(item.REVISED_QUANTITY_2 || item.Quantity),
          cleanText(item.Unit_Name),
          cleanText(item.DECIDED_BRAND_COMPANY_NAME_2),
        ]);

        // Calculate dynamic table properties based on data
        const totalItems = tableBody.length;
        const availableWidth = pageWidth - 30; // Total width minus margins
        
        // Dynamic font size based on data amount
        let tableFontSize = 8; // Reduced font size to prevent overflow
        let headerFontSize = 9;
        let cellPadding = 3; // Reduced padding
        
        if (totalItems > 15) {
          tableFontSize = 7;
          headerFontSize = 8;
          cellPadding = 2;
        } else if (totalItems > 10) {
          tableFontSize = 7.5;
          headerFontSize = 8.5;
          cellPadding = 2.5;
        }
        
        // Enhanced Table with responsive styling and fixed widths
        doc.autoTable({
          head: [
            [
              "Sr. No.",
              "UID",
              "Material Type",
              "SKU Code", 
              "Material Name",
              "Quantity",
              "Unit",
              "Brand/Company",
            ],
          ],
          body: tableBody,
          startY: 115,
          theme: "grid",
          styles: { 
            fontSize: tableFontSize,
            cellPadding: cellPadding,
            font: "helvetica",
            textColor: [0, 0, 0],
            lineColor: [200, 200, 200],
            lineWidth: 0.1,
            overflow: 'linebreak',
            cellWidth: 'wrap',
            fontStyle: "normal", // Ensure table body text is normal
          },
          headStyles: {
            fillColor: [255, 255, 255], // White (no background)
            textColor: [0, 0, 0], // Black text for header
            fontStyle: "bold", // Bold header text
            fontSize: headerFontSize,
            halign: "center",
            cellPadding: cellPadding + 1,
            overflow: 'linebreak',
          },
          columnStyles: {
            0: { halign: "center", cellWidth: 15 }, // Sr. No - Fixed
            1: { halign: "center", cellWidth: 18 }, // UID - Fixed
            2: {halign: "center", cellWidth: 30 }, // Material Type - Fixed
            3: { halign: "center", cellWidth: 22 }, // SKU Code - Fixed
            4: { cellWidth: 40 }, // Material Name - Fixed
            5: { halign: "center", cellWidth: 18 }, // Quantity - Fixed
            6: { halign: "center", cellWidth: 15 }, // Unit - Fixed
            7: { halign: "center",cellWidth: 30 }, // Brand/Company - Fixed
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245], // Light gray for alternate rows
          },
          margin: { top: 115, left: 15, right: 15 },
          tableWidth: 'auto',
          pageBreak: 'auto', // Allow page break for large tables
          showHead: 'everyPage', // Show header on every page
        });

        // Get the Y position after table
        const tableEndY = doc.lastAutoTable?.finalY || 150;
        
        // Footer Section
        const footerY = Math.max(tableEndY + 30, pageHeight - 60);
        
        // Signature section
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Authorized Signature", 15, footerY);
        
        // Signature line
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(15, footerY + 15, 80, footerY + 15);
        
        // Additional info in footer
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, footerY + 25);
        
        // Page border (optional - makes it look more professional)
        doc.setDrawColor(41, 128, 185);
        doc.setLineWidth(2);
        doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

        return doc.output("datauristring");
      } catch (pdfError) {
        console.error("PDF generation error:", pdfError.message, pdfError.stack);
        throw new Error(`Failed to generate PDF: ${pdfError.message}`);
      }
    };

    const pdfDataUri = generatePDF();
    const base64Data = pdfDataUri.replace(/^data:application\/pdf(?:;[^,]+)?;base64,/, "");
    if (!base64Data || !/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
      console.error("Invalid base64 data");
      throw new Error("Invalid base64 data for PDF");
    }

    // Step 4: Upload PDF to Google Drive
    console.log("Uploading PDF to Google Drive...");
    let folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    console.log("Current GOOGLE_DRIVE_FOLDER_ID:", folderId);

    if (!folderId) {
      console.error("Google Drive folder ID is not set in environment variables");
      throw new Error("Google Drive folder ID is required");
    }

    let validFolderId = folderId;
    let isFolderValid = false;

    // Verify folder exists
    try {
      const folderCheck = await drive.files.get({
        fileId: folderId,
        fields: "id, name",
        supportsAllDrives: true,
      });
      console.log(`Folder found: ${folderCheck.data.name} (ID: ${folderId})`);
      isFolderValid = true;
    } catch (folderError) {
      console.error("Error verifying Google Drive folder:", folderError.message);
      console.log("Attempting to create a new folder...");

      // Create a new folder if the provided one is invalid
      try {
        const newFolder = await drive.files.create({
          resource: {
            name: `Indent_PDFs_${Date.now()}`,
            mimeType: "application/vnd.google-apps.folder",
          },
          fields: "id, name",
          supportsAllDrives: true,
        });
        validFolderId = newFolder.data.id;
        console.log(`Created new folder: ${newFolder.data.name} (ID: ${validFolderId})`);
        isFolderValid = true;
      } catch (createError) {
        console.error("Failed to create new folder:", createError.message);
        console.log("Falling back to root Drive upload (no parent folder)");
        validFolderId = null; // Upload to root
        isFolderValid = false;
      }
    }

    const pdfBuffer = Buffer.from(base64Data, "base64");
    const fileMetadata = {
      name: `indent_${INDENT_NUMBER_3}_${Date.now()}.pdf`,
      parents: isFolderValid && validFolderId ? [validFolderId] : [],
      mimeType: "application/pdf",
    };
    const media = {
      mimeType: "application/pdf",
      body: Readable.from(pdfBuffer),
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id, webViewLink",
      supportsAllDrives: true,
    }).catch((err) => {
      console.error("Google Drive upload error:", err.message);
      throw new Error(`Failed to upload PDF: ${err.message}`);
    });

    pdfUrl = file.data.webViewLink;
    await drive.permissions.create({
      fileId: file.data.id,
      requestBody: { role: "reader", type: "anyone" },
      supportsAllDrives: true,
    }).catch((err) => {
      console.error("Google Drive permissions error:", err.message);
      throw new Error(`Failed to set permissions: ${err.message}`);
    });

    // Helper function to get column letter from 0-based index
    const getColumnLetter = (index) => {
      let letter = '';
      let tempIndex = index;
      while (tempIndex >= 0) {
        letter = String.fromCharCode((tempIndex % 26) + 65) + letter;
        tempIndex = Math.floor(tempIndex / 26) - 1;
      }
      return letter;
    };

    // Step 5: Update Google Sheets (only specific cells to preserve formulas)
    console.log("Updating Google Sheets...");
    const updateData = [];
    for (let i = 0; i < UIDs.length; i++) {
      const actualRowIndex = rowIndices[i];
      const updates = [
        { col: "STATUS 3", value: STATUS_3 },
        { col: "INDENT NUMBER 3", value: INDENT_NUMBER_3 },
        { col: "PDF URL 3", value: pdfUrl },
        { col: "REMARK 3", value: REMARK_3 },
      ];

      for (const update of updates) {
        const colIndex = columnIndices[update.col];
        if (colIndex !== -1) {
          const colLetter = getColumnLetter(colIndex);
          const range = `Purchase_FMS!${colLetter}${actualRowIndex}`;
          updateData.push({
            range,
            values: [[update.value]],
          });
        }
      }
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: "RAW",
        data: updateData,
      },
    }).catch((err) => {
      console.error("Google Sheets batch update error:", err.message);
      throw new Error(`Failed to update sheet: ${err.message}`);
    });

    console.log("Google Sheets updated successfully");
    return res.json({ message: "Data updated successfully", pdfUrl });
  } catch (error) {
    console.error("Error in update-indent-data:", error.message, error.stack);
    return res.status(500).json({
      error: "Server error",
      details: error.message || "An unexpected error occurred",
    });
  }
});





module.exports = router;
