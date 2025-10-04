import React, { useState, useEffect } from 'react';
import { FaPencilAlt, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center text-red-500">
          Something went wrong. Please try again later.
        </div>
      );
    }
    return this.props.children;
  }
}

const Vendor_FollowUp_Material = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [status, setStatus] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [remark, setRemark] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/get-vendor-follow-up-material`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const apiData = await response.json();
        console.log('API Data:', apiData); // Debug: Log API response

        if (apiData && Array.isArray(apiData.data)) {
          setMaterials(apiData.data);
        } else {
          throw new Error('API data is not in the expected format');
        }
      } catch (error) {
        console.error('Error fetching materials:', error);
        setError('Failed to load materials from API. Please try again later.');
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  const openUpdateModal = (material) => {
    // Validate material object
    if (!material || !material.UID) {
      console.error('Invalid material object:', material);
      setError('Cannot open modal: Invalid material data.');
      return;
    }

    console.log('Selected Material:', material); // Debug: Log material object
    setSelectedMaterial(material);
    // Set state with fallback values to ensure fields are populated
    setStatus(material.STATUS_8 || '');
    setExpectedDeliveryDate(material.EXPECTED_DELIVERY_DATE_8 ? material.EXPECTED_DELIVERY_DATE_8.split('/').reverse().join('-') : ''); // Convert DD/MM/YYYY to YYYY-MM-DD if needed
    setRemark(material.REMARK_RECEIVED_VENDOR_8 || '');
    setIsUpdateModalOpen(true);
    setShowSuccess(false);
    setValidationError('');
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedMaterial(null);
    setStatus('');
    setExpectedDeliveryDate('');
    setRemark('');
    setIsSaving(false);
    setShowSuccess(false);
    setValidationError('');
  };

  const validateUpdate = () => {
    if (!status || !expectedDeliveryDate || !remark) {
      setValidationError('All fields (Status, Expected Delivery Date, Remark) are required.');
      return false;
    }
    setValidationError('');
    return true;
  };

 const handleUpdate = async () => {
  if (!selectedMaterial || !validateUpdate()) return;

  // Calculate the updated follow-up count
  const updatedFollowUpCount = (parseInt(selectedMaterial.FOLLOW_UP_COUNT_8 || '0') + 1).toString();

  const payload = {
    uid: selectedMaterial.UID,
    status,
    expected_delivery_date: expectedDeliveryDate,
    remark,
    follow_up_count: updatedFollowUpCount, // Include FOLLOW_UP_COUNT_8 in the payload
  };

  try {
    setIsSaving(true);
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/update-vendor-follow-up-material`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update data');
    }

    setShowSuccess(true);
    const updatedMaterials = materials.map(mat =>
      mat.UID === selectedMaterial.UID
        ? {
            ...mat,
            STATUS_8: status,
            EXPECTED_DELIVERY_DATE_8: expectedDeliveryDate,
            REMARK_RECEIVED_VENDOR_8: remark,
            FOLLOW_UP_COUNT_8: updatedFollowUpCount, // Update local state
          }
        : mat
    );
    setMaterials(updatedMaterials);

    setTimeout(() => {
      closeUpdateModal();
    }, 1500);
  } catch (error) {
    console.error('Error updating data:', error);
    setError('Failed to update due to a network error.');
  } finally {
    setIsSaving(false);
  }
};

  return (
    <ErrorBoundary>
      <div className="p-4 bg-gray-50 min-h-screen">
        <div className="bg-white border border-gray-300 rounded-xl shadow-lg">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : materials.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No materials available for follow-up.</div>
          ) : (
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">UID</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">REQ NO</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">SITE NAME</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">SUPERVISOR NAME</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">MATERIAL TYPE</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">SKU CODE</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">MATERIAL NAME</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">QUANTITY</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">UNIT NAME</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">PURPOSE</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">REQUIRE DATE</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">REVISED QUANTITY 2</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">DECIDED BRAND/COMPANY NAME 2</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">INDENT NUMBER 3</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">PDF URL 3</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">REMARK 3</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">PLANNED 8</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">ACTUAL 8</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">STATUS 8</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">FOLLOW-UP COUNT 8</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">EXPECTED DELIVERY DATE 8</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">REMARK RECEIVED VENDOR 8</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">PDF URL 5</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">PDF URL 7</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">VENDOR FIRM NAME 5</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">VENDOR CONTACT</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">EXPECTED DELIVERY DATE 7</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-300">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {materials.map((material, index) => (
                    <tr key={material.UID || index} className={`hover:bg-blue-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200 font-medium">{material.UID || 'N/A'}</td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200 font-medium text-blue-600">{material.Req_No || 'N/A'}</td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                        <div className="max-w-[120px] truncate" title={material.Site_Name}>{material.Site_Name || 'N/A'}</div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">{material.Supervisor_Name || 'N/A'}</td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">{material.Material_Type || 'N/A'}</td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200 font-mono text-xs">{material.SKU_Code || 'N/A'}</td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                        <div className="max-w-[120px] truncate" title={material.Material_Name}>{material.Material_Name || 'N/A'}</div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200 text-right font-semibold">{material.Quantity || 'N/A'}</td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">{material.Unit_Name || 'N/A'}</td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                        <div className="max-w-[100px] truncate" title={material.Purpose}>{material.Purpose || 'N/A'}</div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">{material.Require_Date || 'N/A'}</td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200 font-semibold text-orange-600">{material.REVISED_QUANTITY_2 || 'N/A'}</td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                        <div className="max-w-[120px] truncate" title={material['DECIDED_BRAND/COMPANY_NAME_2']}>
                          {material['DECIDED_BRAND/COMPANY_NAME_2'] || 'N/A'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200 font-mono text-xs bg-yellow-50">{material.INDENT_NUMBER_3 || 'N/A'}</td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                        <div className="max-w-[120px] truncate" title={material.PDF_URL_3}>
                          {material.PDF_URL_3 ? (
                            <a href={material.PDF_URL_3} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                              View PDF
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                        <div className="max-w-[120px] truncate" title={material.REMARK_3}>{material.REMARK_3 || 'N/A'}</div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">{material.PLANNED_8 || 'N/A'}</td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">{material.ACTUAL_8 || 'N/A'}</td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">{material.STATUS_8 || 'N/A'}</td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">{material.FOLLOW_UP_COUNT_8 || '0'}</td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">{material.EXPECTED_DELIVERY_DATE_8 || 'N/A'}</td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                        <div className="max-w-[120px] truncate" title={material.REMARK_RECEIVED_VENDOR_8}>{material.REMARK_RECEIVED_VENDOR_8 || 'N/A'}</div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                        <div className="max-w-[120px] truncate" title={material.PDF_URL_5}>
                          {material.PDF_URL_5 ? (
                            <a href={material.PDF_URL_5} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                              View PDF
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                        <div className="max-w-[120px] truncate" title={material.PDF_URL_7}>
                          {material.PDF_URL_7 ? (
                            <a href={material.PDF_URL_7} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                              View PDF
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">{material.Vendor_Firm_Name_5 || 'N/A'}</td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">{material.Vendor_Contact || 'N/A'}</td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">{material.EXPECTED_DELIVERY_DATE_7 || 'N/A'}</td>
                      <td className="px-3 py-3 text-sm text-gray-800 border-r border-gray-200">
                        <button
                          onClick={() => openUpdateModal(material)}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                          disabled={!material.UID}
                        >
                          <FaPencilAlt />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Update Modal */}
        {isUpdateModalOpen && selectedMaterial && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto max-h-[90vh] flex flex-col">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold text-white flex items-center">
                    Update Vendor Follow-Up - UID: {selectedMaterial.UID || 'N/A'}
                  </h4>
                  <button
                    onClick={closeUpdateModal}
                    className="text-white hover:text-gray-200 p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200"
                    disabled={isSaving}
                  >
                    <FaTimes size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {showSuccess && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                    <FaCheck className="text-green-600 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-green-800 font-medium">Success!</p>
                      <p className="text-green-700 text-sm">Follow-up has been updated successfully.</p>
                    </div>
                  </div>
                )}
                {validationError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                    <FaTimes className="text-red-600 mr-3 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{validationError}</p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h5 className="font-semibold text-blue-800 mb-2">Update Follow-Up Details</h5>
                  <p className="text-blue-700 text-sm">Provide the status, expected delivery date, and remark.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    Status *
                    {!status && <span className="text-red-500 ml-1">Required</span>}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white ${!status ? 'border-red-500' : 'border-gray-200'}`}
                    disabled={isSaving}
                  >
                    <option value="">Select Status</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Not Dispatched">Not Dispatched</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    Expected Delivery Date *
                    {!expectedDeliveryDate && <span className="text-red-500 ml-1">Required</span>}
                  </label>
                  <input
                    type="date"
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                    className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${!expectedDeliveryDate ? 'border-red-500' : 'border-gray-200'}`}
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    Remark *
                    {!remark && <span className="text-red-500 ml-1">Required</span>}
                  </label>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 resize-none ${!remark ? 'border-red-500' : 'border-gray-200'}`}
                    placeholder="Enter remark"
                    rows={4}
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100 flex-shrink-0">
                <div className="flex justify-end">
                  <button
                    onClick={handleUpdate}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center min-w-[140px] justify-center shadow-lg hover:shadow-xl"
                    disabled={isSaving || !status || !expectedDeliveryDate || !remark}
                  >
                    {isSaving ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaCheck className="mr-2" />
                        Update Follow-Up
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Vendor_FollowUp_Material;