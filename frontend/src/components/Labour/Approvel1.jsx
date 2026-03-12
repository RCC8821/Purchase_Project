

import React, { useState, useEffect } from 'react';
import { 
  useGetLabourApproveQuery, 
  usePostLabourApproval1Mutation,
  useGetProjectDropdownQuery  // ✅ NEW HOOK
} from '../../redux/Labour/LabourSlice';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  RefreshCw, 
  User, 
  Calendar, 
  Users,
  FileText,
  Building,
  AlertCircle,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Wrench,
  Clock,
  Hash,
  Pencil,
  Send,
  ChevronDown,
  UserCircle,
  Building2
} from 'lucide-react';

const Approvel1 = () => {
  // ========== API Hooks ==========
  const { 
    data: labourData, 
    isLoading, 
    isError, 
    error, 
    refetch,
    isFetching 
  } = useGetLabourApproveQuery();

  const [postLabourApproval, { isLoading: isApproving }] = usePostLabourApproval1Mutation();

  // ✅ NEW: Fetch Contractor Dropdown Data
  const { 
    data: contractorDropdownData, 
    isLoading: isLoadingContractors 
  } = useGetProjectDropdownQuery();

  // Console for RTK Query Status
  useEffect(() => {
    console.log('=== RTK Query Status ===');
    console.log('Is Loading:', isLoading);
    console.log('Is Fetching:', isFetching);
    console.log('Is Error:', isError);
    
    if (labourData) {
      console.log('Data Fetched Successfully:', labourData);
      console.log('Total Records:', labourData.length || 0);
    }

    // ✅ Log contractor dropdown data
    if (contractorDropdownData) {
      console.log('Contractor Dropdown Data:', contractorDropdownData);
    }
    
    if (isError) {
      console.error('Error Details:', error);
    }
  }, [labourData, isLoading, isError, error, isFetching, contractorDropdownData]);

  // ========== Local State ==========
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('');
  
  // ========== Form State for Edit ==========
  const [formData, setFormData] = useState({
    Status_2: '',
    Approved_Head_2: '',
    Name_Of_Contractor_2: '',
    Contractor_Firm_Name_2: '',
    Remark_2: ''
  });

  // ========== Check if Contractor Head is Selected ==========
  const isContractorHead = formData.Approved_Head_2 === 'Contractor Head';

  // ========== Filter Data ==========
  const filteredData = labourData?.filter(item => 
    item.uid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nameOfContractor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.projectEngineer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.workDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.workType?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // ========== Handle Actions ==========
  const handleAction = (item, action) => {
    console.log('Action Clicked:', action, 'for Item:', item);
    setSelectedItem(item);
    setActionType(action);
    
    setFormData({
      Status_2: '',
      Approved_Head_2: '',
      Name_Of_Contractor_2: '',
      Contractor_Firm_Name_2: '',
      Remark_2: ''
    });
    
    setShowModal(true);
  };

  // ========== Handle Form Change ==========
  const handleFormChange = (field, value) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // ✅ Clear contractor fields when switching away from "Contractor Head"
      if (field === 'Approved_Head_2' && value !== 'Contractor Head') {
        newData.Name_Of_Contractor_2 = '';
        newData.Contractor_Firm_Name_2 = '';
      }
      
      return newData;
    });
  };

  // ✅ NEW: Handle Contractor Selection - Auto-fill Firm Name
  const handleContractorSelect = (contractorName) => {
    // Find selected contractor from dropdown data
    const selectedContractor = contractorDropdownData?.find(
      item => item.projectName === contractorName
    );

    console.log('Selected Contractor:', selectedContractor);

    setFormData(prev => ({
      ...prev,
      Name_Of_Contractor_2: contractorName,
      // Auto-fill firm name from projectEngineer field
      Contractor_Firm_Name_2: selectedContractor?.projectEngineer || ''
    }));
  };

  // ========== Validation Function ==========
  const validateForm = () => {
    if (!formData.Status_2) {
      alert('Please select Status');
      return false;
    }
    
    if (!formData.Approved_Head_2) {
      alert('Please select Approved Head');
      return false;
    }
    
    if (formData.Approved_Head_2 === 'Contractor Head') {
      if (!formData.Name_Of_Contractor_2.trim()) {
        alert('Please select Name of Contractor');
        return false;
      }
      if (!formData.Contractor_Firm_Name_2.trim()) {
        alert('Contractor Firm Name is required');
        return false;
      }
    }
    
    return true;
  };

  // ========== Check if Submit Button Should be Disabled ==========
  const isSubmitDisabled = () => {
    if (!formData.Status_2 || !formData.Approved_Head_2) {
      return true;
    }
    
    if (formData.Approved_Head_2 === 'Contractor Head') {
      if (!formData.Name_Of_Contractor_2.trim() || !formData.Contractor_Firm_Name_2.trim()) {
        return true;
      }
    }
    
    return false;
  };

  // ========== Handle Submit ==========
  const handleSubmit = async () => {
    if (!selectedItem) return;

    if (!validateForm()) {
      return;
    }

    console.log('=== Submitting Approval ===');
    console.log('Selected Item:', selectedItem);
    console.log('Form Data:', formData);

    try {
      const payload = {
        uid: selectedItem.uid,
        Status_2: formData.Status_2,
        Approved_Head_2: formData.Approved_Head_2,
        Remark_2: formData.Remark_2 || '',
      };

      if (formData.Approved_Head_2 === 'Contractor Head') {
        payload.Name_Of_Contractor_2 = formData.Name_Of_Contractor_2;
        payload.Contractor_Firm_Name_2 = formData.Contractor_Firm_Name_2;
      }

      console.log('Payload to Send:', payload);

      const result = await postLabourApproval(payload).unwrap();
      
      console.log('API Response:', result);
      
      if (result.success) {
        alert(`✅ Successfully Updated!\nRow: ${result.rowNumber}\nUpdated Columns: ${result.updatedColumns?.join(', ')}`);
        
        setShowModal(false);
        setSelectedItem(null);
        setFormData({
          Status_2: '',
          Approved_Head_2: '',
          Name_Of_Contractor_2: '',
          Contractor_Firm_Name_2: '',
          Remark_2: ''
        });
        refetch();
      } else {
        alert(`Error: ${result.message}`);
      }
      
    } catch (err) {
      console.error('=== API Error ===');
      console.error('Error:', err);
      
      let errorMessage = 'Something went wrong!';
      
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.error) {
        errorMessage = err.error;
      } else if (typeof err?.data === 'string' && err.data.includes('<!DOCTYPE')) {
        errorMessage = 'Server error - Check backend console';
      }
      
      alert(`❌ Error: ${errorMessage}`);
    }
  };

  // ========== Loading State ==========
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading Labour Data...</p>
        </div>
      </div>
    );
  }

  // ========== Error State ==========
  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center bg-red-50 p-6 rounded-xl border border-red-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium mb-2">Error Loading Data</p>
          <p className="text-red-500 text-sm mb-4">{error?.data?.message || 'Failed to fetch data'}</p>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* ========== Header Section ========== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Labour Approval - Level 1</h2>
          <p className="text-gray-500 mt-1">Review and approve labour requisition requests</p>
        </div>
        
        <button 
          onClick={refetch}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-800 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ========== Search & Filter ========== */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by UID, project, contractor, engineer, work..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-gray-600 font-medium">
            Total: <span className="text-indigo-600 font-bold">{filteredData.length}</span> Records
          </span>
        </div>
      </div>

      {/* ========== Data Table ========== */}
      {filteredData.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No pending approvals found</p>
          <p className="text-gray-400 mt-1">All labour requests have been processed</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1800px]">
              <thead className="bg-blue-900 sticky top-0">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Planned Date
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      UID
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Project Name
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Project Engineer
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      Work Type
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Work Description
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Labour Cat. 1
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    No. of Labour 1
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Labour Cat. 2
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    No. of Labour 2
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Total Labour
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date Required
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Head of Contractor
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Name of Contractor
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Contractor Firm
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Remark
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap sticky right-0 bg-indigo-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((item, index) => (
                  <tr 
                    key={item.uid || item.sheetRow || index} 
                    className="hover:bg-indigo-50/50 transition-colors"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-sm font-semibold">
                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                        {item.planned2 || 'N/A'}
                      </span>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-bold">
                        {item.uid || 'N/A'}
                      </span>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {item.projectName || 'N/A'}
                      </span>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-xs">
                            {item.projectEngineer?.charAt(0)?.toUpperCase() || 'P'}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {item.projectEngineer || 'N/A'}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
                        {item.workType || 'N/A'}
                      </span>
                    </td>
                    
                    <td className="px-4 py-4 min-w-[200px]">
                      <span className="text-sm text-gray-700">
                        {item.workDescription || 'N/A'}
                      </span>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {item.labourCategory1 || 'N/A'}
                      </span>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                        {item.numberOfLabour1 || '0'}
                      </span>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {item.labourCategory2 || 'N/A'}
                      </span>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold text-sm">
                        {item.numberOfLabour2 || '0'}
                      </span>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold text-lg">
                        {item.totalLabour || '0'}
                      </span>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-sm font-medium">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        {item.dateRequired || 'N/A'}
                      </span>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {item.headOfContractor || 'N/A'}
                      </span>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-xs">
                            {item.nameOfContractor?.charAt(0)?.toUpperCase() || 'C'}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {item.nameOfContractor || 'N/A'}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {item.contractorFirmName || '-'}
                      </span>
                    </td>
                    
                    <td className="px-4 py-4 min-w-[150px]">
                      <span className="text-sm text-gray-600 italic">
                        {item.remark || '-'}
                      </span>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap sticky right-0 bg-white shadow-[-4px_0_8px_rgba(0,0,0,0.1)]">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleAction(item, 'edit')}
                          className="p-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
                          title="Take Action"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-indigo-600">{filteredData.length}</span> records
              </p>
              <p className="text-xs text-gray-400">
                Scroll horizontally to view all columns →
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========== Edit Modal with Contractor Dropdown ========== */}
      {showModal && selectedItem && actionType === 'edit' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex-shrink-0 p-4 sm:p-6 border-b bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Pencil className="w-5 h-5 text-amber-600" />
                    Labour Approval
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    UID: <span className="font-semibold text-indigo-600">{selectedItem.uid}</span>
                  </p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
              
              {/* Quick Info Card */}
              <div className="bg-gray-50 p-3 sm:p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Request Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-xs text-gray-400">Project</span>
                    <p className="font-medium text-gray-800 truncate">{selectedItem.projectName}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Engineer</span>
                    <p className="font-medium text-gray-800 truncate">{selectedItem.projectEngineer}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Contractor</span>
                    <p className="font-medium text-gray-800 truncate">{selectedItem.nameOfContractor}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Total Labour</span>
                    <p className="font-bold text-green-600">{selectedItem.totalLabour}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Work Type</span>
                    <p className="font-medium text-gray-800 truncate">{selectedItem.workType}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Date Required</span>
                    <p className="font-medium text-gray-800">{selectedItem.dateRequired}</p>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-200 mt-2">
                  <span className="text-xs text-gray-400">Work Description</span>
                  <p className="text-sm text-gray-700 mt-1">{selectedItem.workDescription || 'N/A'}</p>
                </div>
              </div>

              {/* Status_2 Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.Status_2}
                    onChange={(e) => handleFormChange('Status_2', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white cursor-pointer text-sm sm:text-base"
                  >
                    <option value="">-- Select Status --</option>
                    <option value="Done">✔️ Done</option>
                    <option value="Reject">❌ Reject</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Approved_Head_2 Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Approved Head <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.Approved_Head_2}
                    onChange={(e) => handleFormChange('Approved_Head_2', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white cursor-pointer text-sm sm:text-base"
                  >
                    <option value="">-- Select Approved Head --</option>
                    <option value="Company Head">🏢 Company Head</option>
                    <option value="Contractor Head">👷 Contractor Head</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* ✅ CONDITIONAL FIELDS - Contractor Dropdown */}
              {isContractorHead && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200 animate-fadeIn">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <UserCircle className="w-5 h-5" />
                    <span className="text-sm font-semibold">Contractor Details</span>
                  </div>
                  
                  {/* ✅ Name_Of_Contractor_2 - DROPDOWN */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Name of Contractor <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={formData.Name_Of_Contractor_2}
                        onChange={(e) => handleContractorSelect(e.target.value)}
                        disabled={isLoadingContractors}
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {isLoadingContractors ? 'Loading contractors...' : '-- Select Contractor --'}
                        </option>
                        {contractorDropdownData?.map((contractor) => (
                          <option key={contractor.id} value={contractor.projectName}>
                            {contractor.projectName}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    {/* Show total contractors count */}
                    <p className="text-xs text-gray-400 mt-1">
                      {contractorDropdownData?.length || 0} contractors available
                    </p>
                  </div>

                  {/* ✅ Contractor_Firm_Name_2 - AUTO-FILLED (Read Only) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contractor Firm Name <span className="text-red-500">*</span>
                      <span className="text-xs text-green-600 ml-2">(Auto-filled)</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.Contractor_Firm_Name_2}
                        readOnly
                        placeholder="Select contractor to auto-fill..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed text-sm sm:text-base text-gray-700"
                      />
                      {formData.Contractor_Firm_Name_2 && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Remark_2 Textarea */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Remark <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={formData.Remark_2}
                  onChange={(e) => handleFormChange('Remark_2', e.target.value)}
                  rows={3}
                  placeholder="Enter any remarks..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none text-sm sm:text-base"
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 p-4 sm:p-6 border-t bg-gray-50 flex gap-3 justify-end rounded-b-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 sm:px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium text-sm sm:text-base"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isApproving || isSubmitDisabled()}
                className="px-4 sm:px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg text-sm sm:text-base"
              >
                {isApproving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Submitting...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Approvel1;