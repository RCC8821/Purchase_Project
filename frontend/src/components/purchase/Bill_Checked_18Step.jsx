import React, { useState, useEffect } from 'react';

const Bill_Checked_18Step = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [vendorOptions, setVendorOptions] = useState([]);
  const [invoiceNumbers, setInvoiceNumbers] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedUIDs, setSelectedUIDs] = useState([]);
  const [formData, setFormData] = useState({
    STATUS_18: '',
    REMARK_18: ''
  });
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Bill_Checked_Step18`);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setData(result.data);
          const uniqueInvoices = [...new Set(result.data.map(item => item.invoice13).filter(invoice => invoice))];
          setInvoiceNumbers(uniqueInvoices);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        setError(err.message);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Open filter modal
  const handleOpenFilterModal = (index) => {
    setSelectedRowIndex(index);
    setSelectedInvoice('');
    setSelectedVendor('');
    setVendorOptions([]);
    setSelectedUIDs([]);
    setFilteredItems([]);
    setIsFilterModalOpen(true);
  };

  // Handle invoice selection
  const handleInvoiceSelect = (e) => {
    const invoice = e.target.value;
    setSelectedInvoice(invoice);
    setSelectedVendor('');
    setVendorOptions([]);
    
    if (invoice) {
      const vendorsForInvoice = [...new Set(
        data
          .filter(item => item.invoice13 === invoice)
          .map(item => item.vendorFirmName)
          .filter(vendor => vendor)
      )];
      setVendorOptions(vendorsForInvoice);
      
      if (vendorsForInvoice.length === 1) {
        setSelectedVendor(vendorsForInvoice[0]);
      }
    }
  };

  // Handle vendor selection
  const handleVendorSelect = (e) => {
    const vendor = e.target.value;
    setSelectedVendor(vendor);
  };

  // Proceed to items selection
  const handleNextToItems = () => {
    if (selectedInvoice && selectedVendor) {
      const filtered = data.filter(
        item => item.invoice13 === selectedInvoice && item.vendorFirmName === selectedVendor
      );
      setFilteredItems(filtered);
      setIsFilterModalOpen(false);
      setIsItemsModalOpen(true);
    }
  };

  // Handle UID checkbox
  const handleUIDSelect = (uid) => {
    setSelectedUIDs(prev => 
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  // Select All
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUIDs(filteredItems.map(item => item.UID));
    } else {
      setSelectedUIDs([]);
    }
  };

  // Proceed to status update
  const handleNextToStatus = () => {
    if (selectedUIDs.length > 0) {
      setIsItemsModalOpen(false);
      setIsStatusModalOpen(true);
    } else {
      setError('Please select at least one material.');
    }
  };

  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit status updates
  const handleStatusSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (selectedUIDs.length === 0) {
        throw new Error('No UIDs selected');
      }

      const payload = {
        updates: selectedUIDs.map(uid => ({
          uid: String(uid).trim(),
          STATUS_18: formData.STATUS_18 || '',
          REMARK_18: formData.REMARK_18 || ''
        }))
      };

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/bill_checked_status_18Step`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || `Failed to submit updates: ${response.statusText}`);
      }

      // Update local state
      setData(prevData => 
        prevData.map(item => 
          selectedUIDs.includes(item.UID) 
            ? { ...item, STATUS_18: formData.STATUS_18, REMARK_18: formData.REMARK_18 }
            : item
        )
      );

      // Refetch fresh data
      const refetchResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Bill_Checked_Step18`);
      if (refetchResponse.ok) {
        const freshResult = await refetchResponse.json();
        if (freshResult.success && Array.isArray(freshResult.data)) {
          setData(freshResult.data);
        }
      }

      alert('Status 18 and Remark 18 updated successfully!');

      // Reset everything
      handleCancel();
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel and reset
  const handleCancel = () => {
    setIsFilterModalOpen(false);
    setIsItemsModalOpen(false);
    setIsStatusModalOpen(false);
    setSelectedRowIndex(null);
    setSelectedInvoice('');
    setSelectedVendor('');
    setVendorOptions([]);
    setFilteredItems([]);
    setSelectedUIDs([]);
    setFormData({ STATUS_18: '', REMARK_18: '' });
    setError(null);
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* <h2 className="text-2xl font-bold text-gray-800 mb-6">Bill Checked </h2> */}

      {data.length === 0 ? (
        <p className="text-gray-500">No data found.</p>
      ) : (
        <div className="bg-white border border-gray-300 rounded-lg shadow-md overflow-x-auto max-h-[60vh]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Planned 14</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">UID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Site Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Material Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">SKU Code</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Material Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Revised Quantity</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Final Received Qty</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Unit</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Final Indent No</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Final Indent PDF</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Approval Quotation No</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Approval Quotation PDF</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">PO Number</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">PO PDF</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">MRN No</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">MRN PDF</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Vendor Firm Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Vendor Contact</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Invoice 13</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Invoice Photo 13</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, index) => (
                <tr key={index} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{item.planned14}</td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{item.UID}</td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                    <div title={item.siteName}>{item.siteName}</div>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{item.materialType}</td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{item.skuCode}</td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                    <div title={item.materialName}>{item.materialName}</div>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200 text-right">{item.revisedQuantity}</td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200 text-right">{item.finalReceivedQuantity}</td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{item.unitName}</td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{item.finalIndentNo}</td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                    {item.finalIndentPDF ? <a href={item.finalIndentPDF} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View PDF</a> : '-'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{item.approvalQuotationNo}</td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                    {item.approvalQuotationPDF ? <a href={item.approvalQuotationPDF} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View PDF</a> : '-'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{item.poNumber}</td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                    {item.poPDF ? <a href={item.poPDF} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View PDF</a> : '-'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{item.mrnNo}</td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                    {item.mrnPDF ? <a href={item.mrnPDF} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View PDF</a> : '-'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{item.vendorFirmName}</td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{item.vendorContact}</td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{item.invoice13}</td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                    {item.invoicePhoto13 ? <a href={item.invoicePhoto13} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a> : '-'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800">
                    <button
                      onClick={() => handleOpenFilterModal(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ✏️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Filter Modal - Invoice & Vendor */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Select Invoice & Vendor</h2>
              <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Invoice 13 *</label>
                <select
                  value={selectedInvoice}
                  onChange={handleInvoiceSelect}
                  className="mt-1 block w-full border-purple-300 rounded-md shadow-sm p-2 border-2"
                >
                  <option value="">-- Select Invoice 13 --</option>
                  {invoiceNumbers.map((invoice, idx) => (
                    <option key={idx} value={invoice}>{invoice}</option>
                  ))}
                </select>
              </div>
              {selectedInvoice && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vendor Firm Name *</label>
                  {vendorOptions.length === 1 ? (
                    <input
                      type="text"
                      value={selectedVendor}
                      readOnly
                      className="mt-1 block w-full border-purple-300 rounded-md shadow-sm p-2 border-2 bg-gray-100"
                    />
                  ) : (
                    <select
                      value={selectedVendor}
                      onChange={handleVendorSelect}
                      className="mt-1 block w-full border-purple-300 rounded-md shadow-sm p-2 border-2"
                    >
                      <option value="">-- Select Vendor --</option>
                      {vendorOptions.map((vendor, idx) => (
                        <option key={idx} value={vendor}>{vendor}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button onClick={handleCancel} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                Cancel
              </button>
              <button
                onClick={handleNextToItems}
                disabled={!selectedInvoice || !selectedVendor}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items Selection Modal */}
      {isItemsModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[800px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Select Materials</h2>
              <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            {filteredItems.length === 0 ? (
              <p className="text-gray-500">No materials found.</p>
            ) : (
              <div className="overflow-x-auto border border-gray-300 rounded-md">
                <table className="min-w-full bg-gray-100">
                  <thead className="bg-gray-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-r border-gray-300">
                        <input
                          type="checkbox"
                          checked={selectedUIDs.length === filteredItems.length && filteredItems.length > 0}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-r border-gray-300">UID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-r border-gray-300">Site Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-r border-gray-300">Material Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-r border-gray-300">Final Received Qty</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-r border-gray-300">PO Number</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-r border-gray-300">Approval Quotation No</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-r border-gray-300">MRN No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item, idx) => (
                      <tr key={idx} className={`border-t border-gray-300 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-4 py-2 border-r border-gray-300">
                          <input
                            type="checkbox"
                            checked={selectedUIDs.includes(item.UID)}
                            onChange={() => handleUIDSelect(item.UID)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{item.UID}</td>
                        <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{item.siteName}</td>
                        <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{item.materialName}</td>
                        <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200 text-right">{item.finalReceivedQuantity}</td>
                        <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{item.poNumber}</td>
                        <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{item.approvalQuotationNo}</td>
                        <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{item.mrnNo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex justify-end space-x-4 mt-6">
              <button onClick={handleCancel} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                Cancel
              </button>
              <button
                onClick={handleNextToStatus}
                disabled={selectedUIDs.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Update Status 18</h2>
              <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status 18 *</label>
                <select
                  name="STATUS_18"
                  value={formData.STATUS_18}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                >
                  <option value="">-- Select Status --</option>
                  <option value="Done">Done</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Remark 18 *</label>
                <textarea
                  name="REMARK_18"
                  value={formData.REMARK_18}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                  rows="3"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusSubmit}
                disabled={isSubmitting || !formData.STATUS_18 || !formData.REMARK_18}
                className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center ${
                  isSubmitting || !formData.STATUS_18 || !formData.REMARK_18 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bill_Checked_18Step;