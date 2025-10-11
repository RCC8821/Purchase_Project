import React, { useState, useEffect } from "react";
import { FaPencilAlt, FaCheck, FaTimes, FaSpinner } from "react-icons/fa";

const Take_Quotation = () => {
  const [requests, setRequests] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [status4, setStatus4] = useState("Done");
  const [noOfQuotation4, setNoOfQuotation4] = useState("");
  const [remark4, setRemark4] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [vendorOptions, setVendorOptions] = useState([]);

  useEffect(() => {
    setNoOfQuotation4(vendors.length.toString());
  }, [vendors]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/get-take-Quotation`,
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

        if (apiData && Array.isArray(apiData.data)) {
          const transformedData = apiData.data.map((item) => ({
            UID: item.UID || "N/A",
            Req_No: item.Req_No || "N/A",
            Site_Name: item.Site_Name || "N/A",
            Supervisor_Name: item.Supervisor_Name || "N/A",
            Material_Type: item.Material_Type || "N/A",
            SKU_Code: item.SKU_Code || "N/A",
            Material_Name: item.Material_Name || "N/A",
            Unit_Name: item.Unit_Name || "N/A",
            Purpose: item.Purpose || "N/A",
            Require_Date: item.Require_Date || "N/A",
            REVISED_QUANTITY_2: item.REVISED_QUANTITY_2 || "",
            "DECIDED_BRAND/COMPANY_NAME_2":
              item["DECIDED_BRAND/COMPANY_NAME_2"] || "",
            INDENT_NUMBER_3: item.INDENT_NUMBER_3 || "",
            PDF_URL_3: item.PDF_URL_3 || "",
            REMARK_3: item.REMARK_3 || "",
            PLANNED_4: item.PLANNED_4 || "N/A",
            NO_OF_QUOTATION_4: item.NO_OF_QUOTATION_4 || "",
            REMARK_4: item.REMARK_4 || "",
          }));
          setRequests(transformedData);
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

    const fetchVendorOptions = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/vendors`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch vendor data");
        }
        const data = await response.json();
        setVendorOptions(data);
      } catch (error) {
        console.error("Error fetching vendor options:", error);
      }
    };

    fetchRequests();
    fetchVendorOptions();
  }, []);

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
    setCurrentStep(1);
    setSelectedIndent(null);
    setVendors([]);
    setStatus4("Done");
    setNoOfQuotation4("");
    setRemark4("");
    setShowSuccess(false);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setCurrentStep(1);
    setSelectedIndent(null);
    setVendors([]);
    setStatus4("Done");
    setNoOfQuotation4("");
    setRemark4("");
    setIsSaving(false);
    setShowSuccess(false);
  };

  const addVendor = () => {
    setVendors([
      ...vendors,
      {
        firm: "",
        name: "",
        gst: "",
        contact: "",
        address: "",
        deliveryDate: "",
        billType: "",
        paymentTerms: "",
        creditInDays: "",
        transportRequired: "",
        expectedTransportCharges: "",
        freightCharges: "",
        expectedFreightCharges: "",
        materials: [],
      },
    ]);
  };

  const removeVendor = (index) => {
    setVendors(vendors.filter((_, i) => i !== index));
  };

  const handleVendorChange = (index, field, value) => {
    const newVendors = [...vendors];
    newVendors[index][field] = value;
    if (field === "paymentTerms" && value !== "Credit") {
      newVendors[index].creditInDays = "";
    } else if (field === "firm") {
      const selectedVendor = vendorOptions.find((v) => v.vendorFirm === value);
      if (selectedVendor) {
        newVendors[index].gst = selectedVendor.gstNumber || "";
        newVendors[index].contact = selectedVendor.contactNo || "";
        newVendors[index].name = selectedVendor.vendorName || "";
      } else {
        newVendors[index].gst = "";
        newVendors[index].contact = "";
        newVendors[index].name = "";
      }
    } else if (field === "transportRequired" && value !== "Yes") {
      newVendors[index].expectedTransportCharges = "";
    } else if (field === "freightCharges" && value !== "Yes") {
      newVendors[index].expectedFreightCharges = "";
    }
    setVendors(newVendors);
  };

  const addMaterialToVendor = (vendorIndex) => {
    const newVendors = [...vendors];
    newVendors[vendorIndex].materials.push({
      Material_Name: "",
      Rate: "",
      "Discount (%)": "",
      "CGST (%)": "",
      "SGST (%)": "",
      "IGST (%)": "",
      Total: "",
      Remark: "",
      Revised_Quantity: "", // New field for quantity
      Total_Value: "", // New field for total value
    });
    setVendors(newVendors);
  };

  const handleMaterialChange = (vendorIndex, materialIndex, field, value) => {
  console.log("handleMaterialChange called:", {
    vendorIndex,
    materialIndex,
    field,
    value,
    selectedIndent,
  });

  const newVendors = [...vendors];
  const newMaterials = [...newVendors[vendorIndex].materials];
  newMaterials[materialIndex][field] = value;

  // Update Revised_Quantity and Unit_Name when Material_Name is selected
  if (field === "Material_Name" && value) {
    console.log("Filtering requests for INDENT_NUMBER_3:", selectedIndent);
    console.log("Available requests:", requests);

    const selectedRequest = requests.find(
      (req) =>
        req.INDENT_NUMBER_3 === selectedIndent && req.Material_Name === value
    );

    console.log("Selected request:", selectedRequest);

    if (selectedRequest) {
      newMaterials[materialIndex].Revised_Quantity =
        selectedRequest.REVISED_QUANTITY_2 || "";
      newMaterials[materialIndex].Unit_Name = selectedRequest.Unit_Name || "Unit not found";
    } else {
      console.log("No matching request found for Material_Name:", value);
      newMaterials[materialIndex].Revised_Quantity = "";
      newMaterials[materialIndex].Unit_Name = "Select a material to fetch unit";
    }
  }

  // Calculate Total and Total_Value
  if (
    ["Rate", "Discount (%)", "CGST (%)", "SGST (%)", "IGST (%)"].includes(field)
  ) {
    const rate = parseFloat(newMaterials[materialIndex].Rate) || 0;
    const discount = parseFloat(newMaterials[materialIndex]["Discount (%)"]) || 0;
    const cgst = parseFloat(newMaterials[materialIndex]["CGST (%)"]) || 0;
    const sgst = parseFloat(newMaterials[materialIndex]["SGST (%)"]) || 0;
    const igst = parseFloat(newMaterials[materialIndex]["IGST (%)"]) || 0;
    const baseAmount = rate * (1 - discount / 100);
    const taxAmount = baseAmount * ((cgst + sgst + igst) / 100);
    newMaterials[materialIndex].Total = (baseAmount + taxAmount).toFixed(2);

    // Calculate Total_Value
    const revisedQuantity =
      parseFloat(newMaterials[materialIndex].Revised_Quantity) || 0;
    const totalRate = parseFloat(newMaterials[materialIndex].Total) || 0;
    newMaterials[materialIndex].Total_Value = (
      revisedQuantity * totalRate
    ).toFixed(2);
  }

  newVendors[vendorIndex].materials = newMaterials;
  setVendors(newVendors);
};

  const removeMaterialFromVendor = (vendorIndex, materialIndex) => {
    const newVendors = [...vendors];
    newVendors[vendorIndex].materials = newVendors[
      vendorIndex
    ].materials.filter((_, i) => i !== materialIndex);
    setVendors(newVendors);
  };

  const validateStep3 = () => {
    if (vendors.length === 0) return false;
    for (const vendor of vendors) {
      if (
        !vendor.firm ||
        !vendor.deliveryDate ||
        !vendor.billType ||
        !vendor.paymentTerms ||
        !vendor.transportRequired ||
        !vendor.freightCharges
      ) {
        return false;
      }
      if (vendor.paymentTerms === "Credit" && !vendor.creditInDays) {
        return false;
      }
      if (
        vendor.transportRequired === "Yes" &&
        !vendor.expectedTransportCharges
      ) {
        return false;
      }
      if (vendor.freightCharges === "Yes" && !vendor.expectedFreightCharges) {
        return false;
      }
      if (vendor.materials.length === 0) return false;
      for (const material of vendor.materials) {
        if (
          !material.Material_Name ||
          !material.Rate ||
          !material.Revised_Quantity
        ) {
          return false;
        }
      }
    }
    return true;
  };




  


  

  const handleSave = async () => {
    if (!selectedIndent) {
      setError("Please select an indent number.");
      return;
    }

    const selectedRequests = requests.filter(
      (req) => req.INDENT_NUMBER_3 === selectedIndent
    );
    if (selectedRequests.length === 0) {
      setError("No requests found for the selected indent.");
      return;
    }

    const common = {
      Req_No: selectedRequests[0].Req_No,
      site_name: selectedRequests[0].Site_Name,
      Indent_No: selectedIndent,
    };

    const entries = [];

    for (const vendor of vendors) {
      for (const material of vendor.materials) {
        const req = selectedRequests.find(
          (r) => r.Material_Name === material.Material_Name
        );
        if (!req) {
          setError(
            `Material ${material.Material_Name} not found in selected indent.`
          );
          return;
        }

        const revisedQuantity = parseFloat(material.Revised_Quantity) || 0;
        const finalRate = parseFloat(material.Total) || 0;
        const totalValue = parseFloat(material.Total_Value) || 0;

        if (isNaN(totalValue) || totalValue <= 0) {
          setError(
            `Invalid total value for material ${material.Material_Name}. Please check the Rate and Revised Quantity.`
          );
          return;
        }

        const entry = {
          Req_No: common.Req_No,
          UID: req.UID,
          site_name: common.site_name,
          Indent_No: common.Indent_No,
          Material_name: material.Material_Name,
          Vendor_Name: vendor.name,
          Vendor_Ferm_Name: vendor.firm,
          Vendor_Address: vendor.address,
          Contact_Number: vendor.contact,
          Vendor_GST_No: vendor.gst,
          RATE: material.Rate,
          Discount: material["Discount (%)"],
          CGST: material["CGST (%)"],
          SGST: material["SGST (%)"],
          IGST: material["IGST (%)"],
          Final_Rate: material.Total,
          Delivery_Expected_Date: vendor.deliveryDate,
          Payment_Terms_Condistion_Advacne_Credit: vendor.paymentTerms,
          Credit_in_Days: vendor.creditInDays,
          Bill_Type: vendor.billType,
          IS_TRANSPORT_REQUIRED: vendor.transportRequired,
          EXPECTED_TRANSPORT_CHARGES: vendor.expectedTransportCharges,
          FRIGHET_CHARGES: vendor.freightCharges,
          EXPECTED_FRIGHET_CHARGES: vendor.expectedFreightCharges,
          PLANNED_4: status4,
          NO_OF_QUOTATION_4: noOfQuotation4,
          REMARK_4: remark4,
          REVISED_QUANTITY_2: revisedQuantity.toString(),
          Total_Value: totalValue,
        };
        entries.push(entry);
      }
    }

    try {
      setIsSaving(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/save-take-Quotation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ entries }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save data");
      }

      setShowSuccess(true);
      setTimeout(() => {
        closeCreateModal();
      }, 1500);
    } catch (error) {
      console.error("Error saving to sheet:", error);
      setError("Failed to save due to a network error or invalid data.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <button
        onClick={openCreateModal}
        className="mb-4 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        Create New Quotation
      </button>
      <div className="bg-white border border-gray-300 rounded-xl shadow-lg">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
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
                    PLANNED 4
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
                    REVISED QUANTITY 2
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    UNIT NAME
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    DECIDED BRAND/COMPANY NAME 2
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    REQUIRE DAYS
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    PURPOSE
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    INDENT NUMBER 3
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    PDF URL 3
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    REMARK 3
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
                      {request.PLANNED_4 || "N/A"}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200 font-medium">
                      {request.UID}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200 font-medium text-blue-600">
                      {request.Req_No}
                    </td>
                    <td className="px-5 py-5 text-sm text-gray-800 border-r border-gray-200">
                      <div className="max-w-[100px] " title={request.Site_Name}>
                        {request.Site_Name}
                      </div>
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
                    <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200 font-semibold text-orange-600">
                      {request.REVISED_QUANTITY_2}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                      {request.Unit_Name}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                      <div title={request["DECIDED_BRAND/COMPANY_NAME_2"]}>
                        {request["DECIDED_BRAND/COMPANY_NAME_2"]}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                      {request.Require_Date}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                      <div
                        className="max-w-[100px] truncate"
                        title={request.Purpose}
                      >
                        {request.Purpose}
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
                        <a
                          href={request.PDF_URL_3}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                          View PDF
                        </a>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                      <div
                        className="max-w-[120px] truncate"
                        title={request.REMARK_3}
                      >
                        {request.REMARK_3}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-75 backdrop-blur-sm flex items-top justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto transform transition-all duration-300 scale-100 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl flex-shrink-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold text-white flex items-center">
                  Create New Quotation - Step {currentStep} of 5
                </h4>
                <button
                  onClick={closeCreateModal}
                  className="text-white hover:text-gray-200 p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200"
                  disabled={isSaving}
                >
                  <FaTimes size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {showSuccess && (
                <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                  <FaCheck className="text-green-600 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-green-800 font-medium">Success!</p>
                    <p className="text-green-700 text-sm">
                      Quotation has been created successfully.
                    </p>
                  </div>
                </div>
              )}

              <div className="px-6 py-6">
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                      <h5 className="font-semibold text-blue-800 mb-2">
                        Step 1: Select an Indent Number
                      </h5>
                      <p className="text-blue-700 text-sm">
                        Choose an existing indent number to create quotation
                        for.
                      </p>
                    </div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Available Indent Numbers
                    </label>
                    <select
                      onChange={(e) => setSelectedIndent(e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white appearance-none cursor-pointer shadow-sm hover:shadow-md"
                      disabled={isSaving}
                    >
                      <option>-- Select an Indent Number --</option>
                      {[
                        ...new Set(
                          requests.map((request) => request.INDENT_NUMBER_3)
                        ),
                      ].map((indentNumber, index) => (
                        <option key={index} value={indentNumber}>
                          {indentNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                      <h5 className="font-semibold text-green-800 mb-2">
                        Step 2: Review Materials for Indent
                      </h5>
                      <p className="text-green-700 text-sm">
                        Review the materials associated with the selected
                        indent.
                      </p>
                    </div>
                    {selectedIndent &&
                      requests
                        .filter((req) => req.INDENT_NUMBER_3 === selectedIndent)
                        .map((req, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  UID
                                </label>
                                <p className="text-sm font-semibold text-gray-800">
                                  {req.UID}
                                </p>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Material Name
                                </label>
                                <p className="text-sm font-semibold text-gray-800">
                                  {req.Material_Name}
                                </p>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Revised Quantity
                                </label>
                                <p className="text-sm font-semibold text-orange-600">
                                  {req.REVISED_QUANTITY_2}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                  </div>
                )}

              {currentStep === 3 && (
  <div className="space-y-6">
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
      <h5 className="font-semibold text-purple-800 mb-2">
        Step 3: Add Vendors and Quotation Details
      </h5>
      <p className="text-purple-700 text-sm">
        Add vendor information and their associated materials for quotation.
      </p>
    </div>

    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h5 className="text-lg font-semibold text-gray-800">Vendors</h5>
        <button
          onClick={addVendor}
          className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          disabled={isSaving}
        >
          Add Vendor
        </button>
      </div>

      <div className="space-y-6 max-h-[600px] overflow-y-auto">
        {vendors.map((vendor, vIndex) => (
          <div
            key={vIndex}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative shadow-sm"
          >
            <div className="flex justify-between items-center mb-4">
              <h6 className="text-md font-semibold text-blue-800">
                Vendor {vIndex + 1}
              </h6>
              <button
                onClick={() => removeVendor(vIndex)}
                className="text-red-500 hover:text-red-700 px-3 py-1 rounded-md hover:bg-red-50 transition-all duration-200"
                disabled={isSaving}
              >
                Remove Vendor
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Firm *
                  {!vendor.firm && (
                    <span className="text-red-500 ml-1">Required</span>
                  )}
                </label>
                <select
                  value={vendor.firm}
                  onChange={(e) =>
                    handleVendorChange(vIndex, "firm", e.target.value)
                  }
                  className={`w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                    !vendor.firm ? "border-red-500" : ""
                  }`}
                  disabled={isSaving}
                  required
                >
                  <option value="">-- Select Vendor Firm --</option>
                  {vendorOptions.map((option, idx) => (
                    <option key={idx} value={option.vendorFirm}>
                      {option.vendorFirm}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Name
                </label>
                <input
                  value={vendor.name}
                  onChange={(e) =>
                    handleVendorChange(vIndex, "name", e.target.value)
                  }
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter vendor name"
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Number
                </label>
                <input
                  value={vendor.gst}
                  onChange={(e) =>
                    handleVendorChange(vIndex, "gst", e.target.value)
                  }
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter GST number"
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number
                </label>
                <input
                  value={vendor.contact}
                  onChange={(e) =>
                    handleVendorChange(vIndex, "contact", e.target.value)
                  }
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter contact number"
                  disabled={isSaving}
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={vendor.address}
                onChange={(e) =>
                  handleVendorChange(vIndex, "address", e.target.value)
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                rows={3}
                placeholder="Enter vendor address"
                disabled={isSaving}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Expected Date *
                  {!vendor.deliveryDate && (
                    <span className="text-red-500 ml-1">Required</span>
                  )}
                </label>
                <input
                  type="date"
                  value={vendor.deliveryDate}
                  onChange={(e) =>
                    handleVendorChange(vIndex, "deliveryDate", e.target.value)
                  }
                  className={`w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                    !vendor.deliveryDate ? "border-red-500" : ""
                  }`}
                  disabled={isSaving}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bill Type *
                  {!vendor.billType && (
                    <span className="text-red-500 ml-1">Required</span>
                  )}
                </label>
                <select
                  value={vendor.billType}
                  onChange={(e) =>
                    handleVendorChange(vIndex, "billType", e.target.value)
                  }
                  className={`w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                    !vendor.billType ? "border-red-500" : ""
                  }`}
                  disabled={isSaving}
                  required
                >
                  <option value="">Select Bill Type</option>
                  <option>Tax Invoice</option>
                  <option>Proforma Invoice</option>
                  <option>Cash Bill</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Terms *
                  {!vendor.paymentTerms && (
                    <span className="text-red-500 ml-1">Required</span>
                  )}
                </label>
                <select
                  value={vendor.paymentTerms}
                  onChange={(e) =>
                    handleVendorChange(vIndex, "paymentTerms", e.target.value)
                  }
                  className={`w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                    !vendor.paymentTerms ? "border-red-500" : ""
                  }`}
                  disabled={isSaving}
                  required
                >
                  <option value="">Select Payment Terms</option>
                  <option>Credit</option>
                  <option>Advance</option>
                </select>
              </div>
              {vendor.paymentTerms === "Credit" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credit in Days *
                    {!vendor.creditInDays && (
                      <span className="text-red-500 ml-1">Required</span>
                    )}
                  </label>
                  <input
                    type="number"
                    value={vendor.creditInDays}
                    onChange={(e) =>
                      handleVendorChange(vIndex, "creditInDays", e.target.value)
                    }
                    className={`w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      !vendor.creditInDays ? "border-red-500" : ""
                    }`}
                    placeholder="Enter credit days"
                    disabled={isSaving}
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Is Transport Required *
                  {!vendor.transportRequired && (
                    <span className="text-red-500 ml-1">Required</span>
                  )}
                </label>
                <select
                  value={vendor.transportRequired}
                  onChange={(e) =>
                    handleVendorChange(vIndex, "transportRequired", e.target.value)
                  }
                  className={`w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                    !vendor.transportRequired ? "border-red-500" : ""
                  }`}
                  disabled={isSaving}
                  required
                >
                  <option value="">Select</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>
              {vendor.transportRequired === "Yes" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Transport Charges *
                    {!vendor.expectedTransportCharges && (
                      <span className="text-red-500 ml-1">Required</span>
                    )}
                  </label>
                  <input
                    type="number"
                    value={vendor.expectedTransportCharges}
                    onChange={(e) =>
                      handleVendorChange(
                        vIndex,
                        "expectedTransportCharges",
                        e.target.value
                      )
                    }
                    className={`w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      !vendor.expectedTransportCharges ? "border-red-500" : ""
                    }`}
                    placeholder="Enter expected transport charges"
                    disabled={isSaving}
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Freight Charges *
                  {!vendor.freightCharges && (
                    <span className="text-red-500 ml-1">Required</span>
                  )}
                </label>
                <select
                  value={vendor.freightCharges}
                  onChange={(e) =>
                    handleVendorChange(vIndex, "freightCharges", e.target.value)
                  }
                  className={`w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                    !vendor.freightCharges ? "border-red-500" : ""
                  }`}
                  disabled={isSaving}
                  required
                >
                  <option value="">Select</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>
              {vendor.freightCharges === "Yes" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Freight Charges *
                    {!vendor.expectedFreightCharges && (
                      <span className="text-red-500 ml-1">Required</span>
                    )}
                  </label>
                  <input
                    type="number"
                    value={vendor.expectedFreightCharges}
                    onChange={(e) =>
                      handleVendorChange(
                        vIndex,
                        "expectedFreightCharges",
                        e.target.value
                      )
                    }
                    className={`w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      !vendor.expectedFreightCharges ? "border-red-500" : ""
                    }`}
                    placeholder="Enter expected freight charges"
                    disabled={isSaving}
                    required
                  />
                </div>
              )}
            </div>

            <div className="border-t border-gray-300 pt-4">
              <div className="flex justify-between items-center mb-4">
                <h6 className="text-md font-semibold text-indigo-800">
                  Materials for this Vendor
                </h6>
                <button
                  onClick={() => addMaterialToVendor(vIndex)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  disabled={isSaving}
                >
                  Add Material
                </button>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {vendor.materials.map((material, mIndex) => (
                  <div
                    key={mIndex}
                    className="bg-white border border-gray-200 rounded-lg p-3 relative shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h7 className="text-sm font-semibold text-indigo-600">
                        Material {mIndex + 1}
                      </h7>
                      <button
                        onClick={() => removeMaterialFromVendor(vIndex, mIndex)}
                        className="text-red-500 hover:text-red-700 px-2 py-1 rounded-md hover:bg-red-50 transition-all duration-200 text-xs"
                        disabled={isSaving}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Material Name *
                          {!material.Material_Name && (
                            <span className="text-red-500 ml-1">Required</span>
                          )}
                        </label>
                        <select
                          value={material.Material_Name}
                          onChange={(e) =>
                            handleMaterialChange(
                              vIndex,
                              mIndex,
                              "Material_Name",
                              e.target.value
                            )
                          }
                          className={`w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm ${
                            !material.Material_Name ? "border-red-500" : ""
                          }`}
                          disabled={isSaving || !selectedIndent}
                          required
                        >
                          <option value="">-- Select Material --</option>
                          {selectedIndent &&
                            requests
                              .filter(
                                (req) => req.INDENT_NUMBER_3 === selectedIndent
                              )
                              .map((req, i) => (
                                <option key={i} value={req.Material_Name}>
                                  {req.Material_Name}
                                </option>
                              ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Rate *
                          {!material.Rate && (
                            <span className="text-red-500 ml-1">Required</span>
                          )}
                        </label>
                        <input
                          type="number"
                          value={material.Rate}
                          onChange={(e) =>
                            handleMaterialChange(
                              vIndex,
                              mIndex,
                              "Rate",
                              e.target.value
                            )
                          }
                          className={`w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm ${
                            !material.Rate ? "border-red-500" : ""
                          }`}
                          placeholder="0.00"
                          disabled={isSaving}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Revised Quantity
                        </label>
                        <input
                          type="number"
                          value={material.Revised_Quantity || ""}
                          readOnly
                          className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100 font-semibold text-orange-600 text-sm"
                          placeholder="Auto fetched"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Unit of Material
                        </label>
                        <input
                          type="text"
                          value={material.Unit_Name || "Select a material to fetch unit"}
                          readOnly
                          className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100 font-semibold text-orange-600 text-sm"
                          placeholder="Auto fetched"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Discount (%)
                        </label>
                        <input
                          type="number"
                          value={material["Discount (%)"]}
                          onChange={(e) =>
                            handleMaterialChange(
                              vIndex,
                              mIndex,
                              "Discount (%)",
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                          placeholder="0"
                          disabled={isSaving}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          CGST (%)
                        </label>
                        <input
                          type="number"
                          value={material["CGST (%)"]}
                          onChange={(e) =>
                            handleMaterialChange(
                              vIndex,
                              mIndex,
                              "CGST (%)",
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                          placeholder="0"
                          disabled={isSaving}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          SGST (%)
                        </label>
                        <input
                          type="number"
                          value={material["SGST (%)"]}
                          onChange={(e) =>
                            handleMaterialChange(
                              vIndex,
                              mIndex,
                              "SGST (%)",
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                          placeholder="0"
                          disabled={isSaving}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          IGST (%)
                        </label>
                        <input
                          type="number"
                          value={material["IGST (%)"]}
                          onChange={(e) =>
                            handleMaterialChange(
                              vIndex,
                              mIndex,
                              "IGST (%)",
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                          placeholder="0"
                          disabled={isSaving}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Total
                        </label>
                        <input
                          type="number"
                          value={material.Total}
                          readOnly
                          className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100 font-semibold text-green-600 text-sm"
                          placeholder="Auto calculated"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Total Value
                        </label>
                        <input
                          type="number"
                          value={material.Total_Value}
                          readOnly
                          className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100 font-semibold text-blue-600 text-sm"
                          placeholder="Auto calculated"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Remark
                        </label>
                        <input
                          value={material.Remark}
                          onChange={(e) =>
                            handleMaterialChange(
                              vIndex,
                              mIndex,
                              "Remark",
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                          placeholder="Additional notes"
                          disabled={isSaving}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {vendor.materials.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No materials added for this vendor. Add one above.
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                      <h5 className="font-semibold text-emerald-800 mb-2">
                        Step 4: Review Vendors and Materials
                      </h5>
                      <p className="text-emerald-700 text-sm">
                        Review the vendors and their associated materials.
                      </p>
                    </div>

                    <div className="space-y-6">
                      {vendors.map((vendor, vIndex) => (
                        <div
                          key={vIndex}
                          className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm"
                        >
                          <h6 className="text-md font-semibold text-blue-800 mb-3 border-b border-blue-200 pb-2">
                            Vendor {vIndex + 1}
                          </h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Firm
                              </label>
                              <p className="text-sm text-gray-800">
                                {vendor.firm}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Name
                              </label>
                              <p className="text-sm text-gray-800">
                                {vendor.name}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                GST
                              </label>
                              <p className="text-sm text-gray-800">
                                {vendor.gst}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Contact
                              </label>
                              <p className="text-sm text-gray-800">
                                {vendor.contact}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Address
                              </label>
                              <p className="text-sm text-gray-800">
                                {vendor.address}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Delivery Date
                              </label>
                              <p className="text-sm text-gray-800">
                                {vendor.deliveryDate}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Bill Type
                              </label>
                              <p className="text-sm text-gray-800">
                                {vendor.billType}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Payment Terms
                              </label>
                              <p className="text-sm text-gray-800">
                                {vendor.paymentTerms}
                              </p>
                            </div>
                            {vendor.paymentTerms === "Credit" && (
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Credit in Days
                                </label>
                                <p className="text-sm text-gray-800">
                                  {vendor.creditInDays}
                                </p>
                              </div>
                            )}
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Transport Required
                              </label>
                              <p className="text-sm text-gray-800">
                                {vendor.transportRequired}
                              </p>
                            </div>
                            {vendor.transportRequired === "Yes" && (
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Expected Transport Charges
                                </label>
                                <p className="text-sm text-gray-800">
                                  {vendor.expectedTransportCharges}
                                </p>
                              </div>
                            )}
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Freight Charges
                              </label>
                              <p className="text-sm text-gray-800">
                                {vendor.freightCharges}
                              </p>
                            </div>
                            {vendor.freightCharges === "Yes" && (
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Expected Freight Charges
                                </label>
                                <p className="text-sm text-gray-800">
                                  {vendor.expectedFreightCharges}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="border-t border-gray-300 pt-3">
                            <h6 className="text-sm font-semibold text-indigo-800 mb-2">
                              Materials
                            </h6>
                            <div className="space-y-3">
                              {vendor.materials.map((material, mIndex) => (
                                <div
                                  key={mIndex}
                                  className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm"
                                >
                                  <h7 className="text-xs font-semibold text-indigo-600 mb-2">
                                    Material {mIndex + 1}
                                  </h7>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <label className="block text-gray-500 mb-0.5">
                                        Material Name
                                      </label>
                                      <p className="text-gray-800">
                                        {material.Material_Name}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="block text-gray-500 mb-0.5">
                                        Rate
                                      </label>
                                      <p className="text-gray-800">
                                        {material.Rate}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="block text-gray-500 mb-0.5">
                                        Discount (%)
                                      </label>
                                      <p className="text-gray-800">
                                        {material["Discount (%)"]}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="block text-gray-500 mb-0.5">
                                        CGST (%)
                                      </label>
                                      <p className="text-gray-800">
                                        {material["CGST (%)"]}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="block text-gray-500 mb-0.5">
                                        SGST (%)
                                      </label>
                                      <p className="text-gray-800">
                                        {material["SGST (%)"]}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="block text-gray-500 mb-0.5">
                                        IGST (%)
                                      </label>
                                      <p className="text-gray-800">
                                        {material["IGST (%)"]}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="block text-gray-500 mb-0.5">
                                        Total
                                      </label>
                                      <p className="text-gray-800 font-semibold text-green-600">
                                        {material.Total}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="block text-gray-500 mb-0.5">
                                        Revised Quantity
                                      </label>
                                      <p className="text-gray-800 font-semibold text-orange-600">
                                        {material.Revised_Quantity}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="block text-gray-500 mb-0.5">
                                        Total Value
                                      </label>
                                      <p className="text-gray-800 font-semibold text-blue-600">
                                        {material.Total_Value}
                                      </p>
                                    </div>
                                    <div className="md:col-span-2">
                                      <label className="block text-gray-500 mb-0.5">
                                        Remark
                                      </label>
                                      <p className="text-gray-800">
                                        {material.Remark}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {vendor.materials.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-2">
                                  No materials for this vendor.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                      <h5 className="font-semibold text-orange-800 mb-2">
                        Step 5: Update Status and Details
                      </h5>
                      <p className="text-orange-700 text-sm">
                        Set the status and remark. Number of quotations is
                        automatically set based on vendors added.
                      </p>
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        Status 4<span className="ml-1 text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={status4}
                          onChange={(e) => setStatus4(e.target.value)}
                          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white appearance-none cursor-pointer shadow-sm hover:shadow-md"
                          disabled={isSaving}
                        >
                          <option value="Done">✅ Done</option>
                          <option value="PENDING">⏳ PENDING</option>
                          <option value="REJECTED">❌ REJECTED</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            ></path>
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        No. Of Quotation 4
                      </label>
                      <input
                        type="text"
                        value={noOfQuotation4}
                        readOnly
                        className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gray-100 font-semibold text-gray-800 shadow-sm"
                        placeholder="Auto calculated based on vendors"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Remark 4
                      </label>
                      <textarea
                        value={remark4}
                        onChange={(e) => setRemark4(e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 resize-none shadow-sm hover:shadow-md"
                        placeholder="Enter remark"
                        rows={4}
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100 flex-shrink-0">
              <div className="flex justify-between">
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 shadow-sm hover:shadow-md"
                    disabled={isSaving}
                  >
                    Previous
                  </button>
                )}
                {currentStep < 5 && (
                  <button
                    onClick={() => {
                      if (currentStep === 1 && !selectedIndent) return;
                      if (currentStep === 3 && !validateStep3()) return;
                      setCurrentStep(currentStep + 1);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg hover:shadow-xl ml-auto"
                    disabled={
                      (currentStep === 1 && !selectedIndent) ||
                      (currentStep === 3 && !validateStep3()) ||
                      isSaving
                    }
                  >
                    Next
                  </button>
                )}
                {currentStep === 5 && (
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center min-w-[140px] justify-center shadow-lg hover:shadow-xl ml-auto"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaCheck className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Take_Quotation;
