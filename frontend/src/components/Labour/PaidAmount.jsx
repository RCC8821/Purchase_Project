


// import React, { useState, useEffect, useRef, useMemo } from 'react';
// import { 
//   useGetPaidStepQuery, 
//   usePostLabourPaidMutation,
//   useGetProjectDropdownQuery
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
//   ChevronDown,
//   IndianRupee,
//   Wallet,
//   Building2,
//   HardHat,
//   CheckCircle2,
//   MessageSquare,
//   CreditCard,
//   Banknote,
//   Receipt,
//   BadgeCheck,
//   CircleDollarSign,
//   CheckSquare,
//   Square,
//   ListChecks,
//   Check,
//   ChevronUp,
//   XCircle
// } from 'lucide-react';

// // ========== Helper Functions ==========
// const formatAmount = (value) => {
//   if (value == null || value === '') return '0';
  
//   const cleaned = String(value).replace(/[^0-9.-]/g, '');
//   const num = parseFloat(cleaned);
  
//   if (isNaN(num)) return '0';
  
//   return num.toLocaleString('en-IN', {
//     maximumFractionDigits: 0,
//     minimumFractionDigits: 0
//   });
// };

// // ========== Searchable Dropdown Component ==========
// const SearchableDropdown = ({ 
//   label, 
//   icon: Icon, 
//   options = [], 
//   value, 
//   onChange, 
//   placeholder,
//   color = 'amber',
//   required = false,
//   disabled = false
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const dropdownRef = useRef(null);

