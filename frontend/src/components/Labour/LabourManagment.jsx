// // src/components/Labour/LabourManagement.jsx

// import React, { useState, useEffect } from 'react';
// import { 
//   useGetLabourManagementQuery, 
//   usePostLabourManagementMutation 
// } from '../../redux/Labour/LabourSlice';
// import { 
//   Loader2, 
//   RefreshCw, 
//   User, 
//   Calendar, 
//   Users,
//   FileText,
//   Building,
//   AlertCircle,
//   Search,
//   Filter,
//   X,
//   Wrench,
//   Clock,
//   Hash,
//   Pencil,
//   Send,
//   ChevronDown,
//   IndianRupee,
//   Calculator,
//   Truck,
//   Wallet,
//   Building2,
//   HardHat
// } from 'lucide-react';

// const LabourManagement = () => {
//   // ========== API Hooks ==========
//   const { 
//     data: labourData, 
//     isLoading, 
//     isError, 
//     error, 
//     refetch,
//     isFetching 
//   } = useGetLabourManagementQuery();

//   const [postLabourManagement, { isLoading: isSubmitting }] = usePostLabourManagementMutation();

//   // Console for RTK Query Status
//   useEffect(() => {
//     console.log('=== Labour Management Data ===');
//     console.log('Data:', labourData);
//     console.log('Is Loading:', isLoading);
//     console.log('Is Error:', isError);
//   }, [labourData, isLoading, isError]);

//   // ========== Local State ==========
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [showModal, setShowModal] = useState(false);
  
//   // ========== Form State ==========
//   const [formData, setFormData] = useState({
//     Status_3: '',
//     Labouar_Contractor_Name_3: '',
//     Labour_Category_1_3: '',
//     Number_Of_Labour_1_3: '',
//     Labour_Rate_1_3: '',
//     Labour_Category_2_3: '',
//     Number_Of_Labour_2_3: '',
//     Labour_Rate_2_3: '',
//     Total_Wages_3: '',
//     Conveyanance_3: '',
//     Total_Paid_Amount_3: '',
//     Company_Head_Amount_3: '',
//     Contractor_Head_Amount_3: '',
//     Remark_3: ''
//   });

//   // ========== Filter Data ==========
//   const filteredData = labourData?.filter(item => 
//     item.uid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     item.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     item.nameOfContractor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     item.projectEngineer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     item.workDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     item.workType?.toLowerCase().includes(searchTerm.toLowerCase())
//   ) || [];

//   // ========== Calculate Totals ==========
//   useEffect(() => {
//     const num1 = parseFloat(formData.Number_Of_Labour_1_3) || 0;
//     const rate1 = parseFloat(formData.Labour_Rate_1_3) || 0;
//     const num2 = parseFloat(formData.Number_Of_Labour_2_3) || 0;
//     const rate2 = parseFloat(formData.Labour_Rate_2_3) || 0;
//     const conveyance = parseFloat(formData.Conveyanance_3) || 0;

//     const totalWages = (num1 * rate1) + (num2 * rate2);
//     const totalPaid = totalWages + conveyance;

//     setFormData(prev => ({
//       ...prev,
//       Total_Wages_3: totalWages.toString(),
//       Total_Paid_Amount_3: totalPaid.toString()
//     }));
//   }, [
//     formData.Number_Of_Labour_1_3, 
//     formData.Labour_Rate_1_3, 
//     formData.Number_Of_Labour_2_3, 
//     formData.Labour_Rate_2_3,
//     formData.Conveyanance_3
//   ]);

//   // ========== Handle Action ==========
//   const handleAction = (item) => {
//     console.log('Edit Item:', item);
//     setSelectedItem(item);
    
//     // Pre-fill form with existing data if available
//     setFormData({
//       Status_3: item.Status_3 || '',
//       Labouar_Contractor_Name_3: item.Labouar_Contractor_Name_3 || item.nameOfContractor || '',
//       Labour_Category_1_3: item.Labour_Category_1_3 || item.labourCategory1 || '',
//       Number_Of_Labour_1_3: item.Number_Of_Labour_1_3 || item.numberOfLabour1 || '',
//       Labour_Rate_1_3: item.Labour_Rate_1_3 || '',
//       Labour_Category_2_3: item.Labour_Category_2_3 || item.labourCategory2 || '',
//       Number_Of_Labour_2_3: item.Number_Of_Labour_2_3 || item.numberOfLabour2 || '',
//       Labour_Rate_2_3: item.Labour_Rate_2_3 || '',
//       Total_Wages_3: item.Total_Wages_3 || '',
//       Conveyanance_3: item.Conveyanance_3 || '',
//       Total_Paid_Amount_3: item.Total_Paid_Amount_3 || '',
//       Company_Head_Amount_3: item.Company_Head_Amount_3 || '',
//       Contractor_Head_Amount_3: item.Contractor_Head_Amount_3 || '',
//       Remark_3: item.Remark_3 || ''
//     });
    
//     setShowModal(true);
//   };

