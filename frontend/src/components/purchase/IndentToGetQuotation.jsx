import React, { useState, useEffect } from "react";
import {
  FaCheck,
  FaTimes,
  FaSpinner,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";

const IndentToGetQuotation = () => {
  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedReqNo, setSelectedReqNo] = useState(null);
  const [selectedUIDs, setSelectedUIDs] = useState([]);
  const [status3, setStatus3] = useState("Indent");
  const [indentNumber3, setIndentNumber3] = useState("");
  const [remark3, setRemark3] = useState("");
  const [nextIndentNumber, setNextIndentNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/get-indent-data`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        
        // Check if data is valid and contains the 'data' property
        if (data && Array.isArray(data.data)) {
          if (data.data.length === 0) {
            // If data is empty, set requests to empty array and no error
            setRequests([]);
          } else {
            // Transform data as before
            const transformedData = data.data.map((item) => ({
              UID: item.UID || "N/A",
              PLANNED_3: item.PLANNED_3 || "N/A",
              Quantity: item.Quantity || "N/A",
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
              DECIDED_BRAND_COMPANY_NAME_2: item["DECIDED_BRAND/COMPANY_NAME_2"] || "",
              REMARKS_2: item.REMARKS_2 || "",
              STATUS_3: item.STATUS_3 || "",
              INDENT_NUMBER_3: item.INDENT_NUMBER_3 || "",
              PDF_URL_3: item.PDF_URL_3 || "",
              REMARK_3: item.REMARK_3 || "",
            }));
            setRequests(transformedData);

            // Calculate next indent number
            let maxNum = 0;
            transformedData.forEach((item) => {
              if (item.INDENT_NUMBER_3 && item.INDENT_NUMBER_3.startsWith("IND-")) {
                const num = parseInt(item.INDENT_NUMBER_3.slice(4), 10);
                if (!isNaN(num) && num > maxNum) maxNum = num;
              }
            });
            setNextIndentNumber(maxNum + 1);
          }
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
    fetchRequests();
  }, []);

  const openModal = () => {
    setCurrentStep(1);
    setSelectedReqNo(null);
    setSelectedUIDs([]);
    setStatus3("");
    setRemark3("");
    setIndentNumber3(`IND-${nextIndentNumber.toString().padStart(3, "0")}`);
    setIsModalOpen(true);
    setShowSuccess(false);
    setError(null);
  }

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentStep(1);
    setSelectedReqNo(null);
    setSelectedUIDs([]);
    setStatus3("");
    setIndentNumber3("");
    setRemark3("");
    setIsSaving(false);
    setShowSuccess(false);
  };

  const handleNext = () => {
    if (selectedReqNo && selectedUIDs.length > 0) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSave = async () => {
    if (
      selectedUIDs.length === 0 ||
      !selectedReqNo ||
      status3 === "Select Status"
    ) {
      setError("Please select a request number, at least one UID, and a valid status.");
      return;
    }

    setIsSaving(true);
    try {
      const updatedData = {
        UIDs: selectedUIDs,
        STATUS_3: status3,
        INDENT_NUMBER_3: indentNumber3,
        REMARK_3: remark3,
      };

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/update-indent-data`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update");
      }

      const result = await response.json();
      console.log("Update successful:", result);

      setRequests((prev) => prev.filter((r) => !selectedUIDs.includes(r.UID)));
      setNextIndentNumber((prev) => prev + 1);
      setShowSuccess(true);
      setTimeout(closeModal, 1500);
    } catch (error) {
      console.error("Error saving:", error);
      setError(error.message || "Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  const uniqueReqNos = [...new Set(requests.map((r) => r.Req_No))].sort();

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={openModal}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Indent
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-300 rounded shadow-sm">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : requests.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Data Not Available
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    PLANNED_3
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    UID
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Req No
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Site Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Supervisor
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Material Type
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    SKU Code
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Material Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Unit
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Purpose
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Require Date
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Quantity
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Revised Quantity
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Brand/Company
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request, index) => (
                  <tr
                    key={request.Req_No}
                    className={`hover:bg-gray-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">
                      {request.PLANNED_3}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">
                      {request.UID}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">
                      {request.Req_No}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">
                      <div
                        // className="max-w-[120px] truncate"
                        title={request.Site_Name}
                      >
                        {request.Site_Name}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">
                      {request.Supervisor_Name}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">
                      {request.Material_Type}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">
                      {request.SKU_Code}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">
                      <div
                        // className="max-w-[120px] truncate"
                        title={request.Material_Name}
                      >
                        {request.Material_Name}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">
                      {request.Unit_Name}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">
                      <div
                        className="max-w-[100px] truncate"
                        title={request.Purpose}
                      >
                        {request.Purpose}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">
                      {request.Require_Date}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200 text-right">
                      {request.Quantity}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">
                      {request.REVISED_QUANTITY_2}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">
                      <div
                        className="max-w-[120px] truncate"
                        title={request.DECIDED_BRAND_COMPANY_NAME_2}
                      >
                        {request.DECIDED_BRAND_COMPANY_NAME_2 || "N/A"}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">
                      <div
                        className="max-w-[120px] truncate"
                        title={request.REMARKS_2}
                      >
                        {request.REMARKS_2}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enhanced Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold text-white flex items-center">
                  {currentStep === 1 ? "Create New Indent" : "Confirm and Save"}
                </h4>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200"
                  disabled={isSaving}
                >
                  <FaTimes size={18} />
                </button>
              </div>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <FaCheck className="text-green-600 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-green-800 font-medium">Success!</p>
                  <p className="text-green-700 text-sm">
                    Indent has been created successfully.
                  </p>
                </div>
              </div>
            )}

            {/* Modal Body */}
            <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}
              {currentStep === 1 && (
                <div className="space-y-5">
                  {/* Step 1: Select Request Number */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      Step 1: Select a Request Number
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedReqNo || ""}
                        onChange={(e) => setSelectedReqNo(e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white appearance-none cursor-pointer"
                        disabled={isSaving}
                      >
                        <option value="">-- Select a Request Number --</option>
                        {uniqueReqNos.map((no) => (
                          <option key={no} value={no}>
                            {no}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-400"
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

                  {/* Step 2: Select UIDs */}
                  {selectedReqNo && (
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Step 2: Select UIDs to include in this Indent
                        <span className="ml-1 text-red-500">*</span>
                      </label>
                      <div className="space-y-2">
                        {requests
                          .filter((r) => r.Req_No === selectedReqNo)
                          .map((item) => (
                            <div key={item.UID} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`uid-${item.UID}`}
                                checked={selectedUIDs.includes(item.UID)}
                                onChange={() => {
                                  if (selectedUIDs.includes(item.UID)) {
                                    setSelectedUIDs(
                                      selectedUIDs.filter(
                                        (id) => id !== item.UID
                                      )
                                    );
                                  } else {
                                    setSelectedUIDs([
                                      ...selectedUIDs,
                                      item.UID,
                                    ]);
                                  }
                                }}
                                className="mr-2"
                                disabled={isSaving}
                              />
                              <label
                                htmlFor={`uid-${item.UID}`}
                                className="text-sm text-gray-800"
                              >
                                {item.UID} ({item.Material_Name})
                              </label>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-5">
                  {/* Status Field */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      Step 3: Confirm Status
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={status3}
                        onChange={(e) => setStatus3(e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white appearance-none cursor-pointer"
                        disabled={isSaving}
                      >
                         <option value="">-------- Select Status ---------</option>
                        <option value="Indent">Indent</option>
                        <option value="No Indent">No Indent</option>
                        <option value="Shifting">Shifting</option>
                        <option value="PPE">PPE</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-400"
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

                  {/* Remark 3 Field */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Remark
                    </label>
                    <textarea
                      value={remark3}
                      onChange={(e) => setRemark3(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 resize-none"
                      placeholder="Enter remark"
                      rows={3}
                      disabled={isSaving}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-end space-x-3">
                {currentStep === 2 && (
                  <button
                    onClick={handleBack}
                    className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center"
                    disabled={isSaving}
                  >
                    <FaArrowLeft className="mr-2" />
                    Back
                  </button>
                )}
                <button
                  onClick={closeModal}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                {currentStep === 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center min-w-[120px] justify-center"
                    disabled={
                      isSaving || !selectedReqNo || selectedUIDs.length === 0
                    }
                  >
                    <FaArrowRight className="mr-2" />
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center min-w-[120px] justify-center"
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
                        Save
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

export default IndentToGetQuotation;