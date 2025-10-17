// import React, { useState, useEffect } from 'react';

// const MRN = () => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [detailsModalOpen, setDetailsModalOpen] = useState(false);
//   const [selectedPONumber, setSelectedPONumber] = useState('');
//   const [poDetails, setPoDetails] = useState(null);
//   const [poNumbers, setPoNumbers] = useState([]);

//   // Fetch data from the MRN API
//   const fetchRequests = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const url = `${import.meta.env.VITE_BACKEND_URL}/api/get-MRN-Data`;

//       const response = await fetch(url);
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
//       const data = await response.json();
//       if (data.success && Array.isArray(data.data)) {
//         setRequests(data.data);
//         // Extract unique PO numbers from the data
//         const uniquePONumbers = [...new Set(data.data.map(request => request.poNumber7))].filter(po => po);
//         setPoNumbers(uniquePONumbers);
//       } else {
//         throw new Error('API data is not in the expected format');
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       setError('Failed to load data.');
//       setRequests([]);
//       setPoNumbers([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Set PO details from existing requests data
//   const setPoDetailsFromRequests = () => {
//     if (selectedPONumber) {
//       const details = requests.find(request => request.poNumber7 === selectedPONumber);
//       if (details) {
//         setPoDetails(details);
//         setIsModalOpen(false); // Close PO selection modal
//         setDetailsModalOpen(true); // Open details modal
//       } else {
//         setError('No details found for the selected PO number.');
//       }
//     }
//   };

//   // Handle Create PDF API call
//   const handleCreatePDF = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/save-MRN-data`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           poNumber: selectedPONumber,
//           finalReceivedQuantity: poDetails.finalReceivedQuantity9,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log('PDF created:', data);
//       alert(`MRN created successfully! MRN Number: ${data.mrnNo}, PDF URL: ${data.pdfUrl}`);
//       setDetailsModalOpen(false);
//       setPoDetails(null);
//       setSelectedPONumber('');
//     } catch (error) {
//       console.error('Error creating PDF:', error);
//       setError('Failed to create MRN and PDF.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchRequests();
//   }, []);

//   return (
//     <div className="p-4 bg-gray-50 min-h-screen">
//       <h2 className="text-xl font-bold text-gray-800 mb-4">MRN Data</h2>

//       {/* Create MRN Button */}
//       <button
//         onClick={() => setIsModalOpen(true)}
//         className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//       >
//         Create MRN
//       </button>