//   const filteredOptions = useMemo(() => {
//     return options.filter(option => {
//       if (typeof option !== 'string') return false;
//       return option.toLowerCase().includes(searchTerm.toLowerCase());
//     });
//   }, [options, searchTerm]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsOpen(false);
//         setSearchTerm('');
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handleSelect = (option) => {
//     onChange(option);
//     setSearchTerm('');
//     setIsOpen(false);
//   };

//   const handleClear = (e) => {
//     e.stopPropagation();
//     onChange('');
//     setSearchTerm('');
//   };

//   const colorClasses = {
//     amber: { bg: 'bg-amber-50', text: 'text-amber-700', hover: 'hover:bg-amber-100', selected: 'bg-amber-100 text-amber-800', ring: 'ring-amber-200', border: 'border-amber-500' },
//     purple: { bg: 'bg-purple-50', text: 'text-purple-700', hover: 'hover:bg-purple-100', selected: 'bg-purple-100 text-purple-800', ring: 'ring-purple-200', border: 'border-purple-500' },
//     green:  { bg: 'bg-green-50',  text: 'text-green-700',  hover: 'hover:bg-green-100',  selected: 'bg-green-100 text-green-800',  ring: 'ring-green-200',  border: 'border-green-500' },
//     blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   hover: 'hover:bg-blue-100',   selected: 'bg-blue-100 text-blue-800',   ring: 'ring-blue-200',   border: 'border-blue-500' }
//   };

//   const colors = colorClasses[color] || colorClasses.amber;

//   if (disabled) {
//     return (
//       <div>
//         {label && (
//           <label className="block text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
//             {Icon && <Icon className="w-4 h-4" />}
//             {label}
//             {required && <span className="text-red-500">*</span>}
//           </label>
//         )}
//         <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed">
//           {placeholder}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div ref={dropdownRef} className="relative">
//       {label && (
//         <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
//           {Icon && <Icon className="w-4 h-4" />}
//           {label}
//           {required && <span className="text-red-500">*</span>}
//         </label>
//       )}
      
//       <div
//         onClick={() => setIsOpen(!isOpen)}
//         className={`relative w-full px-4 py-3 border rounded-xl cursor-pointer transition-all ${
//           isOpen ? `${colors.border} ring-2 ${colors.ring}` : 'border-gray-300'
//         } ${value ? colors.bg : 'bg-white'}`}
//       >
//         <div className="flex items-center justify-between">
//           <div className="flex-1 flex items-center gap-2">
//             {value ? (
//               <span className={`font-medium ${colors.text}`}>{value}</span>
//             ) : (
//               <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) => {
//                   setSearchTerm(e.target.value);
//                   setIsOpen(true);
//                 }}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setIsOpen(true);
//                 }}
//                 placeholder={placeholder}
//                 className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
//               />
//             )}
//           </div>
          
//           <div className="flex items-center gap-2">
//             {value && (
//               <button
//                 onClick={handleClear}
//                 className="p-1 hover:bg-gray-200 rounded-full transition-colors"
//               >
//                 <X className="w-4 h-4 text-gray-500" />
//               </button>
//             )}
//             {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
//           </div>
//         </div>
//       </div>

//       {isOpen && (
//         <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-hidden">
//           {value && (
//             <div className="p-2 border-b border-gray-100">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                 <input
//                   type="text"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   placeholder="Type to search..."
//                   className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
//                   autoFocus
//                 />
//               </div>
//             </div>
//           )}

//           <div className="max-h-48 overflow-y-auto">
//             <button
//               onClick={() => handleSelect('')}
//               className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
//                 !value ? colors.selected : 'hover:bg-gray-50 text-gray-700'
//               }`}
//             >
//               -- Select --
//             </button>

//             {filteredOptions.length > 0 ? (
//               filteredOptions.map((option, index) => (
//                 <button
//                   key={`${option}-${index}`}
//                   onClick={() => handleSelect(option)}
//                   className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between ${
//                     value === option ? colors.selected : `${colors.hover} text-gray-700`
//                   }`}
//                 >
//                   <span className="truncate">{option}</span>
//                   {value === option && <Check className="w-4 h-4 flex-shrink-0" />}
//                 </button>
//               ))
//             ) : (
//               <div className="px-4 py-3 text-sm text-gray-500 text-center">
//                 No results found
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ========== Main Component ==========
// const PaidAmount = () => {
//   const { 
//     data: paidData, 
//     isLoading, 
//     isError, 
//     error, 
//     refetch,
//     isFetching 
//   } = useGetPaidStepQuery();

//   const [postPaid, { isLoading: isSubmitting }] = usePostLabourPaidMutation();

//   const { 
//     data: bankList = [], 
//     isLoading: isBankLoading 
//   } = useGetProjectDropdownQuery();

//   useEffect(() => {
//     console.log('=== Paid Step Data ===', paidData);
//     console.log('=== Bank Dropdown API Response ===', bankList);
//     console.log('First few bank items:', bankList?.slice(0, 5));
//   }, [paidData, bankList]);

//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedProject, setSelectedProject] = useState('');
//   const [selectedContractor, setSelectedContractor] = useState('');
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [showModal, setShowModal] = useState(false);
  
//   const [formData, setFormData] = useState({
//     Status_5: '',
//     PAYMENT_MODE_5: '',
//     BANK_DETAILS_5: '',
//     PAYMENT_DETAILS_5: '',
//     Payment_Date_5: new Date().toISOString().split('T')[0],
//     Remark_5: ''
//   });

//   // ✅ Check if status is Reject
//   const isRejected = formData.Status_5 === 'Reject';

//   const uniqueProjectNames = useMemo(() => {
//     if (!paidData || !Array.isArray(paidData)) return [];
//     return [...new Set(
//       paidData.map(item => item.projectName).filter(Boolean)
//     )].sort();
//   }, [paidData]);

//   const uniqueContractorNames = useMemo(() => {
//     if (!paidData || !Array.isArray(paidData)) return [];
//     return [...new Set(
//       paidData.map(item => item.Labouar_Contractor_Name_3).filter(Boolean)
//     )].sort();
//   }, [paidData]);

//   const uniqueBankNames = useMemo(() => {
//     if (!bankList || !Array.isArray(bankList)) return [];
    
//     const field = 'extraField';

//     const names = bankList
//       .map(item => item[field] || item.bankName || item.name || item.bank_name || '')
//       .filter(name => name && typeof name === 'string' && name.trim() !== '');
    
//     return [...new Set(names)].sort();
//   }, [bankList]);

//   const paymentModeOptions = [
//     { value: '', label: '-- Select Payment Mode --' },
//     { value: 'Cheque', label: '📄 Cheque' },
//     { value: 'Cash', label: '💵 Cash' },
//     { value: 'NEFT', label: '📱 NEFT' },
//     { value: 'RTGS', label: '📋 RTGS' },
//   ];

//   const filteredData = useMemo(() => {
//     if (!paidData || !Array.isArray(paidData)) return [];
    
//     return paidData.filter(item => {
//       const searchLower = searchTerm.toLowerCase();
//       const matchesSearch = 
//         (item.uid || '').toLowerCase().includes(searchLower) ||
//         (item.projectName || '').toLowerCase().includes(searchLower) ||
//         (item.Labouar_Contractor_Name_3 || '').toLowerCase().includes(searchLower) ||
//         (item.projectEngineer || '').toLowerCase().includes(searchLower) ||
//         (item.workDescription || '').toLowerCase().includes(searchLower) ||
//         (item.workType || '').toLowerCase().includes(searchLower);

//       const matchesProject = !selectedProject || item.projectName === selectedProject;
//       const matchesContractor = !selectedContractor || item.Labouar_Contractor_Name_3 === selectedContractor;

//       return matchesSearch && matchesProject && matchesContractor;
//     });
//   }, [paidData, searchTerm, selectedProject, selectedContractor]);

//   const clearAllFilters = () => {
//     setSearchTerm('');
//     setSelectedProject('');
//     setSelectedContractor('');
//   };

//   const hasActiveFilters = searchTerm || selectedProject || selectedContractor;

//   const handleCardSelect = (item) => {
//     setSelectedItems(prev => 
//       prev.some(s => s.uid === item.uid)
//         ? prev.filter(s => s.uid !== item.uid)
//         : [...prev, item]
//     );
//   };

//   const handleSelectAll = () => {
//     setSelectedItems(
//       selectedItems.length === filteredData.length ? [] : [...filteredData]
//     );
//   };

//   const getTotalSelectedAmount = () => selectedItems.reduce((sum, item) => {
//     const val = String(item.Revised_Company_Head_Amount_4 || '0').replace(/[^0-9.-]/g, '');
//     return sum + (parseFloat(val) || 0);
//   }, 0);

//   const handleBulkPayment = () => {
//     if (selectedItems.length === 0) {
//       alert('Please select at least one record');
//       return;
//     }
//     // Reset form when opening modal
//     setFormData({
//       Status_5: '',
//       PAYMENT_MODE_5: '',
//       BANK_DETAILS_5: '',
//       PAYMENT_DETAILS_5: '',
//       Payment_Date_5: new Date().toISOString().split('T')[0],
//       Remark_5: ''
//     });
//     setShowModal(true);
//   };

//   // ✅ Updated handleFormChange
//   const handleFormChange = (field, value) => {
//     setFormData(prev => {
//       const newData = { ...prev, [field]: value };
      
//       // ✅ If status is Reject, clear other fields
//       if (field === 'Status_5' && value === 'Reject') {
//         newData.PAYMENT_MODE_5 = '';
//         newData.BANK_DETAILS_5 = '';
//         newData.PAYMENT_DETAILS_5 = '';
//         newData.Payment_Date_5 = new Date().toISOString().split('T')[0];
//       }
      
//       return newData;
//     });
//   };

//   // ✅ Updated handleSubmit
//   const handleSubmit = async () => {
//     if (selectedItems.length === 0) return;

//     if (!formData.Status_5) return alert('Please select Payment Status');
    
//     // ✅ Only validate other fields if NOT rejected
//     if (formData.Status_5 !== 'Reject') {
//       if (!formData.PAYMENT_MODE_5) return alert('Please select Payment Mode');
//       if (!formData.BANK_DETAILS_5) return alert('Please select Bank');
//     }

//     let success = 0;
//     let failed = 0;
//     const errors = [];

//     for (const item of selectedItems) {
//       try {
//         // ✅ Build payload based on status
//         let payload = {
//           uid: item.uid,
//           Status_5: formData.Status_5,
//           Remark_5: formData.Remark_5 || ''
//         };

//         // ✅ Only add other fields if NOT rejected
//         if (formData.Status_5 !== 'Reject') {
//           payload = {
//             ...payload,
//             PAYMENT_MODE_5: formData.PAYMENT_MODE_5,
//             BANK_DETAILS_5: formData.BANK_DETAILS_5,
//             PAYMENT_DETAILS_5: formData.PAYMENT_DETAILS_5,
//             Payment_Date_5: formData.Payment_Date_5
//           };
//         }

//         const result = await postPaid(payload).unwrap();
//         if (result?.success) {
//           success++;
//         } else {
//           failed++;
//           errors.push(`${item.uid}: ${result?.message || 'Unknown error'}`);
//         }
//       } catch (err) {
//         console.error(err);
//         if (err?.status === 500 && err?.data?.error?.includes('null')) {
//           success++;
//         } else {
//           failed++;
//           errors.push(`${item.uid}: ${err?.data?.message || err?.message || 'Failed'}`);
//         }
//       }
//     }

//     let message = '';
//     if (success > 0 && failed === 0) {
//       if (formData.Status_5 === 'Reject') {
//         message = `✅ Rejection Successful!\nTotal: ${success} records rejected`;
//       } else {
//         message = `✅ Payment Successful!\nTotal: ${success} records\nAmount: ₹${formatAmount(getTotalSelectedAmount())}`;
//       }
//     } else if (success > 0) {
//       message = `⚠️ Partial Success\nSuccess: ${success}\nFailed: ${failed}\n\nErrors:\n${errors.join('\n')}`;
//     } else {
//       message = `❌ Failed\n${failed} errors\n\n${errors.join('\n')}`;
//     }

//     alert(message);
//     setShowModal(false);
//     setSelectedItems([]);
//     refetch();
//   };

//   // ✅ Check if submit should be disabled
//   const isSubmitDisabled = () => {
//     if (!formData.Status_5) return true;
    
//     // If rejected, only status is required
//     if (formData.Status_5 === 'Reject') return false;
    
//     // For Done, check other required fields
//     if (!formData.PAYMENT_MODE_5 || !formData.BANK_DETAILS_5) return true;
    
//     return false;
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
//           <p className="text-gray-600 font-medium">Loading Payment Data...</p>
//         </div>
//       </div>
//     );
//   }

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
//     <div className="space-y-6 p-4 bg-gray-50 min-h-screen">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
//             <CircleDollarSign className="w-7 h-7 text-amber-600" />
//             Payment Processing
//           </h2>
//           <p className="text-gray-500 mt-1">Select multiple records and process bulk payments</p>
//         </div>
//         <button 
//           onClick={refetch}
//           disabled={isFetching}
//           className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50"
//         >
//           <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
//           Refresh
//         </button>
//       </div>

//       {/* Selection Summary */}
//       {selectedItems.length > 0 && (
//         <div className="sticky top-0 z-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white shadow-lg">
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//             <div className="flex flex-wrap items-center gap-4">
//               <div className="flex items-center gap-2">
//                 <ListChecks className="w-6 h-6" />
//                 <span className="font-bold text-lg">{selectedItems.length} Selected</span>
//               </div>
//               <div className="hidden sm:block h-8 w-px bg-white/30" />
//               <div className="flex flex-wrap gap-3 text-sm">
//                 <div className="bg-white px-4 py-1.5 rounded-lg text-amber-600">
//                   <span className="font-medium">💰 Total Amount:</span>
//                   <span className="font-bold ml-1">₹{formatAmount(getTotalSelectedAmount())}</span>
//                 </div>
//               </div>
//             </div>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => setSelectedItems([])}
//                 className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
//               >
//                 Clear All
//               </button>
//               <button
//                 onClick={handleBulkPayment}
//                 className="px-6 py-2 bg-white text-amber-600 hover:bg-amber-50 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-md"
//               >
//                 <Banknote className="w-5 h-5" />
//                 Process Payment
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Filters */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 space-y-4">
//         <div className="flex items-center justify-between">
//           <h3 className="font-semibold text-gray-700 flex items-center gap-2">
//             <Filter className="w-5 h-5 text-amber-600" />
//             Filters
//           </h3>
//           {hasActiveFilters && (
//             <button
//               onClick={clearAllFilters}
//               className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
//             >
//               <X className="w-4 h-4" />
//               Clear All Filters
//             </button>
//           )}
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
//               <Search className="w-4 h-4" />
//               Search
//             </label>
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search UID, engineer, work type..."
//                 value={searchTerm}
//                 onChange={e => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
//               />
//               {searchTerm && (
//                 <button
//                   onClick={() => setSearchTerm('')}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
//                 >
//                   <X className="w-4 h-4 text-gray-400" />
//                 </button>
//               )}
//             </div>
//           </div>

//           <SearchableDropdown
//             label="Project Name"
//             icon={Building}
//             options={uniqueProjectNames}
//             value={selectedProject}
//             onChange={setSelectedProject}
//             placeholder="Search & select project..."
//             color="purple"
//           />

//           <SearchableDropdown
//             label="Labour Contractor"
//             icon={HardHat}
//             options={uniqueContractorNames}
//             value={selectedContractor}
//             onChange={setSelectedContractor}
//             placeholder="Search & select contractor..."
//             color="green"
//           />
//         </div>

//         {hasActiveFilters && (
//           <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
//             <span className="text-xs text-gray-500">Active:</span>
//             {searchTerm && (
//               <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
//                 Search: "{searchTerm}"
//                 <button onClick={() => setSearchTerm('')} className="hover:text-amber-900">
//                   <X className="w-3 h-3" />
//                 </button>
//               </span>
//             )}
//             {selectedProject && (
//               <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
//                 <Building className="w-3 h-3" />
//                 {selectedProject}
//                 <button onClick={() => setSelectedProject('')} className="hover:text-purple-900">
//                   <X className="w-3 h-3" />
//                 </button>
//               </span>
//             )}
//             {selectedContractor && (
//               <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
//                 <HardHat className="w-3 h-3" />
//                 {selectedContractor}
//                 <button onClick={() => setSelectedContractor('')} className="hover:text-green-900">
//                   <X className="w-3 h-3" />
//                 </button>
//               </span>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Results count & select all */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200">
//             <FileText className="w-5 h-5 text-gray-500" />
//             <span className="text-gray-600 font-medium">
//               Showing: <span className="text-amber-600 font-bold">{filteredData.length}</span> of {paidData?.length || 0}
//             </span>
//           </div>
//           {selectedItems.length > 0 && (
//             <span className="text-sm text-amber-600 font-medium">
//               {selectedItems.length} selected
//             </span>
//           )}
//         </div>
        
//         <button
//           onClick={handleSelectAll}
//           disabled={filteredData.length === 0}
//           className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50 ${
//             selectedItems.length === filteredData.length && filteredData.length > 0
//               ? 'bg-amber-500 text-white'
//               : 'bg-white border border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300'
//           }`}
//         >
//           {selectedItems.length === filteredData.length && filteredData.length > 0 ? (
//             <CheckSquare className="w-5 h-5" />
//           ) : (
//             <Square className="w-5 h-5" />
//           )}
//           {selectedItems.length === filteredData.length && filteredData.length > 0 ? 'Deselect All' : 'Select All'}
//         </button>
//       </div>

//       {/* Cards */}
//       {filteredData.length === 0 ? (
//         <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
//           <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//           <p className="text-gray-500 text-lg font-medium">No records found</p>
//           <p className="text-gray-400 mt-1">
//             {hasActiveFilters ? 'Try adjusting your filters' : 'No payment data available'}
//           </p>
//           {hasActiveFilters && (
//             <button
//               onClick={clearAllFilters}
//               className="mt-4 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors font-medium"
//             >
//               Clear Filters
//             </button>
//           )}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//           {filteredData.map((item, index) => {
//             const isSelected = selectedItems.some(s => s.uid === item.uid);
//             return (
//               <div
//                 key={item.uid || index}
//                 onClick={() => handleCardSelect(item)}
//                 className={`relative bg-white rounded-2xl shadow-sm border-2 transition-all cursor-pointer hover:shadow-lg ${
//                   isSelected ? 'border-amber-500 ring-2 ring-amber-200' : 'border-gray-100 hover:border-amber-300'
//                 }`}
//               >
//                 <div className={`absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
//                   isSelected ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400'
//                 }`}>
//                   {isSelected ? <Check className="w-4 h-4" /> : <span className="text-xs">{index + 1}</span>}
//                 </div>

//                 <div className={`p-4 rounded-t-2xl ${isSelected ? 'bg-amber-50' : 'bg-gray-50'}`}>
//                   <div className="flex items-start gap-3">
//                     <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
//                       <span className="text-white font-bold text-lg">
//                         {item.projectName?.charAt(0)?.toUpperCase() || 'P'}
//                       </span>
//                     </div>
//                     <div className="flex-1 min-w-0 pr-8">
//                       <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-1">
//                         <Hash className="w-3 h-3 mr-1" />
//                         {item.uid}
//                       </span>
//                       <h3 className="font-semibold text-gray-800 truncate">
//                         {item.projectName || 'N/A'}
//                       </h3>
//                       <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
//                         <Clock className="w-3 h-3" />
//                         <span>Planned: {item.planned5 || 'N/A'}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="p-4 space-y-3">
//                   <div className="grid grid-cols-2 gap-3 text-sm">
//                     <div className="flex items-center gap-2">
//                       <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
//                         <User className="w-4 h-4 text-blue-600" />
//                       </div>
//                       <div className="min-w-0">
//                         <p className="text-xs text-gray-400">Engineer</p>
//                         <p className="font-medium text-gray-700 truncate">{item.projectEngineer || 'N/A'}</p>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-2">
//                       <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
//                         <HardHat className="w-4 h-4 text-green-600" />
//                       </div>
//                       <div className="min-w-0">
//                         <p className="text-xs text-gray-400">Contractor</p>
//                         <p className="font-medium text-gray-700 truncate">{item.Labouar_Contractor_Name_3 || 'N/A'}</p>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-2">
//                       <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
//                         <Wrench className="w-4 h-4 text-orange-600" />
//                       </div>
//                       <div className="min-w-0">
//                         <p className="text-xs text-gray-400">Work Type</p>
//                         <p className="font-medium text-gray-700 truncate">{item.workType || 'N/A'}</p>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-2">
//                       <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
//                         <Users className="w-4 h-4 text-purple-600" />
//                       </div>
//                       <div className="min-w-0">
//                         <p className="text-xs text-gray-400">Total Labour</p>
//                         <p className="font-medium text-gray-700">{item.totalLabour || '0'}</p>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="border-t border-gray-100 pt-3">
//                     <div className="grid grid-cols-1 gap-2 mb-2">
//                       <div className="bg-purple-50 rounded-lg p-2">
//                         <p className="text-xs text-purple-600">🏢 Paid Amount</p>
//                         <p className="font-bold text-purple-700">
//                           ₹{formatAmount(item.Revised_Company_Head_Amount_4)}
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
//                     <span className="text-gray-500">Deployed: Cat1 - {item.Deployed_Category_1_Labour_No_4 || '0'}</span>
//                     <span className="text-gray-400">|</span>
//                     <span className="text-gray-500">Cat2 - {item.Deployed_Category_2_Labour_No_4 || '0'}</span>
//                   </div>
//                 </div>

//                 {isSelected && (
//                   <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-b-2xl" />
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* Footer stats */}
//       <div className="bg-white rounded-xl p-4 border border-gray-200">
//         <div className="flex flex-wrap items-center justify-between gap-4">
//           <p className="text-sm text-gray-600">
//             Showing <span className="font-semibold text-amber-600">{filteredData.length}</span> records
//             {selectedItems.length > 0 && (
//               <span className="ml-2">
//                 • <span className="font-semibold text-amber-600">{selectedItems.length}</span> selected
//               </span>
//             )}
//           </p>
//           <p className="text-xs text-gray-400">
//             Click on cards to select • Use filters to narrow down results
//           </p>
//         </div>
//       </div>