//   // ========== Handle Form Change ==========
//   const handleFormChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   // ========== Handle Submit ==========
//   const handleSubmit = async () => {
//     if (!selectedItem) return;

//     // Validation
//     if (!formData.Status_3) {
//       alert('Please select Status');
//       return;
//     }

//     console.log('=== Submitting Labour Management ===');
//     console.log('UID:', selectedItem.uid);
//     console.log('Form Data:', formData);

//     try {
//       const payload = {
//         uid: selectedItem.uid,
//         Status_3: formData.Status_3,
//         Labouar_Contractor_Name_3: formData.Labouar_Contractor_Name_3,
//         Labour_Category_1_3: formData.Labour_Category_1_3,
//         Number_Of_Labour_1_3: formData.Number_Of_Labour_1_3,
//         Labour_Rate_1_3: formData.Labour_Rate_1_3,
//         Labour_Category_2_3: formData.Labour_Category_2_3,
//         Number_Of_Labour_2_3: formData.Number_Of_Labour_2_3,
//         Labour_Rate_2_3: formData.Labour_Rate_2_3,
//         Total_Wages_3: formData.Total_Wages_3,
//         Conveyanance_3: formData.Conveyanance_3,
//         Total_Paid_Amount_3: formData.Total_Paid_Amount_3,
//         Company_Head_Amount_3: formData.Company_Head_Amount_3,
//         Contractor_Head_Amount_3: formData.Contractor_Head_Amount_3,
//         Remark_3: formData.Remark_3
//       };

//       console.log('Payload:', payload);

//       const result = await postLabourManagement(payload).unwrap();
      
//       console.log('API Response:', result);
      
//       if (result.success) {
//         alert(`✅ Successfully Updated!\nRow: ${result.rowNumber}\nUpdated: ${result.updatedColumns?.join(', ')}`);
        
//         setShowModal(false);
//         setSelectedItem(null);
//         setFormData({
//           Status_3: '',
//           Labouar_Contractor_Name_3: '',
//           Labour_Category_1_3: '',
//           Number_Of_Labour_1_3: '',
//           Labour_Rate_1_3: '',
//           Labour_Category_2_3: '',
//           Number_Of_Labour_2_3: '',
//           Labour_Rate_2_3: '',
//           Total_Wages_3: '',
//           Conveyanance_3: '',
//           Total_Paid_Amount_3: '',
//           Company_Head_Amount_3: '',
//           Contractor_Head_Amount_3: '',
//           Remark_3: ''
//         });
//         refetch();
//       } else {
//         alert(`❌ Error: ${result.message}`);
//       }
      
//     } catch (err) {
//       console.error('API Error:', err);
      
//       let errorMessage = 'Something went wrong!';
//       if (err?.data?.message) {
//         errorMessage = err.data.message;
//       } else if (err?.error) {
//         errorMessage = err.error;
//       }
      
//       alert(`❌ Error: ${errorMessage}`);
//     }
//   };

//   // ========== Loading State ==========
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
//           <p className="text-gray-600 font-medium">Loading Labour Management Data...</p>
//         </div>
//       </div>
//     );
//   }

//   // ========== Error State ==========
//   if (isError) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center bg-red-50 p-6 rounded-xl border border-red-200">
//           <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//           <p className="text-red-600 font-medium mb-2">Error Loading Data</p>
//           <p className="text-red-500 text-sm mb-4">{error?.data?.message || 'Failed to fetch data'}</p>
//           <button 
//             onClick={refetch}
//             className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto"
//           >
//             <RefreshCw className="w-4 h-4" />
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 p-4">
//       {/* ========== Header Section ========== */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">Labour Management</h2>
//           <p className="text-gray-500 mt-1">Manage labour payments and assignments</p>
//         </div>
        
//         <button 
//           onClick={refetch}
//           disabled={isFetching}
//           className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
//         >
//           <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
//           Refresh
//         </button>
//       </div>

//       {/* ========== Search & Filter ========== */}
//       <div className="flex flex-col sm:flex-row gap-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search by UID, project, contractor, engineer..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//           />
//         </div>
//         <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
//           <Filter className="w-5 h-5 text-gray-500" />
//           <span className="text-gray-600 font-medium">
//             Total: <span className="text-indigo-600 font-bold">{filteredData.length}</span> Records
//           </span>
//         </div>
//       </div>

