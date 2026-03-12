

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
//   MapPin,
//   Briefcase,
//   Check,
//   ChevronUp
// } from 'lucide-react';

// // ========== Searchable Dropdown Component ==========
// const SearchableDropdown = ({ 
//   label, 
//   icon: Icon, 
//   options = [], 
//   value, 
//   onChange, 
//   placeholder,
//   color = 'amber',
//   required = false
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const dropdownRef = useRef(null);

//   // ✅ Safe filtering - ensure all options are strings
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
//     amber: {
//       bg: 'bg-amber-50',
//       text: 'text-amber-700',
//       hover: 'hover:bg-amber-100',
//       selected: 'bg-amber-100 text-amber-800',
//       ring: 'ring-amber-200',
//       border: 'border-amber-500'
//     },
//     purple: {
//       bg: 'bg-purple-50',
//       text: 'text-purple-700',
//       hover: 'hover:bg-purple-100',
//       selected: 'bg-purple-100 text-purple-800',
//       ring: 'ring-purple-200',
//       border: 'border-purple-500'
//     },
//     green: {
//       bg: 'bg-green-50',
//       text: 'text-green-700',
//       hover: 'hover:bg-green-100',
//       selected: 'bg-green-100 text-green-800',
//       ring: 'ring-green-200',
//       border: 'border-green-500'
//     },
//     blue: {
//       bg: 'bg-blue-50',
//       text: 'text-blue-700',
//       hover: 'hover:bg-blue-100',
//       selected: 'bg-blue-100 text-blue-800',
//       ring: 'ring-blue-200',
//       border: 'border-blue-500'
//     }
//   };

//   const colors = colorClasses[color] || colorClasses.amber;

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
//             {isOpen ? (
//               <ChevronUp className="w-5 h-5 text-gray-400" />
//             ) : (
//               <ChevronDown className="w-5 h-5 text-gray-400" />
//             )}
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
//                 !value 
//                   ? colors.selected 
//                   : 'hover:bg-gray-50 text-gray-700'
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
//                     value === option 
//                       ? colors.selected 
//                       : `${colors.hover} text-gray-700`
//                   }`}
//                 >
//                   <span className="truncate">{option}</span>
//                   {value === option && (
//                     <Check className="w-4 h-4 flex-shrink-0" />
//                   )}
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
//   // ========== API Hooks ==========
//   const { 
//     data: paidData, 
//     isLoading, 
//     isError, 
//     error, 
//     refetch,
//     isFetching 
//   } = useGetPaidStepQuery();

//   const [postPaid, { isLoading: isSubmitting }] = usePostLabourPaidMutation();

//   // ✅ Fetch Bank Names from API
//   const { 
//     data: bankList = [], 
//     isLoading: isBankLoading 
//   } = useGetProjectDropdownQuery();

//   useEffect(() => {
//     console.log('=== Paid Step Data ===');
//     console.log('Data:', paidData);
//     console.log('Bank List:', bankList);
//   }, [paidData, bankList]);

//   // ========== Local State ==========
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedProject, setSelectedProject] = useState('');
//   const [selectedContractor, setSelectedContractor] = useState('');
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [showModal, setShowModal] = useState(false);
  
//   // ========== Form State ==========
//   const [formData, setFormData] = useState({
//     Status_5: '',
//     PAYMENT_MODE_5: '',
//     BANK_DETAILS_5: '',
//     PAYMENT_DETAILS_5: '',
//     Payment_Date_5: '',
//     Remark_5: ''
//   });

//   // ========== Unique Values ==========
//   const uniqueProjectNames = useMemo(() => {
//     if (!paidData || !Array.isArray(paidData)) return [];
//     return [...new Set(
//       paidData
//         .map(item => item.projectName)
//         .filter(name => name && String(name).trim() !== '')
//     )].sort();
//   }, [paidData]);

//   const uniqueContractorNames = useMemo(() => {
//     if (!paidData || !Array.isArray(paidData)) return [];
//     return [...new Set(
//       paidData
//         .map(item => item.Labouar_Contractor_Name_3)
//         .filter(name => name && String(name).trim() !== '')
//     )].sort();
//   }, [paidData]);

//   // ✅ FIXED: Get unique bank names from extraField - only where extraField exists
//   const uniqueBankNames = useMemo(() => {
//     if (!bankList || !Array.isArray(bankList)) return [];
    