//       {/* Bulk Payment Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col">
//             <div className="flex-shrink-0 p-4 sm:p-6 border-b bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-2xl">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
//                     <CircleDollarSign className="w-5 h-5 text-amber-600" />
//                     Bulk Payment Processing
//                   </h3>
//                   <p className="text-xs sm:text-sm text-gray-500 mt-1">
//                     Processing <span className="font-semibold text-amber-600">{selectedItems.length}</span> payments
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

//             <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
//               {/* Selected Records Summary */}
//               <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
//                 <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3 flex items-center gap-2">
//                   <ListChecks className="w-4 h-4" />
//                   Selected Records Summary
//                 </h4>
//                 <div className="max-h-24 overflow-y-auto mb-3 bg-white rounded-lg p-2 border border-amber-100">
//                   <div className="flex flex-wrap gap-2">
//                     {selectedItems.map((item, i) => (
//                       <span 
//                         key={item.uid || i}
//                         className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium"
//                       >
//                         {item.uid}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//                 <div className="bg-white p-3 rounded-lg border border-amber-100 text-center">
//                   <span className="text-xs text-gray-500 block">Total Amount (Selected Records)</span>
//                   <p className="font-bold text-amber-800 text-xl mt-1">
//                     ₹{formatAmount(getTotalSelectedAmount())}
//                   </p>
//                 </div>
//               </div>

