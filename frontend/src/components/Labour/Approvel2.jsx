// src/components/Labour/Approvel2.jsx

import React, { useState, useEffect } from 'react';
import { 
  useGetApprovelAshokSirQuery, 
  usePostLabourApprovalAshokSirMutation 
} from '../../redux/Labour/LabourSlice';
import { 
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
  X,
  Wrench,
  Clock,
  Hash,
  Pencil,
  Send,
  ChevronDown,
  IndianRupee,
  Truck,
  Wallet,
  Building2,
  HardHat,
  UserCheck,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';

const Approvel2 = () => {
  // ========== API Hooks ==========
  const { 
    data: approvalData, 
    isLoading, 
    isError, 
    error, 
    refetch,
    isFetching 
  } = useGetApprovelAshokSirQuery();

  const [postApproval, { isLoading: isSubmitting }] = usePostLabourApprovalAshokSirMutation();

  // Console for RTK Query Status
  useEffect(() => {
    console.log('=== Approvel2 (Ashok Sir) Data ===');
    console.log('Data:', approvalData);
    console.log('Is Loading:', isLoading);
    console.log('Is Error:', isError);
  }, [approvalData, isLoading, isError]);

  // ========== Local State ==========
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // ========== Form State ==========
  const [formData, setFormData] = useState({
    status: '',
    Deployed_Category_1_Labour_No_4: '',
    Deployed_Category_2_Labour_No_4: '',
    Revised_Company_Head_Amount_4: '',
    Revised_Contractor_Head_Amount_4: '',
    remark4: ''
  });

  // ========== Filter Data ==========
  const filteredData = approvalData?.filter(item => 
    item.uid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nameOfContractor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.projectEngineer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.workDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.workType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.Labouar_Contractor_Name_3?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // ========== Handle Action - Pre-fill from Step 3 ==========
  const handleAction = (item) => {
    console.log('Edit Item:', item);
    setSelectedItem(item);
    
    // ✅ Pre-fill form with Step 4 data if exists, otherwise default from Step 3
    setFormData({
      status: item.Status_4 || '',
      
      // ✅ Default from Step 3 - User can edit
      Deployed_Category_1_Labour_No_4: 
        item.Deployed_Category_1_Labour_No_4 || item.Number_Of_Labour_1_3 || '',
      
      Deployed_Category_2_Labour_No_4: 
        item.Deployed_Category_2_Labour_No_4 || item.Number_Of_Labour_2_3 || '',
      
      Revised_Company_Head_Amount_4: 
        item.Revised_Company_Head_Amount_4 || item.Company_Head_Amount_3 || '',
      
      Revised_Contractor_Head_Amount_4: 
        item.Revised_Contractor_Head_Amount_4 || item.Contractor_Head_Amount_3 || '',
      
      remark4: item.remark4 || ''
    });
    
    setShowModal(true);
  };

  // ========== Handle Form Change ==========
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ========== Handle Submit ==========
  const handleSubmit = async () => {
    if (!selectedItem) return;

    // Validation
    if (!formData.status) {
      alert('Please select Status');
      return;
    }

    console.log('=== Submitting Approvel2 (Ashok Sir) ===');
    console.log('UID:', selectedItem.uid);
    console.log('Form Data:', formData);

    try {
      const payload = {
        uid: selectedItem.uid,
        status: formData.status,
        Deployed_Category_1_Labour_No_4: formData.Deployed_Category_1_Labour_No_4,
        Deployed_Category_2_Labour_No_4: formData.Deployed_Category_2_Labour_No_4,
        Revised_Company_Head_Amount_4: formData.Revised_Company_Head_Amount_4,
        Revised_Contractor_Head_Amount_4: formData.Revised_Contractor_Head_Amount_4,
        remark4: formData.remark4
      };

      console.log('Payload:', payload);

      const result = await postApproval(payload).unwrap();
      
      console.log('API Response:', result);
      
      if (result.success) {
        alert(`✅ Successfully Updated!\nRow: ${result.rowNumber}\nUpdated: ${result.updatedColumns?.join(', ')}`);
        
        setShowModal(false);
        setSelectedItem(null);
        setFormData({
          status: '',
          Deployed_Category_1_Labour_No_4: '',
          Deployed_Category_2_Labour_No_4: '',
          Revised_Company_Head_Amount_4: '',
          Revised_Contractor_Head_Amount_4: '',
          remark4: ''
        });
        refetch();
      } else {
        alert(`❌ Error: ${result.message}`);
      }
      
    } catch (err) {
      console.error('API Error:', err);
      
      let errorMessage = 'Something went wrong!';
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.error) {
        errorMessage = err.error;
      }
      
      alert(`❌ Error: ${errorMessage}`);
    }
  };

  // ========== Loading State ==========
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading Ashok Sir Approval Data...</p>
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
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-purple-600" />
            Ashok Sir Approval
          </h2>
          <p className="text-gray-500 mt-1">Final approval step for labour requests</p>
        </div>
        
        <button 
          onClick={refetch}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
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
            placeholder="Search by UID, project, contractor, engineer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-gray-600 font-medium">
            Total: <span className="text-purple-600 font-bold">{filteredData.length}</span> Records
          </span>
        </div>
      </div>

      {/* ========== Data Table ========== */}
      {filteredData.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No records found</p>
          <p className="text-gray-400 mt-1">No approval data available</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[2400px]">
              <thead className="bg-blue-900 sticky top-0">
                <tr>
                  {/* Planned 4 - First Column */}
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Planned Date 4
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
                    Approved Head 2
                  </th>

                  {/* Step 3 Columns - Green Background */}
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap bg-blue-900">
                    <div className="flex items-center gap-2">
                      <HardHat className="w-4 h-4" />
                      Labour Contractor 3
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap bg-blue-900">
                    Labour Cat. 1 (3)
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap bg-blue-900">
                    No. Labour 1 (3)
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap bg-blue-900">
                    Rate 1 (3)
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap bg-blue-900">
                    Labour Cat. 2 (3)
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap bg-blue-900">
                    No. Labour 2 (3)
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap bg-blue-900">
                    Rate 2 (3)
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap bg-blue-900">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4" />
                      Total Wages 3
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap bg-blue-900">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Conveyance 3
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap bg-blue-900">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Total Paid 3
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap bg-blue-900">
                    Company Head Amt 3
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap bg-blue-900">
                    Contractor Head Amt 3
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap bg-blue-900">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Remark 3
                    </div>
                  </th>

                  {/* Action Column - Sticky */}
                  <th className="px-4 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap sticky right-0 bg-purple-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((item, index) => (
                  <tr 
                    key={item.uid || item.sheetRow || index} 
                    className="hover:bg-purple-50/50 transition-colors"
                  >
                    {/* Planned Date 4 - First Column */}
                    <td className="px-4 py-4 whitespace-nowrap  bg-green-50">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-sm font-semibold">
                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                        {item.planned4 || 'N/A'}
                      </span>
                    </td>
                    
                    {/* UID */}
                    <td className="px-4 py-4 whitespace-nowrap  bg-green-50">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-bold">
                        {item.uid || 'N/A'}
                      </span>
                    </td>
                    
                    {/* Project Name */}
                    <td className="px-4 py-4 whitespace-nowrap  bg-green-50">
                      <span className="text-sm font-medium text-gray-900">
                        {item.projectName || 'N/A'}
                      </span>
                    </td>
                    
                    {/* Project Engineer */}
                    <td className="px-4 py-4 whitespace-nowrap  bg-green-50">
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
                    
                    {/* Work Type */}
                    <td className="px-4 py-4 whitespace-nowrap   bg-green-50">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
                        {item.workType || 'N/A'}
                      </span>
                    </td>
                    
                    {/* Work Description */}
                    <td className="px-4 py-4 min-w-[200px]  bg-green-50">
                      <span className="text-sm text-gray-700 line-clamp-2">
                        {item.workDescription || 'N/A'}
                      </span>
                    </td>
                    
                    {/* Labour Category 1 */}
                    <td className="px-4 py-4 whitespace-nowrap  bg-green-50">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {item.labourCategory1 || 'N/A'}
                      </span>
                    </td>
                    
                    {/* Number of Labour 1 */}
                    <td className="px-4 py-4 whitespace-nowrap text-center  bg-green-50">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                        {item.numberOfLabour1 || '0'}
                      </span>
                    </td>
                    
                    {/* Labour Category 2 */}
                    <td className="px-4 py-4 whitespace-nowrap  bg-green-50">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {item.labourCategory2 || 'N/A'}
                      </span>
                    </td>
                    
                    {/* Number of Labour 2 */}
                    <td className="px-4 py-4 whitespace-nowrap text-center  bg-green-50">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold text-sm">
                        {item.numberOfLabour2 || '0'}
                      </span>
                    </td>
                    
                    {/* Total Labour */}
                    <td className="px-4 py-4 whitespace-nowrap text-center  bg-green-50">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold text-lg">
                        {item.totalLabour || '0'}
                      </span>
                    </td>
                    
                    {/* Date Required */}
                    <td className="px-4 py-4 whitespace-nowrap  bg-green-50">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-sm font-medium">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        {item.dateRequired || 'N/A'}
                      </span>
                    </td>
                    
                    {/* Head of Contractor */}
                    <td className="px-4 py-4 whitespace-nowrap  bg-green-50">
                      <span className="text-sm text-gray-700">
                        {item.headOfContractor || 'N/A'}
                      </span>
                    </td>
                    
                    {/* Name of Contractor */}
                    <td className="px-4 py-4 whitespace-nowrap  bg-green-50">
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
                    
                    {/* Contractor Firm Name */}
                    <td className="px-4 py-4 whitespace-nowrap  bg-green-50">
                      <span className="text-sm text-gray-700">
                        {item.contractorFirmName || '-'}
                      </span>
                    </td>
                    
                    {/* Approved Head 2 */}
                    <td className="px-4 py-4 whitespace-nowrap  bg-green-50">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.Approved_Head_2 === 'Company Head' 
                          ? 'bg-purple-100 text-purple-700' 
                          : item.Approved_Head_2 === 'Contractor Head'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {item.Approved_Head_2 || 'N/A'}
                      </span>
                    </td>

                    {/* ========== Step 3 Data - Green Background ========== */}
                    
                    {/* Labour Contractor Name 3 */}
                    <td className="px-4 py-4 whitespace-nowrap bg-green-50">
                      <span className="text-sm font-semibold text-green-800">
                        {item.Labouar_Contractor_Name_3 || '-'}
                      </span>
                    </td>
                    
                    {/* Labour Category 1 (3) */}
                    <td className="px-4 py-4 whitespace-nowrap bg-green-50">
                      <span className="text-sm text-gray-700">
                        {item.Labour_Category_1_3 || '-'}
                      </span>
                    </td>
                    
                    {/* Number of Labour 1 (3) */}
                    <td className="px-4 py-4 whitespace-nowrap text-center bg-green-50">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-200 text-green-800 font-bold text-sm">
                        {item.Number_Of_Labour_1_3 || '0'}
                      </span>
                    </td>
                    
                    {/* Rate 1 (3) */}
                    <td className="px-4 py-4 whitespace-nowrap bg-green-50">
                      <span className="text-sm font-medium text-gray-900">
                        ₹{item.Labour_Rate_1_3 || '0'}
                      </span>
                    </td>
                    
                    {/* Labour Category 2 (3) */}
                    <td className="px-4 py-4 whitespace-nowrap bg-green-50">
                      <span className="text-sm text-gray-700">
                        {item.Labour_Category_2_3 || '-'}
                      </span>
                    </td>
                    
                    {/* Number of Labour 2 (3) */}
                    <td className="px-4 py-4 whitespace-nowrap text-center bg-green-50">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-200 text-green-800 font-bold text-sm">
                        {item.Number_Of_Labour_2_3 || '0'}
                      </span>
                    </td>
                    
                    {/* Rate 2 (3) */}
                    <td className="px-4 py-4 whitespace-nowrap bg-green-50">
                      <span className="text-sm font-medium text-gray-900">
                        ₹{item.Labour_Rate_2_3 || '0'}
                      </span>
                    </td>
                    
                    {/* Total Wages 3 */}
                    <td className="px-4 py-4 whitespace-nowrap bg-green-50">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-200 text-green-800 text-sm font-bold">
                        ₹{item.Total_Wages_3 || '0'}
                      </span>
                    </td>
                    
                    {/* Conveyance 3 */}
                    <td className="px-4 py-4 whitespace-nowrap bg-green-50">
                      <span className="text-sm text-gray-700">
                        ₹{item.Conveyanance_3 || '0'}
                      </span>
                    </td>
                    
                    {/* Total Paid Amount 3 */}
                    <td className="px-4 py-4 whitespace-nowrap bg-green-50">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-200 text-emerald-800 text-sm font-bold">
                        ₹{item.Total_Paid_Amount_3 || '0'}
                      </span>
                    </td>
                    
                    {/* Company Head Amount 3 */}
                    <td className="px-4 py-4 whitespace-nowrap bg-green-50">
                      <span className="text-sm font-semibold text-purple-700">
                        ₹{item.Company_Head_Amount_3 || '0'}
                      </span>
                    </td>
                    
                    {/* Contractor Head Amount 3 */}
                    <td className="px-4 py-4 whitespace-nowrap bg-green-50">
                      <span className="text-sm font-semibold text-blue-700">
                        ₹{item.Contractor_Head_Amount_3 || '0'}
                      </span>
                    </td>
                    
                    {/* Remark 3 */}
                    <td className="px-4 py-4 min-w-[150px] bg-green-50">
                      <span className="text-sm text-gray-600 italic">
                        {item.remark3 || '-'}
                      </span>
                    </td>

                    {/* Action - Sticky */}
                    <td className="px-4 py-4 whitespace-nowrap sticky right-0 bg-white shadow-[-4px_0_8px_rgba(0,0,0,0.1)]">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleAction(item)}
                          className="p-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg"
                          title="Approve"
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
                Showing <span className="font-semibold text-purple-600">{filteredData.length}</span> records
              </p>
              <p className="text-xs text-gray-400">
                Scroll horizontally to view all columns →
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========== Edit Modal ========== */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col">
            
            {/* Modal Header - Fixed */}
            <div className="flex-shrink-0 p-4 sm:p-6 border-b bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-purple-600" />
                    Ashok Sir Approval
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    UID: <span className="font-semibold text-indigo-600">{selectedItem.uid}</span>
                    <span className="mx-2">|</span>
                    Project: <span className="font-semibold text-purple-600">{selectedItem.projectName}</span>
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
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              
              {/* Quick Info - Step 3 Summary */}
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <h4 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Step 3 Summary (From Management)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-500">Labour Contractor</span>
                    <p className="font-semibold text-gray-800">{selectedItem.Labouar_Contractor_Name_3 || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Total Labour (Cat 1)</span>
                    <p className="font-bold text-blue-600">{selectedItem.Number_Of_Labour_1_3 || '0'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Total Labour (Cat 2)</span>
                    <p className="font-bold text-cyan-600">{selectedItem.Number_Of_Labour_2_3 || '0'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Total Wages</span>
                    <p className="font-bold text-green-700">₹{selectedItem.Total_Wages_3 || '0'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Total Paid Amount</span>
                    <p className="font-bold text-emerald-700">₹{selectedItem.Total_Paid_Amount_3 || '0'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Approved Head</span>
                    <p className="font-semibold text-purple-600">{selectedItem.Approved_Head_2 || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Step 3 Amount Reference */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Amount Reference (Step 3)</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <span className="text-xs text-purple-600">🏢 Company Head Amount</span>
                    <p className="font-bold text-purple-800 text-lg">₹{selectedItem.Company_Head_Amount_3 || '0'}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <span className="text-xs text-blue-600">👷 Contractor Head Amount</span>
                    <p className="font-bold text-blue-800 text-lg">₹{selectedItem.Contractor_Head_Amount_3 || '0'}</p>
                  </div>
                </div>
              </div>

              {/* Status Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                  >
                    <option value="">-- Select Status --</option>
                    <option value="Done">✅ Done</option>
                   
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Deployed Labour Section - Pre-filled from Step 3 */}
              <div className="bg-blue-50 p-4 rounded-xl space-y-3 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Deployed Labour Numbers (Step 4)
                  <span className="text-xs font-normal text-blue-500 ml-2">
                    (Pre-filled from Step 3 - Editable)
                  </span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Deployed Category 1 Labour No.
                    </label>
                    <input
                      type="number"
                      value={formData.Deployed_Category_1_Labour_No_4}
                      onChange={(e) => handleFormChange('Deployed_Category_1_Labour_No_4', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <p className="text-xs text-blue-500 mt-1">
                      📋 Original (Step 3): {selectedItem.Number_Of_Labour_1_3 || '0'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Deployed Category 2 Labour No.
                    </label>
                    <input
                      type="number"
                      value={formData.Deployed_Category_2_Labour_No_4}
                      onChange={(e) => handleFormChange('Deployed_Category_2_Labour_No_4', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <p className="text-xs text-cyan-500 mt-1">
                      📋 Original (Step 3): {selectedItem.Number_Of_Labour_2_3 || '0'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Revised Amount Section - Pre-filled from Step 3 */}
              <div className="bg-purple-50 p-4 rounded-xl space-y-3 border border-purple-200">
                <h4 className="text-sm font-semibold text-purple-800 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" />
                  Revised Amount Distribution (Step 4)
                  <span className="text-xs font-normal text-purple-500 ml-2">
                    (Pre-filled from Step 3 - Editable)
                  </span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      🏢 Revised Company Head Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.Revised_Company_Head_Amount_4}
                      onChange={(e) => handleFormChange('Revised_Company_Head_Amount_4', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                    <p className="text-xs text-purple-500 mt-1">
                      📋 Original (Step 3): ₹{selectedItem.Company_Head_Amount_3 || '0'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      👷 Revised Contractor Head Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.Revised_Contractor_Head_Amount_4}
                      onChange={(e) => handleFormChange('Revised_Contractor_Head_Amount_4', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                    <p className="text-xs text-blue-500 mt-1">
                      📋 Original (Step 3): ₹{selectedItem.Contractor_Head_Amount_3 || '0'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Remark */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Remark <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={formData.remark4}
                  onChange={(e) => handleFormChange('remark4', e.target.value)}
                  rows={3}
                  placeholder="Enter any remarks for approval..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

            </div>

            {/* Modal Footer - Fixed */}
            <div className="flex-shrink-0 p-4 sm:p-6 border-t bg-gray-50 flex gap-3 justify-end rounded-b-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 sm:px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.status}
                className="px-4 sm:px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 shadow-md hover:shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Approval
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvel2;