//     const bankNames = bankList
//       .map(item => item.extraField) // ✅ Get extraField
//       .filter(name => name && String(name).trim() !== ''); // ✅ Only non-empty values
    
//     // Remove duplicates and sort
//     return [...new Set(bankNames)].sort();
//   }, [bankList]);

//   // Debug log
//   useEffect(() => {
//     console.log('=== Bank Names Debug ===');
//     console.log('Raw Bank List:', bankList);
//     console.log('Extracted Bank Names (extraField):', uniqueBankNames);
//   }, [bankList, uniqueBankNames]);

//   // ========== Payment Mode Options ==========
//   const paymentModeOptions = [
//      { value: '', label: '-- Select Payment Mode --' },
//    { value: 'Cheque', label: '📄 Cheque' },
//     { value: 'Cash', label: '💵 Cash' },
//    { value: 'NEFT', label: '📱 NEFT' },
//     { value: 'RTGS', label: '📋 RTGS' },
//  { value: 'IMPS', label: '💳 IMPS' }
//   ];

//   // ========== Filter Data ==========
//   const filteredData = useMemo(() => {
//     if (!paidData || !Array.isArray(paidData)) return [];
    
//     return paidData.filter(item => {
//       const searchLower = searchTerm.toLowerCase();
//       const matchesSearch = 
//         item.uid?.toLowerCase().includes(searchLower) ||
//         item.projectName?.toLowerCase().includes(searchLower) ||
//         item.nameOfContractor?.toLowerCase().includes(searchLower) ||
//         item.projectEngineer?.toLowerCase().includes(searchLower) ||
//         item.workDescription?.toLowerCase().includes(searchLower) ||
//         item.workType?.toLowerCase().includes(searchLower) ||
//         item.Labouar_Contractor_Name_3?.toLowerCase().includes(searchLower);

//       const matchesProject = !selectedProject || item.projectName === selectedProject;
//       const matchesContractor = !selectedContractor || item.Labouar_Contractor_Name_3 === selectedContractor;

//       return matchesSearch && matchesProject && matchesContractor;
//     });
//   }, [paidData, searchTerm, selectedProject, selectedContractor]);

//   // ========== Helpers ==========
//   const clearAllFilters = () => {
//     setSearchTerm('');
//     setSelectedProject('');
//     setSelectedContractor('');
//   };

//   const hasActiveFilters = searchTerm || selectedProject || selectedContractor;

//   const handleCardSelect = (item) => {
//     const isSelected = selectedItems.find(selected => selected.uid === item.uid);
    
//     if (isSelected) {
//       setSelectedItems(selectedItems.filter(selected => selected.uid !== item.uid));
//     } else {
//       setSelectedItems([...selectedItems, item]);
//     }
//   };

//   const handleSelectAll = () => {
//     if (selectedItems.length === filteredData.length) {
//       setSelectedItems([]);
//     } else {
//       setSelectedItems([...filteredData]);
//     }
//   };

//   const getTotalSelectedAmount = () => {
//     return selectedItems.reduce((total, item) => {
//       const companyAmt = parseFloat(item.Revised_Company_Head_Amount_4) || 0;
//       const contractorAmt = parseFloat(item.Revised_Contractor_Head_Amount_4) || 0;
//       return total + companyAmt + contractorAmt;
//     }, 0);
//   };

//   const getTotalCompanyAmount = () => {
//     return selectedItems.reduce((total, item) => {
//       return total + (parseFloat(item.Revised_Company_Head_Amount_4) || 0);
//     }, 0);
//   };

//   const getTotalContractorAmount = () => {
//     return selectedItems.reduce((total, item) => {
//       return total + (parseFloat(item.Revised_Contractor_Head_Amount_4) || 0);
//     }, 0);
//   };

//   const handleBulkPayment = () => {
//     if (selectedItems.length === 0) {
//       alert('Please select at least one record');
//       return;
//     }
    
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

//   const handleFormChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   // ========== Handle Submit ==========
//   const handleSubmit = async () => {
//     if (selectedItems.length === 0) return;

//     // Validation
//     if (!formData.Status_5) {
//       alert('Please select Payment Status');
//       return;
//     }