//       {/* ========== Data Table ========== */}
//       {filteredData.length === 0 ? (
//         <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
//           <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//           <p className="text-gray-500 text-lg font-medium">No records found</p>
//           <p className="text-gray-400 mt-1">No labour management data available</p>
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200">
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[1600px]">
//               <thead className="bg-gradient-to-r from-emerald-600 to-teal-600 sticky top-0">
//                 <tr>
//                   <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
//                     <div className="flex items-center gap-2">
//                       <Clock className="w-4 h-4" />
//                       Planned Date
//                     </div>
//                   </th>
//                   <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
//                     <div className="flex items-center gap-2">
//                       <Hash className="w-4 h-4" />
//                       UID
//                     </div>
//                   </th>
//                   <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
//                     <div className="flex items-center gap-2">
//                       <Building className="w-4 h-4" />
//                       Project Name
//                     </div>
//                   </th>
//                   <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
//                     <div className="flex items-center gap-2">
//                       <User className="w-4 h-4" />
//                       Project Engineer
//                     </div>
//                   </th>
//                   <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
//                     <div className="flex items-center gap-2">
//                       <Wrench className="w-4 h-4" />
//                       Work Type
//                     </div>
//                   </th>
//                   <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
//                     Work Description
//                   </th>
//                   <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
//                     Labour Cat. 1
//                   </th>
//                   <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
//                     No. of Labour 1
//                   </th>
//                   <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
//                     Labour Cat. 2
//                   </th>
//                   <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
//                     No. of Labour 2
//                   </th>
//                   <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
//                     <div className="flex items-center gap-2">
//                       <Users className="w-4 h-4" />
//                       Total Labour
//                     </div>
//                   </th>
//                   <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
//                     <div className="flex items-center gap-2">
//                       <Calendar className="w-4 h-4" />
//                       Date Required
//                     </div>
//                   </th>
                