//               {/* Status Dropdown */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Payment Status <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <select
//                     value={formData.Status_5}
//                     onChange={e => handleFormChange('Status_5', e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none bg-white cursor-pointer"
//                   >
//                     <option value="">-- Select Status --</option>
//                     <option value="Done">✅ Done</option>
//                     <option value="Reject">❌ Reject</option>
//                   </select>
//                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                 </div>
//               </div>

//               {/* ✅ Show Reject Info Message */}
//               {isRejected && (
//                 <div className="p-4 bg-red-50 rounded-xl border border-red-200 animate-fadeIn">
//                   <div className="flex items-center gap-2 text-red-700">
//                     <XCircle className="w-5 h-5" />
//                     <span className="text-sm font-semibold">Rejection Mode</span>
//                   </div>
//                   <p className="text-xs text-red-600 mt-2">
//                     Payment will be rejected for all {selectedItems.length} selected records. 
//                     You can add an optional remark. Other fields are not required.
//                   </p>
//                 </div>
//               )}

//               {/* ✅ Only show these fields if NOT rejected */}
//               {!isRejected && (
//                 <>
//                   {/* Payment Mode */}
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       <CreditCard className="w-4 h-4 inline mr-1" />
//                       Payment Mode <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative">
//                       <select
//                         value={formData.PAYMENT_MODE_5}
//                         onChange={e => handleFormChange('PAYMENT_MODE_5', e.target.value)}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none bg-white cursor-pointer"
//                       >
//                         {paymentModeOptions.map(opt => (
//                           <option key={opt.value} value={opt.value}>
//                             {opt.label}
//                           </option>
//                         ))}
//                       </select>
//                       <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                     </div>
//                   </div>

//                   {/* Bank Details */}
//                   <SearchableDropdown
//                     label="Bank Details"
//                     icon={Building2}
//                     options={uniqueBankNames}
//                     value={formData.BANK_DETAILS_5}
//                     onChange={val => handleFormChange('BANK_DETAILS_5', val)}
//                     placeholder={isBankLoading ? "Loading banks..." : "Search & select bank..."}
//                     color="blue"
//                     required={true}
//                   />
//                   {uniqueBankNames.length === 0 && !isBankLoading && (
//                     <p className="text-xs text-amber-600 -mt-2">
//                       ⚠️ No banks found. Check console logs and field name.
//                     </p>
//                   )}

//                   {/* Payment Details & Date */}
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         <Receipt className="w-4 h-4 inline mr-1" />
//                         Payment Details / Reference
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.PAYMENT_DETAILS_5}
//                         onChange={e => handleFormChange('PAYMENT_DETAILS_5', e.target.value)}
//                         placeholder="Enter transaction/reference no..."
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         <Calendar className="w-4 h-4 inline mr-1" />
//                         Payment Date
//                       </label>
//                       <input
//                         type="date"
//                         value={formData.Payment_Date_5}
//                         onChange={e => handleFormChange('Payment_Date_5', e.target.value)}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
//                       />
//                     </div>
//                   </div>
//                 </>
//               )}

//               {/* Remark - Always visible */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   <MessageSquare className="w-4 h-4 inline mr-1" />
//                   Remark <span className="text-gray-400 font-normal">(Optional)</span>
//                 </label>
//                 <textarea
//                   value={formData.Remark_5}
//                   onChange={e => handleFormChange('Remark_5', e.target.value)}
//                   rows={3}
//                   placeholder={isRejected ? "Enter reason for rejection..." : "Enter any payment remarks..."}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
//                 />
//               </div>

//               {/* Info Note */}
//               <div className={`p-3 rounded-lg border ${isRejected ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
//                 <p className={`text-xs ${isRejected ? 'text-red-700' : 'text-blue-700'}`}>
//                   {isRejected ? (
//                     <>⚠️ <strong>Note:</strong> All {selectedItems.length} selected records will be marked as rejected.</>
//                   ) : (
//                     <>ℹ️ <strong>Note:</strong> The same payment details will be applied to all {selectedItems.length} selected records.</>
//                   )}
//                 </p>
//               </div>
//             </div>

//             {/* Footer */}
//             <div className="flex-shrink-0 p-4 sm:p-6 border-t bg-gray-50 flex gap-3 justify-end rounded-b-2xl">
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="px-4 sm:px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
//               >
//                 Cancel
//               </button>
              