//       {/* Modal for PO Selection */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-96">
//             <h3 className="text-lg font-semibold mb-4">Create MRN</h3>
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700">PO Number *</label>
//               <select
//                 value={selectedPONumber}
//                 onChange={(e) => setSelectedPONumber(e.target.value)}
//                 className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//               >
//                 <option value="">-- Select PO Number --</option>
//                 {poNumbers.map((po) => (
//                   <option key={po} value={po}>{po}</option>
//                 ))}
//               </select>
//             </div>
//             <div className="flex justify-end space-x-4">
//               <button
//                 onClick={() => setIsModalOpen(false)}
//                 className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={setPoDetailsFromRequests}
//                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//                 disabled={!selectedPONumber}
//               >
//                 Fetch Details
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modal for Material Details */}
//       {detailsModalOpen && poDetails && (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-150">
//             <h3 className="text-lg font-semibold mb-4">Create MRN</h3>
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700">PO Number *</label>
//               <select
//                 value={selectedPONumber}
//                 disabled
//                 className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100"
//               >
//                 <option value={selectedPONumber}>{selectedPONumber}</option>
//               </select>
//             </div>
//             <button
//               onClick={setPoDetailsFromRequests}
//               className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//             >
//               Fetch Details
//             </button>
//             <div className="mb-4">
//               <h4 className="text-md font-medium text-gray-700">Material Details</h4>
//               <div className="grid grid-cols-2 gap-2 mt-2">
//                 <div><strong>UID:</strong> {poDetails.UID}</div>
//                 <div><strong>Req No:</strong> {poDetails.reqNo}</div>
//                 <div><strong>Site Name:</strong> {poDetails.siteName}</div>
//                 <div><strong>Supervisor Name:</strong> {poDetails.supervisorName}</div>
//                 <div><strong>Material Type:</strong> {poDetails.materialType}</div>
//                 <div><strong>SKU Code:</strong> {poDetails.skuCode}</div>
//                 <div><strong>Material Name:</strong> {poDetails.materialName}</div>
//                 <div><strong>Revised Quantity:</strong> {poDetails.revisedQuantity}</div>
//                 <div><strong>Unit Name:</strong> {poDetails.unitName}</div>
//                 <div><strong>FINAL RECEIVED QUANTITY 9:</strong> {poDetails.finalReceivedQuantity9}</div>
//                 <div><strong>Indent Number:</strong> {poDetails.indentNumber3}</div>
//                 <div><strong>Challan Number:</strong> {poDetails.challanNumber9}</div>
//                 <div><strong>Actual Firm Name:</strong> {poDetails.vendorFirmName5}</div>
//               </div>
//             </div>
//             <div className="flex justify-end space-x-4">
//               <button
//                 onClick={() => {
//                   setDetailsModalOpen(false);
//                   setPoDetails(null);
//                   setSelectedPONumber('');
//                 }}
//                 className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleCreatePDF}
//                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//                 disabled={loading}
//               >
//                 {loading ? 'Creating...' : 'Create PDF'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Table */}
//       <div className="bg-white border border-gray-300 rounded-lg shadow-md mt-4">
//         {loading ? (
//           <div className="p-4 text-center text-gray-500">Loading...</div>
//         ) : error ? (
//           <div className="p-4 text-center text-red-500">{error}</div>
//         ) : requests.length === 0 ? (
//           <div className="p-4 text-center text-gray-500">No data available.</div>
//         ) : (
//           <div className="overflow-x-auto max-h-[60vh]">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-100 sticky top-0 z-10">
//                 <tr>
//                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">UID</th>
//                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Req No</th>
//                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Site Name</th>
//                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Supervisor</th>
//                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Material Type</th>
//                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">SKU</th>
//                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Material Name</th>
//                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Unit</th>
//                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Revised Quantity</th>
//                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Received Qty</th>
//                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Indent Number</th>
//                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">PO Number</th>
//                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">PDF URL 3</th>
//                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">PDF URL 5</th>
//                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">PDF URL 7</th>
//                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Vendor Firm Name</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {requests.map((request, index) => (
//                   <tr key={`${request.UID}-${index}`} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
//                     <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.UID}</td>
//                     <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.reqNo}</td>
//                     <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
//                       <div  title={request.siteName}>{request.siteName}</div>
//                     </td>
//                     <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.supervisorName}</td>
//                     <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.materialType}</td>
//                     <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.skuCode}</td>
//                     <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
//                       <div  title={request.materialName}>{request.materialName}</div>
//                     </td>
//                     <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.unitName}</td>
//                     <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200 text-right">{request.revisedQuantity}</td>
//                     <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200 text-right">{request.finalReceivedQuantity9}</td>
//                     <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.indentNumber3}</td>
//                     <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.poNumber7}</td>
//                     <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
//                       {request.pdfUrl3 ? (
//                         <a href={request.pdfUrl3} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
//                           View PDF
//                         </a>
//                       ) : (
//                         'N/A'
//                       )}
//                     </td>
//                     <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
//                       {request.pdfUrl5 ? (
//                         <a href={request.pdfUrl5} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
//                           View PDF
//                         </a>
//                       ) : (
//                         'N/A'
//                       )}
//                     </td>
//                     <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
//                       {request.pdfUrl7 ? (
//                         <a href={request.pdfUrl7} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
//                           View PDF
//                         </a>
//                       ) : (
//                         'N/A'
//                       )}
//                     </td>
//                     <td className="px-4 py-2 text-sm text-gray-800">{request.vendorFirmName5}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MRN;






import React, { useState, useEffect } from 'react';

