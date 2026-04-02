
// import React, { useState, useEffect } from 'react';

// const PO = () => {
//   const [requests, setRequests] = useState([]);
//   const [supervisors, setSupervisors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [step, setStep] = useState(1);
//   const [selectedQuotation, setSelectedQuotation] = useState('');
//   const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [detailsLoading, setDetailsLoading] = useState(false);
//   const [generateLoading, setGenerateLoading] = useState(false);
//   const [pdfUrl, setPdfUrl] = useState(null);
//   const [showSuccessBox, setShowSuccessBox] = useState(false);

//   useEffect(() => {
//     const fetchRequests = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/get-po-data`);
//         if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
//         const data = await response.json();
//         if (data && Array.isArray(data.data)) {
//           setRequests(data.data);
//         } else {
//           throw new Error('Invalid data format');
//         }
//       } catch (error) {
//         console.error('Error fetching requests:', error);
//         setError('Data not available');
//         setRequests([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     const fetchSupervisors = async () => {
//       try {
//         const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/get-othersheet-data`);
//         if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
//         const data = await response.json();
//         setSupervisors(data);
//       } catch (error) {
//         console.error('Error fetching supervisors:', error);
//         setSupervisors([]);
//       }
//     };

//     fetchRequests();
//     fetchSupervisors();
//   }, []);

//   const uniqueQuotations = [...new Set(requests.map(r => r.QUOTATION_NO_5).filter(Boolean))];

//   const handleNext = () => {
//     if (selectedQuotation) {
//       setDetailsLoading(true);
//       const items = requests.filter(r => r.QUOTATION_NO_5 === selectedQuotation);
//       setSelectedItems(items);
//       setStep(2);
//       setDetailsLoading(false);
//     }
//   };

//   const handleGeneratePO = async () => {
//     if (!expectedDeliveryDate || !selectedItems.length) {
//       alert('Please fill in all required fields.');
//       return;
//     }

//     setGenerateLoading(true);

//     const siteName = selectedItems[0]?.Site_Name || 'N/A';
//     const supervisorNameFromExcel = selectedItems[0]?.Site_Location || 'N/A';

//     const matchedSupervisor = supervisors.find(s =>
//       String(s.Site_Name || '').trim() === String(siteName).trim()
//     );

//     const supervisorName = matchedSupervisor?.Supervisor || supervisorNameFromExcel;
//     const supervisorContact = matchedSupervisor?.Contact_No || '-';
//     const siteLocation = matchedSupervisor?.Site_Location || '-';
//     const finalSiteLocation = siteLocation !== '-' ? siteLocation : 'Not Available';

//     const poData = {
//       quotationNo: selectedQuotation,
//       expectedDeliveryDate,
//       items: selectedItems.map(item => ({
//         uid: item.UID,
//         materialName: item.Material_Name,
//         remark: item.Remark5 ? String(item.Remark5).trim() : '',
//         vendorFirm: item.Vendor_Firm_Name_5 || 'N/A',
//         rate: item.Rate_5,
//         discount: item.DISCOUNT_5 || '0',
//         cgst: item.CGST_5,
//         sgst: item.SGST_5,
//         igst: item.IGST_5,
//         finalRate: item.FINAL_RATE_5,
//         quantity: item.REVISED_QUANTITY_2,
//         unit: item.Unit_Name,
//         totalValue: item.TOTAL_VALUE_5,
//         transportRequired: item.IS_TRANSPORT_REQUIRED,
//         expectedTransport: item.EXPECTED_TRANSPORT_CHARGES,
//         indentNo: item.INDENT_NUMBER_3,
//       })),
//       siteName,
//       siteLocation: finalSiteLocation,
//       supervisorName,
//       supervisorContact,
//       vendorName: selectedItems[0]?.Vendor_Firm_Name_5 || 'N/A',
//       vendorAddress: selectedItems[0]?.Vendor_Address_5 || 'N/A',
//       vendorGST: selectedItems[0]?.Vendor_GST_No_5 || 'N/A',
//       vendorContact: selectedItems[0]?.Vendor_Contact_5 || 'N/A',
//     };

//     console.log(poData)
//     try {
//       const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/create-po`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(poData),
//       });

