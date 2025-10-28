
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

  // Fetch data from API
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/vendor-FollowUp-Billing`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setRequests(data.data);
        const uniquePOs = [...new Set(data.data.map(r => r.poNumber))].filter(Boolean);
        setPoNumbers(uniquePOs);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (err) {
      setError(`Failed to load data: ${err.message}`);
      setRequests([]);
      setPoNumbers([]);
    } finally {
      setLoading(false);
    }
  };

  // Set PO details from local state
  const setPoDetailsFromRequests = () => {
    if (!selectedPONumber) return;
    const details = requests.filter(r => r.poNumber === selectedPONumber);
    if (details.length > 0) {
      setPoDetails(details);
      setIsModalOpen(false);
      setDetailsModalOpen(true);
    } else {
      setError('No items found for this PO');
    }
  };

  // Submit follow-up update
  const handleSubmitFollowUp = async (e) => {
    e.preventDefault();
    if (!status || !remark) {
      setError('Status and Remark are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const updateData = poDetails
        .filter(item => item.UID)
        .map(item => ({
          UID: item.UID,
          status12: status,
          remark12: remark
        }));

      if (updateData.length === 0) throw new Error('No valid items to update');

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/update-followup-Billing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Update failed');
      }

      alert(`Successfully updated ${result.updatedRows || updateData.length} item(s)`);
      resetModals();
      fetchRequests(); // Refresh table
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetModals = () => {
    setDetailsModalOpen(false);
    setIsModalOpen(false);
    setSelectedPONumber('');
    setPoDetails(null);
    setStatus('');
    setRemark('');
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
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Bill Follow Up
      </button>

      {/* PO Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-semibold mb-4">Select PO Number</h3>
            <select
              value={selectedPONumber}
              onChange={(e) => setSelectedPONumber(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="">-- Select PO --</option>
              {poNumbers.map(po => (
                <option key={po} value={po}>{po}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={setPoDetailsFromRequests}
                disabled={!selectedPONumber}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Fetch Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Follow-up Details Modal */}
      {(detailsModalOpen && poDetails) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Update Follow-Up (PO: {selectedPONumber})</h2>
              <button onClick={resetModals} className="text-2xl text-gray-500 hover:text-gray-700">&times;</button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Updating <strong>{poDetails.length}</strong> item(s):
            </p>
            <div className="bg-gray-50 p-3 rounded border mb-6 max-h-40 overflow-y-auto">
              <ul className="text-sm space-y-1">
                {poDetails.map((item, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{item.materialName}</span>
                    <span className="text-gray-500 text-xs">UID: {item.UID}</span>
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={handleSubmitFollowUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status 12 *</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">-- Select --</option>
                  <option value="Received">Received</option>
                  <option value="Hold">Hold</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Remark 12 *</label>
                <textarea
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows="3"
                  required
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={resetModals}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update All'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
        {loading && !requests.length ? (
          <div className="p-8 text-center text-gray-500">Loading data...</div>
        ) : error && !requests.length ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No pending follow-ups.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  {[
                    'Planned 12', 'UID', 'Site Name', 'Supervisor', 'Material Name',
                    'Revised Qty', 'Received Qty', 'Unit', 'Vendor Firm', 'PO Number',
                    'Follow-Up Count 12', 'Remark 12', 'Vendor Contact'
                  ].map(header => (
                    <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((r, i) => (
                  <tr key={`${r.UID}-${i}`} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 text-sm">{r.planned12}</td>
                    <td className="px-4 py-2 text-sm font-mono">{r.UID}</td>
                    <td className="px-4 py-2 text-sm">{r.siteName}</td>
                    <td className="px-4 py-2 text-sm">{r.supervisorName}</td>
                    <td className="px-4 py-2 text-sm">{r.materialName}</td>
                    <td className="px-4 py-2 text-sm text-right">{r.revisedQuantity}</td>
                    <td className="px-4 py-2 text-sm text-right">{r.finalReceivedQuantity}</td>
                    <td className="px-4 py-2 text-sm">{r.unitName}</td>
                    <td className="px-4 py-2 text-sm">{r.vendorFirmName}</td>
                    <td className="px-4 py-2 text-sm font-semibold">{r.poNumber}</td>
                    <td className="px-4 py-2 text-sm text-center">{r.followUpCount12}</td>
                    <td className="px-4 py-2 text-sm italic">{r.remark12 || '-'}</td>
                    <td className="px-4 py-2 text-sm">{r.vendorContact}</td>
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