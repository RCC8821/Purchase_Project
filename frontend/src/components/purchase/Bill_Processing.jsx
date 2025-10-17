

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

  // Fetch data from the BILL-PROCESSING API
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/BILL-PROCESSING`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setRequests(data.data);
        const uniquePONumbers = [...new Set(data.data.map(request => request.poNumber))].filter(po => po);
        setPoNumbers(uniquePONumbers);
      } else {
        throw new Error('API data is not in the expected format');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const setPoDetailsFromRequests = () => {
    if (selectedPONumber) {
      const details = requests.filter(request => request.poNumber === selectedPONumber);
      if (details.length > 0) {
        setPoDetails(details);
        setSelectedItems(details.map(item => item.UID));
        setIsModalOpen(false);
        setItemModalOpen(true);
      } else {
        setError('No details found for the selected PO number.');
      }
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(poDetails.map(item => item.UID));
    } else {
      setSelectedItems([]);
    }
  };

  const handleItemSelect = (uid) => {
    setSelectedItems(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setInvoiceFile(file);
      setPreviewUrl(null);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmitBill = async (e) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!invoiceNumber || !invoiceFile || !status || !remark || selectedItems.length === 0) {
      setError('Please fill all required fields, select at least one item, and upload an invoice file');
      return;
    }
    if (invoiceFile.size > 10 * 1024 * 1024) {
      setError('File too large. Please select a file under 10MB.');
      return;
    }

    setUploading(true);
    try {
      // Convert file to base64
      const imageBase64 = await getBase64(invoiceFile);

      // Validate UIDs exist in requests
      const validUids = selectedItems.filter(uid => requests.some(request => request.UID === uid));
      if (validUids.length !== selectedItems.length) {
        throw new Error('Some selected UIDs are invalid or not found.');
      }

      // Submit to backend
      const payload = {
        uids: validUids,
        invoiceNumber,
        status,
        remark,
        image: imageBase64,
      };

      const submitResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/submit-bill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json();
        throw new Error(errorData.error || 'Failed to submit bill');
      }

      const responseData = await submitResponse.json();
      if (responseData.success) {
        alert('Invoice details updated successfully');
        setDetailsModalOpen(false);
        setInvoiceNumber('');
        setInvoiceFile(null);
        setPreviewUrl(null);
        setStatus('Done');
        setRemark('');
        setSelectedPONumber('');
        setPoDetails(null);
        setSelectedItems([]);
        await fetchRequests(); // Refresh data
      } else {
        throw new Error('Submission was not successful');
      }
    } catch (err) {
      console.error('Error submitting bill:', err);
      if (err.message.includes('Cloudinary')) {
        setError(`Failed to upload file: ${err.message}. Please check the backend Cloudinary configuration.`);
      } else if (err.message.includes('UIDs')) {
        setError(err.message);
      } else if (err.message.includes('Missing required fields')) {
        setError(`Submission failed: ${err.message}`);
      } else {
        setError('An error occurred while submitting the bill. Please try again.');
      }
    } finally {
      setUploading(false);
    }
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Select Purchase Order</h3>
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
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {itemModalOpen && poDetails && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[800px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Select Items to Bill</h2>
              <button
                onClick={() => {
                  setItemModalOpen(false);
                  setSelectedPONumber('');
                  setPoDetails(null);
                  setSelectedItems([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={poDetails.length > 0 && selectedItems.length === poDetails.length}
                      />
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">UID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Site Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Material Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Unit Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Revised Qty</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Final Received Qty</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {poDetails.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.UID)}
                          onChange={() => handleItemSelect(item.UID)}
                        />
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800">{item.UID}</td>
                      <td className="px-4 py-2 text-sm text-gray-800">{item.siteName}</td>
                      <td className="px-4 py-2 text-sm text-gray-800">{item.materialType}</td>
                      <td className="px-4 py-2 text-sm text-gray-800">{item.unitName}</td>
                      <td className="px-4 py-2 text-sm text-gray-800 text-right">{item.revisedQuantity}</td>
                      <td className="px-4 py-2 text-sm text-gray-800 text-right">{item.finalReceivedQuantity}</td>
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
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  if (selectedItems.length > 0) {
                    setItemModalOpen(false);
                    setDetailsModalOpen(true);
                  } else {
                    setError('Please select at least one item');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Next
              </button>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        </div>
      )}

      {detailsModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[600px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Enter Invoice Details</h2>
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  setSelectedPONumber('');
                  setPoDetails(null);
                  setSelectedItems([]);
                  setInvoiceFile(null);
                  setPreviewUrl(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitBill} className="bg-white p-6 border border-gray-200 rounded">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Invoice Number *</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Invoice Photo / PDF *</label>
                <div className="flex space-x-2">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="upload-photo"
                  />
                  <label htmlFor="upload-photo" className="px-4 py-2 bg-gray-200 text-gray-700 rounded cursor-pointer">
                    Upload File
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                    id="capture-photo"
                  />
                  <label htmlFor="capture-photo" className="px-4 py-2 bg-gray-200 text-gray-700 rounded cursor-pointer">
                    Capture Photo
                  </label>
                </div>
                {invoiceFile && <p className="text-sm text-gray-600 mt-2">Selected: {invoiceFile.name}</p>}
                {previewUrl && (
                  <img src={previewUrl} alt="Preview" className="mt-2 max-w-full h-32 object-contain" />
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Status *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                  required
                >
                  <option value="Done">Done</option>
                  <option value="Hold">Hold</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Remark *</label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                  rows="4"
                  required
                ></textarea>
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setDetailsModalOpen(false);
                    setItemModalOpen(true);
                  }}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Previous
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {loading || uploading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>
          </div>
        </div>
      )}

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
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Planned 13</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">UID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Site Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Material Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">SKU Code</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Material Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Revised Quantity</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Received Qty</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Unit</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Final Indent No</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Final Indent</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Approval Quotation No</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Approval Quotation</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">PO Number</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">PO PDF</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">MRN No</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">MRN PDF</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Vendor Firm</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Vendor Contact</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request, index) => (
                  <tr key={`${request.UID}-${index}`} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.planned13}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.UID}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                      <div title={request.siteName}>{request.siteName}</div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.materialType}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.skuCode}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                      <div title={request.materialName}>{request.materialName}</div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200 text-right">{request.revisedQuantity}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200 text-right">{request.finalReceivedQuantity}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.unitName}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.finalIndentNo}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                      {request.finalIndent && <a href={request.finalIndent} target="_blank" rel="noopener noreferrer">View PDF</a>}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.approvalQuotationNo}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                      {request.approvalQuotation && <a href={request.approvalQuotation} target="_blank" rel="noopener noreferrer">View PDF</a>}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.poNumber}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                      {request.poPDF && <a href={request.poPDF} target="_blank" rel="noopener noreferrer">View PDF</a>}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.mrnNo}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                      {request.mrnPDF && <a href={request.mrnPDF} target="_blank" rel="noopener noreferrer">View PDF</a>}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.vendorFerm}</td>
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

export default Bill_Processing;