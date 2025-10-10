

import React, { useState, useEffect } from 'react';

const PO = () => {
  const [requests, setRequests] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedQuotation, setSelectedQuotation] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  // Fetch data from API
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/get-po-data`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data && Array.isArray(data.data)) {
          setRequests(data.data);
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

    const fetchSupervisors = async () => {
      try {
        const response = await fetch(`http://localhost:5000/get-othersheet-data`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data)
        setSupervisors(data);
      } catch (error) {
        console.error('Error fetching supervisors:', error);
        setSupervisors([]);
      }
    };

    fetchRequests();
    fetchSupervisors();
  }, []);

  // Get unique quotation numbers
  const uniqueQuotations = [...new Set(requests.map(r => r.QUOTATION_NO_5).filter(Boolean))];

  const handleNext = () => {
    if (selectedQuotation) {
      setDetailsLoading(true);
      const items = requests.filter(r => r.QUOTATION_NO_5 === selectedQuotation);
      setSelectedItems(items);
      setStep(2);
      setDetailsLoading(false);
    }
  };

  const handleGeneratePO = async () => {
    if (!expectedDeliveryDate || !selectedItems.length) {
      alert('Please fill in all required fields.');
      return;
    }

    setGenerateLoading(true);

    // Log selectedItems to debug available fields
    console.log('Selected Items:', JSON.stringify(selectedItems, null, 2));

    const siteName = selectedItems[0]?.Site_Name || 'N/A';
    const supervisorName = selectedItems[0]?.Supervisor_Name || 'N/A';

    // Match site location based on site name
    const matchedSite = supervisors.find(s => s.Site_Name === siteName);
    const siteLocation = matchedSite ? matchedSite.Site_Location : 'N/A';

    // Match supervisor contact based on supervisor name
    const matchedSupervisor = supervisors.find(s => s.Supervisor === supervisorName);
    const supervisorContact = matchedSupervisor ? matchedSupervisor.Contact_No : 'N/A';

    const poData = {
      quotationNo: selectedQuotation,
      expectedDeliveryDate,
      items: selectedItems.map(item => ({
        uid: item.UID,
        materialName: item.Material_Name,
        vendorFirm: item.Vendor_Firm_Name_5 || 'N/A', // Fixed typo
        rate: item.Rate_5,
        cgst: item.CGST_5,
        sgst: item.SGST_5,
        igst: item.IGST_5,
        finalRate: item.FINAL_RATE_5,
        quantity: item.REVISED_QUANTITY_2,
        unit: item.Unit_Name, // Added unit
        totalValue: item.TOTAL_VALUE_5,
        transportRequired: item.IS_TRANSPORT_REQUIRED,
        expectedTransport: item.EXPECTED_TRANSPORT_CHARGES,
        indentNo: item.INDENT_NUMBER_3,
      })),
      siteName: siteName,
      siteLocation: siteLocation,
      supervisorName: selectedItems[0]?.Supervisor_Name || 'N/A',
      supervisorContact: supervisorContact,
      vendorName: selectedItems[0]?.Vendor_Firm_Name_5 || 'N/A',
      vendorAddress: selectedItems[0]?.Vendor_Address_5 || 'N/A',
      vendorGST: selectedItems[0]?.Vendor_GST_No_5 || 'N/A',
      vendorContact: selectedItems[0]?.Vendor_Contact_5 || 'N/A', // Added if available
    };

    console.log('PO Data being sent:', JSON.stringify(poData, null, 2));

    try {
      const response = await fetch(`http://localhost:5000/api/create-po`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      if (result.pdfUrl) {
        setPdfUrl(result.pdfUrl);
        alert('PO generated successfully!');
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error generating PO:', error);
      alert('Failed to generate PO.');
    } finally {
      setGenerateLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header Section */}
      {/* <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Purchase Order Data</h2>
        <p className="text-gray-600 text-sm">Display of purchase order requests.</p>
      </div> */}

      {/* Create PO Button */}
      <div className="mb-4">
        <button
          onClick={() => {
            setShowModal(true);
            setStep(1);
            setSelectedQuotation('');
            setExpectedDeliveryDate('');
            setSelectedItems([]);
            setPdfUrl(null);
            setDetailsLoading(false);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create PO
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-300 rounded shadow-sm">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : requests.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No Data available.</div>
        ) : (
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    PLANNED_7
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
                  </th> {/* Added */}
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
                    Require Date
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Revised Quantity
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Unit
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Brand/Company
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Indent Number
                  </th>
                  
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Quotation No
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Vendor Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Vendor Firm
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Vendor Address
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Vendor Contact
                  </th> {/* Added */}
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Vendor GST
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Rate
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    CGST
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    SGST
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    IGST
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Final Rate
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Total Value
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Approval
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Transport Required
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Expected Transport
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Freight Charges
                  </th> {/* Fixed typo */}
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    Expected Freight
                  </th> {/* Fixed typo */}
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">
                    PDF URL 3
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                    PDF URL 5
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request, index) => (
                  <tr key={request.Req_No} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.PLANNED_7}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.UID}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.Req_No}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">
                      <div  title={request.Site_Name}>
                        {request.Site_Name}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.Site_Location}</td> {/* Added */}
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.Material_Type}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.SKU_Code}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">
                      <div  title={request.Material_Name}>
                        {request.Material_Name}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.Require_Date}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.REVISED_QUANTITY_2}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.Unit_Name}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request['DECIDED_BRAND/COMPANY_NAME_2']}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.INDENT_NUMBER_3}</td>
                   
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.QUOTATION_NO_5}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.Vendor_Name_5}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.Vendor_Firm_Name_5}</td> {/* Fixed typo */}
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">
                      <div className="max-w-[120px] truncate" title={request.Vendor_Address_5}>
                        {request.Vendor_Address_5}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.Vendor_Contact_5}</td> {/* Added */}
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.Vendor_GST_No_5}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.Rate_5}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.CGST_5}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.SGST_5}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.IGST_5}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.FINAL_RATE_5}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.TOTAL_VALUE_5}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.APPROVAL_5}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.IS_TRANSPORT_REQUIRED}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.EXPECTED_TRANSPORT_CHARGES}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.FREIGHT_CHARGES}</td> {/* Fixed typo */}
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.EXPECTED_FREIGHT_CHARGES}</td> {/* Fixed typo */}
                     <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">
                      <a href={request.PDF_URL_3} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        View
                      </a>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800">
                      <a href={request.PDF_URL_5} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Create PO */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
            {step === 1 && (
              <>
                <h2 className="text-lg font-semibold mb-4">Select Quotation Number</h2>
                <label className="block mb-2 text-sm text-gray-700">Quotation Number *</label>
                <select
                  value={selectedQuotation}
                  onChange={(e) => setSelectedQuotation(e.target.value)}
                  className="w-full p-2 border border-blue-500 rounded mb-4"
                >
                  <option>-- Select Quotation Number --</option>
                  {uniqueQuotations.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
                <div className="flex justify-end">
                  <button
                    onClick={handleNext}
                    disabled={!selectedQuotation}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-lg font-semibold mb-4">Purchase Order Details</h2>
                <label className="block mb-2 text-sm text-gray-700">Expected Delivery Date *</label>
                <input
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                />

                {detailsLoading ? (
                  <div className="flex items-center justify-center mb-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                    <p className="text-gray-600">Loading PO details...</p>
                  </div>
                ) : selectedItems.length > 0 ? (
                  selectedItems.map((item, index) => (
                    <div key={index} className="mb-4 bg-blue-50 p-2 rounded">
                      <h3 className="font-medium mb-2 text-gray-800">
                        Material: {item.Material_Name} (UID: {item.UID})
                      </h3>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-600">
                            <th className="p-1">VENDOR FIRM</th>
                            <th className="p-1">RATE</th>
                            <th className="p-1">CGST</th>
                            <th className="p-1">SGST</th>
                            <th className="p-1">IGST</th>
                            <th className="p-1">FINAL RATE</th>
                            <th className="p-1">TOTAL QUANTITY</th>
                            <th className="p-1">TOTAL VALUE</th>
                            <th className="p-1">DELIVERY DATE</th>
                            <th className="p-1">TRANSPORT</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white">
                            <td className="p-1">{item.Vendor_Firm_Name_5}</td> {/* Fixed typo */}
                            <td className="p-1">{item.Rate_5}</td>
                            <td className="p-1">{item.CGST_5}%</td>
                            <td className="p-1">{item.SGST_5}%</td>
                            <td className="p-1">{item.IGST_5}%</td>
                            <td className="p-1">{item.FINAL_RATE_5}</td>
                            <td className="p-1">{item.REVISED_QUANTITY_2}</td>
                            <td className="p-1">{item.TOTAL_VALUE_5}</td>
                            <td className="p-1">-</td>
                            <td className="p-1">{item.EXPECTED_TRANSPORT_CHARGES}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No details available for this quotation.</p>
                )}

                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleGeneratePO}
                    disabled={generateLoading || !expectedDeliveryDate || detailsLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
                  >
                    {generateLoading ? 'Generating...' : 'Generate PO'}
                  </button>
                </div>

                {pdfUrl && (
                  <div className="mt-4 text-center">
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View Generated PO PDF
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PO;