import React, { useState, useEffect, useRef } from 'react';
import { FaPencilAlt, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';

const Material_Received = () => {
  const [siteNames, setSiteNames] = useState([]);
  const [supervisorNames, setSupervisorNames] = useState([]);
  const [selectedSiteName, setSelectedSiteName] = useState('');
  const [selectedSupervisorName, setSelectedSupervisorName] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [receivedQuantity, setReceivedQuantity] = useState('');
  const [materialStatus, setMaterialStatus] = useState('');
  const [qualityCheck, setQualityCheck] = useState('');
  const [challanNo, setChallanNo] = useState('');
  const [truckDelivery, setTruckDelivery] = useState('');
  const [googleFormCompleted, setGoogleFormCompleted] = useState('');
  const [photoData, setPhotoData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false); // New state to track camera readiness
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/dropdowns`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setSiteNames(data.siteNames || []);
        setSupervisorNames(data.supervisorNames || []);
      } catch (error) {
        console.error('Error fetching dropdowns:', error);
        setError('Failed to load dropdown data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDropdowns();
  }, []);

  // Handle filter button click
  const handleFilter = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = new URL(`${import.meta.env.VITE_BACKEND_URL}/api/get-material-received-filter-data`);
      if (selectedSiteName) url.searchParams.append('siteName', selectedSiteName);
      if (selectedSupervisorName) url.searchParams.append('supervisorName', selectedSupervisorName);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setRequests(data.data);
      } else {
        throw new Error('API data is not in the expected format');
      }
    } catch (error) {
      console.error('Error fetching filtered data:', error);
      setError('Failed to load filtered data.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Open modal
  const openModal = (request) => {
    setSelectedRequest(request);
    setReceivedQuantity(request.totalReceivedQuantity || '');
    setMaterialStatus('');
    setQualityCheck('');
    setChallanNo('');
    setTruckDelivery('');
    setGoogleFormCompleted('');
    setPhotoData(null);
    setSelectedFile(null);
    setIsModalOpen(true);
    setShowSuccess(false);
    setError(null);
    setIsCameraReady(false); // Reset camera readiness
  };

  // Close modal and stop camera
  const closeModal = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsModalOpen(false);
    setSelectedRequest(null);
    setIsSaving(false);
    setShowSuccess(false);
  };

  // Start camera with specified facing mode
  const startCamera = async (facingMode) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: facingMode } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for the video to be ready (loadeddata event)
        videoRef.current.addEventListener('loadeddata', () => {
          setIsCameraReady(true);
        }, { once: true });
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      setError('Failed to access camera. Please allow camera permissions and ensure a camera is connected.');
      setIsCameraReady(false);
    }
  };

  // Capture photo
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && streamRef.current && isCameraReady) {
      const context = canvasRef.current.getContext('2d');
      if (context && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setPhotoData(dataUrl);
        setSelectedFile(null);

        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        videoRef.current.srcObject = null;
        setIsCameraReady(false);
      } else {
        setError('Video frame not ready. Please wait and try again.');
      }
    } else {
      setError('Camera not ready. Please start the camera first.');
    }
  };

 

  // Validate required fields
  const validate = () => {
    if (!receivedQuantity || !materialStatus || !qualityCheck || !challanNo || !truckDelivery || !photoData) {
      return false;
    }
    if (truckDelivery === 'Yes' && !googleFormCompleted) {
      return false;
    }
    return true;
  };

  // Handle save
  const handleSave = async () => {
    if (!validate()) {
      setError('Please fill all required fields.');
      return;
    }

    const payload = {
      uid: selectedRequest.uid,
      reqNo: selectedRequest.reqNo,
      siteName: selectedRequest.siteName,
      supervisorName: selectedRequest.supervisorName || '',
      materialType: selectedRequest.materialType,
      skuCode: selectedRequest.skuCode,
      materialName: selectedRequest.materialName,
      unitName: selectedRequest.unitName,
      receivedQty: receivedQuantity,
      status: materialStatus,
      challanNo,
      qualityApproved: qualityCheck,
      truckDelivery,
      googleFormCompleted,
      photo: photoData,
      vendorName: selectedRequest.vendorName || '' // Added vendorName to payload
    };

    try {
      setIsSaving(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/save-material-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save receipt');
      }

      setShowSuccess(true);
      const updatedRequests = requests.map((req) =>
        req.uid === selectedRequest.uid
          ? {
              ...req,
              totalReceivedQuantity: receivedQuantity,
            }
          : req
      );
      setRequests(updatedRequests);

      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (error) {
      console.error('Error saving data:', error.message);
      setError(`Data not available`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header and Filter Inputs */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Material Received</h2>
        <p className="text-gray-600 text-sm">Filter and record material received data.</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Site Name</label>
          <select
            value={selectedSiteName}
            onChange={(e) => setSelectedSiteName(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
          >
            <option value="">Select Site Name</option>
            {siteNames.map((site, index) => (
              <option key={index} value={site}>{site}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Supervisor Name</label>
          <select
            value={selectedSupervisorName}
            onChange={(e) => setSelectedSupervisorName(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
          >
            <option value="">Select Supervisor Name</option>
            {supervisorNames.map((supervisor, index) => (
              <option key={index} value={supervisor}>{supervisor}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={handleFilter}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Filtering...
              </>
            ) : (
              'Filter'
            )}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-300 rounded shadow-sm">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : requests.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No data available. Please apply filters.</div>
        ) : (
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">UID</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">Req No</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">Site Name</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">Supervisor Name</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">Vendor Name</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">Material Type</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">SKU Code</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">Material Name</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">Unit Name</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">Total Received Quantity</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request, index) => (
                  <tr key={request.uid} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.uid}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.reqNo}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">
                      <div  title={request.siteName}>{request.siteName}</div>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.supervisorName}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.vendorName}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.materialType}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.skuCode}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">
                      <div  title={request.materialName}>{request.materialName}</div>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200">{request.unitName}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 border-r border-gray-200 text-right">{request.totalReceivedQuantity}</td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => openModal(request)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-all duration-200"
                        title="Record Receipt"
                      >
                        <FaPencilAlt size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Record Material Receipt */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold text-white flex items-center">
                  <FaPencilAlt className="mr-2" />
                  Record Material Receipt
                </h4>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200"
                  disabled={isSaving}
                >
                  <FaTimes size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body with Scroll */}
            <div className="px-6 py-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Success Message */}
              {showSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                  <FaCheck className="text-green-600 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-green-800 font-medium">Success!</p>
                    <p className="text-green-700 text-sm">Receipt has been saved successfully.</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <FaTimes className="text-red-600 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 font-medium">Error!</p>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Received Quantity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Received Quantity *</label>
                <input
                  type="text"
                  value={receivedQuantity}
                  onChange={(e) => setReceivedQuantity(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                  placeholder="Enter received quantity"
                  disabled={isSaving}
                />
              </div>

              {/* Material Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Material Status *</label>
                <select
                  value={materialStatus}
                  onChange={(e) => setMaterialStatus(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
                  disabled={isSaving}
                >
                  <option value="">-- Select Status --</option>
                  <option value="Partition">Partition</option>
                  <option value="Full Material">Full Material</option>
                </select>
              </div>

              {/* Quality Check */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quality Check *</label>
                <select
                  value={qualityCheck}
                  onChange={(e) => setQualityCheck(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
                  disabled={isSaving}
                >
                  <option value="">-- Select Quality Check --</option>
                  <option value="Approved">Approved</option>
                  <option value="Reject">Reject</option>
                </select>
              </div>

              {/* Challan No */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Challan No *</label>
                <input
                  type="text"
                  value={challanNo}
                  onChange={(e) => setChallanNo(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                  placeholder="Enter Challan No"
                  disabled={isSaving}
                />
              </div>

              {/* If the Truck Delivery */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">If the Truck Delivery *</label>
                <select
                  value={truckDelivery}
                  onChange={(e) => setTruckDelivery(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
                  disabled={isSaving}
                >
                  <option value="">-- Select Truck Delivery --</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* If Yes, Google Form Completed */}
              {truckDelivery === 'Yes' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">If Yes, have you completed the Google Form for it?</label>
                  <select
                    value={googleFormCompleted}
                    onChange={(e) => setGoogleFormCompleted(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
                    disabled={isSaving}
                  >
                    <option value="">-- Select --</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              )}

              {/* Challan Photo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Challan Photo *</label>
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => startCamera('environment')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    disabled={isSaving || photoData || selectedFile}
                  >
                    Back Camera
                  </button>
                  <button
                    onClick={() => startCamera('user')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    disabled={isSaving || photoData || selectedFile}
                  >
                    Front Camera
                  </button>
                
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                 
                    className="hidden"
                  />
                </div>
                <video
                  ref={videoRef}
                  className="w-full mb-4"
                  style={{ display: (photoData || selectedFile) ? 'none' : 'block' }}
                  autoPlay
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                {(photoData || selectedFile) && (
                  <div className="mt-4">
                    <img
                      src={photoData || (selectedFile && URL.createObjectURL(selectedFile))}
                      alt="Selected/Challan"
                      className="w-full mb-4 rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setPhotoData(null);
                        setSelectedFile(null);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      disabled={isSaving}
                    >
                      Retake/Remove
                    </button>
                  </div>
                )}
                {!photoData && !selectedFile && (
                  <div className="mt-4">
                    <button
                      onClick={capturePhoto}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      disabled={isSaving || !isCameraReady}
                    >
                      Capture Photo
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center min-w-[120px] justify-center"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaCheck className="mr-2" />
                      Save Receipt
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Material_Received;