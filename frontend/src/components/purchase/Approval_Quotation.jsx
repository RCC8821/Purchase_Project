

import React, { useState, useEffect } from "react";
import {
  FaPencilAlt,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaArrowRight,
} from "react-icons/fa";

const Approval_Quotation = () => {
  const [requests, setRequests] = useState([]);
  const [quotationData, setQuotationData] = useState([]);
  const [indentNumbers, setIndentNumbers] = useState([]);
  const [selectedIndent, setSelectedIndent] = useState("");
  const [currentStep, setCurrentStep] = useState(0); // 0: main table, 1: select indent, 2: view UIDs
  const [loading, setLoading] = useState(true);
  const [indentLoading, setIndentLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUIDData, setSelectedUIDData] = useState(null);
  const [selectedQuotations, setSelectedQuotations] = useState([]);

  // Fetch main requests from /get-approval-Quotation API for Step 0
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/get-approval-Quotation`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData = await response.json();
      console.log("Raw API Data:", apiData.data); // Debug: Log raw API response

      if (apiData && Array.isArray(apiData.data)) {
        const transformedData = apiData.data.map((item) => {
          console.log(
            "Item No_Of_Quotation_4:",
            item.No_Of_Quotation_4 || item["No._Of_Quotation_4"] || "N/A"
          ); // Debug: Log specific field
          return {
            UID: item.UID || "N/A",
            Req_No: item.Req_No || "N/A",
            Site_Name: item.Site_Name || "N/A",
            Supervisor_Name: item.Supervisor_Name || "N/A",
            Material_Type: item.Material_Type || "N/A",
            SKU_Code: item.SKU_Code || "N/A",
            Material_Name: item.Material_Name || "N/A",
            Quantity: item.Quantity || "N/A",
            Unit_Name: item.Unit_Name || "N/A",
            Purpose: item.Purpose || "N/A",
            Require_Date: item.Require_Date || "N/A",
            REVISED_QUANTITY_2: item.REVISED_QUANTITY_2 || "N/A",
            "DECIDED_BRAND/COMPANY_NAME_2":
              item["DECIDED_BRAND/COMPANY_NAME_2"] || "N/A",
            INDENT_NUMBER_3: item.INDENT_NUMBER_3 || "N/A",
            PDF_URL_3: item.PDF_URL_3 || "N/A",
            PLANNED_5: item.PLANNED_5 || "N/A",
            No_Of_Quotation_4:
              item.No_Of_Quotation_4 || item["No._Of_Quotation_4"] || "N/A",
            REMARK_4: item.REMARK_4 || "N/A",
          };
        });
        setRequests(transformedData);
        console.log("Transformed Data:", transformedData); // Debug: Log transformed data
      } else {
        throw new Error("API data is not in the expected format");
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      setError("Data not available");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (currentStep === 0) {
      fetchRequests();
    }
  }, [currentStep]);

  // Fetch indent numbers and UID data from /get-Quotation-create API for Steps 1 and 2
  const fetchIndentAndUIDData = async () => {
    try {
      setIndentLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/get-Quotation-create`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData = await response.json();
      console.log(apiData);
      if (apiData && Array.isArray(apiData.data)) {
        const transformedQuotationData = apiData.data.map((item) => ({
          Time_Stamp: item.Time_Stamp || "N/A",
          Req_No: item.Req_No || "N/A",
          UID: item.UID || "N/A",
          site_name: item.site_name || "N/A",
          Indent_No: item.Indent_No || "N/A",
          Material_name: item.Material_name || "N/A",
          Vendor_Name: item.Vendor_Name || "N/A",
          Vendor_Ferm_Name: item.Vendor_Ferm_Name || "N/A",
          Vendor_Address: item.Vendor_Address || "N/A",
          Contact_Number: item.Contact_Number || "N/A",
          Vendor_GST_No: item.Vendor_GST_No || "N/A",
          RATE: item.RATE || "N/A",
          Discount: item.Discount || "N/A",
          CGST: item.CGST || "N/A",
          SGST: item.SGST || "N/A",
          IGST: item.IGST || "N/A",
          Final_Rate: item.Final_Rate || "N/A",
          Delivery_Expected_Date: item.Delivery_Expected_Date || "N/A",
          Payment_Terms_Condition_Advance_Credit:
            item.Payment_Terms_Condition_Advance_Credit || "N/A",
          Credit_in_Days: item.Credit_in_Days || "N/A",
          Bill_Type: item.Bill_Type || "N/A",
          IS_TRANSPORT_REQUIRED: item.IS_TRANSPORT_REQUIRED || "N/A",
          EXPECTED_TRANSPORT_CHARGES: item.EXPECTED_TRANSPORT_CHARGES || "N/A",
          FRIGHET_CHARGES: item.FRIGHET_CHARGES || "N/A",
          EXPECTED_FRIGHET_CHARGES: item.EXPECTED_FRIGHET_CHARGES || "N/A",
          Status: item.Status || "N/A",
          Approval_Status: item.Approval_Status || "N/A",
          No_Of_Quotation_4: item.No_Of_Quotation_4 || "N/A",
          Remark_4: item.Remark_4 || "N/A",
          Quotation_No: item.Quotation_No || "N/A",
          Total_Quantity: item.Total_Quantity || "N/A",
          Total_Value: item.Total_Value || "N/A",
        }));

        setQuotationData(transformedQuotationData);

        // Extract unique indent numbers where Approval_Status is empty
        const uniqueIndents = [
          ...new Set(
            transformedQuotationData
              .filter(
                (item) =>
                  item.Indent_No !== "N/A" &&
                  (item.Approval_Status === "N/A" ||
                    item.Approval_Status === "" ||
                    item.Approval_Status === null ||
                    item.Approval_Status === undefined)
              )
              .map((item) => item.Indent_No)
          ),
        ];
        setIndentNumbers(uniqueIndents);
      } else {
        setIndentNumbers([]);
        setQuotationData([]);
      }
    } catch (error) {
      console.error("Error fetching indent numbers:", error);
      setError("Failed to load indent numbers from API.");
      setIndentNumbers([]);
      setQuotationData([]);
    } finally {
      setIndentLoading(false);
    }
  };

  // Fetch UID data for selected indent from quotationData
  const fetchUIDDataForIndent = (indentNo) => {
    if (!quotationData.length) return [];

    return quotationData
      .filter((item) => item.Indent_No === indentNo)
      .map((item) => ({
        Time_Stamp: item.Time_Stamp || "N/A",
        Req_No: item.Req_No || "N/A",
        UID: item.UID || "N/A",
        site_name: item.site_name || "N/A",
        Indent_No: item.Indent_No || "N/A",
        Material_name: item.Material_name || "N/A",
        Vendor_Name: item.Vendor_Name || "N/A",
        Vendor_Ferm_Name: item.Vendor_Ferm_Name || "N/A",
        Vendor_Address: item.Vendor_Address || "N/A",
        Contact_Number: item.Contact_Number || "N/A",
        Vendor_GST_No: item.Vendor_GST_No || "N/A",
        RATE: item.RATE || "N/A",
        Discount: item.Discount || "N/A",
        CGST: item.CGST || "N/A",
        SGST: item.SGST || "N/A",
        IGST: item.IGST || "N/A",
        Final_Rate: item.Final_Rate || "N/A",
        Delivery_Expected_Date: item.Delivery_Expected_Date || "N/A",
        Payment_Terms_Condition_Advance_Credit:
          item.Payment_Terms_Condition_Advance_Credit || "N/A",
        Credit_in_Days: item.Credit_in_Days || "N/A",
        Bill_Type: item.Bill_Type || "N/A",
        IS_TRANSPORT_REQUIRED: item.IS_TRANSPORT_REQUIRED || "N/A",
        EXPECTED_TRANSPORT_CHARGES: item.EXPECTED_TRANSPORT_CHARGES || "N/A",
        FRIGHET_CHARGES: item.FRIGHET_CHARGES || "N/A",
        EXPECTED_FRIGHET_CHARGES: item.EXPECTED_FRIGHET_CHARGES || "N/A",
        Status: item.Status || "N/A",
        Approval_Status: item.Approval_Status || "N/A",
        No_Of_Quotation_4: item.No_Of_Quotation_4 || "N/A",
        Remark_4: item.Remark_4 || "N/A",
        Quotation_No: item.Quotation_No || "N/A",
        Total_Quantity: item.Total_Quantity || "N/A",
        Total_Value: item.Total_Value || "N/A",
      }));
  };

  // Handle Create Approval Quotation
  const handleCreateApproval = () => {
    setCurrentStep(1);
    fetchIndentAndUIDData();
  };

  // Handle Next from Step 1 (Select Indent)
  const handleNextStep = () => {
    if (!selectedIndent) {
      alert("Please select an indent number first.");
      return;
    }

    setLoading(true);
    const uidData = fetchUIDDataForIndent(selectedIndent);
    setSelectedUIDData(uidData);
    setSelectedQuotations([]);
    setCurrentStep(2);
    setLoading(false);
  };

  const toggleSelect = (item) => {
    setSelectedQuotations((prev) => {
      const isSelected = prev.some(
        (selected) =>
          selected.UID === item.UID &&
          selected.Vendor_Ferm_Name === item.Vendor_Ferm_Name
      );
      if (isSelected) {
        return prev.filter(
          (selected) =>
            !(
              selected.UID === item.UID &&
              selected.Vendor_Ferm_Name === item.Vendor_Ferm_Name
            )
        );
      } else {
        return [...prev, item];
      }
    });
  };

  // Handle Approve/Reject action for single quotation
  const handleAction = async (item, action) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/update-approval`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            approvals: [{ uid: item.UID, vendor_firm_name: item.Vendor_Ferm_Name }],
            status: action === "approve" ? "Approved" : "Rejected",
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update");
      }
      alert(
        `${
          action === "approve" ? "Approved" : "Rejected"
        } quotation for UID: ${item.UID}, Vendor: ${item.Vendor_Ferm_Name}`
      );
      setSelectedUIDData((prev) =>
        prev.filter(
          (data) =>
            !(
              data.UID === item.UID &&
              data.Vendor_Ferm_Name === item.Vendor_Ferm_Name
            )
        )
      );
      setSelectedQuotations((prev) =>
        prev.filter(
          (data) =>
            !(
              data.UID === item.UID &&
              data.Vendor_Ferm_Name === item.Vendor_Ferm_Name
            )
        )
      );
      // Navigate back to Step 0 and refresh data after successful action
      setCurrentStep(0);
      setSelectedIndent("");
      setSelectedUIDData(null);
      setSelectedQuotations([]);
      fetchRequests(); // Refresh the table data
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    } finally {
      setLoading(false);
    }
  };

  // Handle Save for multiple quotations
  const handleSave = async () => {
    if (selectedQuotations.length === 0) {
      alert("No quotations selected");
      return;
    }
    setLoading(true);
    try {
      console.log("Sending request with quotations:", selectedQuotations);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/update-approval`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            approvals: selectedQuotations.map((item) => ({
              uid: item.UID,
              vendor_firm_name: item.Vendor_Ferm_Name,
            })),
            status: "Approved",
          }),
        }
      );
      console.log(
        "Response status:",
        response.status,
        "Status text:",
        response.statusText
      );

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error(
          `Expected JSON, received ${
            contentType || "no content-type"
          }: ${text.slice(0, 100)}...`
        );
      }

      const data = await response.json();
      if (!response.ok) {
        console.error("API Error Response:", data);
        throw new Error(
          `Failed to update: ${data.error || response.statusText}`
        );
      }

      alert("Selected quotations approved!");
      setSelectedUIDData((prev) =>
        prev.filter(
          (data) =>
            !selectedQuotations.some(
              (selected) =>
                selected.UID === data.UID &&
                selected.Vendor_Ferm_Name === data.Vendor_Ferm_Name
            )
        )
      );
      setSelectedQuotations([]);
      // Navigate back to Step 0 and refresh data
      setCurrentStep(0);
      setSelectedIndent("");
      setSelectedUIDData(null);
      fetchRequests(); // Refresh the table data
    } catch (err) {
      console.error("Error in handleSave:", err);
      alert(`Error updating status: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Render Step 1: Select Indent Number
  const renderStep1 = () => (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Select Indent Number
        </h2>
        <button
          onClick={() => {
            setCurrentStep(0);
            setSelectedIndent("");
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <FaTimes />
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Indent Number <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedIndent}
          onChange={(e) => setSelectedIndent(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={indentLoading}
        >
          <option value="">--Select Indent Number--</option>
          {indentNumbers.map((indent, index) => (
            <option key={index} value={indent}>
              {indent}
            </option>
          ))}
        </select>
      </div>

      {indentLoading && (
        <div className="flex items-center text-blue-600 mb-4">
          <FaSpinner className="animate-spin mr-2" />
          Loading indent numbers...
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          onClick={() => {
            setCurrentStep(0);
            setSelectedIndent("");
          }}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleNextStep}
          disabled={!selectedIndent || indentLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          <FaArrowRight className="mr-2" />
          Next
        </button>
      </div>
    </div>
  );

  // Render Step 2: View UID Data
  const renderStep2 = () => (
    <div className="p-6 bg-white rounded-lg shadow-md max-h-[70vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          UID Data for Indent: {selectedIndent}
        </h2>
        <button
          onClick={() => {
            setCurrentStep(1);
            setSelectedUIDData(null);
            setSelectedQuotations([]);
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <FaTimes />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <FaSpinner className="animate-spin text-blue-600 mx-auto mb-2" />
          <p>Loading UID data...</p>
        </div>
      ) : selectedUIDData && selectedUIDData.length > 0 ? (
        <div className="space-y-4">
          {selectedUIDData.map((item, index) => (
            <div
              key={`${item.UID}-${item.Vendor_Ferm_Name}`}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedQuotations.some(
                      (selected) =>
                        selected.UID === item.UID &&
                        selected.Vendor_Ferm_Name === item.Vendor_Ferm_Name
                    )}
                    onChange={() => toggleSelect(item)}
                    className="mr-2"
                  />
                  <h3 className="font-semibold text-gray-800">
                    UID: {item.UID} (Vendor: {item.Vendor_Ferm_Name})
                  </h3>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAction(item, "approve")}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                  >
                    <FaCheck />
                  </button>
                  <button
                    onClick={() => handleAction(item, "reject")}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Req No:</span>
                  <p className="text-gray-800">{item.Req_No}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Site Name:</span>
                  <p className="text-gray-800">{item.site_name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Material:</span>
                  <p
                    className="text-gray-800 truncate"
                    title={item.Material_name}
                  >
                    {item.Material_name}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Vendor Name:
                  </span>
                  <p className="text-gray-800">{item.Vendor_Name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Vendor Firm:
                  </span>
                  <p className="text-gray-800">{item.Vendor_Ferm_Name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Rate:</span>
                  <p className="text-gray-800">{item.RATE}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">CGST:</span>
                  <p className="text-gray-800">{item.CGST}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">SGST:</span>
                  <p className="text-gray-800">{item.SGST}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">IGST:</span>
                  <p className="text-gray-800">{item.IGST}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Final Rate:</span>
                  <p className="text-gray-800 font-semibold">
                    {item.Final_Rate}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Total Quantity:
                  </span>
                  <p className="text-gray-800">{item.Total_Quantity}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Total Value:
                  </span>
                  <p className="text-gray-800">{item.Total_Value}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Delivery Date:
                  </span>
                  <p className="text-gray-800">{item.Delivery_Expected_Date}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Payment Terms:
                  </span>
                  <p className="text-gray-800">
                    {item.Payment_Terms_Condition_Advance_Credit}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Credit Days:
                  </span>
                  <p className="text-gray-800">{item.Credit_in_Days}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Is Transport Required:
                  </span>
                  <p className="text-gray-800">{item.IS_TRANSPORT_REQUIRED}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Transport Charges:
                  </span>
                  <p className="text-gray-800">
                    {item.EXPECTED_TRANSPORT_CHARGES}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Is Freight Charges:
                  </span>
                  <p className="text-gray-800">{item.FRIGHET_CHARGES}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Freight Charges:
                  </span>
                  <p className="text-gray-800">
                    {item.EXPECTED_FRIGHET_CHARGES}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Quotation No:
                  </span>
                  <p className="text-gray-800 font-mono">{item.Quotation_No}</p>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-gray-600">Remark:</span>
                  <p className="text-gray-800">{item.Remark_4}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No UID data found for this indent number.
        </div>
      )}

      <div className="flex justify-end mt-6 space-x-3">
        <button
          onClick={() => {
            setCurrentStep(1);
            setSelectedUIDData(null);
            setSelectedQuotations([]);
          }}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSave}
          disabled={selectedQuotations.length === 0 || loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="mb-4 flex justify-between items-center">
        {currentStep === 0 && (
          <button
            onClick={handleCreateApproval}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <FaPencilAlt className="mr-2" />
            Create Approval Quotation
          </button>
        )}
      </div>

      {currentStep === 0 && (
        <div className="bg-white border border-gray-300 rounded-xl shadow-lg">
          {loading ? (
            <div className="p-4 text-center text-gray-500 flex items-center justify-center">
              <FaSpinner className="animate-spin mr-2" /> Loading...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : requests.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No requests available.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                      PLANNED 5
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                      UID
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                      REQ NO
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                      SITE NAME
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                      SUPERVISOR NAME
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                      MATERIAL TYPE
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                      SKU CODE
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                      MATERIAL NAME
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                      QUANTITY
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                      UNIT NAME
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                      PURPOSE
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                      REQUIRE DATE
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                      REVISED QUANTITY 2
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                      DECIDED BRAND/COMPANY NAME 2
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                      INDENT NUMBER 3
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                      PDF URL 3
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                      NO OF QUOTATION 4
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                      REMARK 4
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request, index) => (
                    <tr
                      key={request.Req_No}
                      className={`hover:bg-blue-50 transition-colors duration-150 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                        {request.PLANNED_5}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200 font-medium">
                        {request.UID}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200 font-medium text-blue-600">
                        {request.Req_No}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                        <div title={request.Site_Name}>{request.Site_Name}</div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                        {request.Supervisor_Name}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                        {request.Material_Type}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200 font-mono text-xs">
                        {request.SKU_Code}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                        <div
                          className="max-w-[120px] truncate"
                          title={request.Material_Name}
                        >
                          {request.Material_Name}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200 text-right font-semibold">
                        {request.Quantity}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                        {request.Unit_Name}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                        <div
                          className="max-w-[100px] truncate"
                          title={request.Purpose}
                        >
                          {request.Purpose}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                        {request.Require_Date}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200 font-semibold text-orange-600">
                        {request.REVISED_QUANTITY_2}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                        <div
                          className="max-w-[120px] truncate"
                          title={request["DECIDED_BRAND/COMPANY_NAME_2"]}
                        >
                          {request["DECIDED_BRAND/COMPANY_NAME_2"]}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200 font-mono text-xs bg-yellow-50">
                        {request.INDENT_NUMBER_3}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                        <div
                          className="max-w-[120px] truncate"
                          title={request.PDF_URL_3}
                        >
                          {request.PDF_URL_3 !== "N/A" ? (
                            <a
                              href={request.PDF_URL_3}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                            >
                              View PDF
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                        {request.No_Of_Quotation_4}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                        {request.REMARK_4}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
    </div>
  );
};

export default Approval_Quotation;