//               <button
//                 onClick={handleSubmit}
//                 disabled={isSubmitting || isSubmitDisabled()}
//                 className={`px-4 sm:px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg ${
//                   isRejected 
//                     ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600'
//                     : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
//                 }`}
//               >
//                 {isSubmitting ? (
//                   <>
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                     <span>Processing {selectedItems.length}...</span>
//                   </>
//                 ) : (
//                   <>
//                     {isRejected ? <XCircle className="w-4 h-4" /> : <BadgeCheck className="w-4 h-4" />}
//                     <span>{isRejected ? `Reject (${selectedItems.length})` : `Confirm Payment (${selectedItems.length})`}</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Animation style */}
//       <style>{`
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(-10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default PaidAmount;




//////



import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  useGetPaidStepQuery, 
  usePostLabourPaidMutation,
  useGetProjectDropdownQuery
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
  ChevronDown,
  IndianRupee,
  Wallet,
  Building2,
  HardHat,
  CheckCircle2,
  MessageSquare,
  CreditCard,
  Banknote,
  Receipt,
  BadgeCheck,
  CircleDollarSign,
  CheckSquare,
  Square,
  ListChecks,
  Check,
  ChevronUp,
  XCircle,
  Link,
  ExternalLink,
  Tag,
  BadgeDollarSign
} from 'lucide-react';

// ========== Helper Functions ==========
const formatAmount = (value) => {
  if (value == null || value === '') return '0';
  const cleaned = String(value).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  });
};

