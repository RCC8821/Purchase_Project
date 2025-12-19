

import React, { useState, useEffect } from 'react';

const Bill_Processing = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedPONumber, setSelectedPONumber] = useState('');
  const [poDetails, setPoDetails] = useState(null);
  const [poNumbers, setPoNumbers] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState('Done');
  const [remark, setRemark] = useState('');
  const [uploading, setUploading] = useState(false);

  // Fetch data from API
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/BILL-PROCESSING`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setRequests(data.data);
        const uniquePOs = [...new Set(data.data.map(r => r.poNumber))].filter(Boolean);
        setPoNumbers(uniquePOs);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const setPoDetailsFromRequests = () => {
    if (!selectedPONumber) return;
    const details = requests.filter(r => r.poNumber === selectedPONumber);
    if (details.length > 0) {
      setPoDetails(details);
      setSelectedItems(details.map(i => i.UID));
      setIsModalOpen(false);
      setItemModalOpen(true);
    } else {
      setError('No items found for this PO');
    }
  };

  const handleSelectAll = (e) => {
    setSelectedItems(e.target.checked ? poDetails.map(i => i.UID) : []);
  };

  const handleItemSelect = (uid) => {
    setSelectedItems(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  // Handle file (PDF + Image)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File too large! Max 10MB allowed.');
      return;
    }

    setInvoiceFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  // Convert to base64
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Submit bill
  const handleSubmitBill = async (e) => {
    e.preventDefault();
    setError(null);

    if (!invoiceNumber || !invoiceFile || !status || !remark || selectedItems.length === 0) {
      setError('All fields are required and at least one item must be selected');
      return;
    }

    setUploading(true);
    try {
      const imageBase64 = await getBase64(invoiceFile);

      const payload = {
        uids: selectedItems,
        invoiceNumber,
        status,
        remark,
        image: imageBase64,
      };

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/submit-bill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      alert('Invoice submitted successfully!');
      closeAllModals();
      await fetchRequests();
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const closeAllModals = () => {
    setDetailsModalOpen(false);
    setItemModalOpen(false);
    setIsModalOpen(false);
    setSelectedPONumber('');
    setPoDetails(null);
    setSelectedItems([]);
    setInvoiceFile(null);
    setPreviewUrl(null);
    setInvoiceNumber('');
    setRemark('');
    setStatus('Done');
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Vendor Bill Processing Data</h2>
      <button
        onClick={() => setIsModalOpen(true)}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Bill Processing
      </button>

      {/* PO Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Select Purchase Order</h3>
            <select
              value={selectedPONumber}
              onChange={(e) => setSelectedPONumber(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="">-- Select PO Number --</option>
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
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Selection Modal */}
      {itemModalOpen && poDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Select Items to Bill</h2>
              <button onClick={closeAllModals} className="text-xl">×</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedItems.length === poDetails.length}
                      />
                    </th>
                    <th className="p-2 text-left">UID</th>
                    <th className="p-2 text-left">Site</th>
                    <th className="p-2 text-left">Material</th>
                    <th className="p-2 text-left">Unit</th>
                    <th className="p-2 text-right">Rev Qty</th>
                    <th className="p-2 text-right">Rec Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {poDetails.map(item => (
                    <tr key={item.UID} className="border-t hover:bg-gray-50">
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.UID)}
                          onChange={() => handleItemSelect(item.UID)}
                        />
                      </td>
                      <td className="p-2">{item.UID}</td>
                      <td className="p-2">{item.siteName}</td>
                      <td className="p-2">{item.materialType}</td>
                      <td className="p-2">{item.unitName}</td>
                      <td className="p-2 text-right">{item.revisedQuantity}</td>
                      <td className="p-2 text-right">{item.finalReceivedQuantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => {
                  setItemModalOpen(false);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  if (selectedItems.length > 0) {
                    setItemModalOpen(false);
                    setDetailsModalOpen(true);
                  } else {
                    setError('Select at least one item');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Next
              </button>
            </div>
            {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {detailsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Enter Invoice Details</h2>
              <button onClick={closeAllModals} className="text-2xl">×</button>
            </div>

            <form onSubmit={handleSubmitBill}>
              <div className="mb-4">
                <label className="block font-medium">Invoice Number *</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                  className="w-full p-2 border rounded mt-1"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block font-medium">Invoice File (PDF/Image) *</label>
                <div className="flex gap-2 flex-wrap">
                  <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" id="upload-file" />
                  <label htmlFor="upload-file" className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer text-sm">
                    Upload File
                  </label>
                  <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" id="capture-photo" />
                  <label htmlFor="capture-photo" className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer text-sm">
                    Camera
                  </label>
                </div>
                {invoiceFile && <p className="text-sm text-gray-600 mt-1">Selected: {invoiceFile.name}</p>}

                {previewUrl && (
                  <div className="mt-3 p-2 border rounded bg-gray-50 max-h-64 overflow-auto">
                    {invoiceFile.type === 'application/pdf' ? (
                      <iframe src={previewUrl} className="w-full h-64" title="PDF Preview" />
                    ) : (
                      <img src={previewUrl} alt="Preview" className="max-w-full h-auto max-h-64 mx-auto block" />
                    )}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block font-medium">Status *</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full p-2 border rounded mt-1"
                >
                  <option value="Done">Done</option>
                  <option value="Hold">Hold</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-medium">Remark *</label>
                <textarea
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                  className="w-full p-2 border rounded mt-1"
                  rows="3"
                  required
                />
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setDetailsModalOpen(false);
                    setItemModalOpen(true);
                  }}
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                >
                  Previous
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                >
                  {uploading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>

            {error && <p className="text-red-500 mt-3 text-center">{error}</p>}
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-lg shadow-md mt-6 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No data available</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left font-medium border-r border-gray-300">Planned 13</th>
                  <th className="px-3 py-2 text-left font-medium border-r border-gray-300">UID</th>
                  <th className="px-3 py-2 text-left font-medium border-r border-gray-300">Site Name</th>
                  <th className="px-3 py-2 text-left font-medium border-r border-gray-300">Material Type</th>
                  <th className="px-3 py-2 text-left font-medium border-r border-gray-300">SKU Code</th>
                  <th className="px-3 py-2 text-left font-medium border-r border-gray-300">Material Name</th>
                  <th className="px-3 py-2 text-left font-medium border-r border-gray-300">Revised Qty</th>
                  <th className="px-3 py-2 text-left font-medium border-r border-gray-300">Received Qty</th>
                  <th className="px-3 py-2 text-left font-medium border-r border-gray-300">Unit</th>
                  <th className="px-3 py-2 text-left font-medium border-r border-gray-300">Final Indent No</th>
                  <th className="px-3 py-2 text-left font-medium border-r border-gray-300">Final Indent</th>
                  <th className="px-3 py-2 text-left font-medium border-r border-gray-300">Approval Quotation No</th>
                  <th className="px-3 py-2 text-left font-medium border-r border-gray-300">Approval Quotation</th>
                  <th className="px-3 py-2 text-left font-medium border-r border-gray-300">PO Number</th>
                  <th className="px-3 py-2 text-left font-medium border-r border-gray-300">PO PDF</th>
                  <th className="px-3 py-2 text-left font-medium border-r border-gray-300">MRN No</th>
                  <th className="px-3 py-2 text-left font-medium border-r border-gray-300">MRN PDF</th>
                  <th className="px-3 py-2 text-left font-medium border-r border-gray-300">Vendor Firm</th>
                  <th className="px-3 py-2 text-left font-medium">Vendor Contact</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r, i) => (
                  <tr key={`${r.UID}-${i}`} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2 border-r">{r.planned13}</td>
                    <td className="px-3 py-2 border-r">{r.UID}</td>
                    <td className="px-3 py-2 border-r">{r.siteName}</td>
                    <td className="px-3 py-2 border-r">{r.materialType}</td>
                    <td className="px-3 py-2 border-r">{r.skuCode}</td>
                    <td className="px-3 py-2 border-r">{r.materialName}</td>
                    <td className="px-3 py-2 border-r text-right">{r.revisedQuantity}</td>
                    <td className="px-3 py-2 border-r text-right">{r.finalReceivedQuantity}</td>
                    <td className="px-3 py-2 border-r">{r.unitName}</td>
                    <td className="px-3 py-2 border-r">{r.finalIndentNo}</td>
                    <td className="px-3 py-2 border-r">
                      {r.finalIndent && <a href={r.finalIndent} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View PDF</a>}
                    </td>
                    <td className="px-3 py-2 border-r">{r.approvalQuotationNo}</td>
                    <td className="px-3 py-2 border-r">
                      {r.approvalQuotation && <a href={r.approvalQuotation} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View PDF</a>}
                    </td>
                    <td className="px-3 py-2 border-r">{r.poNumber}</td>
                    <td className="px-3 py-2 border-r">
                      {r.poPDF && <a href={r.poPDF} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View PDF</a>}
                    </td>
                    <td className="px-3 py-2 border-r">{r.mrnNo}</td>
                    <td className="px-3 py-2 border-r">
                      {r.mrnPDF && <a href={r.mrnPDF} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View PDF</a>}
                    </td>
                    <td className="px-3 py-2 border-r">{r.vendorFerm}</td>
                    <td className="px-3 py-2">{r.vendorContact}</td>
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

export default Bill_Processing;