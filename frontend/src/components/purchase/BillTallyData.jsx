


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
  const [isSubmitting, setIsSubmitting] = useState(false); // ← NEW

  const [formData, setFormData] = useState({
    status16: '',
    vendorFirmName: '',
    billNo: '',
    billDate: '',
    items: [],
    transportWOGST: '',
    gstRate: '',
    adjustmentAmount: '0',
    netAmount: '0.00',
    remark: ''
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Bill_Tally`);
        if (!response.ok) throw new Error('Failed to fetch data');
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBillTallyEntry = () => {
    setIsModalOpen(true);
    setStep(1);
  };

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

  const handleVendorSelect = (e) => {
    const vendor = e.target.value;
    setSelectedVendor(vendor);
  };

  const handleNext = () => {
    if (step === 1 && selectedInvoice && selectedVendor) {
      const selectedItems = data.filter(
        item => item.invoice13 === selectedInvoice && item.vendorFirmName === selectedVendor
      );

      if (selectedItems.length > 0) {
        const initialItems = selectedItems.map((item, index) => ({
          materialName: item.materialName || 'N/A',
          uid: item.UID || `N/A-${index}`,
          amount: '',
          cgst: 'None',
          sgst: 'None',
          igst: 'None',
          cgstAmt: '0',
          sgstAmt: '0',
          igstAmt: '0',
          total: '0'
        }));
        setFormData(prev => ({
          ...prev,
          vendorFirmName: selectedVendor,
          items: initialItems
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          vendorFirmName: selectedVendor,
          items: []
        }));
      }
      setStep(2);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];

    if (name === 'cgst') {
      newItems[index].cgst = value;
      newItems[index].sgst = value;
      newItems[index].igst = 'None';
    } else if (name === 'igst') {
      newItems[index].igst = value;
      newItems[index].cgst = 'None';
      newItems[index].sgst = 'None';
    } else {
      newItems[index][name] = value;
    }

    setFormData(prev => ({ ...prev, items: newItems }));
  };

  // TAX CALCULATION
  useEffect(() => {
    if (formData.items.length === 0) return;

    const updatedItems = formData.items.map(item => {
      const amount = parseFloat(item.amount) || 0;
      let cgstAmt = 0;
      let sgstAmt = 0;
      let igstAmt = 0;

      if (item.cgst !== 'None') {
        const rate = parseFloat(item.cgst) || 0;
        cgstAmt = amount * (rate / 200);
        sgstAmt = cgstAmt;
      } else if (item.igst !== 'None') {
        const rate = parseFloat(item.igst) || 0;
        igstAmt = amount * (rate / 100);
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
  }, [
    formData.items.map(item => `${item.amount || 0}-${item.cgst}-${item.igst}`).join(','),
    formData.transportWOGST,
    formData.gstRate,
    formData.adjustmentAmount
  ]);

  // SUBMIT WITH LOADING & SUCCESS/FAIL ON BUTTON
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const btn = document.getElementById('submit-btn');
    btn.innerHTML = 'Submitting...';
    btn.className = 'px-6 py-2 bg-gray-500 text-white rounded font-medium cursor-not-allowed';

    try {
      const itemsTotal = formData.items.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
      const transport = parseFloat(formData.transportWOGST) || 0;
      const gstRate = parseFloat(formData.gstRate) || 0;
      const transportGst = transport * (gstRate / 100);
      const adjustment = parseFloat(formData.adjustmentAmount) || 0;
      const netAmount = (itemsTotal + transport + transportGst + adjustment).toFixed(2);

      const submitData = {
        status16: formData.status16,
        vendorFirmName: formData.vendorFirmName,
        billNo: formData.billNo,
        billDate: formData.billDate,
        transportWOGST: formData.transportWOGST,
        gstRate: formData.gstRate,
        remark: formData.remark,
        netAmount,
        items: formData.items.map(item => ({
          uid: item.uid,
          amount: item.amount,
          cgst: item.cgst !== 'None' ? item.cgst : '0',
          sgst: item.cgst !== 'None' ? item.cgst : '0',
          igst: item.igst !== 'None' ? item.igst : '0',
          cgstAmt: item.cgstAmt,
          sgstAmt: item.sgstAmt,
          igstAmt: item.igstAmt,
          total: item.total,
          gstPercent: item.cgst !== 'None' ? item.cgst : (item.igst !== 'None' ? item.igst : '0')
        }))
      };

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/bill_tally_entry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) throw new Error('Failed to submit');

      // SUCCESS
      btn.innerHTML = 'Submitted Successfully!';
      btn.className = 'px-6 py-2 bg-green-600 text-white rounded font-medium shadow-md';

      setTimeout(() => {
        setIsModalOpen(false);
        setStep(1);
        setSelectedInvoice('');
        setSelectedVendor('');
        setVendorOptions([]);
        setFormData({
          status16: '', vendorFirmName: '', billNo: '', billDate: '', items: [],
          transportWOGST: '', gstRate: '', adjustmentAmount: '0',
          netAmount: '0.00', remark: ''
        });
        setIsSubmitting(false);
      }, 1500);

    } catch (err) {
      console.error('Submit error:', err);
      // FAILURE
      btn.innerHTML = 'Failed! Try Again';
      btn.className = 'px-6 py-2 bg-red-600 text-white rounded font-medium';

      setTimeout(() => {
        btn.innerHTML = 'Submit';
        btn.className = 'px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 shadow-md';
        setIsSubmitting(false);
      }, 2000);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setStep(1);
    setSelectedInvoice('');
    setSelectedVendor('');
    setVendorOptions([]);
    setFormData({
      status16: '', vendorFirmName: '', billNo: '', billDate: '', items: [],
      transportWOGST: '', gstRate: '', adjustmentAmount: '0',
      netAmount: '0.00', remark: ''
    });
  };

  const handlePrevious = () => setStep(1);

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <button onClick={handleBillTallyEntry} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
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
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Invoice 13</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, index) => (
                <tr key={index} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{item.planned16}</td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{item.UID}</td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200"><div title={item.siteName}>{item.siteName}</div></td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{item.materialType}</td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{item.skuCode}</td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200"><div title={item.materialName}>{item.materialName}</div></td>
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

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[1200px] max-h-[90vh] overflow-y-auto">
            {step === 1 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Select Invoice & Vendor</h2>
                  <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Invoice 13 *</label>
                    <select value={selectedInvoice} onChange={handleInvoiceSelect} className="mt-1 block w-full border-purple-300 rounded-md shadow-sm p-2 border-2">
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
                        <input type="text" value={selectedVendor} readOnly className="mt-1 block w-full border-purple-300 rounded-md shadow-sm p-2 border-2 bg-gray-100" />
                      ) : (
                        <select value={selectedVendor} onChange={handleVendorSelect} className="mt-1 block w-full border-purple-300 rounded-md shadow-sm p-2 border-2">
                          <option value="">-- Select Vendor --</option>
                          {vendorOptions.map((vendor, index) => (
                            <option key={index} value={vendor}>{vendor}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button onClick={handleCancel} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Cancel</button>
                  <button onClick={handleNext} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700" disabled={!selectedInvoice || !selectedVendor}>
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Bill Tally Entry Details</h2>
                  <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status 16 *</label>
                      <select name="status16" value={formData.status16} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border">
                        <option value="">-- Select Status --</option>
                        <option value="Done">Done</option>
                        <option value="Hold">Hold</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Vendor Firm Name *</label>
                      <input type="text" name="vendorFirmName" value={formData.vendorFirmName} readOnly className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bill No. *</label>
                      <input type="text" name="billNo" value={formData.billNo} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bill Date *</label>
                      <input type="date" name="billDate" value={formData.billDate} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border" />
                    </div>
                  </div>

                  {/* ITEM TABLE */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Item Details</label>
                    {formData.items.length === 0 ? (
                      <p className="text-red-500">No items found.</p>
                    ) : (
                      <div className="overflow-x-auto border border-gray-300 rounded-md">
                        <table className="min-w-full bg-white divide-y divide-gray-300">
                          <thead className="bg-gray-200 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-xs font-medium text-gray-700 text-center border-r border-gray-300 w-16">UID</th>
                              <th className="px-4 py-2 text-xs font-medium text-gray-700 text-center border-r border-gray-300">Material Name</th>
                              <th className="px-4 py-2 text-xs font-medium text-gray-700 text-center border-r border-gray-300 w-32">Amount *</th>
                              <th className="px-3 py-2 text-xs font-medium text-gray-700 text-center border-r border-gray-300 w-20">CGST</th>
                              <th className="px-3 py-2 text-xs font-medium text-gray-700 text-center border-r border-gray-300 w-20">IGST</th>
                              <th className="px-3 py-2 text-xs font-medium text-gray-700 text-center border-r border-gray-300 w-24">CGST Amt</th>
                              <th className="px-3 py-2 text-xs font-medium text-gray-700 text-center border-r border-gray-300 w-24">SGST Amt</th>
                              <th className="px-3 py-2 text-xs font-medium text-gray-700 text-center border-r border-gray-300 w-24">IGST Amt</th>
                              <th className="px-3 py-2 text-xs font-medium text-gray-700 text-center w-24">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-300">
                            {formData.items.map((item, index) => (
                              <tr key={`${item.uid}-${index}`} className="hover:bg-gray-50">
                                <td className="px-3 py-2 border-r border-gray-300 text-center">
                                  <input type="text" value={item.uid} readOnly className="w-full text-center border-0 bg-transparent text-sm p-0" />
                                </td>
                                <td className="px-4 py-2 border-r border-gray-300 text-left">
                                  <input type="text" value={item.materialName} readOnly className="w-full bg-transparent border-0 text-sm p-0" title={item.materialName} />
                                </td>
                                <td className="px-4 py-2 border-r border-gray-300">
                                  <input
                                    type="number"
                                    name="amount"
                                    value={item.amount}
                                    onChange={(e) => handleItemChange(index, e)}
                                    className="w-full text-center border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500"
                                    placeholder="0"
                                    step="0.01"
                                  />
                                </td>
                                <td className="px-3 py-2 border-r border-gray-300">
                                  <select
                                    name="cgst"
                                    value={item.cgst}
                                    onChange={(e) => handleItemChange(index, e)}
                                    disabled={item.igst !== 'None'}
                                    className="w-full text-center border rounded px-1 py-0.5 text-sm bg-white disabled:bg-gray-100"
                                  >
                                    <option value="None">None</option>
                                    <option value="5">5%</option>
                                    <option value="12">12%</option>
                                    <option value="18">18%</option>
                                    <option value="28">28%</option>
                                  </select>
                                </td>
                                <td className="px-3 py-2 border-r border-gray-300">
                                  <select
                                    name="igst"
                                    value={item.igst}
                                    onChange={(e) => handleItemChange(index, e)}
                                    disabled={item.cgst !== 'None'}
                                    className="w-full text-center border rounded px-1 py-0.5 text-sm bg-white disabled:bg-gray-100"
                                  >
                                    <option value="None">None</option>
                                    <option value="5">5%</option>
                                    <option value="12">12%</option>
                                    <option value="18">18%</option>
                                    <option value="28">28%</option>
                                  </select>
                                </td>
                                <td className="px-3 py-2 border-r border-gray-300 text-center">
                                  <input type="text" value={item.cgstAmt} readOnly className="w-full text-center bg-transparent border-0 text-sm p-0" />
                                </td>
                                <td className="px-3 py-2 border-r border-gray-300 text-center">
                                  <input type="text" value={item.sgstAmt} readOnly className="w-full text-center bg-transparent border-0 text-sm p-0" />
                                </td>
                                <td className="px-3 py-2 border-r border-gray-300 text-center">
                                  <input type="text" value={item.igstAmt} readOnly className="w-full text-center bg-transparent border-0 text-sm p-0" />
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <input type="text" value={item.total} readOnly className="w-full text-center bg-transparent border-0 text-sm p-0 font-medium" />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-100 font-semibold">
                            <tr>
                              <td colSpan="2" className="px-3 py-2 text-right border-r border-gray-300">Total</td>
                              <td className="px-4 py-2 text-center border-r border-gray-300">
                                {formData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2)}
                              </td>
                              <td className="px-3 py-2 text-center border-r border-gray-300">-</td>
                              <td className="px-3 py-2 text-center border-r border-gray-300">-</td>
                              <td className="px-3 py-2 text-center border-r border-gray-300">
                                {formData.items.reduce((sum, item) => sum + (parseFloat(item.cgstAmt) || 0), 0).toFixed(2)}
                              </td>
                              <td className="px-3 py-2 text-center border-r border-gray-300">
                                {formData.items.reduce((sum, item) => sum + (parseFloat(item.sgstAmt) || 0), 0).toFixed(2)}
                              </td>
                              <td className="px-3 py-2 text-center border-r border-gray-300">
                                {formData.items.reduce((sum, item) => sum + (parseFloat(item.igstAmt) || 0), 0).toFixed(2)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formData.items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0).toFixed(2)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* TRANSPORT & FINAL TOTAL */}
                  <div className="mt-6 border-t pt-6 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl shadow-sm">
                    <div className="grid grid-cols-3 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Transport (w/o GST) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="transportWOGST"
                          value={formData.transportWOGST}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          GST % <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="gstRate"
                          value={formData.gstRate}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                        >
                          <option value="">-- Select --</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1 font-semibold">
                          Net Transport Amount
                        </label>
                        <input
                          type="text"
                          value={(
                            (parseFloat(formData.transportWOGST) || 0) * 
                            (1 + (parseFloat(formData.gstRate) || 0) / 100)
                          ).toFixed(2)}
                          readOnly
                          className="w-full px-4 py-2.5 bg-green-100 border-2 border-green-400 rounded-lg font-bold text-green-800 text-base"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adjustment Amount
                        </label>
                        <input
                          type="number"
                          name="adjustmentAmount"
                          value={formData.adjustmentAmount}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                          placeholder="(+/-) 0.00"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-purple-800 mb-1 text-lg">
                          Grand Total
                        </label>
                        <input
                          type="text"
                          value={formData.netAmount}
                          readOnly
                          className="w-full px-4 py-2.5 bg-purple-100 border-2 border-purple-500 rounded-lg font-extrabold text-purple-900 text-xl tracking-wide"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Remark *</label>
                    <textarea name="remark" value={formData.remark} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border" rows="3"></textarea>
                  </div>
                </div>
                
                {/* SUBMIT BUTTON WITH LOADING */}
                <div className="flex justify-between space-x-4 mt-6">
                  <button onClick={handlePrevious} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
                    Previous
                  </button>
                  <button
                    id="submit-btn"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 shadow-md transition-all duration-300"
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