// ========== Searchable Dropdown Component ==========
const SearchableDropdown = ({ 
  label, 
  icon: Icon, 
  options = [], 
  value, 
  onChange, 
  placeholder,
  color = 'amber',
  required = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const filteredOptions = useMemo(() => {
    return options.filter(option => {
      if (typeof option !== 'string') return false;
      return option.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [options, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  const colorClasses = {
    amber:  { bg: 'bg-amber-50',  text: 'text-amber-700',  hover: 'hover:bg-amber-100',  selected: 'bg-amber-100 text-amber-800',  ring: 'ring-amber-200',  border: 'border-amber-500'  },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', hover: 'hover:bg-purple-100', selected: 'bg-purple-100 text-purple-800', ring: 'ring-purple-200', border: 'border-purple-500' },
    green:  { bg: 'bg-green-50',  text: 'text-green-700',  hover: 'hover:bg-green-100',  selected: 'bg-green-100 text-green-800',  ring: 'ring-green-200',  border: 'border-green-500'  },
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   hover: 'hover:bg-blue-100',   selected: 'bg-blue-100 text-blue-800',   ring: 'ring-blue-200',   border: 'border-blue-500'   },
    rose:   { bg: 'bg-rose-50',   text: 'text-rose-700',   hover: 'hover:bg-rose-100',   selected: 'bg-rose-100 text-rose-800',   ring: 'ring-rose-200',   border: 'border-rose-500'   },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', hover: 'hover:bg-indigo-100', selected: 'bg-indigo-100 text-indigo-800',ring: 'ring-indigo-200', border: 'border-indigo-500' },
  };

  const colors = colorClasses[color] || colorClasses.amber;

  if (disabled) {
    return (
      <div>
        {label && (
          <label className="block text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4" />}
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed">
          {placeholder}
        </div>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" />}
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-full px-4 py-3 border rounded-xl cursor-pointer transition-all ${
          isOpen ? `${colors.border} ring-2 ${colors.ring}` : 'border-gray-300'
        } ${value ? colors.bg : 'bg-white'}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 flex items-center gap-2">
            {value ? (
              <span className={`font-medium ${colors.text}`}>{value}</span>
            ) : (
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
                onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
                placeholder={placeholder}
                className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            {value && (
              <button onClick={handleClear} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
            {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-hidden">
          {value && (
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Type to search..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  autoFocus
                />
              </div>
            </div>
          )}
          <div className="max-h-48 overflow-y-auto">
            <button
              onClick={() => handleSelect('')}
              className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                !value ? colors.selected : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              -- Select --
            </button>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  key={`${option}-${index}`}
                  onClick={() => handleSelect(option)}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between ${
                    value === option ? colors.selected : `${colors.hover} text-gray-700`
                  }`}
                >
                  <span className="truncate">{option}</span>
                  {value === option && <Check className="w-4 h-4 flex-shrink-0" />}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ========== VIEW MODES ==========
const VIEW_MODE = {
  LIST: 'list',       // normal card listing
  BILL: 'bill',       // bill-wise payment page
};


// ========== Bill Payment Page ==========

const BillPaymentPage = ({
  billNo,
  billItems,
  onBack,
  postPaid,
  isSubmitting,
  refetch,
  uniqueBankNames,
  isBankLoading,
}) => {
  // ✅ Auto-select all items - user cannot change
  const selectedItems = billItems;

  const [showModal, setShowModal] = useState(true);
  const [formData, setFormData] = useState({
    Status_5: '',
    PAYMENT_MODE_5: '',
    BANK_DETAILS_5: '',
    PAYMENT_DETAILS_5: '',
    Payment_Date_5: new Date().toISOString().split('T')[0],
    Remark_5: ''
  });

  const isRejected = formData.Status_5 === 'Reject';

  const paymentModeOptions = [
    { value: '', label: '-- Select Payment Mode --' },
    { value: 'Cheque', label: '📄 Cheque' },
    { value: 'Cash', label: '💵 Cash' },
    { value: 'NEFT', label: '📱 NEFT' },
    { value: 'RTGS', label: '📋 RTGS' },
  ];

  const getTotalAmount = () => selectedItems.reduce((sum, item) => {
    const val = String(item.Revised_Company_Head_Amount_4 || '0').replace(/[^0-9.-]/g, '');
    return sum + (parseFloat(val) || 0);
  }, 0);

  const handleFormChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'Status_5' && value === 'Reject') {
        newData.PAYMENT_MODE_5 = '';
        newData.BANK_DETAILS_5 = '';
        newData.PAYMENT_DETAILS_5 = '';
        newData.Payment_Date_5 = new Date().toISOString().split('T')[0];
      }
      return newData;
    });
  };

  // ✅ Updated - PAYMENT_DETAILS_5 & Payment_Date_5 also required
  const isSubmitDisabled = () => {
    if (!formData.Status_5) return true;
    if (formData.Status_5 === 'Reject') return false;
    if (!formData.PAYMENT_MODE_5) return true;
    if (!formData.BANK_DETAILS_5) return true;
    if (!formData.PAYMENT_DETAILS_5.trim()) return true; // ✅ Required
    if (!formData.Payment_Date_5) return true;           // ✅ Required
    return false;
  };

  const handleSubmit = async () => {
    if (!formData.Status_5) return alert('Please select Payment Status');
    if (formData.Status_5 !== 'Reject') {
      if (!formData.PAYMENT_MODE_5) return alert('Please select Payment Mode');
      if (!formData.BANK_DETAILS_5) return alert('Please select Bank');
      if (!formData.PAYMENT_DETAILS_5.trim()) return alert('Please enter Payment Details / Reference'); // ✅ Added
      if (!formData.Payment_Date_5) return alert('Please select Payment Date'); // ✅ Added
    }

    let success = 0, failed = 0;
    const errors = [];

    for (const item of selectedItems) {
      try {
        let payload = {
          uid: item.uid,
          Status_5: formData.Status_5,
          Remark_5: formData.Remark_5 || ''
        };
        if (formData.Status_5 !== 'Reject') {
          payload = {
            ...payload,
            PAYMENT_MODE_5: formData.PAYMENT_MODE_5,
            BANK_DETAILS_5: formData.BANK_DETAILS_5,
            PAYMENT_DETAILS_5: formData.PAYMENT_DETAILS_5,
            Payment_Date_5: formData.Payment_Date_5
          };
        }
        const result = await postPaid(payload).unwrap();
        if (result?.success) { success++; }
        else { failed++; errors.push(`${item.uid}: ${result?.message || 'Unknown error'}`); }
      } catch (err) {
        console.error(err);
        if (err?.status === 500 && err?.data?.error?.includes('null')) { success++; }
        else { failed++; errors.push(`${item.uid}: ${err?.data?.message || err?.message || 'Failed'}`); }
      }
    }

    let message = '';
    if (success > 0 && failed === 0) {
      message = formData.Status_5 === 'Reject'
        ? `✅ Rejection Successful!\nTotal: ${success} records rejected`
        : `✅ Payment Successful!\nTotal: ${success} records\nAmount: ₹${formatAmount(getTotalAmount())}`;
    } else if (success > 0) {
      message = `⚠️ Partial Success\nSuccess: ${success}\nFailed: ${failed}\n\nErrors:\n${errors.join('\n')}`;
    } else {
      message = `❌ Failed\n${failed} errors\n\n${errors.join('\n')}`;
    }

    alert(message);
    setShowModal(false);
    refetch();
    onBack();
  };

  // ✅ When modal is closed without submitting - go back to list
  const handleModalClose = () => {
    setShowModal(false);
    onBack();
  };

  const paidNames = [...new Set(billItems.map(i => i.Paid_Name).filter(Boolean))];
  const billUrl = billItems.find(i => i.Bill_Url)?.Bill_Url || '';

  return (
    <div className="space-y-6 p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ChevronDown className="w-5 h-5 text-gray-600 rotate-90" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Receipt className="w-7 h-7 text-amber-600" />
              Bill Payment — <span className="text-amber-600">{billNo}</span>
            </h2>
            <p className="text-gray-500 mt-1">
              {billItems.length} record(s) under this bill
              {paidNames.length > 0 && (
                <span className="ml-2 text-indigo-600 font-medium">
                  • Paid To: {paidNames.join(', ')}
                </span>
              )}
            </p>
          </div>
        </div>

        {billUrl && (
          <a
            href={billUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Bill
          </a>
        )}
      </div>

      {/* Bill Info Banner */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-4">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Tag className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Bill Number</p>
              <p className="font-bold text-indigo-700 text-lg">{billNo}</p>
            </div>
          </div>

          {paidNames.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Paid Name(s)</p>
                <p className="font-bold text-purple-700">{paidNames.join(', ')}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Records</p>
              <p className="font-bold text-amber-700">{billItems.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Bill Amount</p>
              <p className="font-bold text-green-700 text-lg">
                ₹{formatAmount(getTotalAmount())}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards - Read Only */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-amber-600" />
          All {billItems.length} records included in this payment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {billItems.map((item, index) => (
            <div
              key={item.uid || index}
              className="relative bg-white rounded-2xl shadow-sm border-2 border-amber-400 ring-2 ring-amber-100"
            >
              {/* Always show checkmark */}
              <div className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center bg-amber-500 text-white">
                <Check className="w-4 h-4" />
              </div>

              <div className="p-4 rounded-t-2xl bg-amber-50">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {item.projectName?.charAt(0)?.toUpperCase() || 'P'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-1">
                      <Hash className="w-3 h-3 mr-1" />
                      {item.uid}
                    </span>
                    <h3 className="font-semibold text-gray-800 truncate">{item.projectName || 'N/A'}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>Planned: {item.planned5 || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">Engineer</p>
                      <p className="font-medium text-gray-700 truncate">{item.projectEngineer || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <HardHat className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">Contractor</p>
                      <p className="font-medium text-gray-700 truncate">{item.Labouar_Contractor_Name_3 || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Wrench className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">Work Type</p>
                      <p className="font-medium text-gray-700 truncate">{item.workType || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">Total Labour</p>
                      <p className="font-medium text-gray-700">{item.totalLabour || '0'}</p>
                    </div>
                  </div>
                </div>

                {item.Paid_Name && (
                  <div className="flex items-center gap-2 bg-indigo-50 rounded-lg px-3 py-2">
                    <User className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-indigo-500">Paid Name</p>
                      <p className="font-semibold text-indigo-700 truncate">{item.Paid_Name}</p>
                    </div>
                  </div>
                )}

                {(item.Bill_No || item.Bill_Url) && (
                  <div className="grid grid-cols-2 gap-2">
                    {item.Bill_No && (
                      <div className="flex items-center gap-2 bg-rose-50 rounded-lg px-3 py-2">
                        <Receipt className="w-4 h-4 text-rose-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-rose-500">Bill No</p>
                          <p className="font-semibold text-rose-700 truncate text-sm">{item.Bill_No}</p>
                        </div>
                      </div>
                    )}
                    {item.Bill_Url && (
                      <a
                        href={item.Bill_Url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-2 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-blue-500">Bill URL</p>
                          <p className="font-semibold text-blue-700 text-xs">View Bill</p>
                        </div>
                      </a>
                    )}
                  </div>
                )}

                <div className="border-t border-gray-100 pt-3">
                  <div className="bg-purple-50 rounded-lg p-2">
                    <p className="text-xs text-purple-600">🏢 Paid Amount</p>
                    <p className="font-bold text-purple-700">
                      ₹{formatAmount(item.Revised_Company_Head_Amount_4)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-gray-500">Cat1 - {item.Deployed_Category_1_Labour_No_4 || '0'}</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500">Cat2 - {item.Deployed_Category_2_Labour_No_4 || '0'}</span>
                </div>
              </div>

              {/* Always show amber bottom bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-b-2xl" />
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal - Auto Opens */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex-shrink-0 p-4 sm:p-6 border-b bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                    <CircleDollarSign className="w-5 h-5 text-amber-600" />
                    Bulk Payment Processing
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Bill: <span className="font-semibold text-indigo-600">{billNo}</span>
                    {' '}• Processing{' '}
                    <span className="font-semibold text-amber-600">{selectedItems.length}</span> payments
                  </p>
                </div>
                <button
                  onClick={handleModalClose}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Summary */}
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <ListChecks className="w-4 h-4" />
                  Selected Records Summary
                </h4>
                <div className="max-h-24 overflow-y-auto mb-3 bg-white rounded-lg p-2 border border-amber-100">
                  <div className="flex flex-wrap gap-2">
                    {selectedItems.map((item, i) => (
                      <span
                        key={item.uid || i}
                        className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium"
                      >
                        {item.uid}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-amber-100 text-center">
                  <span className="text-xs text-gray-500 block">Total Amount</span>
                  <p className="font-bold text-amber-800 text-xl mt-1">
                    ₹{formatAmount(getTotalAmount())}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Status <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.Status_5}
                    onChange={e => handleFormChange('Status_5', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none bg-white cursor-pointer"
                  >
                    <option value="">-- Select Status --</option>
                    <option value="Done">✅ Done</option>
                    <option value="Reject">❌ Reject</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Rejection Mode Banner */}
              {isRejected && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-200 animate-fadeIn">
                  <div className="flex items-center gap-2 text-red-700">
                    <XCircle className="w-5 h-5" />
                    <span className="text-sm font-semibold">Rejection Mode</span>
                  </div>
                  <p className="text-xs text-red-600 mt-2">
                    Payment will be rejected for all {selectedItems.length} selected records.
                    You can add an optional remark.
                  </p>
                </div>
              )}

              {/* Payment Fields - Only show when NOT rejected */}
              {!isRejected && (
                <>
                  {/* Payment Mode */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <CreditCard className="w-4 h-4 inline mr-1" />
                      Payment Mode <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.PAYMENT_MODE_5}
                        onChange={e => handleFormChange('PAYMENT_MODE_5', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none bg-white cursor-pointer"
                      >
                        {paymentModeOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Bank Details */}
                  <SearchableDropdown
                    label="Bank Details"
                    icon={Building2}
                    options={uniqueBankNames}
                    value={formData.BANK_DETAILS_5}
                    onChange={val => handleFormChange('BANK_DETAILS_5', val)}
                    placeholder={isBankLoading ? "Loading banks..." : "Search & select bank..."}
                    color="blue"
                    required={true}
                  />

                  {/* Payment Details & Date */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* ✅ Payment Details - Now Required */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Receipt className="w-4 h-4 inline mr-1" />
                        Payment Details / Reference{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.PAYMENT_DETAILS_5}
                        onChange={e => handleFormChange('PAYMENT_DETAILS_5', e.target.value)}
                        placeholder="Enter transaction/reference no..."
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors ${
                          !formData.PAYMENT_DETAILS_5.trim()
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300 bg-white'
                        }`}
                      />
                      {/* ✅ Helper text when empty */}
                      {!formData.PAYMENT_DETAILS_5.trim() && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <span>⚠️</span>
                          <span>Payment reference is required</span>
                        </p>
                      )}
                    </div>

                    {/* ✅ Payment Date - Now Required */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Payment Date{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.Payment_Date_5}
                        onChange={e => handleFormChange('Payment_Date_5', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors ${
                          !formData.Payment_Date_5
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300 bg-white'
                        }`}
                      />
                      {/* ✅ Helper text when empty */}
                      {!formData.Payment_Date_5 && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <span>⚠️</span>
                          <span>Payment date is required</span>
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Remark - Always visible */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Remark{' '}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={formData.Remark_5}
                  onChange={e => handleFormChange('Remark_5', e.target.value)}
                  rows={3}
                  placeholder={
                    isRejected
                      ? "Enter reason for rejection..."
                      : "Enter any payment remarks..."
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              {/* Note Banner */}
              <div
                className={`p-3 rounded-lg border ${
                  isRejected
                    ? 'bg-red-50 border-red-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <p className={`text-xs ${isRejected ? 'text-red-700' : 'text-blue-700'}`}>
                  {isRejected ? (
                    <>
                      <strong>⚠️ Note:</strong> All {selectedItems.length} selected records
                      will be marked as rejected.
                    </>
                  ) : (
                    <>
                      <strong>ℹ️ Note:</strong> The same payment details will be applied
                      to all {selectedItems.length} selected records.
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 p-4 sm:p-6 border-t bg-gray-50 flex gap-3 justify-end rounded-b-2xl">
              <button
                onClick={handleModalClose}
                className="px-4 sm:px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || isSubmitDisabled()}
                className={`px-4 sm:px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 
                  disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg ${
                  isRejected
                    ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing {selectedItems.length}...</span>
                  </>
                ) : (
                  <>
                    {isRejected
                      ? <XCircle className="w-4 h-4" />
                      : <BadgeCheck className="w-4 h-4" />
                    }
                    <span>
                      {isRejected
                        ? `Reject (${selectedItems.length})`
                        : `Confirm Payment (${selectedItems.length})`
                      }
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};



// ========== Main Component ==========
const PaidAmount = () => {
  const { 
    data: rawPaidData, 
    isLoading, 
    isError, 
    error, 
    refetch,
    isFetching 
  } = useGetPaidStepQuery();

  const paidData = useMemo(() => {
    if (!rawPaidData) return [];
    if (Array.isArray(rawPaidData)) return rawPaidData;
    if (Array.isArray(rawPaidData?.data)) return rawPaidData.data;
    return [];
  }, [rawPaidData]);

  const [postPaid, { isLoading: isSubmitting }] = usePostLabourPaidMutation();

  const { 
    data: bankList = [], 
    isLoading: isBankLoading 
  } = useGetProjectDropdownQuery();

  // ========== View Mode ==========
  const [viewMode, setViewMode] = useState(VIEW_MODE.LIST);
  const [activeBillNo, setActiveBillNo] = useState('');

  // ========== Filter States ==========
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedContractor, setSelectedContractor] = useState('');
  const [selectedBillNo, setSelectedBillNo] = useState('');
  const [selectedPaidName, setSelectedPaidName] = useState('');

  // ========== Unique Options ==========
  const uniqueProjectNames = useMemo(() => {
    if (!paidData.length) return [];
    return [...new Set(paidData.map(i => i.projectName).filter(Boolean))].sort();
  }, [paidData]);

  const uniqueContractorNames = useMemo(() => {
    if (!paidData.length) return [];
    return [...new Set(paidData.map(i => i.Labouar_Contractor_Name_3).filter(Boolean))].sort();
  }, [paidData]);

  const uniqueBillNumbers = useMemo(() => {
    if (!paidData.length) return [];
    return [...new Set(paidData.map(i => i.Bill_No).filter(Boolean))].sort();
  }, [paidData]);

  const uniquePaidNames = useMemo(() => {
    if (!paidData.length) return [];
    return [...new Set(paidData.map(i => i.Paid_Name).filter(Boolean))].sort();
  }, [paidData]);

  const uniqueBankNames = useMemo(() => {
    if (!bankList || !Array.isArray(bankList)) return [];
    const names = bankList
      .map(item => item['extraField'] || item.bankName || item.name || item.bank_name || '')
      .filter(name => name && typeof name === 'string' && name.trim() !== '');
    return [...new Set(names)].sort();
  }, [bankList]);

  // ========== All Filters Together ==========
  const filteredData = useMemo(() => {
    if (!paidData.length) return [];
    return paidData.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch = !searchTerm || (
        (item.uid || '').toLowerCase().includes(searchLower) ||
        (item.projectName || '').toLowerCase().includes(searchLower) ||
        (item.Labouar_Contractor_Name_3 || '').toLowerCase().includes(searchLower) ||
        (item.projectEngineer || '').toLowerCase().includes(searchLower) ||
        (item.workDescription || '').toLowerCase().includes(searchLower) ||
        (item.workType || '').toLowerCase().includes(searchLower) ||
        (item.Bill_No || '').toLowerCase().includes(searchLower) ||
        (item.Paid_Name || '').toLowerCase().includes(searchLower)
      );

      const matchesProject    = !selectedProject    || item.projectName === selectedProject;
      const matchesContractor = !selectedContractor || item.Labouar_Contractor_Name_3 === selectedContractor;
      const matchesBillNo     = !selectedBillNo     || item.Bill_No === selectedBillNo;
      const matchesPaidName   = !selectedPaidName   || item.Paid_Name === selectedPaidName;

      // ✅ All filters work together with AND logic
      return matchesSearch && matchesProject && matchesContractor && matchesBillNo && matchesPaidName;
    });
  }, [paidData, searchTerm, selectedProject, selectedContractor, selectedBillNo, selectedPaidName]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedProject('');
    setSelectedContractor('');
    setSelectedBillNo('');
    setSelectedPaidName('');
  };

  const hasActiveFilters = searchTerm || selectedProject || selectedContractor || selectedBillNo || selectedPaidName;

  // ✅ Bill No select → go to Bill Payment Page
  const handleBillNoSelect = (billNo) => {
    setSelectedBillNo(billNo);
    if (billNo) {
      setActiveBillNo(billNo);
      setViewMode(VIEW_MODE.BILL);
    }
  };

  const handleBackToList = () => {
    setViewMode(VIEW_MODE.LIST);
    setActiveBillNo('');
    setSelectedBillNo('');
  };

  const billItems = useMemo(() => {
    if (!activeBillNo) return [];
    return paidData.filter(i => i.Bill_No === activeBillNo);
  }, [paidData, activeBillNo]);

  // ========== Loading / Error ==========
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading Payment Data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center bg-red-50 p-6 rounded-xl border border-red-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium mb-2">Error Loading Data</p>
          <p className="text-red-500 text-sm mb-4">{error?.data?.message || 'Failed to fetch data'}</p>
          <button onClick={refetch} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto">
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ========== Bill Payment View ==========
  if (viewMode === VIEW_MODE.BILL && activeBillNo) {
    return (
      <BillPaymentPage
        billNo={activeBillNo}
        billItems={billItems}
        onBack={handleBackToList}
        postPaid={postPaid}
        isSubmitting={isSubmitting}
        refetch={refetch}
        uniqueBankNames={uniqueBankNames}
        isBankLoading={isBankLoading}
      />
    );
  }

  // ========== Main List View ==========
  return (
    <div className="space-y-6 p-4 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CircleDollarSign className="w-7 h-7 text-amber-600" />
            Payment Processing
          </h2>
          <p className="text-gray-500 mt-1">
            Use filters to find records • Select Bill No to process payment
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ✅ Filters - All work together */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Filter className="w-5 h-5 text-amber-600" />
            Filters
            <span className="text-xs text-gray-400 font-normal">(All filters work together)</span>
          </h3>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        {/* Row 1 - Search + Project + Contractor */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search UID, project, engineer..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          <SearchableDropdown
            label="Project Name"
            icon={Building}
            options={uniqueProjectNames}
            value={selectedProject}
            onChange={setSelectedProject}
            placeholder="Select project..."
            color="purple"
          />

          <SearchableDropdown
            label="Labour Contractor"
            icon={HardHat}
            options={uniqueContractorNames}
            value={selectedContractor}
            onChange={setSelectedContractor}
            placeholder="Select contractor..."
            color="green"
          />
        </div>

        {/* Row 2 - Bill No + Paid Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ✅ Bill No - click to open payment page */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-rose-500" />
              Bill Number
              <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-normal">
                Click to process payment
              </span>
            </label>
            <SearchableDropdown
              icon={Receipt}
              options={uniqueBillNumbers}
              value={selectedBillNo}
              onChange={handleBillNoSelect}
              placeholder="Select bill number to process..."
              color="rose"
            />
          </div>

          <SearchableDropdown
            label="Paid Name"
            icon={User}
            options={uniquePaidNames}
            value={selectedPaidName}
            onChange={setSelectedPaidName}
            placeholder="Select paid name..."
            color="indigo"
          />
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-400 self-center">Active filters:</span>

            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                🔍 "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-amber-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedProject && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                <Building className="w-3 h-3" />
                {selectedProject}
                <button onClick={() => setSelectedProject('')} className="ml-1 hover:text-purple-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedContractor && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                <HardHat className="w-3 h-3" />
                {selectedContractor}
                <button onClick={() => setSelectedContractor('')} className="ml-1 hover:text-green-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedBillNo && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-medium">
                <Receipt className="w-3 h-3" />
                Bill: {selectedBillNo}
                <button onClick={() => setSelectedBillNo('')} className="ml-1 hover:text-rose-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedPaidName && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                <User className="w-3 h-3" />
                {selectedPaidName}
                <button onClick={() => setSelectedPaidName('')} className="ml-1 hover:text-indigo-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200">
          <FileText className="w-5 h-5 text-gray-500" />
          <span className="text-gray-600 font-medium">
            Showing: <span className="text-amber-600 font-bold">{filteredData.length}</span>
            <span className="text-gray-400"> of {paidData?.length || 0} records</span>
          </span>
        </div>

        <div className="text-xs text-gray-400 bg-white px-4 py-2 rounded-xl border border-gray-200">
          💡 Select <span className="text-rose-500 font-semibold">Bill Number</span> above to process payment
        </div>
      </div>

      {/* ✅ Cards - NOT clickable, NO selection */}
      {filteredData.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No records found</p>
          <p className="text-gray-400 mt-1">
            {hasActiveFilters ? 'Try adjusting your filters' : 'No payment data available'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="mt-4 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredData.map((item, index) => (
            <div
              key={item.uid || index}
              // ✅ NO onClick - cards are not selectable
              className="relative bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all"
            >
              {/* ✅ Serial number only - no select indicator */}
              <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-xs text-gray-500 font-medium">{index + 1}</span>
              </div>

              {/* Card Header */}
              <div className="p-4 rounded-t-2xl bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {item.projectName?.charAt(0)?.toUpperCase() || 'P'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-1">
                      <Hash className="w-3 h-3 mr-1" />
                      {item.uid}
                    </span>
                    <h3 className="font-semibold text-gray-800 truncate">{item.projectName || 'N/A'}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>Planned: {item.planned5 || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">Engineer</p>
                      <p className="font-medium text-gray-700 truncate">{item.projectEngineer || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <HardHat className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">Contractor</p>
                      <p className="font-medium text-gray-700 truncate">{item.Labouar_Contractor_Name_3 || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Wrench className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">Work Type</p>
                      <p className="font-medium text-gray-700 truncate">{item.workType || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">Total Labour</p>
                      <p className="font-medium text-gray-700">{item.totalLabour || '0'}</p>
                    </div>
                  </div>
                </div>

                {/* Paid Name */}
                {item.Paid_Name && (
                  <div className="flex items-center gap-2 bg-indigo-50 rounded-lg px-3 py-2">
                    <User className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-indigo-500">Paid Name</p>
                      <p className="font-semibold text-indigo-700 truncate">{item.Paid_Name}</p>
                    </div>
                  </div>
                )}

                {/* Bill No + Bill URL */}
                {(item.Bill_No || item.Bill_Url) && (
                  <div className="grid grid-cols-2 gap-2">
                    {item.Bill_No && (
                      <button
                        onClick={() => handleBillNoSelect(item.Bill_No)}
                        className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg px-3 py-2 transition-colors text-left"
                      >
                        <Receipt className="w-4 h-4 text-rose-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-rose-500">Bill No</p>
                          <p className="font-semibold text-rose-700 truncate text-sm">{item.Bill_No}</p>
                        </div>
                      </button>
                    )}
                    {item.Bill_Url && (
                      <a
                        href={item.Bill_Url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-2 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-blue-500">Bill URL</p>
                          <p className="font-semibold text-blue-700 text-xs">View Bill</p>
                        </div>
                      </a>
                    )}
                  </div>
                )}

                {/* Amount */}
                <div className="border-t border-gray-100 pt-3">
                  <div className="bg-purple-50 rounded-lg p-2">
                    <p className="text-xs text-purple-600">🏢 Paid Amount</p>
                    <p className="font-bold text-purple-700">
                      ₹{formatAmount(item.Revised_Company_Head_Amount_4)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-gray-500">Cat1 - {item.Deployed_Category_1_Labour_No_4 || '0'}</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500">Cat2 - {item.Deployed_Category_2_Labour_No_4 || '0'}</span>
                </div>
              </div>
              {/* ✅ NO bottom amber bar - not selected */}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            Total <span className="font-semibold text-amber-600">{filteredData.length}</span> records shown
          </p>
          <p className="text-xs text-gray-400">
            💡 Click on <span className="text-rose-500 font-medium">Bill No</span> on any card to process that bill's payment
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};



export default PaidAmount;