//     if (!formData.PAYMENT_MODE_5) {
//       alert('Please select Payment Mode');
//       return;
//     }

//     if (!formData.BANK_DETAILS_5) {
//       alert('Please select Bank');
//       return;
//     }

//     console.log('=== Submitting Bulk Payment ===');
//     console.log('Selected Items:', selectedItems.length);
//     console.log('Form Data:', formData);

//     let successCount = 0;
//     let errorCount = 0;
//     const errors = [];

//     for (const item of selectedItems) {
//       try {
//         const payload = {
//           uid: item.uid,
//           Status_5: formData.Status_5,
//           PAYMENT_MODE_5: formData.PAYMENT_MODE_5,
//           BANK_DETAILS_5: formData.BANK_DETAILS_5,
//           PAYMENT_DETAILS_5: formData.PAYMENT_DETAILS_5,
//           Payment_Date_5: formData.Payment_Date_5,
//           Remark_5: formData.Remark_5
//         };

//         console.log(`Processing UID: ${item.uid}`, payload);

//         const result = await postPaid(payload).unwrap();
        
//         if (result.success) {
//           successCount++;
//           console.log(`✅ Success: ${item.uid}`);
//         } else {
//           errorCount++;
//           errors.push(`${item.uid}: ${result.message || 'Unknown error'}`);
//         }
        
//       } catch (err) {
//         console.error(`Error for ${item.uid}:`, err);
        
//         // Handle regex error - data is still saved
//         if (err?.status === 500 && err?.data?.error?.includes("Cannot read properties of null")) {
//           successCount++;
//           console.log(`✅ Success (response parse handled): ${item.uid}`);
//         } else if (err?.data?.success === false) {
//           errorCount++;
//           errors.push(`${item.uid}: ${err?.data?.message || 'Failed'}`);
//         } else {
//           successCount++;
//           console.warn(`⚠️ Possible success with warning: ${item.uid}`);
//         }
//       }
//     }

//     if (successCount > 0 && errorCount === 0) {
//       alert(`✅ Payment Successful!\n\nTotal Records: ${successCount}\nTotal Amount: ₹${getTotalSelectedAmount().toLocaleString()}`);
//     } else if (successCount > 0 && errorCount > 0) {
//       alert(`⚠️ Partial Success!\n\nSuccess: ${successCount}\nFailed: ${errorCount}\n\nErrors:\n${errors.join('\n')}`);
//     } else {
//       alert(`❌ Payment Failed!\n\nFailed: ${errorCount}\n\nErrors:\n${errors.join('\n')}`);
//     }

//     setShowModal(false);
//     setSelectedItems([]);
//     setFormData({
//       Status_5: '',
//       PAYMENT_MODE_5: '',
//       BANK_DETAILS_5: '',
//       PAYMENT_DETAILS_5: '',
//       Payment_Date_5: '',
//       Remark_5: ''
//     });
//     refetch();
//   };

//   const isItemSelected = (uid) => {
//     return selectedItems.some(item => item.uid === uid);
//   };

//   // ========== Loading State ==========
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
//     <div className="space-y-6 p-4 bg-gray-50 min-h-screen">
//       {/* ========== Header Section ========== */}
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

//       {/* ========== Selection Summary Bar ========== */}
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
//                 <div className="bg-white/20 px-3 py-1.5 rounded-lg">
//                   <span className="opacity-75">🏢 Company:</span>
//                   <span className="font-bold ml-1">₹{getTotalCompanyAmount().toLocaleString()}</span>
//                 </div>
//                 <div className="bg-white/20 px-3 py-1.5 rounded-lg">
//                   <span className="opacity-75">👷 Contractor:</span>
//                   <span className="font-bold ml-1">₹{getTotalContractorAmount().toLocaleString()}</span>
//                 </div>
//                 <div className="bg-white px-4 py-1.5 rounded-lg text-amber-600">
//                   <span className="font-medium">💰 Total:</span>
//                   <span className="font-bold ml-1">₹{getTotalSelectedAmount().toLocaleString()}</span>
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