//       if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
//       const result = await response.json();

//       if (result.pdfUrl) {
//         setPdfUrl(result.pdfUrl);
//         setShowModal(false);
//         setSelectedQuotation('');
//         setExpectedDeliveryDate('');
//         setSelectedItems([]);
//         setShowSuccessBox(true);

//         // Refresh data
//         const refresh = async () => {
//           try {
//             setLoading(true);
//             const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/get-po-data`);
//             if (!res.ok) throw new Error('Network error');
//             const data = await res.json();
//             if (data && Array.isArray(data.data)) setRequests(data.data);
//           } catch (err) {
//             setError('Failed to refresh');
//           } finally {
//             setLoading(false);
//           }
//         };
//         await refresh();
//       }
//     } catch (error) {
//       console.error('Error generating PO:', error);
//       alert('Failed to generate PO.');
//     } finally {
//       setGenerateLoading(false);
//     }
//   };

//   const handleShare = async (url) => {
//     if (!url) return;
//     if (navigator.share) {
//       try {
//         await navigator.share({ title: 'PO PDF', text: 'Here is the PO.', url });
//         return;
//       } catch (err) { /* fallback */ }
//     }
//     try {
//       await navigator.clipboard.writeText(url);
//       alert('PDF URL copied!');
//     } catch (err) {
//       alert('Copy failed. Copy manually.');
//     }
//   };

//   return (
//     <div className="p-4 bg-gray-50 min-h-screen">
//       <div className="mb-4">
//         <button
//           onClick={() => {
//             setShowModal(true);
//             setStep(1);
//             setSelectedQuotation('');
//             setExpectedDeliveryDate('');
//             setSelectedItems([]);
//             setPdfUrl(null);
//             setShowSuccessBox(false);
//           }}
//           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//         >
//           Create PO
//         </button>
//       </div>

//       {showSuccessBox && pdfUrl && (
//         <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow-md">
//           <h3 className="text-lg font-semibold mb-2">PO Generated Successfully!</h3>
//           <div className="flex items-center space-x-4">
//             <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
//               View PDF
//             </a>
//             <button onClick={() => handleShare(pdfUrl)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
//               Share
//             </button>
//           </div>
//           <button onClick={() => setShowSuccessBox(false)} className="mt-2 text-sm text-gray-600 hover:underline">
//             Close
//           </button>
//         </div>
//       )}

//       {/* Main Table - unchanged */}
//       <div className="bg-white border border-gray-300 rounded shadow-sm">
//         {/* ... your existing table code remains exactly the same ... */}
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto relative">
//             <button onClick={() => setShowModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl">×</button>

//             {step === 1 && (
//               <>
//                 <h2 className="text-lg font-semibold mb-4">Select Quotation Number</h2>
//                 <label className="block mb-2 text-sm text-gray-700">Quotation Number *</label>
//                 <select
//                   value={selectedQuotation}
//                   onChange={(e) => setSelectedQuotation(e.target.value)}
//                   className="w-full p-2 border border-blue-500 rounded mb-4"
//                 >
//                   <option>-- Select Quotation Number --</option>
//                   {uniqueQuotations.map((q) => (
//                     <option key={q} value={q}>{q}</option>
//                   ))}
//                 </select>
//                 <div className="flex justify-end">
//                   <button onClick={handleNext} disabled={!selectedQuotation} className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400">
//                     Next
//                   </button>
//                 </div>
//               </>
//             )}

//             {step === 2 && (
//               <>
//                 <h2 className="text-lg font-semibold mb-4">Purchase Order Details</h2>
//                 <label className="block mb-2 text-sm text-gray-700">Expected Delivery Date *</label>
//                 <input
//                   type="date"
//                   value={expectedDeliveryDate}
//                   onChange={(e) => setExpectedDeliveryDate(e.target.value)}
//                   className="w-full p-2 border border-gray-300 rounded mb-4"
//                 />