const MRN = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedPONumber, setSelectedPONumber] = useState('');
  const [poDetails, setPoDetails] = useState(null);
  const [poNumbers, setPoNumbers] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null); // New state for PDF URL
  const [showSuccessBox, setShowSuccessBox] = useState(false); // New state for success box

  // Fetch data from the MRN API
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/get-MRN-Data`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setRequests(data.data);
        // Extract unique PO numbers from the data
        const uniquePONumbers = [...new Set(data.data.map(request => request.poNumber7))].filter(po => po);
        setPoNumbers(uniquePONumbers);
      } else {
        throw new Error('API data is not in the expected format');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data.');
      setRequests([]);
      setPoNumbers([]);
    } finally {
      setLoading(false);
    }
  };

  // Set PO details from existing requests data
  const setPoDetailsFromRequests = () => {
    if (selectedPONumber) {
      const details = requests.find(request => request.poNumber7 === selectedPONumber);
      if (details) {
        setPoDetails(details);
        setIsModalOpen(false); // Close PO selection modal
        setDetailsModalOpen(true); // Open details modal
      } else {
        setError('No details found for the selected PO number.');
      }
    }
  };

  // Share function
  const handleShare = async (url) => {
    if (!url) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MRN PDF',
          text: 'Here is the generated MRN PDF.',
          url: url,
        });
        console.log('Shared natively');
        return;
      } catch (err) {
        console.warn('Native share failed, falling back', err);
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      alert('PDF URL copied to clipboard!');
    } catch (err) {
      alert('Could not copy URL. Please copy it manually.');
    }
  };

  // Handle Create PDF API call
  const handleCreatePDF = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/save-MRN-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          poNumber: selectedPONumber,
          finalReceivedQuantity: poDetails.finalReceivedQuantity9,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('PDF created:', data);
      if (data.pdfUrl) {
        setPdfUrl(data.pdfUrl); // Store the PDF URL
        setShowSuccessBox(true); // Show the success box
        setDetailsModalOpen(false); // Close details modal
        setPoDetails(null);
        setSelectedPONumber('');
        // Fetch updated data
        await fetchRequests();
      } else {
        throw new Error('No PDF URL returned');
      }
    } catch (error) {
      console.error('Error creating PDF:', error);
      setError('Failed to create MRN and PDF.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h2 className="text-xl font-bold text-gray-800 mb-4">MRN Data</h2>

      {/* Create MRN Button */}
      <button
        onClick={() => {
          setIsModalOpen(true);
          setShowSuccessBox(false); // Reset success box on new create
          setPdfUrl(null); // Reset PDF URL
        }}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Create MRN
      </button>

      {/* Success Box - Shown after successful MRN generation */}
      {showSuccessBox && pdfUrl && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">MRN Generated Successfully!</h3>
          <div className="flex items-center space-x-4">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View PDF
            </a>
            <button
              onClick={() => handleShare(pdfUrl)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Share
            </button>
          </div>
          <button
            onClick={() => setShowSuccessBox(false)}
            className="mt-2 text-sm text-gray-600 hover:underline"
          >
            Close
          </button>
        </div>
      )}

      {/* Modal for PO Selection */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Create MRN</h3>
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

      {/* Modal for Material Details */}
      {detailsModalOpen && poDetails && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-150">
            <h3 className="text-lg font-semibold mb-4">Create MRN</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">PO Number *</label>
              <select
                value={selectedPONumber}
                disabled
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100"
              >
                <option value={selectedPONumber}>{selectedPONumber}</option>
              </select>
            </div>
            <button
              onClick={setPoDetailsFromRequests}
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Fetch Details
            </button>
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-700">Material Details</h4>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div><strong>UID:</strong> {poDetails.UID}</div>
                <div><strong>Req No:</strong> {poDetails.reqNo}</div>
                <div><strong>Site Name:</strong> {poDetails.siteName}</div>
                <div><strong>Supervisor Name:</strong> {poDetails.supervisorName}</div>
                <div><strong>Material Type:</strong> {poDetails.materialType}</div>
                <div><strong>SKU Code:</strong> {poDetails.skuCode}</div>
                <div><strong>Material Name:</strong> {poDetails.materialName}</div>
                <div><strong>Revised Quantity:</strong> {poDetails.revisedQuantity}</div>
                <div><strong>Unit Name:</strong> {poDetails.unitName}</div>
                <div><strong>FINAL RECEIVED QUANTITY 9:</strong> {poDetails.finalReceivedQuantity9}</div>
                <div><strong>Indent Number:</strong> {poDetails.indentNumber3}</div>
                <div><strong>Challan Number:</strong> {poDetails.challanNumber9}</div>
                <div><strong>Actual Firm Name:</strong> {poDetails.vendorFirmName5}</div>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  setPoDetails(null);
                  setSelectedPONumber('');
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePDF}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create PDF'}
              </button>
            </div>
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
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">UID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Req No</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Site Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Supervisor</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Material Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">SKU</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Material Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Unit</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Revised Quantity</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Received Qty</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Indent Number</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">PO Number</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">PDF URL 3</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">PDF URL 5</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">PDF URL 7</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Vendor Firm Name</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request, index) => (
                  <tr key={`${request.UID}-${index}`} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.UID}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.reqNo}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                      <div title={request.siteName}>{request.siteName}</div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.supervisorName}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.materialType}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.skuCode}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                      <div title={request.materialName}>{request.materialName}</div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.unitName}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200 text-right">{request.revisedQuantity}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200 text-right">{request.finalReceivedQuantity9}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.indentNumber3}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{request.poNumber7}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                      {request.pdfUrl3 ? (
                        <a href={request.pdfUrl3} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View PDF
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                      {request.pdfUrl5 ? (
                        <a href={request.pdfUrl5} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View PDF
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                      {request.pdfUrl7 ? (
                        <a href={request.pdfUrl7} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View PDF
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800">{request.vendorFirmName5}</td>
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

export default MRN;