//       {/* ========== Filters Section ========== */}
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
//           {/* Search Input */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
//               <Search className="w-4 h-4" />
//               Search
//             </label>
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search UID, engineer, work type..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
//               />
//               {searchTerm && (
//                 <button
//                   onClick={() => setSearchTerm('')}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
//                 >
//                   <X className="w-4 h-4 text-gray-400" />
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Project Name Dropdown */}
//           <SearchableDropdown
//             label="Project Name"
//             icon={Building}
//             options={uniqueProjectNames}
//             value={selectedProject}
//             onChange={setSelectedProject}
//             placeholder="Search & select project..."
//             color="purple"
//           />

//           {/* Labour Contractor Dropdown */}
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

//         {/* Active Filters Display */}
//         {hasActiveFilters && (
//           <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
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

//       {/* ========== Results Count & Select All ========== */}
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

//       {/* ========== Cards Grid ========== */}
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
//             const isSelected = isItemSelected(item.uid);
//             const totalAmount = (parseFloat(item.Revised_Company_Head_Amount_4) || 0) + 
//                                (parseFloat(item.Revised_Contractor_Head_Amount_4) || 0);
            
//             return (
//               <div
//                 key={item.uid || index}
//                 onClick={() => handleCardSelect(item)}
//                 className={`relative bg-white rounded-2xl shadow-sm border-2 transition-all cursor-pointer hover:shadow-lg ${
//                   isSelected 
//                     ? 'border-amber-500 ring-2 ring-amber-200' 
//                     : 'border-gray-100 hover:border-amber-300'
//                 }`}
//               >
//                 {/* Selection Indicator */}
//                 <div className={`absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
//                   isSelected 
//                     ? 'bg-amber-500 text-white' 
//                     : 'bg-gray-100 text-gray-400'
//                 }`}>
//                   {isSelected ? <Check className="w-4 h-4" /> : <span className="text-xs">{index + 1}</span>}
//                 </div>

//                 {/* Card Header */}
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

//                 {/* Card Body */}
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
//                     <div className="grid grid-cols-2 gap-2 mb-2">
//                       <div className="bg-purple-50 rounded-lg p-2">
//                         <p className="text-xs text-purple-600">🏢  Paid Amount</p>
//                         <p className="font-bold text-purple-700">₹{((item.Revised_Company_Head_Amount_4) || 0).toLocaleString()}</p>
//                       </div>
//                       <div className="bg-blue-50 rounded-lg p-2">
//                         <p className="text-xs text-blue-600">👷 Contractor Head</p>
//                         <p className="font-bold text-blue-700">₹{((item.Revised_Contractor_Head_Amount_4) || 0).toLocaleString()}</p>
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

//       {/* ========== Footer Stats ========== */}
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

//       {/* ========== Bulk Payment Modal ========== */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col">
            
//             {/* Modal Header */}
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

//             {/* Modal Body */}
//             <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              
//               {/* Selected Items Summary */}
//               <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
//                 <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3 flex items-center gap-2">
//                   <ListChecks className="w-4 h-4" />
//                   Selected Records Summary
//                 </h4>
                
//                 <div className="max-h-24 overflow-y-auto mb-3 bg-white rounded-lg p-2 border border-amber-100">
//                   <div className="flex flex-wrap gap-2">
//                     {selectedItems.map((item, index) => (
//                       <span 
//                         key={item.uid || index}
//                         className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium"
//                       >
//                         {item.uid}
//                       </span>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-3 gap-3 text-sm">
//                   <div className="bg-white p-3 rounded-lg border border-amber-100 text-center">
//                     <span className="text-xs text-gray-500 block">🏢 Company</span>
//                     <p className="font-bold text-purple-700">₹{getTotalCompanyAmount().toLocaleString()}</p>
//                   </div>
//                   <div className="bg-white p-3 rounded-lg border border-amber-100 text-center">
//                     <span className="text-xs text-gray-500 block">👷 Contractor</span>
//                     <p className="font-bold text-blue-700">₹{getTotalContractorAmount().toLocaleString()}</p>
//                   </div>
//                   <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-3 rounded-lg border border-amber-200 text-center">
//                     <span className="text-xs text-amber-700 block">💰 Total</span>
//                     <p className="font-bold text-amber-800">₹{getTotalSelectedAmount().toLocaleString()}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Payment Status Dropdown */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Payment Status <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <select
//                     value={formData.Status_5}
//                     onChange={(e) => handleFormChange('Status_5', e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white cursor-pointer"
//                   >
//                     <option value="">-- Select Status --</option>
//                     <option value="Done">💰 Done</option>
                 