//                 {detailsLoading ? (
//                   <div className="flex items-center justify-center mb-4">
//                     <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
//                     <p className="text-gray-600">Loading PO details...</p>
//                   </div>
//                 ) : selectedItems.length > 0 ? (
//                   selectedItems.map((item, index) => (
//                     <div key={index} className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
//                       <h3 className="font-semibold mb-2 text-gray-800">
//                         Material: {item.Material_Name} (UID: {item.UID})
//                       </h3>
//                       {item.Remark5 && (
//                         <p className="text-xs text-gray-600 italic mb-3 bg-gray-100 px-2 py-1 rounded">
//                           Remark: {item.Remark5}
//                         </p>
//                       )}
//                       <table className="w-full text-sm border border-gray-300">
//                         <thead className="bg-gray-200">
//                           <tr className="text-left text-gray-700">
//                             <th className="p-2">VENDOR FIRM</th>
//                             <th className="p-2">RATE</th>
//                             <th className="p-2">CGST</th>
//                             <th className="p-2">SGST</th>
//                             <th className="p-2">IGST</th>
//                             <th className="p-2">FINAL RATE</th>
//                             <th className="p-2">QTY</th>
//                             <th className="p-2">TOTAL VALUE</th>
//                             <th className="p-2">TRANSPORT</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           <tr className="bg-white">
//                             <td className="p-2">{item.Vendor_Firm_Name_5}</td>
//                             <td className="p-2">{item.Rate_5}</td>
//                             <td className="p-2">{item.CGST_5}%</td>
//                             <td className="p-2">{item.SGST_5}%</td>
//                             <td className="p-2">{item.IGST_5}%</td>
//                             <td className="p-2">{item.FINAL_RATE_5}</td>
//                             <td className="p-2">{item.REVISED_QUANTITY_2}</td>
//                             <td className="p-2">{item.TOTAL_VALUE_5}</td>
//                             <td className="p-2">{item.EXPECTED_TRANSPORT_CHARGES}</td>
//                           </tr>
//                         </tbody>
//                       </table>
//                     </div>
//                   ))
//                 ) : (
//                   <p className="text-gray-500">No details available.</p>
//                 )}

//                 <div className="flex justify-between mt-6">
//                   <button onClick={() => setStep(1)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded">
//                     Previous
//                   </button>
//                   <button
//                     onClick={handleGeneratePO}
//                     disabled={generateLoading || !expectedDeliveryDate}
//                     className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
//                   >
//                     {generateLoading ? 'Generating...' : 'Generate PO'}
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PO;




