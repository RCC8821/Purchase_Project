
import React, { useState, useEffect } from 'react';

const MRN = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedPONumber, setSelectedPONumber] = useState('');
  const [selectedUIDs, setSelectedUIDs] = useState([]);
  const [selectedDetails, setSelectedDetails] = useState([]);
  const [poNumbers, setPoNumbers] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showSuccessBox, setShowSuccessBox] = useState(false);

  // Fetch data from the MRN API and group UIDs by PO
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/get-MRN-Data`;
      console.log('Fetching requests from:', url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched data:', data);

      if (data.success && Array.isArray(data.data)) {
        setRequests(data.data);
        const poMap = data.data.reduce((acc, request) => {
          if (request.poNumber7) {
            if (!acc[request.poNumber7]) acc[request.poNumber7] = [];
            if (request.UID && !acc[request.poNumber7].includes(request.UID)) {
              acc[request.poNumber7].push(request.UID);
            }
          }
          return acc;
        }, {});
        const poNumbersArray = Object.keys(poMap).map(po => ({ poNumber: po, uids: poMap[po] }));
        setPoNumbers(poNumbersArray);
        console.log('Processed poNumbers:', poNumbersArray);
      } else {
        throw new Error('API data is not in the expected format');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Failed to load data: ${error.message}`);
      setRequests([]);
      setPoNumbers([]);
    } finally {
      setLoading(false);
    }
  };

  // Set selected details from requests using PO and selected UIDs
  const setSelectedDetailsFromRequests = () => {
    console.log('Setting selected details for PO:', selectedPONumber, 'UIDs:', selectedUIDs);
    if (selectedPONumber && selectedUIDs.length > 0) {
      const details = requests.filter(request =>
        request.poNumber7 === selectedPONumber && selectedUIDs.includes(request.UID)
      );
      console.log('Filtered details:', details);
      if (details.length > 0) {
        setSelectedDetails(details);
        setIsModalOpen(false);
        setDetailsModalOpen(true);
      } else {
        setError('No details found for the selected materials. Check PO and UID selection.');
        console.warn('No matching details found for PO:', selectedPONumber, 'UIDs:', selectedUIDs);
      }
    } else {
      setError('Please select a PO Number and at least one material.');
      console.warn('Invalid selection - PO:', selectedPONumber, 'UIDs:', selectedUIDs);
    }
  };

  // Toggle select all
  const toggleAll = (materials) => {
    const allSelected = selectedUIDs.length === materials.length;
    if (allSelected) {
      setSelectedUIDs([]);
    } else {
      const uids = materials.map(r => r.UID).filter(uid => uid);
      setSelectedUIDs(uids);
      console.log('Selected all UIDs:', uids);
    }
  };

  // Toggle single UID
  const toggleUID = (uid) => {
    setSelectedUIDs(prev => {
      const newUIDs = prev.includes(uid) ? prev.filter(u => u !== uid) : [...prev, uid];
      console.log('Toggled UID:', uid, 'New UIDs:', newUIDs);
      return newUIDs;
    });
  };

  // Share function
  const handleShare = async (url) => {
    if (!url) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MRN PDF',
          text: 'Here is the generated MRN PDF.',
          url: url,
        });
        console.log('Shared natively');
        return;
      } catch (err) {
        console.warn('Native share failed, falling back', err);
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      alert('PDF URL copied to clipboard!');
    } catch (err) {
      alert('Could not copy URL. Please copy it manually.');
    }
  };

  // Handle Create PDF API call
  const handleCreatePDF = async () => {
    try {
      setLoading(true);
      const purchaseFmsUIDs = selectedDetails.map(detail => detail.UID);
      const finalReceivedQuantities = selectedDetails.map(detail => detail.finalReceivedQuantity9 || '');
      const vehicleNo = selectedDetails[0]?.vehicleNo || '-';
      const deliveryDate = selectedDetails[0]?.deliveryDate || '';

      console.log('Sending API request with:', {
        poNumber: selectedPONumber,
        purchaseFmsUIDs,
        finalReceivedQuantities,
        vehicleNo,
        deliveryDate,
      });

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/save-MRN-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poNumber: selectedPONumber,
          purchaseFmsUIDs,
          finalReceivedQuantities,
          vehicleNo,
          deliveryDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('PDF created:', data);
      if (data.pdfUrl) {
        setPdfUrl(data.pdfUrl);
        setShowSuccessBox(true);
        setDetailsModalOpen(false);
        setSelectedDetails([]);
        setSelectedPONumber('');
        setSelectedUIDs([]);
        await fetchRequests();
      } else {
        throw new Error('No PDF URL returned');
      }
    } catch (error) {
      console.error('Error creating PDF:', error);
      setError(`Failed to create MRN and PDF: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h2 className="text-xl font-bold text-gray-800 mb-4">MRN Data</h2>

      {/* Create MRN Button */}
      <button
        onClick={() => {
          setIsModalOpen(true);
          setShowSuccessBox(false);
          setPdfUrl(null);
        }}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Create MRN
      </button>

      {/* Success Box */}
      {showSuccessBox && pdfUrl && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">MRN Generated Successfully!</h3>
          <div className="flex items-center space-x-4">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View PDF
            </a>
            <button
              onClick={() => handleShare(pdfUrl)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-blue-700"
            >
              Share
            </button>
          </div>
          <button
            onClick={() => setShowSuccessBox(false)}
            className="mt-2 text-sm text-gray-600 hover:underline"
          >
            Close
          </button>
        </div>
      )}

      {/* Modal for PO Selection and Material Checkboxes */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Create MRN</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">PO Number *</label>
              <select
                value={selectedPONumber}
                onChange={(e) => {
                  setSelectedPONumber(e.target.value);
                  setSelectedUIDs([]);
                  console.log('Selected PO:', e.target.value);
                }}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              >
                <option value="">-- Select PO Number --</option>
                {poNumbers.map((po) => (
                  <option key={po.poNumber} value={po.poNumber}>{po.poNumber}</option>
                ))}
              </select>
            </div>
            {selectedPONumber && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Materials *</label>
                {(() => {
                  const materials = requests.filter(r => r.poNumber7 === selectedPONumber);
                  console.log('Materials for PO:', selectedPONumber, materials);
                  const allSelected = materials.length > 0 && selectedUIDs.length === materials.length;
                  return (
                    <>
                      <label className="block mb-2">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={() => toggleAll(materials)}
                        /> Select All
                      </label>
                      <div className="overflow-y-auto max-h-40 border border-gray-300 p-2 rounded-md">
                        {materials.length > 0 ? (
                          materials.map((r) => (
                            <label key={r.UID} className="block text-sm">
                              <input
                                type="checkbox"
                                checked={selectedUIDs.includes(r.UID)}
                                onChange={() => toggleUID(r.UID)}
                              /> {r.materialName || 'N/A'} ({r.skuCode || 'N/A'}) - Qty: {r.finalReceivedQuantity9 || 'N/A'} (UID: {r.UID || 'N/A'})
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-red-500">No materials found for this PO.</p>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedPONumber('');
                  setSelectedUIDs([]);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={setSelectedDetailsFromRequests}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={!selectedPONumber || selectedUIDs.length === 0}
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Selected Materials Details */}
      {detailsModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[80vw] max-w-4xl">
            <h3 className="text-lg font-semibold mb-4">Create MRN for Selected Materials</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">PO Number</label>
              <input
                value={selectedPONumber || 'N/A'}
                disabled
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100"
              />
            </div>
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-700">Material Details</h4>
              <div className="overflow-x-auto max-h-96">
                {selectedDetails.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">UID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Req No</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Site Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Supervisor Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Material Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">SKU Code</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Material Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Revised Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Unit Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Final Received Qty</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Indent Number</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Challan Number</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Vendor Firm Name</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedDetails.map((detail) => (
                        <tr key={detail.UID}>
                          <td className="px-4 py-2 text-sm">{detail.UID || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm">{detail.reqNo || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm">{detail.siteName || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm">{detail.supervisorName || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm">{detail.materialType || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm">{detail.skuCode || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm">{detail.materialName || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm">{detail.revisedQuantity || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm">{detail.unitName || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm">{detail.finalReceivedQuantity9 || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm">{detail.indentNumber3 || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm">{detail.Challan_No || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm">{detail.vendorFirmName5 || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-red-500">No material details available. Check PO and UID selection.</p>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  setSelectedDetails([]);
                  setSelectedPONumber('');
                  setSelectedUIDs([]);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePDF}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={loading || selectedDetails.length === 0}
              >
                {loading ? 'Creating...' : 'Create PDF'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-300 rounded-lg shadow-md mt-4">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : requests.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No data available.</div>
        ) : (
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">UID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Req No</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Site Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Supervisor</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Material Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">SKU</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Material Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Unit</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Revised Quantity</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Final Received Qty</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Indent Number</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">PO Number</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">PDF URL 3</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">PDF URL 5</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">PDF URL 7</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Vendor Firm Name</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request, index) => (
                  <tr key={`${request.UID}-${index}`} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.UID || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.reqNo || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                      <div title={request.siteName}>{request.siteName || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.supervisorName || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.materialType || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.skuCode || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                      <div title={request.materialName}>{request.materialName || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.unitName || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200 text-right">{request.revisedQuantity || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200 text-right">{request.finalReceivedQuantity9 || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.indentNumber3 || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.poNumber7 || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                      {request.pdfUrl3 ? (
                        <a href={request.pdfUrl3} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View PDF
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                      {request.pdfUrl5 ? (
                        <a href={request.pdfUrl5} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View PDF
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                      {request.pdfUrl7 ? (
                        <a href={request.pdfUrl7} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View PDF
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800">{request.vendorFirmName5 || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MRN;