//                   </select>
//                   <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                 </div>
//               </div>

//               {/* Payment Mode Dropdown */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   <CreditCard className="w-4 h-4 inline mr-1" />
//                   Payment Mode <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <select
//                     value={formData.PAYMENT_MODE_5}
//                     onChange={(e) => handleFormChange('PAYMENT_MODE_5', e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white cursor-pointer"
//                   >
//                     {paymentModeOptions.map((option) => (
//                       <option key={option.value} value={option.value}>
//                         {option.label}
//                       </option>
//                     ))}
//                   </select>
//                   <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                 </div>
//               </div>

//               {/* ✅ Bank Details Dropdown - From API extraField */}
//               <SearchableDropdown
//                 label="Bank Details"
//                 icon={Building2}
//                 options={uniqueBankNames}
//                 value={formData.BANK_DETAILS_5}
//                 onChange={(value) => handleFormChange('BANK_DETAILS_5', value)}
//                 placeholder={isBankLoading ? "Loading banks..." : "Search & select bank..."}
//                 color="blue"
//                 required={true}
//               />
//               {uniqueBankNames.length === 0 && !isBankLoading && (
//                 <p className="text-xs text-amber-600 -mt-3">⚠️ No banks with extraField found in API</p>
//               )}

//               {/* Payment Details & Date */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <Receipt className="w-4 h-4 inline mr-1" />
//                     Payment Details / Reference
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.PAYMENT_DETAILS_5}
//                     onChange={(e) => handleFormChange('PAYMENT_DETAILS_5', e.target.value)}
//                     placeholder="Enter transaction/reference no..."
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <Calendar className="w-4 h-4 inline mr-1" />
//                     Payment Date
//                   </label>
//                   <input
//                     type="date"
//                     value={formData.Payment_Date_5}
//                     onChange={(e) => handleFormChange('Payment_Date_5', e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
//                   />
//                 </div>
//               </div>

//               {/* Remark */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   <MessageSquare className="w-4 h-4 inline mr-1" />
//                   Remark <span className="text-gray-400 font-normal">(Optional)</span>
//                 </label>
//                 <textarea
//                   value={formData.Remark_5}
//                   onChange={(e) => handleFormChange('Remark_5', e.target.value)}
//                   rows={3}
//                   placeholder="Enter any payment remarks..."
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
//                 />
//               </div>

//               {/* Info Note */}
//               <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
//                 <p className="text-xs text-blue-700">
//                   ℹ️ <strong>Note:</strong> The same payment details will be applied to all {selectedItems.length} selected records.
//                 </p>
//               </div>

//             </div>

//             {/* Modal Footer */}
//             <div className="flex-shrink-0 p-4 sm:p-6 border-t bg-gray-50 flex gap-3 justify-end rounded-b-2xl">
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="px-4 sm:px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
//               >
//                 Cancel
//               </button>
              
//               <button
//                 onClick={handleSubmit}
//                 disabled={isSubmitting || !formData.Status_5 || !formData.PAYMENT_MODE_5 || !formData.BANK_DETAILS_5}
//                 className="px-4 sm:px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg"
//               >
//                 {isSubmitting ? (
//                   <>
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                     <span>Processing {selectedItems.length}...</span>
//                   </>
//                 ) : (
//                   <>
//                     <BadgeCheck className="w-4 h-4" />
//                     Confirm Payment ({selectedItems.length})
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

