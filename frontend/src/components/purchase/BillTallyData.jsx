

import React, { useState, useEffect } from 'react';

const BillTallyData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [invoiceNumbers, setInvoiceNumbers] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [vendorOptions, setVendorOptions] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [formData, setFormData] = useState({
    status16: '',
    vendorFirmName: '',
    billNo: '',
    billDate: '',
    items: [],
    transportLoading: '', // Added new field
    transportWOGST: '',
    gstRate: '',
    adjustmentAmount: '0', // New field for adjustment
    netAmount: '0.00',
    remark: ''
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/Bill_Tally`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          console.log('API Data:', result.data);
          setData(result.data);
          const uniqueInvoices = [...new Set(result.data.map(item => item.invoice13).filter(invoice => invoice))];
          console.log('Unique Invoices:', uniqueInvoices);
          setInvoiceNumbers(uniqueInvoices);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Open modal for bill tally entry
  const handleBillTallyEntry = () => {
    setIsModalOpen(true);
    setStep(1);
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
      console.log('Vendors for Invoice:', vendorsForInvoice);
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
    console.log('Selected Vendor:', vendor);
  };

  // Move to next step in modal
  const handleNext = () => {
    if (step === 1 && selectedInvoice && selectedVendor) {
      // Filter items by invoice AND vendor
      const selectedItems = data.filter(
        item => item.invoice13 === selectedInvoice && item.vendorFirmName === selectedVendor
      );
      console.log('Selected Items for Invoice and Vendor:', selectedItems);

      // Ensure all items are included, even duplicates, and map to formData.items
      if (selectedItems.length > 0) {
        const initialItems = selectedItems.map((item, index) => ({
          materialName: item.materialName || 'N/A',
          uid: item.UID || `N/A-${index}`,
          amount: '',
          cgst: 'None',
          igst: 'None',
          cgstAmt: '0',
          sgstAmt: '0',
          igstAmt: '0',
          total: '0'
        }));
        console.log('Mapped formData.items:', initialItems);
        setFormData(prev => ({
          ...prev,
          vendorFirmName: selectedVendor,
          items: initialItems
        }));
      } else {
        console.warn('No items found for selected invoice and vendor');
        setFormData(prev => ({
          ...prev,
          vendorFirmName: selectedVendor,
          items: []
        }));
      }
      setStep(2);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle item-specific changes (e.g., amount, CGST, IGST)
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    newItems[index][name] = value;

    if (name === 'cgst' && value !== 'None') {
      newItems[index].igst = 'None';
    } else if (name === 'igst' && value !== 'None') {
      newItems[index].cgst = 'None';
    }

    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  // Calculate tax amounts and totals
  useEffect(() => {
    if (formData.items.length === 0) return;

    const updatedItems = formData.items.map(item => {
      const amount = parseFloat(item.amount) || 0;
      let cgstAmt = 0;
      let sgstAmt = 0;
      let igstAmt = 0;

      if (item.cgst !== 'None') {
        const cgstRate = parseFloat(item.cgst) || 0;
        cgstAmt = amount * (cgstRate / 100);
        sgstAmt = cgstAmt;
      } else if (item.igst !== 'None') {
        const igstRate = parseFloat(item.igst) || 0;
        igstAmt = amount * (igstRate / 100);
      }

      const total = amount + cgstAmt + sgstAmt + igstAmt;

      return {
        ...item,
        cgstAmt: cgstAmt.toFixed(2),
        sgstAmt: sgstAmt.toFixed(2),
        igstAmt: igstAmt.toFixed(2),
        total: total.toFixed(2)
      };
    });

    const itemsTotal = updatedItems.reduce((sum, item) => sum + parseFloat(item.total), 0);
    const transport = parseFloat(formData.transportWOGST) || 0;
    const gstRate = parseFloat(formData.gstRate) || 0;
    const transportGst = transport * (gstRate / 100);
    const adjustment = parseFloat(formData.adjustmentAmount) || 0;
    const netAmount = (itemsTotal + transport + transportGst + adjustment).toFixed(2);

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      netAmount
    }));
  }, [formData.items, formData.transportWOGST, formData.gstRate, formData.adjustmentAmount]);

  // Handle form submission
  const handleSubmit = async () => {
    const submitData = { ...formData };
    delete submitData.adjustmentAmount;
    delete submitData.netAmount;

    try {
      const response = await fetch(`http://localhost:5000/api/bill_tally_entry`, { // Updated API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit data');
      }

      const result = await response.json();
      console.log('Submit result:', result);

      // Close modal and reset after successful submission
      setIsModalOpen(false);
      setStep(1);
      setSelectedInvoice('');
      setSelectedVendor('');
      setVendorOptions([]);
      setFormData({
        status16: '',
        vendorFirmName: '',
        billNo: '',
        billDate: '',
        items: [],
        transportLoading: '', // Reset new field
        transportWOGST: '',
        gstRate: '',
        adjustmentAmount: '0',
        netAmount: '0.00',
        remark: ''
      });

      // Optionally, refetch the data to update the table
      // fetchData(); // Uncomment if you want to refresh the table
    } catch (err) {
      console.error('Submit error:', err);
      // Handle error, e.g., show a message to the user
    }
  };

  // Handle modal cancellation
  const handleCancel = () => {
    setIsModalOpen(false);
    setStep(1);
    setSelectedInvoice('');
    setSelectedVendor('');
    setVendorOptions([]);
    setFormData({
      status16: '',
      vendorFirmName: '',
      billNo: '',
      billDate: '',
      items: [],
      transportLoading: '', // Reset new field
      transportWOGST: '',
      gstRate: '',
      adjustmentAmount: '0',
      netAmount: '0.00',
      remark: ''
    });
  };

  // Handle going back to previous step
  const handlePrevious = () => {
    setStep(1);
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        {/* <h2 className="text-2xl font-bold text-gray-800">Bill Tally Data (Planned 16 Done, Actual 16 Pending)</h2> */}
        <button
          onClick={handleBillTallyEntry}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Bill Tally Entry
        </button>
      </div>

      {data.length === 0 ? (
        <p className="text-gray-500">No data found.</p>
      ) : (
        <div className="bg-white border border-gray-300 rounded-lg shadow-md overflow-x-auto max-h-[80vh]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Planned 16</th>
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
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Invoice 13</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, index) => (
                <tr key={index} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{item.planned16}</td>
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
                  <td className="px-4 py-2 text-sm text-gray-800">{item.invoice13}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[800px] max-h-[90vh] overflow-y-auto">
            {step === 1 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Select Invoice & Vendor</h2>
                  <button
                    onClick={handleCancel}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
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
                      {invoiceNumbers.map((invoice, index) => (
                        <option key={index} value={invoice}>{invoice}</option>
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
                          {vendorOptions.map((vendor, index) => (
                            <option key={index} value={vendor}>{vendor}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700">Remark *</label>
                    <textarea
                      name="remark"
                      value={formData.remark}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                      rows="3"
                    ></textarea>
                  </div> */}
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    disabled={!selectedInvoice || !selectedVendor}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Bill Tally Entry Details</h2>
                  <button
                    onClick={handleCancel}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status 16 *</label>
                      <select
                        name="status16"
                        value={formData.status16}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                      >
                        <option value="">-- Select Status --</option>
                        <option value="Done">Done</option>
                        <option value="Hold">Hold</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Vendor Firm Name *</label>
                      <input
                        type="text"
                        name="vendorFirmName"
                        value={formData.vendorFirmName}
                        readOnly
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bill No. *</label>
                      <input
                        type="text"
                        name="billNo"
                        value={formData.billNo}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bill Date *</label>
                      <input
                        type="date"
                        name="billDate"
                        value={formData.billDate}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Item Details</label>
                    {formData.items.length === 0 ? (
                      <p className="text-red-500">No items found for the selected invoice and vendor.</p>
                    ) : (
                      <div className="overflow-x-auto border border-gray-300 rounded-md">
                        <table className="min-w-full bg-gray-100">
                          <thead className="bg-gray-200 sticky top-0">
                            <tr>
                              <th className="px-2 py-2 text-xs font-medium text-gray-700 border-r border-gray-300">UID</th>
                              <th className="px-2 py-2 text-xs font-medium text-gray-700 border-r border-gray-300">Material Name</th>
                              <th className="px-2 py-2 text-xs font-medium text-gray-700 border-r border-gray-300">Amount *</th>
                              <th className="px-2 py-2 text-xs font-medium text-gray-700 border-r border-gray-300">CGST</th>
                              <th className="px-2 py-2 text-xs font-medium text-gray-700 border-r border-gray-300">IGST</th>
                              <th className="px-2 py-2 text-xs font-medium text-gray-700 border-r border-gray-300">CGST Amt</th>
                              <th className="px-2 py-2 text-xs font-medium text-gray-700 border-r border-gray-300">SGST Amt</th>
                              <th className="px-2 py-2 text-xs font-medium text-gray-700 border-r border-gray-300">IGST Amt</th>
                              <th className="px-2 py-2 text-xs font-medium text-gray-700">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.items.map((item, index) => (
                              <tr key={`${item.uid}-${index}`} className="border-t border-gray-300">
                                <td className="px-2 py-2 border-r border-gray-300">
                                  <input
                                    type="text"
                                    value={item.uid}
                                    readOnly
                                    className="w-full border-gray-300 rounded-md shadow-sm p-1 text-sm bg-gray-100"
                                  />
                                </td>
                                <td className="px-2 py-2 border-r border-gray-300">
                                  <input
                                    type="text"
                                    value={item.materialName}
                                    readOnly
                                    className="w-full border-gray-300 rounded-md shadow-sm p-1 text-sm bg-gray-100"
                                  />
                                </td>
                                <td className="px-2 py-2 border-r border-gray-300">
                                  <input
                                    type="number"
                                    name="amount"
                                    value={item.amount}
                                    onChange={(e) => handleItemChange(index, e)}
                                    className="w-full border-gray-300 rounded-md shadow-sm p-1 text-sm border"
                                    placeholder="Enter Amount"
                                  />
                                </td>
                                <td className="px-2 py-2 border-r border-gray-300">
                                  <select
                                    name="cgst"
                                    value={item.cgst}
                                    onChange={(e) => handleItemChange(index, e)}
                                    className="w-full border-gray-300 rounded-md shadow-sm p-1 text-sm border"
                                    disabled={item.igst !== 'None'}
                                  >
                                    <option value="None">None</option>
                                    <option value="5">5%</option>
                                    <option value="12">12%</option>
                                    <option value="18">18%</option>
                                    <option value="28">28%</option>
                                  </select>
                                </td>
                                <td className="px-2 py-2 border-r border-gray-300">
                                  <select
                                    name="igst"
                                    value={item.igst}
                                    onChange={(e) => handleItemChange(index, e)}
                                    className="w-full border-gray-300 rounded-md shadow-sm p-1 text-sm border"
                                    disabled={item.cgst !== 'None'}
                                  >
                                    <option value="None">None</option>
                                    <option value="5">5%</option>
                                    <option value="12">12%</option>
                                    <option value="18">18%</option>
                                    <option value="28">28%</option>
                                  </select>
                                </td>
                                <td className="px-2 py-2 border-r border-gray-300">
                                  <input
                                    type="text"
                                    value={item.cgstAmt}
                                    readOnly
                                    className="w-full border-gray-300 rounded-md shadow-sm p-1 text-sm bg-gray-100"
                                  />
                                </td>
                                <td className="px-2 py-2 border-r border-gray-300">
                                  <input
                                    type="text"
                                    value={item.sgstAmt}
                                    readOnly
                                    className="w-full border-gray-300 rounded-md shadow-sm p-1 text-sm bg-gray-100"
                                  />
                                </td>
                                <td className="px-2 py-2 border-r border-gray-300">
                                  <input
                                    type="text"
                                    value={item.igstAmt}
                                    readOnly
                                    className="w-full border-gray-300 rounded-md shadow-sm p-1 text-sm bg-gray-100"
                                  />
                                </td>
                                <td className="px-2 py-2">
                                  <input
                                    type="text"
                                    value={item.total}
                                    readOnly
                                    className="w-full border-gray-300 rounded-md shadow-sm p-1 text-sm bg-gray-100"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Transport Loading *</label>
                      <input
                        type="number"
                        name="transportLoading"
                        value={formData.transportLoading}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Transport (w/o GST) *</label>
                      <input
                        type="number"
                        name="transportWOGST"
                        value={formData.transportWOGST}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">GST % *</label>
                      <input
                        type="number"
                        name="gstRate"
                        value={formData.gstRate}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                        placeholder="Enter GST %"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Adjustment Amount</label>
                      <input
                        type="number"
                        name="adjustmentAmount"
                        value={formData.adjustmentAmount}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                        placeholder="Enter Adjustment (+/-)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Net Amount</label>
                      <input
                        type="text"
                        value={formData.netAmount}
                        readOnly
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 border"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Remark *</label>
                    <textarea
                      name="remark"
                      value={formData.remark}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
                <div className="flex justify-between space-x-4 mt-6">
                  <button
                    onClick={handlePrevious}
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Submit
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

export default BillTallyData;