//                   <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
//                     Name of Contractor
//                   </th>
//                   <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
//                     Contractor Firm
//                   </th>
//                   <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
//                     Approved Head
//                   </th>
//                   <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
//                     Remark
//                   </th>
//                   <th className="px-4 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap sticky right-0 bg-emerald-700">
//                     Action
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {filteredData.map((item, index) => (
//                   <tr 
//                     key={item.uid || item.sheetRow || index} 
//                     className="hover:bg-emerald-50/50 transition-colors"
//                   >
//                     {/* Planned Date */}
//                     <td className="px-4 py-4 whitespace-nowrap">
//                       <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-teal-100 text-teal-700 text-sm font-semibold">
//                         <Clock className="w-3.5 h-3.5 mr-1.5" />
//                         {item.planned3 || 'N/A'}
//                       </span>
//                     </td>
                    
//                     {/* UID */}
//                     <td className="px-4 py-4 whitespace-nowrap">
//                       <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-bold">
//                         {item.uid || 'N/A'}
//                       </span>
//                     </td>
                    
//                     {/* Project Name */}
//                     <td className="px-4 py-4 whitespace-nowrap">
//                       <span className="text-sm font-medium text-gray-900">
//                         {item.projectName || 'N/A'}
//                       </span>
//                     </td>
                    
//                     {/* Project Engineer */}
//                     <td className="px-4 py-4 whitespace-nowrap">
//                       <div className="flex items-center gap-2">
//                         <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
//                           <span className="text-white font-semibold text-xs">
//                             {item.projectEngineer?.charAt(0)?.toUpperCase() || 'P'}
//                           </span>
//                         </div>
//                         <span className="text-sm font-medium text-gray-900">
//                           {item.projectEngineer || 'N/A'}
//                         </span>
//                       </div>
//                     </td>
                    
//                     {/* Work Type */}
//                     <td className="px-4 py-4 whitespace-nowrap">
//                       <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
//                         {item.workType || 'N/A'}
//                       </span>
//                     </td>
                    
//                     {/* Work Description */}
//                     <td className="px-4 py-4 min-w-[200px]">
//                       <span className="text-sm text-gray-700">
//                         {item.workDescription || 'N/A'}
//                       </span>
//                     </td>
                    
//                     {/* Labour Category 1 */}
//                     <td className="px-4 py-4 whitespace-nowrap">
//                       <span className="text-sm font-medium text-gray-900 capitalize">
//                         {item.labourCategory1 || 'N/A'}
//                       </span>
//                     </td>
                    
//                     {/* Number of Labour 1 */}
//                     <td className="px-4 py-4 whitespace-nowrap text-center">
//                       <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
//                         {item.numberOfLabour1 || '0'}
//                       </span>
//                     </td>
                    
//                     {/* Labour Category 2 */}
//                     <td className="px-4 py-4 whitespace-nowrap">
//                       <span className="text-sm font-medium text-gray-900 capitalize">
//                         {item.labourCategory2 || 'N/A'}
//                       </span>
//                     </td>
                    
//                     {/* Number of Labour 2 */}
//                     <td className="px-4 py-4 whitespace-nowrap text-center">
//                       <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold text-sm">
//                         {item.numberOfLabour2 || '0'}
//                       </span>
//                     </td>
                    
//                     {/* Total Labour */}
//                     <td className="px-4 py-4 whitespace-nowrap text-center">
//                       <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold text-lg">
//                         {item.totalLabour || '0'}
//                       </span>
//                     </td>
                    
//                     {/* Date Required */}
//                     <td className="px-4 py-4 whitespace-nowrap">
//                       <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-sm font-medium">
//                         <Calendar className="w-3.5 h-3.5 mr-1.5" />
//                         {item.dateRequired || 'N/A'}
//                       </span>
//                     </td>
                    
//                     {/* Head of Contractor */}
//                     {/* <td className="px-4 py-4 whitespace-nowrap">
//                       <span className="text-sm text-gray-700">
//                         {item.headOfContractor || 'N/A'}
//                       </span>
//                     </td> */}
                    
//                     {/* Name of Contractor */}
//                     <td className="px-4 py-4 whitespace-nowrap">
//                       <div className="flex items-center gap-2">
//                         <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
//                           <span className="text-white font-semibold text-xs">
//                             {item.nameOfContractor?.charAt(0)?.toUpperCase() || 'C'}
//                           </span>
//                         </div>
//                         <span className="text-sm font-medium text-gray-900">
//                           {item.nameOfContractor || 'N/A'}
//                         </span>
//                       </div>
//                     </td>
                    
//                     {/* Contractor Firm Name */}
//                     <td className="px-4 py-4 whitespace-nowrap">
//                       <span className="text-sm text-gray-700">
//                         {item.contractorFirmName || '-'}
//                       </span>
//                     </td>
                    
//                     {/* Approved Head */}
//                     <td className="px-4 py-4 whitespace-nowrap">
//                       <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
//                         item.Approved_Head_2 === 'Company Head' 
//                           ? 'bg-purple-100 text-purple-700' 
//                           : item.Approved_Head_2 === 'Contractor Head'
//                           ? 'bg-blue-100 text-blue-700'
//                           : 'bg-gray-100 text-gray-700'
//                       }`}>
//                         {item.Approved_Head_2 || 'N/A'}
//                       </span>
//                     </td>
                    
//                     {/* Remark */}
//                     <td className="px-4 py-4 min-w-[150px]">
//                       <span className="text-sm text-gray-600 italic">
//                         {item.remark || '-'}
//                       </span>
//                     </td>
                    
//                     {/* Action - Sticky */}
//                     <td className="px-4 py-4 whitespace-nowrap sticky right-0 bg-white shadow-[-4px_0_8px_rgba(0,0,0,0.1)]">
//                       <div className="flex items-center justify-center">
//                         <button
//                           onClick={() => handleAction(item)}
//                           className="p-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg"
//                           title="Manage Labour"
//                         >
//                           <Pencil className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
          
//           <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
//             <div className="flex items-center justify-between">
//               <p className="text-sm text-gray-600">
//                 Showing <span className="font-semibold text-emerald-600">{filteredData.length}</span> records
//               </p>
//               <p className="text-xs text-gray-400">
//                 Scroll horizontally to view all columns →
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ========== Edit Modal ========== */}
//       {showModal && selectedItem && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col">
            
//             {/* Modal Header - Fixed */}
//             <div className="flex-shrink-0 p-4 sm:p-6 border-b bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-2xl">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
//                     <Wallet className="w-5 h-5 text-emerald-600" />
//                     Labour Management
//                   </h3>
//                   <p className="text-xs sm:text-sm text-gray-500 mt-1">
//                     UID: <span className="font-semibold text-indigo-600">{selectedItem.uid}</span>
//                     <span className="mx-2">|</span>
//                     Project: <span className="font-semibold text-emerald-600">{selectedItem.projectName}</span>
//                   </p>
//                 </div>
//                 <button 
//                   onClick={() => setShowModal(false)}
//                   className="p-2 hover:bg-gray-200 rounded-full transition-colors"
//                 >
//                   <X className="w-5 h-5 text-gray-500" />
//                 </button>
//               </div>
//             </div>

//             {/* Modal Body - Scrollable */}
//             <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              
//               {/* Quick Info */}
//               <div className="bg-gray-50 p-4 rounded-xl">
//                 <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Request Info</h4>
//                 <div className="grid grid-cols-3 gap-3 text-sm">
//                   <div>
//                     <span className="text-xs text-gray-400">Work Type</span>
//                     <p className="font-medium text-gray-800">{selectedItem.workType}</p>
//                   </div>
//                   <div>
//                     <span className="text-xs text-gray-400">Total Labour</span>
//                     <p className="font-bold text-green-600">{selectedItem.totalLabour}</p>
//                   </div>
//                   <div>
//                     <span className="text-xs text-gray-400">Approved Head</span>
//                     <p className="font-medium text-purple-600">{selectedItem.Approved_Head_2 || 'N/A'}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Status Dropdown */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Status <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <select
//                     value={formData.Status_3}
//                     onChange={(e) => handleFormChange('Status_3', e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white cursor-pointer"
//                   >
//                     <option value="">-- Select Status --</option>
//                     <option value="Completed">✅ Completed</option>
//                     <option value="In Progress">🔄 In Progress</option>
//                     <option value="Pending">⏳ Pending</option>
//                     <option value="Cancelled">❌ Cancelled</option>
//                   </select>
//                   <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                 </div>
//               </div>

//               {/* Labour Contractor Name */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   <HardHat className="w-4 h-4 inline mr-1" />
//                   Labour Contractor Name
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.Labouar_Contractor_Name_3}
//                   onChange={(e) => handleFormChange('Labouar_Contractor_Name_3', e.target.value)}
//                   placeholder="Enter contractor name"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                 />
//               </div>

//               {/* Labour Category 1 Section */}
//               <div className="bg-blue-50 p-4 rounded-xl space-y-3">
//                 <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
//                   <Users className="w-4 h-4" />
//                   Labour Category 1
//                 </h4>
//                 <div className="grid grid-cols-3 gap-3">
//                   <div>
//                     <label className="block text-xs text-gray-600 mb-1">Category</label>
//                     <input
//                       type="text"
//                       value={formData.Labour_Category_1_3}
//                       onChange={(e) => handleFormChange('Labour_Category_1_3', e.target.value)}
//                       placeholder="e.g. Mistri"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs text-gray-600 mb-1">No. of Labour</label>
//                     <input
//                       type="number"
//                       value={formData.Number_Of_Labour_1_3}
//                       onChange={(e) => handleFormChange('Number_Of_Labour_1_3', e.target.value)}
//                       placeholder="0"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs text-gray-600 mb-1">Rate (₹)</label>
//                     <input
//                       type="number"
//                       value={formData.Labour_Rate_1_3}
//                       onChange={(e) => handleFormChange('Labour_Rate_1_3', e.target.value)}
//                       placeholder="0"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Labour Category 2 Section */}
//               <div className="bg-cyan-50 p-4 rounded-xl space-y-3">
//                 <h4 className="text-sm font-semibold text-cyan-800 flex items-center gap-2">
//                   <Users className="w-4 h-4" />
//                   Labour Category 2
//                 </h4>
//                 <div className="grid grid-cols-3 gap-3">
//                   <div>
//                     <label className="block text-xs text-gray-600 mb-1">Category</label>
//                     <input
//                       type="text"
//                       value={formData.Labour_Category_2_3}
//                       onChange={(e) => handleFormChange('Labour_Category_2_3', e.target.value)}
//                       placeholder="e.g. Helper"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs text-gray-600 mb-1">No. of Labour</label>
//                     <input
//                       type="number"
//                       value={formData.Number_Of_Labour_2_3}
//                       onChange={(e) => handleFormChange('Number_Of_Labour_2_3', e.target.value)}
//                       placeholder="0"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs text-gray-600 mb-1">Rate (₹)</label>
//                     <input
//                       type="number"
//                       value={formData.Labour_Rate_2_3}
//                       onChange={(e) => handleFormChange('Labour_Rate_2_3', e.target.value)}
//                       placeholder="0"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Payment Section */}
//               <div className="bg-green-50 p-4 rounded-xl space-y-3">
//                 <h4 className="text-sm font-semibold text-green-800 flex items-center gap-2">
//                   <IndianRupee className="w-4 h-4" />
//                   Payment Details
//                 </h4>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-xs text-gray-600 mb-1">Total Wages (Auto)</label>
//                     <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-green-600">
//                       ₹ {formData.Total_Wages_3 || '0'}
//                     </div>
//                   </div>
//                   <div>
//                     <label className="block text-xs text-gray-600 mb-1">
//                       <Truck className="w-3 h-3 inline mr-1" />
//                       Conveyance (₹)
//                     </label>
//                     <input
//                       type="number"
//                       value={formData.Conveyanance_3}
//                       onChange={(e) => handleFormChange('Conveyanance_3', e.target.value)}
//                       placeholder="0"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
//                     />
//                   </div>
//                   <div className="col-span-2">
//                     <label className="block text-xs text-gray-600 mb-1">Total Paid Amount (Auto)</label>
//                     <div className="px-3 py-2 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-lg text-lg font-bold text-green-700 text-center">
//                       ₹ {formData.Total_Paid_Amount_3 || '0'}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Head Amount Distribution */}
//               <div className="bg-purple-50 p-4 rounded-xl space-y-3">
//                 <h4 className="text-sm font-semibold text-purple-800 flex items-center gap-2">
//                   <Building2 className="w-4 h-4" />
//                   Amount Distribution
//                 </h4>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-xs text-gray-600 mb-1">🏢 Company Head Amount (₹)</label>
//                     <input
//                       type="number"
//                       value={formData.Company_Head_Amount_3}
//                       onChange={(e) => handleFormChange('Company_Head_Amount_3', e.target.value)}
//                       placeholder="0"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs text-gray-600 mb-1">👷 Contractor Head Amount (₹)</label>
//                     <input
//                       type="number"
//                       value={formData.Contractor_Head_Amount_3}
//                       onChange={(e) => handleFormChange('Contractor_Head_Amount_3', e.target.value)}
//                       placeholder="0"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Remark */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Remark <span className="text-gray-400 font-normal">(Optional)</span>
//                 </label>
//                 <textarea
//                   value={formData.Remark_3}
//                   onChange={(e) => handleFormChange('Remark_3', e.target.value)}
//                   rows={3}
//                   placeholder="Enter any remarks..."
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
//                 />
//               </div>

//             </div>

//             {/* Modal Footer - Fixed */}
//             <div className="flex-shrink-0 p-4 sm:p-6 border-t bg-gray-50 flex gap-3 justify-end rounded-b-2xl">
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="px-4 sm:px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
//               >
//                 Cancel
//               </button>
              
//               <button
//                 onClick={handleSubmit}
//                 disabled={isSubmitting || !formData.Status_3}
//                 className="px-4 sm:px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-md hover:shadow-lg"
//               >
//                 {isSubmitting ? (
//                   <>
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                     <span>Submitting...</span>
//                   </>
//                 ) : (
//                   <>
//                     <Send className="w-4 h-4" />
//                     Submit
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LabourManagement;





// src/components/Labour/LabourManagement.jsx

import React, { useState, useEffect } from 'react';
import { 
  useGetLabourManagementQuery, 
  usePostLabourManagementMutation 
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
  Calculator,
  Truck,
  Wallet,
  Building2,
  HardHat
} from 'lucide-react';

const LabourManagement = () => {
  // ========== API Hooks ==========
  const { 
    data: labourData, 
    isLoading, 
    isError, 
    error, 
    refetch,
    isFetching 
  } = useGetLabourManagementQuery();

  const [postLabourManagement, { isLoading: isSubmitting }] = usePostLabourManagementMutation();

  // Console for RTK Query Status
  useEffect(() => {
    console.log('=== Labour Management Data ===');
    console.log('Data:', labourData);
    console.log('Is Loading:', isLoading);
    console.log('Is Error:', isError);
  }, [labourData, isLoading, isError]);

  // ========== Local State ==========
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // ========== Form State ==========
  const [formData, setFormData] = useState({
    Status_3: '',
    Labouar_Contractor_Name_3: '',
    Labour_Category_1_3: '',
    Number_Of_Labour_1_3: '',
    Labour_Rate_1_3: '',
    Labour_Category_2_3: '',
    Number_Of_Labour_2_3: '',
    Labour_Rate_2_3: '',
    Total_Wages_3: '',
    Conveyanance_3: '',
    Total_Paid_Amount_3: '',
    Company_Head_Amount_3: '',
    Contractor_Head_Amount_3: '',
    Remark_3: ''
  });

  // ========== Filter Data ==========
  const filteredData = labourData?.filter(item => 
    item.uid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nameOfContractor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.projectEngineer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.workDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.workType?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // ========== Calculate Totals ==========
  useEffect(() => {
    const num1 = parseFloat(formData.Number_Of_Labour_1_3) || 0;
    const rate1 = parseFloat(formData.Labour_Rate_1_3) || 0;
    const num2 = parseFloat(formData.Number_Of_Labour_2_3) || 0;
    const rate2 = parseFloat(formData.Labour_Rate_2_3) || 0;
    const conveyance = parseFloat(formData.Conveyanance_3) || 0;

    const totalWages = (num1 * rate1) + (num2 * rate2);
    const totalPaid = totalWages + conveyance;

    setFormData(prev => ({
      ...prev,
      Total_Wages_3: totalWages.toString(),
      Total_Paid_Amount_3: totalPaid.toString(),
      // Auto-fill Company Head Amount with Total Paid Amount
      Company_Head_Amount_3: totalPaid.toString()
    }));
  }, [
    formData.Number_Of_Labour_1_3, 
    formData.Labour_Rate_1_3, 
    formData.Number_Of_Labour_2_3, 
    formData.Labour_Rate_2_3,
    formData.Conveyanance_3
  ]);

  // ========== Handle Action ==========
  const handleAction = (item) => {
    console.log('Edit Item:', item);
    setSelectedItem(item);
    
    // Pre-fill form - Labour Contractor Name is EMPTY by default
    setFormData({
      Status_3: item.Status_3 || '',
      Labouar_Contractor_Name_3: '', // Empty by default - user will type
      Labour_Category_1_3: item.Labour_Category_1_3 || item.labourCategory1 || '',
      Number_Of_Labour_1_3: item.Number_Of_Labour_1_3 || item.numberOfLabour1 || '',
      Labour_Rate_1_3: item.Labour_Rate_1_3 || '',
      Labour_Category_2_3: item.Labour_Category_2_3 || item.labourCategory2 || '',
      Number_Of_Labour_2_3: item.Number_Of_Labour_2_3 || item.numberOfLabour2 || '',
      Labour_Rate_2_3: item.Labour_Rate_2_3 || '',
      Total_Wages_3: item.Total_Wages_3 || '',
      Conveyanance_3: item.Conveyanance_3 || '',
      Total_Paid_Amount_3: item.Total_Paid_Amount_3 || '',
      Company_Head_Amount_3: item.Company_Head_Amount_3 || '',
      Contractor_Head_Amount_3: item.Contractor_Head_Amount_3 || '',
      Remark_3: item.Remark_3 || ''
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
    if (!formData.Status_3) {
      alert('Please select Status');
      return;
    }

    console.log('=== Submitting Labour Management ===');
    console.log('UID:', selectedItem.uid);
    console.log('Form Data:', formData);

    try {
      const payload = {
        uid: selectedItem.uid,
        Status_3: formData.Status_3,
        Labouar_Contractor_Name_3: formData.Labouar_Contractor_Name_3,
        Labour_Category_1_3: formData.Labour_Category_1_3,
        Number_Of_Labour_1_3: formData.Number_Of_Labour_1_3,
        Labour_Rate_1_3: formData.Labour_Rate_1_3,
        Labour_Category_2_3: formData.Labour_Category_2_3,
        Number_Of_Labour_2_3: formData.Number_Of_Labour_2_3,
        Labour_Rate_2_3: formData.Labour_Rate_2_3,
        Total_Wages_3: formData.Total_Wages_3,
        Conveyanance_3: formData.Conveyanance_3,
        Total_Paid_Amount_3: formData.Total_Paid_Amount_3,
        Company_Head_Amount_3: formData.Company_Head_Amount_3,
        Contractor_Head_Amount_3: formData.Contractor_Head_Amount_3,
        Remark_3: formData.Remark_3
      };

      console.log('Payload:', payload);

      const result = await postLabourManagement(payload).unwrap();
      
      console.log('API Response:', result);
      
      if (result.success) {
        alert(`✅ Successfully Updated!\nRow: ${result.rowNumber}\nUpdated: ${result.updatedColumns?.join(', ')}`);
        
        setShowModal(false);
        setSelectedItem(null);
        setFormData({
          Status_3: '',
          Labouar_Contractor_Name_3: '',
          Labour_Category_1_3: '',
          Number_Of_Labour_1_3: '',
          Labour_Rate_1_3: '',
          Labour_Category_2_3: '',
          Number_Of_Labour_2_3: '',
          Labour_Rate_2_3: '',
          Total_Wages_3: '',
          Conveyanance_3: '',
          Total_Paid_Amount_3: '',
          Company_Head_Amount_3: '',
          Contractor_Head_Amount_3: '',
          Remark_3: ''
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
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading Labour Management Data...</p>
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
          <h2 className="text-2xl font-bold text-gray-800">Labour Management</h2>
          <p className="text-gray-500 mt-1">Manage labour payments and assignments</p>
        </div>
        
        <button 
          onClick={refetch}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
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
          <p className="text-gray-500 text-lg font-medium">No records found</p>
          <p className="text-gray-400 mt-1">No labour management data available</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1600px]">
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
                    Name of Contractor
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Contractor Firm
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Approved Head
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Remark
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap sticky right-0 bg-emerald-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((item, index) => (
                  <tr 
                    key={item.uid || item.sheetRow || index} 
                    className="hover:bg-emerald-50/50 transition-colors"
                  >
                    {/* Planned Date */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-teal-100 text-teal-700 text-sm font-semibold">
                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                        {item.planned3 || 'N/A'}
                      </span>
                    </td>
                    
                    {/* UID */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-bold">
                        {item.uid || 'N/A'}
                      </span>
                    </td>
                    
                    {/* Project Name */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {item.projectName || 'N/A'}
                      </span>
                    </td>
                    
                    {/* Project Engineer */}
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
                    
                    {/* Work Type */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
                        {item.workType || 'N/A'}
                      </span>
                    </td>
                    
                    {/* Work Description */}
                    <td className="px-4 py-4 min-w-[200px]">
                      <span className="text-sm text-gray-700">
                        {item.workDescription || 'N/A'}
                      </span>
                    </td>
                    
                    {/* Labour Category 1 */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {item.labourCategory1 || 'N/A'}
                      </span>
                    </td>
                    
                    {/* Number of Labour 1 */}
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                        {item.numberOfLabour1 || '0'}
                      </span>
                    </td>
                    
                    {/* Labour Category 2 */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {item.labourCategory2 || 'N/A'}
                      </span>
                    </td>
                    
                    {/* Number of Labour 2 */}
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold text-sm">
                        {item.numberOfLabour2 || '0'}
                      </span>
                    </td>
                    
                    {/* Total Labour */}
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold text-lg">
                        {item.totalLabour || '0'}
                      </span>
                    </td>
                    
                    {/* Date Required */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-sm font-medium">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        {item.dateRequired || 'N/A'}
                      </span>
                    </td>
                    
                    {/* Name of Contractor */}
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
                    
                    {/* Contractor Firm Name */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {item.contractorFirmName || '-'}
                      </span>
                    </td>
                    
                    {/* Approved Head */}
                    <td className="px-4 py-4 whitespace-nowrap">
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
                    
                    {/* Remark */}
                    <td className="px-4 py-4 min-w-[150px]">
                      <span className="text-sm text-gray-600 italic">
                        {item.remark || '-'}
                      </span>
                    </td>
                    
                    {/* Action - Sticky */}
                    <td className="px-4 py-4 whitespace-nowrap sticky right-0 bg-white shadow-[-4px_0_8px_rgba(0,0,0,0.1)]">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleAction(item)}
                          className="p-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg"
                          title="Manage Labour"
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
                Showing <span className="font-semibold text-emerald-600">{filteredData.length}</span> records
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
            <div className="flex-shrink-0 p-4 sm:p-6 border-b bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-emerald-600" />
                    Labour Management
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    UID: <span className="font-semibold text-indigo-600">{selectedItem.uid}</span>
                    <span className="mx-2">|</span>
                    Project: <span className="font-semibold text-emerald-600">{selectedItem.projectName}</span>
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
              
              {/* Quick Info - Updated with Contractor Name & Firm Name */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Request Info</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-400">Work Type</span>
                    <p className="font-medium text-gray-800">{selectedItem.workType || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Total Labour</span>
                    <p className="font-bold text-green-600">{selectedItem.totalLabour || '0'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Approved Head</span>
                    <p className="font-medium text-purple-600">{selectedItem.Approved_Head_2 || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Date Required</span>
                    <p className="font-medium text-amber-600">{selectedItem.dateRequired || 'N/A'}</p>
                  </div>
                  {/* Contractor Name from API */}
                  <div className="col-span-2">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Contractor Name (from Request)
                    </span>
                    <p className="font-semibold text-emerald-700">{selectedItem.nameOfContractor || 'N/A'}</p>
                  </div>
                  {/* Contractor Firm Name from API */}
                  <div className="col-span-2">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      Contractor Firm Name
                    </span>
                    <p className="font-semibold text-blue-700">{selectedItem.contractorFirmName || 'N/A'}</p>
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
                    value={formData.Status_3}
                    onChange={(e) => handleFormChange('Status_3', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                  >
                    <option value="">-- Select Status --</option>
                    <option value="Done">✅ Done</option>
                   
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Labour Contractor Name - Empty by default */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <HardHat className="w-4 h-4 inline mr-1" />
                  Labour Contractor Name <span className="text-gray-400 font-normal">(Enter manually)</span>
                </label>
                <input
                  type="text"
                  value={formData.Labouar_Contractor_Name_3}
                  onChange={(e) => handleFormChange('Labouar_Contractor_Name_3', e.target.value)}
                  placeholder="Enter labour contractor name..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  💡 Reference: {selectedItem.nameOfContractor || 'N/A'} ({selectedItem.contractorFirmName || 'No Firm'})
                </p>
              </div>

              {/* Labour Category 1 Section */}
              <div className="bg-blue-50 p-4 rounded-xl space-y-3">
                <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Labour Category 1
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Category</label>
                    <input
                      type="text"
                      value={formData.Labour_Category_1_3}
                      onChange={(e) => handleFormChange('Labour_Category_1_3', e.target.value)}
                      placeholder="e.g. Mistri"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">No. of Labour</label>
                    <input
                      type="number"
                      value={formData.Number_Of_Labour_1_3}
                      onChange={(e) => handleFormChange('Number_Of_Labour_1_3', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Rate (₹)</label>
                    <input
                      type="number"
                      value={formData.Labour_Rate_1_3}
                      onChange={(e) => handleFormChange('Labour_Rate_1_3', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Labour Category 2 Section */}
              <div className="bg-cyan-50 p-4 rounded-xl space-y-3">
                <h4 className="text-sm font-semibold text-cyan-800 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Labour Category 2
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Category</label>
                    <input
                      type="text"
                      value={formData.Labour_Category_2_3}
                      onChange={(e) => handleFormChange('Labour_Category_2_3', e.target.value)}
                      placeholder="e.g. Helper"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">No. of Labour</label>
                    <input
                      type="number"
                      value={formData.Number_Of_Labour_2_3}
                      onChange={(e) => handleFormChange('Number_Of_Labour_2_3', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Rate (₹)</label>
                    <input
                      type="number"
                      value={formData.Labour_Rate_2_3}
                      onChange={(e) => handleFormChange('Labour_Rate_2_3', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="bg-green-50 p-4 rounded-xl space-y-3">
                <h4 className="text-sm font-semibold text-green-800 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" />
                  Payment Details
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Total Wages (Auto)</label>
                    <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-green-600">
                      ₹ {formData.Total_Wages_3 || '0'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      <Truck className="w-3 h-3 inline mr-1" />
                      Conveyance (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.Conveyanance_3}
                      onChange={(e) => handleFormChange('Conveyanance_3', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">Total Paid Amount (Auto)</label>
                    <div className="px-3 py-2 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-lg text-lg font-bold text-green-700 text-center">
                      ₹ {formData.Total_Paid_Amount_3 || '0'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Head Amount Distribution */}
              <div className="bg-purple-50 p-4 rounded-xl space-y-3">
                <h4 className="text-sm font-semibold text-purple-800 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Amount Distribution
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {/* Company Head Amount - Disabled & Auto-filled */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      🏢 Company Head Amount (₹) 
                      <span className="text-purple-500 ml-1">(Auto)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.Company_Head_Amount_3}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-purple-100 text-purple-700 font-bold cursor-not-allowed"
                    />
                    <p className="text-xs text-purple-500 mt-1">
                      = Total Paid Amount
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">👷 Contractor Head Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.Contractor_Head_Amount_3}
                      onChange={(e) => handleFormChange('Contractor_Head_Amount_3', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Remark */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Remark <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={formData.Remark_3}
                  onChange={(e) => handleFormChange('Remark_3', e.target.value)}
                  rows={3}
                  placeholder="Enter any remarks..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
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
                disabled={isSubmitting || !formData.Status_3}
                className="px-4 sm:px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-md hover:shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
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
    </div>
  );
};

export default LabourManagement;