// export default PaidAmount;





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
  ChevronUp
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
  required = false
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
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', hover: 'hover:bg-amber-100', selected: 'bg-amber-100 text-amber-800', ring: 'ring-amber-200', border: 'border-amber-500' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', hover: 'hover:bg-purple-100', selected: 'bg-purple-100 text-purple-800', ring: 'ring-purple-200', border: 'border-purple-500' },
    green:  { bg: 'bg-green-50',  text: 'text-green-700',  hover: 'hover:bg-green-100',  selected: 'bg-green-100 text-green-800',  ring: 'ring-green-200',  border: 'border-green-500' },
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   hover: 'hover:bg-blue-100',   selected: 'bg-blue-100 text-blue-800',   ring: 'ring-blue-200',   border: 'border-blue-500' }
  };

  const colors = colorClasses[color] || colorClasses.amber;

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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsOpen(true);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(true);
                }}
                placeholder={placeholder}
                className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {value && (
              <button
                onClick={handleClear}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
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
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ========== Main Component ==========
const PaidAmount = () => {
  const { 
    data: paidData, 
    isLoading, 
    isError, 
    error, 
    refetch,
    isFetching 
  } = useGetPaidStepQuery();

  const [postPaid, { isLoading: isSubmitting }] = usePostLabourPaidMutation();

  const { 
    data: bankList = [], 
    isLoading: isBankLoading 
  } = useGetProjectDropdownQuery();

  useEffect(() => {
    console.log('=== Paid Step Data ===', paidData);
    console.log('=== Bank Dropdown API Response ===', bankList);
    console.log('First few bank items:', bankList?.slice(0, 5));
  }, [paidData, bankList]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedContractor, setSelectedContractor] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    Status_5: '',
    PAYMENT_MODE_5: '',
    BANK_DETAILS_5: '',
    PAYMENT_DETAILS_5: '',
    Payment_Date_5: new Date().toISOString().split('T')[0],
    Remark_5: ''
  });

  const uniqueProjectNames = useMemo(() => {
    if (!paidData || !Array.isArray(paidData)) return [];
    return [...new Set(
      paidData.map(item => item.projectName).filter(Boolean)
    )].sort();
  }, [paidData]);

  const uniqueContractorNames = useMemo(() => {
    if (!paidData || !Array.isArray(paidData)) return [];
    return [...new Set(
      paidData.map(item => item.Labouar_Contractor_Name_3).filter(Boolean)
    )].sort();
  }, [paidData]);

  const uniqueBankNames = useMemo(() => {
    if (!bankList || !Array.isArray(bankList)) return [];
    
    // Change field name if needed: 'extraField' / 'bankName' / 'name' / 'bank_name'
    const field = 'extraField';

    const names = bankList
      .map(item => item[field] || item.bankName || item.name || item.bank_name || '')
      .filter(name => name && typeof name === 'string' && name.trim() !== '');
    
    return [...new Set(names)].sort();
  }, [bankList]);

  const paymentModeOptions = [
    { value: '', label: '-- Select Payment Mode --' },
    { value: 'Cheque', label: '📄 Cheque' },
    { value: 'Cash', label: '💵 Cash' },
    { value: 'NEFT', label: '📱 NEFT' },
    { value: 'RTGS', label: '📋 RTGS' },
    
  ];

  const filteredData = useMemo(() => {
    if (!paidData || !Array.isArray(paidData)) return [];
    
    return paidData.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (item.uid || '').toLowerCase().includes(searchLower) ||
        (item.projectName || '').toLowerCase().includes(searchLower) ||
        (item.Labouar_Contractor_Name_3 || '').toLowerCase().includes(searchLower) ||
        (item.projectEngineer || '').toLowerCase().includes(searchLower) ||
        (item.workDescription || '').toLowerCase().includes(searchLower) ||
        (item.workType || '').toLowerCase().includes(searchLower);

      const matchesProject = !selectedProject || item.projectName === selectedProject;
      const matchesContractor = !selectedContractor || item.Labouar_Contractor_Name_3 === selectedContractor;

      return matchesSearch && matchesProject && matchesContractor;
    });
  }, [paidData, searchTerm, selectedProject, selectedContractor]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedProject('');
    setSelectedContractor('');
  };

  const hasActiveFilters = searchTerm || selectedProject || selectedContractor;

  const handleCardSelect = (item) => {
    setSelectedItems(prev => 
      prev.some(s => s.uid === item.uid)
        ? prev.filter(s => s.uid !== item.uid)
        : [...prev, item]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === filteredData.length ? [] : [...filteredData]
    );
  };

  // Only company amount is considered now
  const getTotalSelectedAmount = () => selectedItems.reduce((sum, item) => {
    const val = String(item.Revised_Company_Head_Amount_4 || '0').replace(/[^0-9.-]/g, '');
    return sum + (parseFloat(val) || 0);
  }, 0);

  const handleBulkPayment = () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one record');
      return;
    }
    setShowModal(true);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) return;

    if (!formData.Status_5) return alert('Please select Payment Status');
    if (!formData.PAYMENT_MODE_5) return alert('Please select Payment Mode');
    if (!formData.BANK_DETAILS_5) return alert('Please select Bank');

    let success = 0;
    let failed = 0;
    const errors = [];

    for (const item of selectedItems) {
      try {
        const payload = {
          uid: item.uid,
          Status_5: formData.Status_5,
          PAYMENT_MODE_5: formData.PAYMENT_MODE_5,
          BANK_DETAILS_5: formData.BANK_DETAILS_5,
          PAYMENT_DETAILS_5: formData.PAYMENT_DETAILS_5,
          Payment_Date_5: formData.Payment_Date_5,
          Remark_5: formData.Remark_5
        };

        const result = await postPaid(payload).unwrap();
        if (result?.success) {
          success++;
        } else {
          failed++;
          errors.push(`${item.uid}: ${result?.message || 'Unknown error'}`);
        }
      } catch (err) {
        console.error(err);
        if (err?.status === 500 && err?.data?.error?.includes('null')) {
          success++;
        } else {
          failed++;
          errors.push(`${item.uid}: ${err?.data?.message || err?.message || 'Failed'}`);
        }
      }
    }

    let message = '';
    if (success > 0 && failed === 0) {
      message = `✅ Payment Successful!\nTotal: ${success} records\nAmount: ₹${formatAmount(getTotalSelectedAmount())}`;
    } else if (success > 0) {
      message = `⚠️ Partial Success\nSuccess: ${success}\nFailed: ${failed}\n\nErrors:\n${errors.join('\n')}`;
    } else {
      message = `❌ Failed\n${failed} errors\n\n${errors.join('\n')}`;
    }

    alert(message);
    setShowModal(false);
    setSelectedItems([]);
    refetch();
  };

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
    <div className="space-y-6 p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CircleDollarSign className="w-7 h-7 text-amber-600" />
            Payment Processing
          </h2>
          <p className="text-gray-500 mt-1">Select multiple records and process bulk payments</p>
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

      {/* Selection Summary - only total */}
      {selectedItems.length > 0 && (
        <div className="sticky top-0 z-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <ListChecks className="w-6 h-6" />
                <span className="font-bold text-lg">{selectedItems.length} Selected</span>
              </div>
              <div className="hidden sm:block h-8 w-px bg-white/30" />
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="bg-white px-4 py-1.5 rounded-lg text-amber-600">
                  <span className="font-medium">💰 Total Amount:</span>
                  <span className="font-bold ml-1">₹{formatAmount(getTotalSelectedAmount())}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedItems([])}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={handleBulkPayment}
                className="px-6 py-2 bg-white text-amber-600 hover:bg-amber-50 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-md"
              >
                <Banknote className="w-5 h-5" />
                Process Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Filter className="w-5 h-5 text-amber-600" />
            Filters
          </h3>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear All Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search UID, engineer, work type..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
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
            placeholder="Search & select project..."
            color="purple"
          />

          <SearchableDropdown
            label="Labour Contractor"
            icon={HardHat}
            options={uniqueContractorNames}
            value={selectedContractor}
            onChange={setSelectedContractor}
            placeholder="Search & select contractor..."
            color="green"
          />
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">Active:</span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="hover:text-amber-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedProject && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                <Building className="w-3 h-3" />
                {selectedProject}
                <button onClick={() => setSelectedProject('')} className="hover:text-purple-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedContractor && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                <HardHat className="w-3 h-3" />
                {selectedContractor}
                <button onClick={() => setSelectedContractor('')} className="hover:text-green-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results count & select all */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200">
            <FileText className="w-5 h-5 text-gray-500" />
            <span className="text-gray-600 font-medium">
              Showing: <span className="text-amber-600 font-bold">{filteredData.length}</span> of {paidData?.length || 0}
            </span>
          </div>
          {selectedItems.length > 0 && (
            <span className="text-sm text-amber-600 font-medium">
              {selectedItems.length} selected
            </span>
          )}
        </div>
        
        <button
          onClick={handleSelectAll}
          disabled={filteredData.length === 0}
          className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50 ${
            selectedItems.length === filteredData.length && filteredData.length > 0
              ? 'bg-amber-500 text-white'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300'
          }`}
        >
          {selectedItems.length === filteredData.length && filteredData.length > 0 ? (
            <CheckSquare className="w-5 h-5" />
          ) : (
            <Square className="w-5 h-5" />
          )}
          {selectedItems.length === filteredData.length && filteredData.length > 0 ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Cards - only showing Company Paid Amount */}
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
          {filteredData.map((item, index) => {
            const isSelected = selectedItems.some(s => s.uid === item.uid);
            return (
              <div
                key={item.uid || index}
                onClick={() => handleCardSelect(item)}
                className={`relative bg-white rounded-2xl shadow-sm border-2 transition-all cursor-pointer hover:shadow-lg ${
                  isSelected ? 'border-amber-500 ring-2 ring-amber-200' : 'border-gray-100 hover:border-amber-300'
                }`}
              >
                <div className={`absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {isSelected ? <Check className="w-4 h-4" /> : <span className="text-xs">{index + 1}</span>}
                </div>

                <div className={`p-4 rounded-t-2xl ${isSelected ? 'bg-amber-50' : 'bg-gray-50'}`}>
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
                      <h3 className="font-semibold text-gray-800 truncate">
                        {item.projectName || 'N/A'}
                      </h3>
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

                  <div className="border-t border-gray-100 pt-3">
                    <div className="grid grid-cols-1 gap-2 mb-2">
                      <div className="bg-purple-50 rounded-lg p-2">
                        <p className="text-xs text-purple-600">🏢 Paid Amount</p>
                        <p className="font-bold text-purple-700">
                          ₹{formatAmount(item.Revised_Company_Head_Amount_4)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-gray-500">Deployed: Cat1 - {item.Deployed_Category_1_Labour_No_4 || '0'}</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-500">Cat2 - {item.Deployed_Category_2_Labour_No_4 || '0'}</span>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-b-2xl" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer stats */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-amber-600">{filteredData.length}</span> records
            {selectedItems.length > 0 && (
              <span className="ml-2">
                • <span className="font-semibold text-amber-600">{selectedItems.length}</span> selected
              </span>
            )}
          </p>
          <p className="text-xs text-gray-400">
            Click on cards to select • Use filters to narrow down results
          </p>
        </div>
      </div>

      {/* Bulk Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col">
            <div className="flex-shrink-0 p-4 sm:p-6 border-b bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                    <CircleDollarSign className="w-5 h-5 text-amber-600" />
                    Bulk Payment Processing
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Processing <span className="font-semibold text-amber-600">{selectedItems.length}</span> payments
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

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
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
                  <span className="text-xs text-gray-500 block">Total Amount (Selected Records)</span>
                  <p className="font-bold text-amber-800 text-xl mt-1">
                    ₹{formatAmount(getTotalSelectedAmount())}
                  </p>
                </div>
              </div>

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
                    <option value="Done">💰 Done</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

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
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

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
              {uniqueBankNames.length === 0 && !isBankLoading && (
                <p className="text-xs text-amber-600 -mt-2">
                  ⚠️ No banks found. Check console logs and field name.
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Receipt className="w-4 h-4 inline mr-1" />
                    Payment Details / Reference
                  </label>
                  <input
                    type="text"
                    value={formData.PAYMENT_DETAILS_5}
                    onChange={e => handleFormChange('PAYMENT_DETAILS_5', e.target.value)}
                    placeholder="Enter transaction/reference no..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={formData.Payment_Date_5}
                    onChange={e => handleFormChange('Payment_Date_5', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Remark <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={formData.Remark_5}
                  onChange={e => handleFormChange('Remark_5', e.target.value)}
                  rows={3}
                  placeholder="Enter any payment remarks..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700">
                  ℹ️ <strong>Note:</strong> The same payment details will be applied to all {selectedItems.length} selected records.
                </p>
              </div>
            </div>

            <div className="flex-shrink-0 p-4 sm:p-6 border-t bg-gray-50 flex gap-3 justify-end rounded-b-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 sm:px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.Status_5 || !formData.PAYMENT_MODE_5 || !formData.BANK_DETAILS_5}
                className="px-4 sm:px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing {selectedItems.length}...</span>
                  </>
                ) : (
                  <>
                    <BadgeCheck className="w-4 h-4" />
                    Confirm Payment ({selectedItems.length})
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

export default PaidAmount;