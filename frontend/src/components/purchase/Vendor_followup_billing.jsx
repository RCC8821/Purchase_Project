import React, { useState, useEffect } from 'react';

const Vendor_followup_billing = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedPONumber, setSelectedPONumber] = useState('');
  const [poDetails, setPoDetails] = useState(null);
  const [poNumbers, setPoNumbers] = useState([]);
  const [status, setStatus] = useState('');
  const [remark, setRemark] = useState('');

  // Fetch data from the Vendor Follow-Up Billing API
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/vendor-FollowUp-Billing`;
      console.log('Fetching from URL:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      const data = await response.json();
      console.log('API Response:', data);
      if (data.success && Array.isArray(data.data)) {
        setRequests(data.data);
        const uniquePONumbers = [...new Set(data.data.map(request => request.poNumber))].filter(po => po);
        setPoNumbers(uniquePONumbers);
      } else {
        throw new Error('API data is not in the expected format');
      }
    } catch (error) {
      console.error('Error fetching data:', error.message, error.stack);
      setError(`Failed to load data: ${error.message}`);
      setRequests([]);
      setPoNumbers([]);
    } finally {
      setLoading(false);
    }
  };

  // Set PO details from existing requests data
  const setPoDetailsFromRequests = () => {
    if (selectedPONumber) {
      const details = requests.filter(request => request.poNumber === selectedPONumber);
      if (details.length > 0) {
        setPoDetails(details);
        setIsModalOpen(false);
        setDetailsModalOpen(true);
      } else {
        setError('No details found for the selected PO number.');
      }
    }
  };

  // Handle follow-up details submission
  const handleSubmitFollowUp = async (e) => {
    e.preventDefault();
    if (!status || !remark) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      // Ensure poDetails contains valid UID
      const updateData = poDetails.map(item => {
        console.log('Mapping item:', item); // Debug log
        if (!item.UID) {
          console.warn('Missing UID in item:', item);
          return null; // Skip invalid items
        }
        return {
          UID: item.UID,
          status12: status,
          remark12: remark
        };
      }).filter(item => item !== null); // Filter out null entries

      if (updateData.length === 0) {
        throw new Error('No valid items to update');
      }

      console.log('Sending update data:', updateData); // Debug log
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/update-followup-Billing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }
      const result = await response.json();
      console.log('Update response:', result);
      alert('Follow-up details updated successfully');
      setDetailsModalOpen(false);
      setStatus('');
      setRemark('');
      setSelectedPONumber('');
      setPoDetails(null);
      fetchRequests(); // Refresh data after update
    } catch (err) {
      console.error('Error submitting follow-up:', err.message, err.stack);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Vendor Follow-Up Billing Data</h2>

      {/* Bill Follow Up Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Bill Follow Up
      </button>

      {/* Modal for PO Selection */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Bill Follow Up</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">PO Number *</label>
              <select
                value={selectedPONumber}
                onChange={(e) => setSelectedPONumber(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              >
                <option value="">-- Select PO Number --</option>
                {poNumbers.map((po) => (
                  <option key={po} value={po}>{po}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={setPoDetailsFromRequests}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={!selectedPONumber}
              >
                Fetch Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Follow-up Details */}
      {detailsModalOpen && poDetails && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[600px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Follow-up Details</h2>
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  setSelectedPONumber('');
                  setPoDetails(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <p className="text-gray-700 mb-4">The following {poDetails.length} item(s) for PO #{selectedPONumber} will be updated:</p>
            <div className="bg-white p-4 border border-gray-200 rounded mb-6">
              {loading ? (
                <p>Loading items...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : poDetails.length > 0 ? (
                <ul className="list-disc pl-5">
                  {poDetails.map((item, index) => (
                    <li key={index} className="text-gray-800">
                      {item.materialName} (UID: {item.UID})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No items available</p>
              )}
            </div>

            <form onSubmit={handleSubmitFollowUp} className="bg-white p-6 border border-gray-200 rounded">
              <h3 className="text-lg font-semibold mb-4">Enter new follow-up details:</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Status 12 *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                  required
                >
                  <option value="">-- Select Status --</option>
                  <option value="Received">Received</option>
                  <option value="Hold">Hold</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Remark 12 *</label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                  rows="2"
                  required
                ></textarea>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setDetailsModalOpen(false);
                    setSelectedPONumber('');
                    setPoDetails(null);
                  }}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Previous
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>
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
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Planned 12</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">UID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Site Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Supervisor</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Material Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Revised Quantity</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Received Qty</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Unit</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Vendor Firm Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">PO Number</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Follow-Up Count 12</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Remark 12</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Vendor Contact</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request, index) => (
                  <tr key={`${request.UID}-${index}`} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.planned12}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.UID}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                      <div title={request.siteName}>{request.siteName}</div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.supervisorName}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                      <div title={request.materialName}>{request.materialName}</div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200 text-right">{request.revisedQuantity}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200 text-right">{request.finalReceivedQuantity}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.unitName}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.vendorFirmName}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.poNumber}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.followUpCount12}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.remark12}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{request.vendorContact}</td>
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

export default Vendor_followup_billing;