////// PO PDF Update 






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
  const [showSuccessBox, setShowSuccessBox] = useState(false);

  // ===== ADMIN STATES (NEW) =====
  const [activeTab, setActiveTab] = useState('create');
  const [isAdmin, setIsAdmin] = useState(() => {
    const userType = localStorage.getItem('userType');
    console.log('userType from localStorage:', userType);
    return userType === 'admin' || userType === 'Admin' || userType === 'ADMIN';
  });
  const [adminGrouped, setAdminGrouped] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [poSearch, setPoSearch] = useState('');

  // ===== CHECK ADMIN FROM LOCALSTORAGE =====
  useEffect(() => {
    const userType = localStorage.getItem('userType');
    console.log('useEffect userType:', userType);
    setIsAdmin(userType === 'admin' || userType === 'Admin' || userType === 'ADMIN');
  }, []);

  // ===== EXISTING FETCH (UNCHANGED) =====
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/get-po-data`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        if (data && Array.isArray(data.data)) {
          setRequests(data.data);
        } else {
          throw new Error('Invalid data format');
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
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/get-othersheet-data`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setSupervisors(data);
      } catch (error) {
        console.error('Error fetching supervisors:', error);
        setSupervisors([]);
      }
    };

    fetchRequests();
    fetchSupervisors();
  }, []);

  // ===== ADMIN: FETCH PO DATA (NEW) =====
  const fetchAdminPOs = async () => {
    setAdminLoading(true);
    setUpdateSuccess(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/get-po-data-admin`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setAdminGrouped(data.grouped || []);
    } catch (error) {
      console.error('Error fetching admin PO data:', error);
      setAdminGrouped([]);
    } finally {
      setAdminLoading(false);
    }
  };

  // Jab Edit tab pe aaye toh fetch karo
  useEffect(() => {
    if (activeTab === 'edit' && isAdmin) {
      fetchAdminPOs();
    }
  }, [activeTab, isAdmin]);

  // ===== ADMIN: UPDATE PO PDF (NEW) =====
  const handleUpdatePO = async (poNumber) => {
    if (!confirm(`Kya aap sure hai ki "${poNumber}" ka PDF update karna hai?\nSheet mein rates pehle update kar liye ho?`)) {
      return;
    }

    setUpdateLoading(true);
    setUpdateSuccess(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/update-po-pdf`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poNumber }),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const result = await response.json();

      setUpdateSuccess({
        poNumber,
        newPdfUrl: result.newPdfUrl,
        message: result.message,
      });

      // Refresh admin data
      await fetchAdminPOs();
    } catch (error) {
      console.error('Error updating PO:', error);
      alert('Failed to update PO PDF: ' + error.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  // ===== EXISTING HANDLERS (UNCHANGED) =====
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

    const siteName = selectedItems[0]?.Site_Name || 'N/A';
    const supervisorNameFromExcel = selectedItems[0]?.Site_Location || 'N/A';

    const matchedSupervisor = supervisors.find(s =>
      String(s.Site_Name || '').trim() === String(siteName).trim()
    );

    const supervisorName = matchedSupervisor?.Supervisor || supervisorNameFromExcel;
    const supervisorContact = matchedSupervisor?.Contact_No || '-';
    const siteLocation = matchedSupervisor?.Site_Location || '-';
    const finalSiteLocation = siteLocation !== '-' ? siteLocation : 'Not Available';

    const poData = {
      quotationNo: selectedQuotation,
      expectedDeliveryDate,
      items: selectedItems.map(item => ({
        uid: item.UID,
        materialName: item.Material_Name,
        remark: item.Remark5 ? String(item.Remark5).trim() : '',
        vendorFirm: item.Vendor_Firm_Name_5 || 'N/A',
        rate: item.Rate_5,
        discount: item.DISCOUNT_5 || '0',
        cgst: item.CGST_5,
        sgst: item.SGST_5,
        igst: item.IGST_5,
        finalRate: item.FINAL_RATE_5,
        quantity: item.REVISED_QUANTITY_2,
        unit: item.Unit_Name,
        totalValue: item.TOTAL_VALUE_5,
        transportRequired: item.IS_TRANSPORT_REQUIRED,
        expectedTransport: item.EXPECTED_TRANSPORT_CHARGES,
        indentNo: item.INDENT_NUMBER_3,
      })),
      siteName,
      siteLocation: finalSiteLocation,
      supervisorName,
      supervisorContact,
      vendorName: selectedItems[0]?.Vendor_Firm_Name_5 || 'N/A',
      vendorAddress: selectedItems[0]?.Vendor_Address_5 || 'N/A',
      vendorGST: selectedItems[0]?.Vendor_GST_No_5 || 'N/A',
      vendorContact: selectedItems[0]?.Vendor_Contact_5 || 'N/A',
    };

    console.log(poData);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/create-po`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poData),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const result = await response.json();

      if (result.pdfUrl) {
        setPdfUrl(result.pdfUrl);
        setShowModal(false);
        setSelectedQuotation('');
        setExpectedDeliveryDate('');
        setSelectedItems([]);
        setShowSuccessBox(true);

        // Refresh data
        const refresh = async () => {
          try {
            setLoading(true);
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/get-po-data`);
            if (!res.ok) throw new Error('Network error');
            const data = await res.json();
            if (data && Array.isArray(data.data)) setRequests(data.data);
          } catch (err) {
            setError('Failed to refresh');
          } finally {
            setLoading(false);
          }
        };
        await refresh();
      }
    } catch (error) {
      console.error('Error generating PO:', error);
      alert('Failed to generate PO.');
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleShare = async (url) => {
    if (!url) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'PO PDF', text: 'Here is the PO.', url });
        return;
      } catch (err) { /* fallback */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      alert('PDF URL copied!');
    } catch (err) {
      alert('Copy failed. Copy manually.');
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">

      {/* ========== TAB BUTTONS ========== */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 rounded font-semibold transition-colors ${
            activeTab === 'create'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Create PO
        </button>

        {/* Edit PO tab sirf Admin ko dikhega */}
        {isAdmin && (
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              activeTab === 'edit'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Edit PO
          </button>
        )}
      </div>

      {/* ========== CREATE PO TAB (EVERYONE) ========== */}
      {activeTab === 'create' && (
        <>
          <div className="mb-4">
            <button
              onClick={() => {
                setShowModal(true);
                setStep(1);
                setSelectedQuotation('');
                setExpectedDeliveryDate('');
                setSelectedItems([]);
                setPdfUrl(null);
                setShowSuccessBox(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create PO
            </button>
          </div>

          {showSuccessBox && pdfUrl && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">PO Generated Successfully!</h3>
              <div className="flex items-center space-x-4">
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  View PDF
                </a>
                <button onClick={() => handleShare(pdfUrl)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  Share
                </button>
              </div>
              <button onClick={() => setShowSuccessBox(false)} className="mt-2 text-sm text-gray-600 hover:underline">
                Close
              </button>
            </div>
          )}

          {/* Main Table - your existing table code goes here */}
          <div className="bg-white border border-gray-300 rounded shadow-sm">
            {/* ... your existing table code remains exactly the same ... */}
          </div>
        </>
      )}

      {/* ========== EDIT PO TAB (NEW - ADMIN ONLY) ========== */}
      {activeTab === 'edit' && isAdmin && (
        <div>
          {/* Update Success Message */}
          {updateSuccess && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg">{updateSuccess.poNumber} - PDF Updated Successfully!</h3>
              <p className="text-sm mt-1">{updateSuccess.message}</p>
              <div className="flex items-center gap-3 mt-3">
                <a
                  href={updateSuccess.newPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  View New PDF
                </a>
                <button
                  onClick={() => handleShare(updateSuccess.newPdfUrl)}
                  className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Share
                </button>
                <button
                  onClick={() => setUpdateSuccess(null)}
                  className="text-sm text-gray-500 hover:underline"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Header + Refresh */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Last 2 Months - Purchase Orders</h2>
            <button
              onClick={fetchAdminPOs}
              disabled={adminLoading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              {adminLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Pehle Google Sheet mein rate/price update karo, fir yahan se "Update PDF" click karo. Naya PDF banega same PO number ke saath.
          </p>

          {/* PO Number Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search PO Number... (e.g. PO_777)"
              value={poSearch}
              onChange={(e) => setPoSearch(e.target.value)}
              className="w-full sm:w-80 p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Admin PO List */}
          {adminLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mr-3"></div>
              <p className="text-gray-600">Loading PO data...</p>
            </div>
          ) : adminGrouped.filter(po => po.poNumber.toLowerCase().includes(poSearch.toLowerCase())).length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 text-lg">{poSearch ? `No PO found for "${poSearch}"` : 'No POs found in last 2 months.'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {adminGrouped.filter(po => po.poNumber.toLowerCase().includes(poSearch.toLowerCase())).map((po, idx) => (
                <div key={idx} className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
                  {/* PO Header - Click to expand */}
                  <div
                    className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedPO(selectedPO === po.poNumber ? null : po.poNumber)}
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-0">
                      <span className="font-bold text-blue-700 text-lg">{po.poNumber}</span>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {po.quotationNo}
                      </span>
                      <span className="text-sm text-gray-600">{po.siteName}</span>
                      <span className="text-sm text-gray-500">| {po.vendorName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {po.pdfUrl && (
                        <a
                          href={po.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                        >
                          View Current PDF
                        </a>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdatePO(po.poNumber);
                        }}
                        disabled={updateLoading}
                        className="px-3 py-1.5 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 disabled:bg-gray-400 transition-colors"
                      >
                        {updateLoading ? 'Updating...' : 'Update PDF'}
                      </button>
                      <span className="text-gray-400 text-lg ml-1">
                        {selectedPO === po.poNumber ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {/* PO Items - Expandable Detail */}
                  {selectedPO === po.poNumber && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <span><strong>Items:</strong> {po.items.length}</span>
                        <span><strong>Delivery Date:</strong> {po.deliveryDate || 'N/A'}</span>
                        <span><strong>Vendor:</strong> {po.vendorName}</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-gray-300">
                          <thead className="bg-gray-200">
                            <tr className="text-left text-gray-700">
                              <th className="p-2 border">#</th>
                              <th className="p-2 border">UID</th>
                              <th className="p-2 border">Material Name</th>
                              <th className="p-2 border">Qty</th>
                              <th className="p-2 border">Unit</th>
                              <th className="p-2 border">Rate</th>
                              <th className="p-2 border">Discount</th>
                              <th className="p-2 border">CGST</th>
                              <th className="p-2 border">SGST</th>
                              <th className="p-2 border">IGST</th>
                              <th className="p-2 border">Final Rate</th>
                              <th className="p-2 border">Total Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {po.items.map((item, i) => (
                              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="p-2 border text-center">{i + 1}</td>
                                <td className="p-2 border">{item.UID}</td>
                                <td className="p-2 border">
                                  {item.Material_Name}
                                  {item.Remark5 && (
                                    <div className="text-xs text-gray-500 italic mt-1">({item.Remark5})</div>
                                  )}
                                </td>
                                <td className="p-2 border text-center">{item.REVISED_QUANTITY_2}</td>
                                <td className="p-2 border text-center">{item.Unit_Name}</td>
                                <td className="p-2 border text-right font-semibold text-blue-700">{item.Rate_5}</td>
                                <td className="p-2 border text-center">{item.DISCOUNT_5 || '0'}%</td>
                                <td className="p-2 border text-center">{item.CGST_5}%</td>
                                <td className="p-2 border text-center">{item.SGST_5}%</td>
                                <td className="p-2 border text-center">{item.IGST_5}%</td>
                                <td className="p-2 border text-right">{item.FINAL_RATE_5}</td>
                                <td className="p-2 border text-right font-semibold">{item.TOTAL_VALUE_5}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700">
                        <strong>Note:</strong> Pehle Google Sheet mein rate/price update karo, fir "Update PDF" button click karo.
                        Naya PDF banega same PO number ({po.poNumber}) ke saath. Purani PDF Drive pe safe rahegi.
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========== CREATE PO MODAL (EXISTING - UNCHANGED) ========== */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto relative">
            <button onClick={() => setShowModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl">×</button>

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
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
                <div className="flex justify-end">
                  <button onClick={handleNext} disabled={!selectedQuotation} className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400">
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
                    <div key={index} className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="font-semibold mb-2 text-gray-800">
                        Material: {item.Material_Name} (UID: {item.UID})
                      </h3>
                      {item.Remark5 && (
                        <p className="text-xs text-gray-600 italic mb-3 bg-gray-100 px-2 py-1 rounded">
                          Remark: {item.Remark5}
                        </p>
                      )}
                      <table className="w-full text-sm border border-gray-300">
                        <thead className="bg-gray-200">
                          <tr className="text-left text-gray-700">
                            <th className="p-2">VENDOR FIRM</th>
                            <th className="p-2">RATE</th>
                            <th className="p-2">CGST</th>
                            <th className="p-2">SGST</th>
                            <th className="p-2">IGST</th>
                            <th className="p-2">FINAL RATE</th>
                            <th className="p-2">QTY</th>
                            <th className="p-2">TOTAL VALUE</th>
                            <th className="p-2">TRANSPORT</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white">
                            <td className="p-2">{item.Vendor_Firm_Name_5}</td>
                            <td className="p-2">{item.Rate_5}</td>
                            <td className="p-2">{item.CGST_5}%</td>
                            <td className="p-2">{item.SGST_5}%</td>
                            <td className="p-2">{item.IGST_5}%</td>
                            <td className="p-2">{item.FINAL_RATE_5}</td>
                            <td className="p-2">{item.REVISED_QUANTITY_2}</td>
                            <td className="p-2">{item.TOTAL_VALUE_5}</td>
                            <td className="p-2">{item.EXPECTED_TRANSPORT_CHARGES}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No details available.</p>
                )}

                <div className="flex justify-between mt-6">
                  <button onClick={() => setStep(1)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded">
                    Previous
                  </button>
                  <button
                    onClick={handleGeneratePO}
                    disabled={generateLoading || !expectedDeliveryDate}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
                  >
                    {generateLoading ? 'Generating...' : 'Generate PO'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PO;