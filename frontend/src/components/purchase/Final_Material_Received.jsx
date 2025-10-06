
import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';

const Final_Material_Received = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedUID, setSelectedUID] = useState('');

  // Fetch data
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/get-Final-material-received`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setRequests(data.data);
      } else {
        throw new Error('API data is not in the expected format');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Data not available');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const uniqueUIDs = [...new Set(requests.map(r => r.uid))];

  const handleNext = () => {
    if (selectedUID) {
      const selectedRequest = requests.find(r => r.uid === selectedUID);
      if (selectedRequest) {
        const reqNo = selectedRequest.reqNo;
        const filtered = requests.filter(r => r.reqNo === reqNo);
        setSelectedRequests(filtered);
        setStep(2);
      }
    }
  };

const handleSave = async () => {
  try {
    if (!selectedUID || !totalReceived || selectedRequests.length === 0) {
      alert('Please select a valid UID and ensure data is available.');
      return;
    }

    const url = `${import.meta.env.VITE_BACKEND_URL}/api/save-final-receipt`;
    const challan_urls = selectedRequests.map(r => r.Challan_url);
    const dataToSend = {
      uid: selectedUID,
      totalReceivedQuantity: totalReceived,
      status: 'Done',
      challan_urls: challan_urls
    };

    console.log('Sending data:', dataToSend);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend),
    });

    console.log('Response status:', response.status);
    const responseData = await response.json();
    console.log('Response data:', responseData);

    if (response.ok) {
      alert('Saved successfully');
      fetchRequests();
      setIsModalOpen(false);
      setStep(1);
      setSelectedUID('');
    } else {
      alert(`Error saving: ${response.status} - ${responseData.message || 'Unknown error'}`);
    }
  } catch (e) {
    console.error('Fetch error:', e);
    alert('Error saving');
  }
};
  const closeModal = () => {
    setIsModalOpen(false);
    setStep(1);
    setSelectedUID('');
    setSelectedRequests([]);
  };

  let details = null;
  let totalReceived = 0;
  if (step === 2 && selectedRequests.length > 0) {
    details = selectedRequests[0];
    totalReceived = selectedRequests.reduce((sum, r) => sum + parseFloat(r.totalReceivedQuantity || 0), 0);
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <button
        onClick={() => setIsModalOpen(true)}
        className="mb-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
      >
        Final Done Material
      </button>

      {/* Table */}
      <div className="bg-white border border-gray-300 rounded-lg shadow-md">
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
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Timestamp</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">UID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Req No</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Site Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Supervisor</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Material Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">SKU</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Material Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Unit</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Order Quantity</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Received Qty</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Challan URL</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Vendor Firm Name</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request, index) => (
                  <tr key={`${request.uid}-${index}`} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.Timestamp}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.uid}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.reqNo}</td>
                    <td className="px-5 py-5 text-sm text-gray-800 border-r border-gray-200">
                      <div className="max-w-[150px]"  title={request.siteName}>{request.siteName}</div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.supervisorName}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.materialType}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.skuCode}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                      <div className="max-w-[120px] truncate" title={request.materialName}>{request.materialName}</div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.unitName}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200 text-right">{request.revisedQuantity}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200 text-right">{request.totalReceivedQuantity}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.status}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                      <a href={request.Challan_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        View PDF
                      </a>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800">{request.vendorName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl relative w-1/2">
            <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">×</button>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Final Done Material</h2>
            {step === 1 ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UID *</label>
                <select
                  value={selectedUID}
                  onChange={(e) => setSelectedUID(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select UID</option>
                  {uniqueUIDs.map((uid) => (
                    <option key={uid} value={uid}>
                      {uid}
                    </option>
                  ))}
                </select>
                <div className="mt-6 flex justify-end space-x-4">
                  <button onClick={closeModal} className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition duration-200">
                    Cancel
                  </button>
                  <button onClick={handleNext} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200" disabled={!selectedUID}>
                    Next
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {details ? (
                  <>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Material Details</h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Req No:</p>
                        <p className="text-sm text-gray-900">{details.reqNo}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Site Name:</p>
                        <p className="text-sm text-gray-900">{details.siteName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Supervisor:</p>
                        <p className="text-sm text-gray-900">{details.supervisorName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Material Type:</p>
                        <p className="text-sm text-gray-900">{details.materialType}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">SKU:</p>
                        <p className="text-sm text-gray-900">{details.skuCode}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Material Name:</p>
                        <p className="text-sm text-gray-900">{details.materialName}</p>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Receipts</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Timestamp</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Received Qty</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Challan URL</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedRequests.map((r, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-800">{r.Timestamp}</td>
                              <td className="px-4 py-2 text-sm text-gray-800">{r.totalReceivedQuantity}</td>
                              <td className="px-4 py-2 text-sm text-gray-800">{r.status}</td>
                              <td className="px-4 py-2 text-sm text-gray-800">
                                <a href={r.Challan_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  View
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-4 text-sm font-medium text-gray-700">Total Received Quantity: <span className="text-sm text-gray-900">{totalReceived.toFixed(2)}</span></p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No data for selected UID.</p>
                )}
                <div className="mt-6 flex justify-end space-x-4">
                  <button onClick={closeModal} className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition duration-200">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
                    Save Final Receipt
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Final_Material_Received;