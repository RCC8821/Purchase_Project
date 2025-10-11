import React, { useState, useEffect } from 'react';
import { FaPencilAlt, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

const ApproveRequired = () => {
  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [status2, setStatus2] = useState('APPROVED');
  const [revisedQuantity2, setRevisedQuantity2] = useState('');
  const [decidedBrandCompanyName2, setDecidedBrandCompanyName2] = useState('');
  const [remarks2, setRemarks2] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/get-approve-Requied`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('API Response:', data);

        if (data && Array.isArray(data.data)) {
          const transformedData = data.data.map(item => ({
            UID: item.UID || 'N/A',
            PLANNED_2: item.PLANNED_2 || 'N/A',
            Req_No: item.Req_No || 'N/A',
            Site_Name: item.Site_Name || 'N/A',
            Supervisor_Name: item.Supervisor_Name || 'N/A',
            Material_Type: item.Material_Type || 'N/A',
            SKU_Code: item.SKU_Code || 'N/A',
            Material_Name: item.Material_Name || 'N/A',
            Unit_Name: item.Unit_Name || 'N/A',
            Quantity: item.Quantity || 'N/A',
            Purpose: item.Purpose || 'N/A',
            Require_Days: item.Require_Days || 'N/A', // Map Require_Days instead of Require_Date
            Remark: item.Remark || 'N/A',
            status2: item.STATUS_2 || '',
          })).filter(item => item.status2 !== 'APPROVED');
          console.log('Transformed Data:', transformedData);
          setRequests(transformedData);
        } else {
          throw new Error('API data is not in the expected format');
        }
      } catch (error) {
        console.error('Error fetching requests:', error);
        setError('Data not available');
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // Handle opening the modal
  const openModal = (request) => {
    setSelectedRequest(request);
    setStatus2(request.status2 || 'APPROVED');
    setRevisedQuantity2(request.revisedQuantity2 || '');
    setDecidedBrandCompanyName2(request.decidedBrandCompanyName2 || '');
    setRemarks2(request.remarks2 || '');
    setIsModalOpen(true);
    setShowSuccess(false);
  };

  // Handle closing the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
    setStatus2('APPROVED');
    setRevisedQuantity2('');
    setDecidedBrandCompanyName2('');
    setRemarks2('');
    setIsSaving(false);
    setShowSuccess(false);
  };

  // Handle saving the data
  const handleSave = async () => {
    if (!selectedRequest) return;

    // Validate required fields (status2 is required, remarks2 is optional)
    if (!status2) {
      setError('Status is required');
      return;
    }

    const updatedData = {
      UID: selectedRequest.UID,
      STATUS_2: status2,
      REVISED_QUANTITY_2: revisedQuantity2 || '', // Allow empty
      DECIDED_BRAND_COMPANY_NAME_2: decidedBrandCompanyName2 || '', // Allow empty
      REMARKS_2: remarks2 || '', // Allow empty
    };

    try {
      setIsSaving(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/approve-Requied-save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        setShowSuccess(true);

        if (status2 === 'APPROVED') {
          setRequests((prevRequests) =>
            prevRequests.filter((req) => req.UID !== selectedRequest.UID)
          );
        } else {
          setRequests((prevRequests) =>
            prevRequests.map((req) =>
              req.UID === selectedRequest.UID
                ? { ...req, status2, revisedQuantity2, decidedBrandCompanyName2, remarks2 }
                : req
            )
          );
        }

        setTimeout(() => {
          closeModal();
        }, 1500);
      } else {
        const errorText = await response.text();
        console.error('Error saving to sheet:', errorText);
        setError(`Failed to save: ${errorText}`);
      }
    } catch (error) {
      console.error('Error saving to sheet:', error);
      setError('Failed to save due to a network error.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-gray-800">Approve Required</h2>
        </div>
        <p className="text-gray-600 text-sm">Review and approve required requests.</p>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-300 rounded shadow-sm">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : requests.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No requests available.</div>
        ) : (
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    PLANNED_2
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
                    Quantity
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Purpose
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Require Days
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Remark
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request, index) => (
                  <tr key={request.Req_No} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">
                      {request.PLANNED_2}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">
                      {request.UID}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                      {request.Req_No}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-800 border-r border-gray-200">
                      <div title={request.Site_Name}>
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
                      <div title={request.Material_Name}>
                        {request.Material_Name}
                      </div>
                    </td>
                  
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">
                      {request.Unit_Name}
                    </td>
                      <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200 text-right">
                      {request.Quantity}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">
                      <div className="max-w-[100px] truncate" title={request.Purpose}>
                        {request.Purpose}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">
                      {request.Require_Days} {/* Display Require_Days */}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">
                      <div className="max-w-[120px] truncate" title={request.Remark}>
                        {request.Remark}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => openModal(request)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-all duration-200"
                        title="Edit Status"
                      >
                        <FaPencilAlt size={16} />
                      </button>
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
                  <FaPencilAlt className="mr-2" />
                  Update Request Details
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

            {/* Error Message */}
            {error && (
              <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <FaTimes className="text-red-600 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {showSuccess && (
              <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <FaCheck className="text-green-600 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-green-800 font-medium">Success!</p>
                  <p className="text-green-700 text-sm">Request has been updated successfully.</p>
                </div>
              </div>
            )}

            {/* Modal Body */}
            <div className="px-6 py-6">
              <div className="space-y-5">
                {/* Status Field */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    Status
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={status2}
                      onChange={(e) => setStatus2(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white appearance-none cursor-pointer"
                      disabled={isSaving}
                      required
                    >
                      <option value="APPROVED">✅ APPROVED</option>
                      <option value="PENDING">⏳ PENDING</option>
                      <option value="REJECTED">❌ REJECTED</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Revised Quantity Field */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Revised Quantity
                  </label>
                  <input
                    type="text"
                    value={revisedQuantity2}
                    onChange={(e) => setRevisedQuantity2(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    placeholder="Enter revised quantity (optional)"
                    disabled={isSaving}
                  />
                </div>

                {/* Brand/Company Name Field */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Brand/Company Name
                  </label>
                  <input
                    type="text"
                    value={decidedBrandCompanyName2}
                    onChange={(e) => setDecidedBrandCompanyName2(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    placeholder="Enter brand/company name (optional)"
                    disabled={isSaving}
                  />
                </div>

                {/* Remarks Field */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Remarks (Optional)
                  </label>
                  <textarea
                    value={remarks2}
                    onChange={(e) => setRemarks2(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 resize-none"
                    placeholder="Enter remarks (optional)"
                    rows={3}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400"
                  disabled={isSaving}
                >
                  Cancel
                </button>
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
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveRequired;