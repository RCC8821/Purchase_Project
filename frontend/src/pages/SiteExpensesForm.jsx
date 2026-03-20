

// import React, { useState, useEffect, useMemo } from 'react';
// import {
//   useGetProjectDropdownQuery,
// } from '../redux/Labour/LabourSlice';

// import {
//   usePostSiteExpenseMutation,
//   usePostLabourRequestMutation,
//   usePostContractorDebitMutation,
// } from '../redux/formSlice';

// import {
//   Loader2, Receipt, Users, CreditCard, Building, User, Hash, FileText,
//   IndianRupee, Calendar, Camera, Briefcase, HardHat, MessageSquare,
//   Send, RefreshCw, X, ChevronDown, Wrench, Calculator, Package
// } from 'lucide-react';

// const SiteExpensesForm = () => {
//   const [activeTab, setActiveTab] = useState('siteExpenses');

//   // ─── API Hooks ────────────────────────────────────────────────────────────
//   const {
//     data: dropdownData,
//     isLoading: isDropdownLoading,
//     isError: isDropdownError,
//   } = useGetProjectDropdownQuery();

//   const safeDropdown = Array.isArray(dropdownData) ? dropdownData : [];

//   const [postSiteExpense,    { isLoading: isSiteLoading  }] = usePostSiteExpenseMutation();
//   const [postLabourRequest,  { isLoading: isLabourLoading }] = usePostLabourRequestMutation();
//   const [postContractorDebit,{ isLoading: isDebitLoading  }] = usePostContractorDebitMutation();

//   const isSubmitting = isSiteLoading || isLabourLoading || isDebitLoading;

//   // ─── Form States ──────────────────────────────────────────────────────────
//   const [siteExpensesData, setSiteExpensesData] = useState({
//     Vendor_Payee_Name_1: '',
//     Project_Name_1: '',
//     Project_Engineer_Name_1: '',
//     Head_Type_1: '',
//     Bill_No_1: '',
//     Bill_Date_1: '',
//     Bill_Photo_1: '',
//     Contractor_Name_1: '',
//     Contractor_Firm_Name_1: '',
//     Remark_1: '',
//   });

//   // ✅ Photo preview ke liye alag state
//   const [billPhotoName, setBillPhotoName] = useState('');

//   const [siteExpenseItems, setSiteExpenseItems] = useState([
//     { Exp_Head_1: '', Details_of_Work_1: '', Amount_1: '' }
//   ]);

//   const [labourData, setLabourData] = useState({
//     Project_Name_1: '',
//     Project_Engineer_1: '',
//     Work_Type_1: '',
//     Work_Description_1: '',
//     Labour_Category_1: '',
//     Number_Of_Labour_1: '',
//     Labour_Category_2: '',
//     Number_Of_Labour_2: '',
//     Total_Labour_1: '',
//     Date_Of_Required_1: '',
//     Head_Of_Contractor_Company_1: '',
//     Name_Of_Contractor_1: '',
//     Contractor_Firm_Name_1: '',
//     Remark_1: '',
//   });

//   const [debitData, setDebitData] = useState({
//     Project_Name_1: '',
//     Project_Engineer_1: '',
//     Contractor_Name_1: '',
//     Contractor_Firm_Name_1: '',
//     Work_Type_1: '',
//     Work_Date_1: '',
//     Work_Description_1: '',
//     Particular_1: '',
//     Qty_1: '',
//     Rate_Wages_1: '',
//     Amount_1: '',
//   });

//   const isLabourContractorHead = labourData.Head_Of_Contractor_Company_1 === 'Contractor Head';
//   const isSiteContractorHead   = siteExpensesData.Head_Type_1 === 'Contractor Head';

//   // ─── Auto Calculations ────────────────────────────────────────────────────
//   useEffect(() => {
//     const l1 = parseInt(labourData.Number_Of_Labour_1) || 0;
//     const l2 = parseInt(labourData.Number_Of_Labour_2) || 0;
//     setLabourData(prev => ({ ...prev, Total_Labour_1: (l1 + l2).toString() }));
//   }, [labourData.Number_Of_Labour_1, labourData.Number_Of_Labour_2]);

//   useEffect(() => {
//     const qty  = parseFloat(debitData.Qty_1)        || 0;
//     const rate = parseFloat(debitData.Rate_Wages_1) || 0;
//     setDebitData(prev => ({ ...prev, Amount_1: (qty * rate).toFixed(2) }));
//   }, [debitData.Qty_1, debitData.Rate_Wages_1]);

//   // ─── Dropdown Options ─────────────────────────────────────────────────────
//   const projectOptions = useMemo(() => {
//     const seen = new Set();
//     return safeDropdown
//       .filter(item => {
//         const name = (item.projectName || '').trim();
//         return name && name !== '(No Project Name)';
//       })
//       .reduce((acc, item) => {
//         const name  = item.projectName.trim();
//         const lower = name.toLowerCase();
//         if (!seen.has(lower)) {
//           seen.add(lower);
//           acc.push({
//             value:    name,
//             label:    item.label || name,
//             engineer: item.engineer || '',
//           });
//         }
//         return acc;
//       }, [])
//       .sort((a, b) => a.label.localeCompare(b.label));
//   }, [safeDropdown]);

//   const contractorOptions = useMemo(() => {
//     const seen = new Map();
//     safeDropdown.forEach(item => {
//       const cName = (item.contractorName || '').trim();
//       if (!cName) return;
//       const lowerC = cName.toLowerCase();
//       const fName  = (item.contractorFirmName || '').trim();
//       if (!seen.has(lowerC)) {
//         seen.set(lowerC, {
//           value:    cName,
//           firmName: fName,
//           label:    fName ? `${cName} (${fName})` : cName,
//         });
//       } else {
//         const existing = seen.get(lowerC);
//         if (fName && !existing.firmName) {
//           existing.firmName = fName;
//           existing.label    = `${cName} (${fName})`;
//         }
//       }
//     });
//     return Array.from(seen.values()).sort((a, b) => a.label.localeCompare(b.label));
//   }, [safeDropdown]);

//   const expenseWorkTypeOptions = useMemo(() => {
//     return [...new Set(
//       safeDropdown.map(i => (i.expenseWorkType || '').trim()).filter(Boolean)
//     )].sort();
//   }, [safeDropdown]);

//   const labourWorkTypeOptions = useMemo(() => {
//     return [...new Set(
//       safeDropdown.map(i => (i.labourWorkType || '').trim()).filter(Boolean)
//     )].sort();
//   }, [safeDropdown]);

//   const labourCategoryOptions = useMemo(() => {
//     return [...new Set(
//       safeDropdown.map(i => (i.labourCategory || '').trim()).filter(Boolean)
//     )].sort();
//   }, [safeDropdown]);

//   // ─── Debug Logs ───────────────────────────────────────────────────────────
//   useEffect(() => {
//     console.log('── Dropdown Debug ──────────────────────');
//     console.log('Raw rows from API   :', safeDropdown.length);
//     console.log('Unique Projects     :', projectOptions.length);
//     console.log('Unique Contractors  :', contractorOptions.length);
//     console.log('Contractors list    :', contractorOptions.map(c => c.value));
//   }, [safeDropdown, projectOptions, contractorOptions]);

//   // ─── Handlers ─────────────────────────────────────────────────────────────
//   const handleProjectChange = (tab, value) => {
//     const engineer = projectOptions.find(o => o.value === value)?.engineer || '';
//     if (tab === 'siteExpenses') {
//       setSiteExpensesData(prev => ({ ...prev, Project_Name_1: value, Project_Engineer_Name_1: engineer }));
//     } else if (tab === 'labour') {
//       setLabourData(prev => ({ ...prev, Project_Name_1: value, Project_Engineer_1: engineer }));
//     } else if (tab === 'debit') {
//       setDebitData(prev => ({ ...prev, Project_Name_1: value, Project_Engineer_1: engineer }));
//     }
//   };

//   const handleContractorChange = (tab, value) => {
//     const firmName = contractorOptions.find(o => o.value === value)?.firmName || '';
//     if (tab === 'siteExpenses') {
//       setSiteExpensesData(prev => ({ ...prev, Contractor_Name_1: value, Contractor_Firm_Name_1: firmName }));
//     } else if (tab === 'labour') {
//       setLabourData(prev => ({ ...prev, Name_Of_Contractor_1: value, Contractor_Firm_Name_1: firmName }));
//     } else if (tab === 'debit') {
//       setDebitData(prev => ({ ...prev, Contractor_Name_1: value, Contractor_Firm_Name_1: firmName }));
//     }
//   };

//   const handleSiteExpenseChange = (field, value) => setSiteExpensesData(prev => ({ ...prev, [field]: value }));
//   const handleLabourChange      = (field, value) => setLabourData(prev => ({ ...prev, [field]: value }));
//   const handleDebitChange       = (field, value) => setDebitData(prev => ({ ...prev, [field]: value }));

//   // ✅ Photo handler — FileReader se base64 with data URI
//   const handlePhotoChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setBillPhotoName(file.name);
//       const reader = new FileReader();
//       reader.readAsDataURL(file); // data:image/jpeg;base64,.... format
//       reader.onload = () => {
//         handleSiteExpenseChange('Bill_Photo_1', reader.result);
//       };
//       reader.onerror = () => {
//         console.error('File read karne mein error');
//         setBillPhotoName('');
//         handleSiteExpenseChange('Bill_Photo_1', '');
//       };
//     }
//   };

//   const handleItemChange = (index, field, value) => {
//     setSiteExpenseItems(prev => {
//       const updated = [...prev];
//       updated[index] = { ...updated[index], [field]: value };
//       return updated;
//     });
//   };

//   const addItem    = () => setSiteExpenseItems(prev => [
//     ...prev,
//     { Exp_Head_1: '', Details_of_Work_1: '', Amount_1: '' }
//   ]);
//   const removeItem = (index) => setSiteExpenseItems(prev => prev.filter((_, i) => i !== index));

//   const showAlert = (type, message) => {
//     alert(`${type === 'success' ? '✅' : '❌'} ${message}`);
//   };

//   // ─── Submit Handlers ──────────────────────────────────────────────────────
//   const handleSubmitSiteExpenses = async (e) => {
//     e.preventDefault();
//     if (!siteExpensesData.Project_Name_1) { showAlert('error', 'Project Name required hai'); return; }

//     const validItems = siteExpenseItems.filter(item => item.Exp_Head_1 && item.Amount_1);
//     if (validItems.length === 0) {
//       showAlert('error', 'Kam se kam ek item mein Expense Head aur Amount fill karo');
//       return;
//     }

//     const payload = {
//       Vendor_Payee_Name_1:      siteExpensesData.Vendor_Payee_Name_1,
//       Project_Name_1:           siteExpensesData.Project_Name_1,
//       Project_Engineer_Name_1:  siteExpensesData.Project_Engineer_Name_1,
//       Head_Type_1:              siteExpensesData.Head_Type_1,
//       Bill_No_1:                siteExpensesData.Bill_No_1,
//       Bill_Date_1:              siteExpensesData.Bill_Date_1,
//       Bill_Photo_1:             siteExpensesData.Bill_Photo_1, // ✅ base64 data URI
//       Contractor_Name_1:        siteExpensesData.Contractor_Name_1,
//       Contractor_Firm_Name_1:   siteExpensesData.Contractor_Firm_Name_1,
//       Remark_1:                 siteExpensesData.Remark_1,
//       items:                    validItems,
//     };

//     try {
//       const result = await postSiteExpense(payload).unwrap();
//       showAlert('success', `${result.message} | Bill: ${result.billNo}`);
//       resetSiteExpensesForm();
//     } catch (err) {
//       showAlert('error', err?.data?.message || 'Site Expense submit karne mein error aaya');
//     }
//   };

//   const handleSubmitLabour = async (e) => {
//     e.preventDefault();
//     if (!labourData.Project_Name_1 || !labourData.Work_Type_1) {
//       showAlert('error', 'Project Name aur Work Type required hain');
//       return;
//     }
//     const payload = { ...labourData };
//     try {
//       const result = await postLabourRequest(payload).unwrap();
//       showAlert('success', `${result.message} | UID: ${result.uid}`);
//       resetLabourForm();
//     } catch (err) {
//       showAlert('error', err?.data?.message || 'Labour Request submit karne mein error aaya');
//     }
//   };

//   const handleSubmitDebit = async (e) => {
//     e.preventDefault();
//     if (!debitData.Project_Name_1 || !debitData.Contractor_Name_1) {
//       showAlert('error', 'Project Name aur Contractor Name required hain');
//       return;
//     }
//     const payload = { ...debitData };
//     try {
//       const result = await postContractorDebit(payload).unwrap();
//       showAlert('success', `${result.message} | UID: ${result.uid}`);
//       resetDebitForm();
//     } catch (err) {
//       showAlert('error', err?.data?.message || 'Contractor Debit submit karne mein error aaya');
//     }
//   };

//   // ─── Reset Handlers ───────────────────────────────────────────────────────
//   const resetSiteExpensesForm = () => {
//     setSiteExpensesData({
//       Vendor_Payee_Name_1: '', Project_Name_1: '', Project_Engineer_Name_1: '',
//       Head_Type_1: '', Bill_No_1: '', Bill_Date_1: '', Bill_Photo_1: '',
//       Contractor_Name_1: '', Contractor_Firm_Name_1: '', Remark_1: '',
//     });
//     setSiteExpenseItems([{ Exp_Head_1: '', Details_of_Work_1: '', Amount_1: '' }]);
//     setBillPhotoName(''); // ✅ Photo name bhi reset
//   };

//   const resetLabourForm = () => setLabourData({
//     Project_Name_1: '', Project_Engineer_1: '', Work_Type_1: '', Work_Description_1: '',
//     Labour_Category_1: '', Number_Of_Labour_1: '', Labour_Category_2: '', Number_Of_Labour_2: '',
//     Total_Labour_1: '', Date_Of_Required_1: '', Head_Of_Contractor_Company_1: '',
//     Name_Of_Contractor_1: '', Contractor_Firm_Name_1: '', Remark_1: '',
//   });

//   const resetDebitForm = () => setDebitData({
//     Project_Name_1: '', Project_Engineer_1: '', Contractor_Name_1: '', Contractor_Firm_Name_1: '',
//     Work_Type_1: '', Work_Date_1: '', Work_Description_1: '', Particular_1: '',
//     Qty_1: '', Rate_Wages_1: '', Amount_1: '',
//   });

//   // ─── Reusable SelectField Component ──────────────────────────────────────
//   const SelectField = ({
//     label, icon: Icon, value, onChange, options,
//     required, colorClass = 'blue', disabled = false
//   }) => (
//     <div>
//       <label className="block text-sm font-semibold text-gray-700 mb-2">
//         {Icon && <Icon className="w-4 h-4 inline mr-1" />}
//         {label} {required && <span className="text-red-500">*</span>}
//         {disabled && isDropdownLoading && (
//           <span className="text-xs text-gray-500 ml-2">(loading...)</span>
//         )}
//       </label>
//       <div className="relative">
//         <select
//           value={value}
//           onChange={onChange}
//           disabled={disabled}
//           className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none
//             focus:ring-2 focus:ring-${colorClass}-500 appearance-none bg-white
//             ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
//         >
//           <option value="">-- Select {label} --</option>
//           {options.map((opt, idx) => (
//             <option key={idx} value={opt.value}>{opt.label}</option>
//           ))}
//         </select>
//         <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//       </div>
//     </div>
//   );

//   // ─── Tab Config ───────────────────────────────────────────────────────────
//   const tabs = [
//     { id: 'siteExpenses', label: 'Site Expenses', icon: Receipt,    gradient: 'from-blue-600 to-indigo-600'   },
//     { id: 'labour',       label: 'Labour',        icon: Users,      gradient: 'from-emerald-600 to-teal-600'  },
//     { id: 'debit',        label: 'Debit',         icon: CreditCard, gradient: 'from-purple-600 to-indigo-600' },
//   ];
//   const activeTabConfig = tabs.find(t => t.id === activeTab);

//   // ─── JSX ──────────────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
//       <div className="max-w-4xl mx-auto">

//         {/* ── Tabs ── */}
//         <div className="flex flex-wrap gap-2 mb-6">
//           {tabs.map((tab) => {
//             const Icon     = tab.icon;
//             const isActive = activeTab === tab.id;
//             return (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
//                   isActive
//                     ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg scale-105`
//                     : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
//                 }`}
//               >
//                 <Icon className="w-5 h-5" /> {tab.label}
//               </button>
//             );
//           })}
//         </div>

//         {/* Dropdown error banner */}
//         {isDropdownError && (
//           <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
//             ⚠️ Dropdown data load nahi ho paya. Page refresh karo.
//           </div>
//         )}

//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

//           {/* ── Header ── */}
//           <div className={`bg-gradient-to-r ${activeTabConfig?.gradient} p-6 text-white`}>
//             <div className="flex items-center gap-3">
//               <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
//                 {activeTabConfig && <activeTabConfig.icon className="w-6 h-6" />}
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold">{activeTabConfig?.label} Form</h1>
//                 <p className="text-white/80 text-sm mt-1">
//                   {activeTab === 'siteExpenses' && 'Enter site expense details'}
//                   {activeTab === 'labour'       && 'Request labour for your project'}
//                   {activeTab === 'debit'        && 'Create debit entries for contractors'}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* ════════════════════ SITE EXPENSES FORM ════════════════════ */}
//           {activeTab === 'siteExpenses' && (
//             <form onSubmit={handleSubmitSiteExpenses} className="p-6 space-y-6">

//               {/* Vendor & Project */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <User className="w-4 h-4 inline mr-1" />Vendor/Payee Name
//                   </label>
//                   <input
//                     type="text"
//                     value={siteExpensesData.Vendor_Payee_Name_1}
//                     onChange={(e) => handleSiteExpenseChange('Vendor_Payee_Name_1', e.target.value)}
//                     placeholder="Enter Vendor/Payee Name"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//                 <SelectField
//                   label="Project Name" icon={Building} required
//                   value={siteExpensesData.Project_Name_1}
//                   onChange={(e) => handleProjectChange('siteExpenses', e.target.value)}
//                   options={projectOptions} colorClass="blue" disabled={isDropdownLoading}
//                 />
//               </div>

//               {/* Engineer + Bill No + Bill Date */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <User className="w-4 h-4 inline mr-1" />Project Engineer
//                     <span className="text-xs text-gray-400 ml-1">(auto)</span>
//                   </label>
//                   <input
//                     type="text" readOnly
//                     value={siteExpensesData.Project_Engineer_Name_1}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed text-gray-600"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <Hash className="w-4 h-4 inline mr-1" />Bill No.
//                   </label>
//                   <input
//                     type="text"
//                     value={siteExpensesData.Bill_No_1}
//                     onChange={(e) => handleSiteExpenseChange('Bill_No_1', e.target.value)}
//                     placeholder="Enter Bill Number"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <Calendar className="w-4 h-4 inline mr-1" />Bill Date
//                   </label>
//                   <input
//                     type="date"
//                     value={siteExpensesData.Bill_Date_1}
//                     onChange={(e) => handleSiteExpenseChange('Bill_Date_1', e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//               </div>

//               {/* Head Type */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   <Briefcase className="w-4 h-4 inline mr-1" />Head Type
//                 </label>
//                 <div className="relative">
//                   <select
//                     value={siteExpensesData.Head_Type_1}
//                     onChange={(e) => {
//                       const val = e.target.value;
//                       setSiteExpensesData(prev => ({
//                         ...prev,
//                         Head_Type_1: val,
//                         ...(val !== 'Contractor Head' && { Contractor_Name_1: '', Contractor_Firm_Name_1: '' })
//                       }));
//                     }}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
//                   >
//                     <option value="">-- Select Head Type --</option>
//                     {['Company Head', 'Contractor Head'].map((opt, i) => (
//                       <option key={i} value={opt}>{opt}</option>
//                     ))}
//                   </select>
//                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                 </div>
//               </div>

//               {/* ✅ Bill Photo — FileReader se base64 */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   <Camera className="w-4 h-4 inline mr-1" />Bill Photo
//                 </label>
//                 <input
//                   type="file"
//                   accept="image/*,application/pdf"
//                   onChange={handlePhotoChange}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                 />
//                 {billPhotoName && (
//                   <p className="text-xs text-green-600 mt-1">✅ {billPhotoName} — Ready to upload</p>
//                 )}
//               </div>

//               {/* Contractor fields — only when Contractor Head */}
//               {isSiteContractorHead && (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       <HardHat className="w-4 h-4 inline mr-1" />Contractor Name
//                     </label>
//                     <div className="relative">
//                       <select
//                         value={siteExpensesData.Contractor_Name_1}
//                         onChange={(e) => handleContractorChange('siteExpenses', e.target.value)}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
//                       >
//                         <option value="">-- Select Contractor --</option>
//                         {contractorOptions.map((opt, i) => (
//                           <option key={i} value={opt.value}>{opt.label}</option>
//                         ))}
//                       </select>
//                       <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                     </div>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       <Building className="w-4 h-4 inline mr-1" />Contractor Firm Name
//                       <span className="text-xs text-gray-400 ml-1">(auto)</span>
//                     </label>
//                     <input
//                       type="text" readOnly
//                       value={siteExpensesData.Contractor_Firm_Name_1}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed text-gray-600"
//                     />
//                   </div>
//                 </div>
//               )}

//               {/* Expense Items */}
//               <div className="border border-blue-200 rounded-xl overflow-hidden">
//                 <div className="bg-blue-50 px-4 py-3 flex items-center justify-between border-b border-blue-200">
//                   <h3 className="font-semibold text-blue-800 flex items-center gap-2">
//                     <FileText className="w-5 h-5" />Expense Items
//                     <span className="text-xs text-blue-600 font-normal">(har item alag row banega sheet mein)</span>
//                   </h3>
//                   <button
//                     type="button" onClick={addItem}
//                     className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
//                   >
//                     + Add Item
//                   </button>
//                 </div>

//                 <div className="p-4 space-y-4">
//                   {siteExpenseItems.map((item, index) => (
//                     <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative">
//                       {siteExpenseItems.length > 1 && (
//                         <button
//                           type="button" onClick={() => removeItem(index)}
//                           className="absolute top-3 right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
//                         >
//                           <X className="w-4 h-4" />
//                         </button>
//                       )}

//                       <p className="text-sm font-semibold text-gray-600 mb-3">Item {index + 1}</p>

//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                         <div>
//                           <label className="block text-xs font-medium text-gray-600 mb-1">
//                             Expense Head <span className="text-red-500">*</span>
//                           </label>
//                           <div className="relative">
//                             <select
//                               value={item.Exp_Head_1}
//                               onChange={(e) => handleItemChange(index, 'Exp_Head_1', e.target.value)}
//                               className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
//                             >
//                               <option value="">-- Select --</option>
//                               {expenseWorkTypeOptions.map((opt, i) => (
//                                 <option key={i} value={opt}>{opt}</option>
//                               ))}
//                             </select>
//                             <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
//                           </div>
//                         </div>

//                         <div>
//                           <label className="block text-xs font-medium text-gray-600 mb-1">
//                             Amount (₹) <span className="text-red-500">*</span>
//                           </label>
//                           <input
//                             type="number"
//                             value={item.Amount_1}
//                             onChange={(e) => handleItemChange(index, 'Amount_1', e.target.value)}
//                             placeholder="0.00"
//                             className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                           />
//                         </div>

//                         <div className="md:col-span-2">
//                           <label className="block text-xs font-medium text-gray-600 mb-1">Details of Work</label>
//                           <input
//                             type="text"
//                             value={item.Details_of_Work_1}
//                             onChange={(e) => handleItemChange(index, 'Details_of_Work_1', e.target.value)}
//                             placeholder="Work details..."
//                             className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="bg-blue-50 px-4 py-3 border-t border-blue-200 flex items-center justify-between">
//                   <span className="text-sm font-semibold text-blue-800">
//                     Total Items: {siteExpenseItems.filter(i => i.Exp_Head_1 && i.Amount_1).length} valid
//                   </span>
//                   <span className="text-lg font-bold text-blue-700">
//                     ₹{siteExpenseItems.reduce((sum, i) => sum + (parseFloat(i.Amount_1) || 0), 0).toFixed(2)}
//                   </span>
//                 </div>
//               </div>

//               {/* Remark */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   <MessageSquare className="w-4 h-4 inline mr-1" />Remark
//                 </label>
//                 <textarea
//                   value={siteExpensesData.Remark_1} rows={2}
//                   onChange={(e) => handleSiteExpenseChange('Remark_1', e.target.value)}
//                   placeholder="Enter any remarks..."
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
//                 />
//               </div>

//               {/* Buttons */}
//               <div className="flex gap-4 pt-4 border-t">
//                 <button type="button" onClick={resetSiteExpensesForm}
//                   className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
//                 >
//                   <RefreshCw className="w-4 h-4" /> Reset
//                 </button>
//                 <button type="submit" disabled={isSiteLoading || isDropdownLoading}
//                   className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
//                 >
//                   {isSiteLoading
//                     ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
//                     : <><Send className="w-4 h-4" /> Submit Site Expense</>
//                   }
//                 </button>
//               </div>
//             </form>
//           )}

//           {/* ════════════════════ LABOUR FORM ════════════════════ */}
//           {activeTab === 'labour' && (
//             <form onSubmit={handleSubmitLabour} className="p-6 space-y-6">

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <SelectField
//                   label="Project Name" icon={Building} required
//                   value={labourData.Project_Name_1}
//                   onChange={(e) => handleProjectChange('labour', e.target.value)}
//                   options={projectOptions} colorClass="emerald" disabled={isDropdownLoading}
//                 />
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <User className="w-4 h-4 inline mr-1" />Project Engineer
//                     <span className="text-xs text-gray-400 ml-1">(auto)</span>
//                   </label>
//                   <input type="text" readOnly value={labourData.Project_Engineer_1}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed text-gray-600"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   <Wrench className="w-4 h-4 inline mr-1" />Work Type <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <select value={labourData.Work_Type_1}
//                     onChange={(e) => handleLabourChange('Work_Type_1', e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
//                   >
//                     <option value="">-- Select Work Type --</option>
//                     {labourWorkTypeOptions.map((opt, i) => (
//                       <option key={i} value={opt}>{opt}</option>
//                     ))}
//                   </select>
//                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   <FileText className="w-4 h-4 inline mr-1" />Work Description
//                 </label>
//                 <textarea value={labourData.Work_Description_1} rows={3}
//                   onChange={(e) => handleLabourChange('Work_Description_1', e.target.value)}
//                   placeholder="Describe the work..."
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
//                 />
//               </div>

//               <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-4">
//                 <h3 className="font-semibold text-emerald-800 flex items-center gap-2">
//                   <Users className="w-5 h-5" />Labour Details
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Labour Category 1</label>
//                     <div className="relative">
//                       <select value={labourData.Labour_Category_1}
//                         onChange={(e) => handleLabourChange('Labour_Category_1', e.target.value)}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
//                       >
//                         <option value="">-- Select --</option>
//                         {labourCategoryOptions.map((opt, i) => (
//                           <option key={i} value={opt}>{opt}</option>
//                         ))}
//                       </select>
//                       <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                     </div>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Number of Labour (Cat 1)</label>
//                     <input type="number" min="0" placeholder="0"
//                       value={labourData.Number_Of_Labour_1}
//                       onChange={(e) => handleLabourChange('Number_Of_Labour_1', e.target.value)}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Labour Category 2</label>
//                     <div className="relative">
//                       <select value={labourData.Labour_Category_2}
//                         onChange={(e) => handleLabourChange('Labour_Category_2', e.target.value)}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
//                       >
//                         <option value="">-- Select --</option>
//                         {labourCategoryOptions.map((opt, i) => (
//                           <option key={i} value={opt}>{opt}</option>
//                         ))}
//                       </select>
//                       <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                     </div>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Number of Labour (Cat 2)</label>
//                     <input type="number" min="0" placeholder="0"
//                       value={labourData.Number_Of_Labour_2}
//                       onChange={(e) => handleLabourChange('Number_Of_Labour_2', e.target.value)}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                     />
//                   </div>
//                 </div>

//                 <div className="bg-white p-4 rounded-xl border border-emerald-300 flex items-center justify-between">
//                   <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//                     <Calculator className="w-4 h-4" />Total Labour (Auto)
//                   </span>
//                   <span className="text-2xl font-bold text-emerald-600">
//                     {labourData.Total_Labour_1 || '0'}
//                   </span>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   <Calendar className="w-4 h-4 inline mr-1" />Date of Required
//                 </label>
//                 <input type="date" value={labourData.Date_Of_Required_1}
//                   onChange={(e) => handleLabourChange('Date_Of_Required_1', e.target.value)}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                 />
//               </div>

//               <div className={`grid grid-cols-1 gap-4 ${isLabourContractorHead ? 'md:grid-cols-3' : ''}`}>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <Briefcase className="w-4 h-4 inline mr-1" />Head Of Contractor/Company
//                   </label>
//                   <div className="relative">
//                     <select value={labourData.Head_Of_Contractor_Company_1}
//                       onChange={(e) => {
//                         const val = e.target.value;
//                         setLabourData(prev => ({
//                           ...prev,
//                           Head_Of_Contractor_Company_1: val,
//                           ...(val !== 'Contractor Head' && { Name_Of_Contractor_1: '', Contractor_Firm_Name_1: '' })
//                         }));
//                       }}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
//                     >
//                       <option value="">-- Select --</option>
//                       {['Company Head', 'Contractor Head'].map((opt, i) => (
//                         <option key={i} value={opt}>{opt}</option>
//                       ))}
//                     </select>
//                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                   </div>
//                 </div>

//                 {isLabourContractorHead && (
//                   <>
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         <HardHat className="w-4 h-4 inline mr-1" />Name of Contractor
//                       </label>
//                       <div className="relative">
//                         <select value={labourData.Name_Of_Contractor_1}
//                           onChange={(e) => handleContractorChange('labour', e.target.value)}
//                           className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
//                         >
//                           <option value="">-- Select --</option>
//                           {contractorOptions.map((opt, i) => (
//                             <option key={i} value={opt.value}>{opt.label}</option>
//                           ))}
//                         </select>
//                         <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         <Building className="w-4 h-4 inline mr-1" />Contractor Firm
//                         <span className="text-xs text-gray-400 ml-1">(auto)</span>
//                       </label>
//                       <input type="text" readOnly value={labourData.Contractor_Firm_Name_1}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed text-gray-600"
//                       />
//                     </div>
//                   </>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   <MessageSquare className="w-4 h-4 inline mr-1" />Remark
//                 </label>
//                 <textarea value={labourData.Remark_1} rows={2}
//                   onChange={(e) => handleLabourChange('Remark_1', e.target.value)}
//                   placeholder="Enter any remarks..."
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
//                 />
//               </div>

//               <div className="flex gap-4 pt-4 border-t">
//                 <button type="button" onClick={resetLabourForm}
//                   className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
//                 >
//                   <RefreshCw className="w-4 h-4" /> Reset
//                 </button>
//                 <button type="submit" disabled={isLabourLoading || isDropdownLoading}
//                   className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
//                 >
//                   {isLabourLoading
//                     ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
//                     : <><Send className="w-4 h-4" /> Submit Labour Request</>
//                   }
//                 </button>
//               </div>
//             </form>
//           )}

//           {/* ════════════════════ DEBIT FORM ════════════════════ */}
//           {activeTab === 'debit' && (
//             <form onSubmit={handleSubmitDebit} className="p-6 space-y-6">

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <SelectField
//                   label="Project Name" icon={Building} required
//                   value={debitData.Project_Name_1}
//                   onChange={(e) => handleProjectChange('debit', e.target.value)}
//                   options={projectOptions} colorClass="purple" disabled={isDropdownLoading}
//                 />
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <User className="w-4 h-4 inline mr-1" />Project Engineer
//                     <span className="text-xs text-gray-400 ml-1">(auto)</span>
//                   </label>
//                   <input type="text" readOnly value={debitData.Project_Engineer_1}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed text-gray-600"
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <HardHat className="w-4 h-4 inline mr-1" />Contractor Name <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <select value={debitData.Contractor_Name_1}
//                       onChange={(e) => handleContractorChange('debit', e.target.value)}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
//                     >
//                       <option value="">-- Select Contractor --</option>
//                       {contractorOptions.map((opt, i) => (
//                         <option key={i} value={opt.value}>{opt.label}</option>
//                       ))}
//                     </select>
//                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <Building className="w-4 h-4 inline mr-1" />Contractor Firm
//                     <span className="text-xs text-gray-400 ml-1">(auto)</span>
//                   </label>
//                   <input type="text" readOnly value={debitData.Contractor_Firm_Name_1}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed text-gray-600"
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <Wrench className="w-4 h-4 inline mr-1" />Work Type
//                   </label>
//                   <div className="relative">
//                     <select value={debitData.Work_Type_1}
//                       onChange={(e) => handleDebitChange('Work_Type_1', e.target.value)}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
//                     >
//                       <option value="">-- Select --</option>
//                       {labourWorkTypeOptions.map((opt, i) => (
//                         <option key={i} value={opt}>{opt}</option>
//                       ))}
//                     </select>
//                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <Calendar className="w-4 h-4 inline mr-1" />Work Date
//                   </label>
//                   <input type="date" value={debitData.Work_Date_1}
//                     onChange={(e) => handleDebitChange('Work_Date_1', e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   <FileText className="w-4 h-4 inline mr-1" />Work Description
//                 </label>
//                 <textarea value={debitData.Work_Description_1} rows={3}
//                   onChange={(e) => handleDebitChange('Work_Description_1', e.target.value)}
//                   placeholder="Describe the work..."
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
//                 />
//               </div>

//               <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 space-y-4">
//                 <h3 className="font-semibold text-purple-800 flex items-center gap-2">
//                   <Calculator className="w-5 h-5" />Amount Calculation
//                 </h3>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     <Package className="w-4 h-4 inline mr-1" />Particular
//                   </label>
//                   <div className="relative">
//                     <select value={debitData.Particular_1}
//                       onChange={(e) => handleDebitChange('Particular_1', e.target.value)}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
//                     >
//                       <option value="">-- Select Particular --</option>
//                       {['Labour Work', 'Material Supply', 'Transportation', 'Equipment Rent', 'Advance', 'Other'].map((opt, i) => (
//                         <option key={i} value={opt}>{opt}</option>
//                       ))}
//                     </select>
//                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       <Hash className="w-4 h-4 inline mr-1" />Quantity
//                     </label>
//                     <input type="number" min="0" step="0.01" placeholder="0"
//                       value={debitData.Qty_1}
//                       onChange={(e) => handleDebitChange('Qty_1', e.target.value)}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       <IndianRupee className="w-4 h-4 inline mr-1" />Rate / Wages (₹)
//                     </label>
//                     <input type="number" min="0" step="0.01" placeholder="0"
//                       value={debitData.Rate_Wages_1}
//                       onChange={(e) => handleDebitChange('Rate_Wages_1', e.target.value)}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
//                     />
//                   </div>
//                 </div>

//                 <div className="bg-white p-4 rounded-xl border border-purple-300 flex items-center justify-between">
//                   <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//                     <IndianRupee className="w-4 h-4" />Total Amount (Auto)
//                   </span>
//                   <span className="text-2xl font-bold text-purple-600">
//                     ₹{debitData.Amount_1 || '0.00'}
//                   </span>
//                 </div>
//               </div>

//               <div className="flex gap-4 pt-4 border-t">
//                 <button type="button" onClick={resetDebitForm}
//                   className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
//                 >
//                   <RefreshCw className="w-4 h-4" /> Reset
//                 </button>
//                 <button type="submit" disabled={isDebitLoading || isDropdownLoading}
//                   className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
//                 >
//                   {isDebitLoading
//                     ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
//                     : <><Send className="w-4 h-4" /> Submit Debit Entry</>
//                   }
//                 </button>
//               </div>
//             </form>
//           )}

//         </div>
//       </div>
//     </div>
//   );
// };

// export default SiteExpensesForm;




import React, { useState, useEffect, useMemo } from 'react';
import {
  useGetProjectDropdownQuery,
} from '../redux/Labour/LabourSlice';

import {
  usePostSiteExpenseMutation,
  usePostLabourRequestMutation,
  usePostContractorDebitMutation,
} from '../redux/formSlice';

import {
  Loader2, Receipt, Users, CreditCard, Building, User, Hash, FileText,
  IndianRupee, Calendar, Camera, Briefcase, HardHat, MessageSquare,
  Send, RefreshCw, X, ChevronDown, Wrench, Calculator, Package
} from 'lucide-react';

const SiteExpensesForm = () => {
  const [activeTab, setActiveTab] = useState('siteExpenses');

  // ─── API Hooks ────────────────────────────────────────────────────────────
  const {
    data: dropdownData,
    isLoading: isDropdownLoading,
    isError: isDropdownError,
  } = useGetProjectDropdownQuery();

  const safeDropdown = Array.isArray(dropdownData) ? dropdownData : [];

  const [postSiteExpense,    { isLoading: isSiteLoading  }] = usePostSiteExpenseMutation();
  const [postLabourRequest,  { isLoading: isLabourLoading }] = usePostLabourRequestMutation();
  const [postContractorDebit,{ isLoading: isDebitLoading  }] = usePostContractorDebitMutation();

  const isSubmitting = isSiteLoading || isLabourLoading || isDebitLoading;

  // ─── Form States ──────────────────────────────────────────────────────────
  const [siteExpensesData, setSiteExpensesData] = useState({
    Vendor_Payee_Name_1: '',
    Project_Name_1: '',
    Project_Engineer_Name_1: '',
    Head_Type_1: '',
    Bill_No_1: '',
    Bill_Date_1: '',
    Bill_Photo_1: '',
    Contractor_Name_1: '',
    Contractor_Firm_Name_1: '',
    Remark_1: '',
  });

  // ✅ Photo preview ke liye alag state
  const [billPhotoName, setBillPhotoName] = useState('');

  const [siteExpenseItems, setSiteExpenseItems] = useState([
    { Exp_Head_1: '', Details_of_Work_1: '', Amount_1: '' }
  ]);

  const [labourData, setLabourData] = useState({
    Project_Name_1: '',
    Project_Engineer_1: '',
    Work_Type_1: '',
    Work_Description_1: '',
    Labour_Category_1: '',
    Number_Of_Labour_1: '',
    Labour_Category_2: '',
    Number_Of_Labour_2: '',
    Total_Labour_1: '',
    Date_Of_Required_1: '',
    Head_Of_Contractor_Company_1: '',
    Name_Of_Contractor_1: '',
    Contractor_Firm_Name_1: '',
    Remark_1: '',
  });

  const [debitData, setDebitData] = useState({
    Project_Name_1: '',
    Project_Engineer_1: '',
    Contractor_Name_1: '',
    Contractor_Firm_Name_1: '',
    Work_Type_1: '',
    Work_Date_1: '',
    Work_Description_1: '',
    Particular_1: '',
    Qty_1: '',
    Rate_Wages_1: '',
    Amount_1: '',
  });

  const isLabourContractorHead = labourData.Head_Of_Contractor_Company_1 === 'Contractor Head';
  const isSiteContractorHead   = siteExpensesData.Head_Type_1 === 'Contractor Head';

  // ─── Auto Calculations ────────────────────────────────────────────────────
  useEffect(() => {
    const l1 = parseInt(labourData.Number_Of_Labour_1) || 0;
    const l2 = parseInt(labourData.Number_Of_Labour_2) || 0;
    setLabourData(prev => ({ ...prev, Total_Labour_1: (l1 + l2).toString() }));
  }, [labourData.Number_Of_Labour_1, labourData.Number_Of_Labour_2]);

  useEffect(() => {
    const qty  = parseFloat(debitData.Qty_1)        || 0;
    const rate = parseFloat(debitData.Rate_Wages_1) || 0;
    setDebitData(prev => ({ ...prev, Amount_1: (qty * rate).toFixed(2) }));
  }, [debitData.Qty_1, debitData.Rate_Wages_1]);

  // ─── Dropdown Options ─────────────────────────────────────────────────────
  const projectOptions = useMemo(() => {
    const seen = new Set();
    return safeDropdown
      .filter(item => {
        const name = (item.projectName || '').trim();
        return name && name !== '(No Project Name)';
      })
      .reduce((acc, item) => {
        const name  = item.projectName.trim();
        const lower = name.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          acc.push({
            value:    name,
            label:    item.label || name,
            engineer: item.engineer || '',
          });
        }
        return acc;
      }, [])
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [safeDropdown]);

  const contractorOptions = useMemo(() => {
    const seen = new Map();
    safeDropdown.forEach(item => {
      const cName = (item.contractorName || '').trim();
      if (!cName) return;
      const lowerC = cName.toLowerCase();
      const fName  = (item.contractorFirmName || '').trim();
      if (!seen.has(lowerC)) {
        seen.set(lowerC, {
          value:    cName,
          firmName: fName,
          label:    fName ? `${cName} (${fName})` : cName,
        });
      } else {
        const existing = seen.get(lowerC);
        if (fName && !existing.firmName) {
          existing.firmName = fName;
          existing.label    = `${cName} (${fName})`;
        }
      }
    });
    return Array.from(seen.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [safeDropdown]);

  const expenseWorkTypeOptions = useMemo(() => {
    return [...new Set(
      safeDropdown.map(i => (i.expenseWorkType || '').trim()).filter(Boolean)
    )].sort();
  }, [safeDropdown]);

  const labourWorkTypeOptions = useMemo(() => {
    return [...new Set(
      safeDropdown.map(i => (i.labourWorkType || '').trim()).filter(Boolean)
    )].sort();
  }, [safeDropdown]);

  const labourCategoryOptions = useMemo(() => {
    return [...new Set(
      safeDropdown.map(i => (i.labourCategory || '').trim()).filter(Boolean)
    )].sort();
  }, [safeDropdown]);

  // ─── Debug Logs ───────────────────────────────────────────────────────────
  useEffect(() => {
    console.log('── Dropdown Debug ──────────────────────');
    console.log('Raw rows from API   :', safeDropdown.length);
    console.log('Unique Projects     :', projectOptions.length);
    console.log('Unique Contractors  :', contractorOptions.length);
    console.log('Contractors list    :', contractorOptions.map(c => c.value));
  }, [safeDropdown, projectOptions, contractorOptions]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleProjectChange = (tab, value) => {
    const engineer = projectOptions.find(o => o.value === value)?.engineer || '';
    if (tab === 'siteExpenses') {
      setSiteExpensesData(prev => ({ ...prev, Project_Name_1: value, Project_Engineer_Name_1: engineer }));
    } else if (tab === 'labour') {
      setLabourData(prev => ({ ...prev, Project_Name_1: value, Project_Engineer_1: engineer }));
    } else if (tab === 'debit') {
      setDebitData(prev => ({ ...prev, Project_Name_1: value, Project_Engineer_1: engineer }));
    }
  };

  const handleContractorChange = (tab, value) => {
    const firmName = contractorOptions.find(o => o.value === value)?.firmName || '';
    if (tab === 'siteExpenses') {
      setSiteExpensesData(prev => ({ ...prev, Contractor_Name_1: value, Contractor_Firm_Name_1: firmName }));
    } else if (tab === 'labour') {
      setLabourData(prev => ({ ...prev, Name_Of_Contractor_1: value, Contractor_Firm_Name_1: firmName }));
    } else if (tab === 'debit') {
      setDebitData(prev => ({ ...prev, Contractor_Name_1: value, Contractor_Firm_Name_1: firmName }));
    }
  };

  const handleSiteExpenseChange = (field, value) => setSiteExpensesData(prev => ({ ...prev, [field]: value }));
  const handleLabourChange      = (field, value) => setLabourData(prev => ({ ...prev, [field]: value }));
  const handleDebitChange       = (field, value) => setDebitData(prev => ({ ...prev, [field]: value }));

  // ✅ Photo handler — FileReader se base64 with data URI
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBillPhotoName(file.name);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        handleSiteExpenseChange('Bill_Photo_1', reader.result);
      };
      reader.onerror = () => {
        console.error('File read karne mein error');
        setBillPhotoName('');
        handleSiteExpenseChange('Bill_Photo_1', '');
      };
    }
  };

  const handleItemChange = (index, field, value) => {
    setSiteExpenseItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addItem    = () => setSiteExpenseItems(prev => [
    ...prev,
    { Exp_Head_1: '', Details_of_Work_1: '', Amount_1: '' }
  ]);
  const removeItem = (index) => setSiteExpenseItems(prev => prev.filter((_, i) => i !== index));

  const showAlert = (type, message) => {
    alert(`${type === 'success' ? '✅' : '❌'} ${message}`);
  };

  // ─── Submit Handlers ──────────────────────────────────────────────────────

  // ✅ UPDATED: Site Expenses — required fields validation (Bill No. & Remark optional)
  const handleSubmitSiteExpenses = async (e) => {
    e.preventDefault();

    // Required field checks
    if (!siteExpensesData.Vendor_Payee_Name_1.trim()) {
      showAlert('error', 'Vendor/Payee Name required hai');
      return;
    }
    if (!siteExpensesData.Project_Name_1) {
      showAlert('error', 'Project Name required hai');
      return;
    }
    if (!siteExpensesData.Head_Type_1) {
      showAlert('error', 'Head Type required hai');
      return;
    }
    if (!siteExpensesData.Bill_Date_1) {
      showAlert('error', 'Bill Date required hai');
      return;
    }
    if (!siteExpensesData.Bill_Photo_1) {
      showAlert('error', 'Bill Photo required hai');
      return;
    }
    // Contractor fields required when Contractor Head selected
    if (isSiteContractorHead && !siteExpensesData.Contractor_Name_1) {
      showAlert('error', 'Contractor Name required hai');
      return;
    }

    const validItems = siteExpenseItems.filter(item => item.Exp_Head_1 && item.Amount_1 && item.Details_of_Work_1.trim());
    if (validItems.length === 0) {
      showAlert('error', 'Kam se kam ek item mein Expense Head, Amount aur Details of Work fill karo');
      return;
    }
    const incompleteItem = siteExpenseItems.find(item =>
      (item.Exp_Head_1 || item.Amount_1 || item.Details_of_Work_1.trim()) &&
      (!item.Exp_Head_1 || !item.Amount_1 || !item.Details_of_Work_1.trim())
    );
    if (incompleteItem) {
      showAlert('error', 'Har item mein Expense Head, Amount aur Details of Work teeno required hain');
      return;
    }

    const payload = {
      Vendor_Payee_Name_1:      siteExpensesData.Vendor_Payee_Name_1,
      Project_Name_1:           siteExpensesData.Project_Name_1,
      Project_Engineer_Name_1:  siteExpensesData.Project_Engineer_Name_1,
      Head_Type_1:              siteExpensesData.Head_Type_1,
      Bill_No_1:                siteExpensesData.Bill_No_1,
      Bill_Date_1:              siteExpensesData.Bill_Date_1,
      Bill_Photo_1:             siteExpensesData.Bill_Photo_1,
      Contractor_Name_1:        siteExpensesData.Contractor_Name_1,
      Contractor_Firm_Name_1:   siteExpensesData.Contractor_Firm_Name_1,
      Remark_1:                 siteExpensesData.Remark_1,
      items:                    validItems,
    };

    try {
      const result = await postSiteExpense(payload).unwrap();
      showAlert('success', `${result.message} | Bill: ${result.billNo}`);
      resetSiteExpensesForm();
    } catch (err) {
      showAlert('error', err?.data?.message || 'Site Expense submit karne mein error aaya');
    }
  };

  // ✅ UPDATED: Labour — required fields validation
  // Optional: Labour Category 2, Number of Labour Cat 2, Remark
  const handleSubmitLabour = async (e) => {
    e.preventDefault();

    if (!labourData.Project_Name_1) {
      showAlert('error', 'Project Name required hai');
      return;
    }
    if (!labourData.Work_Type_1) {
      showAlert('error', 'Work Type required hai');
      return;
    }
    if (!labourData.Work_Description_1.trim()) {
      showAlert('error', 'Work Description required hai');
      return;
    }
    if (!labourData.Labour_Category_1) {
      showAlert('error', 'Labour Category 1 required hai');
      return;
    }
    if (!labourData.Number_Of_Labour_1 || parseInt(labourData.Number_Of_Labour_1) <= 0) {
      showAlert('error', 'Number of Labour (Cat 1) required hai aur 0 se zyada hona chahiye');
      return;
    }
    if (!labourData.Date_Of_Required_1) {
      showAlert('error', 'Date of Required required hai');
      return;
    }
    if (!labourData.Head_Of_Contractor_Company_1) {
      showAlert('error', 'Head Of Contractor/Company required hai');
      return;
    }
    // Contractor fields required when Contractor Head selected
    if (isLabourContractorHead && !labourData.Name_Of_Contractor_1) {
      showAlert('error', 'Name of Contractor required hai');
      return;
    }

    const payload = { ...labourData };
    try {
      const result = await postLabourRequest(payload).unwrap();
      showAlert('success', `${result.message} | UID: ${result.uid}`);
      resetLabourForm();
    } catch (err) {
      showAlert('error', err?.data?.message || 'Labour Request submit karne mein error aaya');
    }
  };

  const handleSubmitDebit = async (e) => {
    e.preventDefault();
    if (!debitData.Project_Name_1 || !debitData.Contractor_Name_1) {
      showAlert('error', 'Project Name aur Contractor Name required hain');
      return;
    }
    const payload = { ...debitData };
    try {
      const result = await postContractorDebit(payload).unwrap();
      showAlert('success', `${result.message} | UID: ${result.uid}`);
      resetDebitForm();
    } catch (err) {
      showAlert('error', err?.data?.message || 'Contractor Debit submit karne mein error aaya');
    }
  };

  // ─── Reset Handlers ───────────────────────────────────────────────────────
  const resetSiteExpensesForm = () => {
    setSiteExpensesData({
      Vendor_Payee_Name_1: '', Project_Name_1: '', Project_Engineer_Name_1: '',
      Head_Type_1: '', Bill_No_1: '', Bill_Date_1: '', Bill_Photo_1: '',
      Contractor_Name_1: '', Contractor_Firm_Name_1: '', Remark_1: '',
    });
    setSiteExpenseItems([{ Exp_Head_1: '', Details_of_Work_1: '', Amount_1: '' }]);
    setBillPhotoName('');
  };

  const resetLabourForm = () => setLabourData({
    Project_Name_1: '', Project_Engineer_1: '', Work_Type_1: '', Work_Description_1: '',
    Labour_Category_1: '', Number_Of_Labour_1: '', Labour_Category_2: '', Number_Of_Labour_2: '',
    Total_Labour_1: '', Date_Of_Required_1: '', Head_Of_Contractor_Company_1: '',
    Name_Of_Contractor_1: '', Contractor_Firm_Name_1: '', Remark_1: '',
  });

  const resetDebitForm = () => setDebitData({
    Project_Name_1: '', Project_Engineer_1: '', Contractor_Name_1: '', Contractor_Firm_Name_1: '',
    Work_Type_1: '', Work_Date_1: '', Work_Description_1: '', Particular_1: '',
    Qty_1: '', Rate_Wages_1: '', Amount_1: '',
  });

  // ─── Reusable SelectField Component ──────────────────────────────────────
  const SelectField = ({
    label, icon: Icon, value, onChange, options,
    required, colorClass = 'blue', disabled = false
  }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {Icon && <Icon className="w-4 h-4 inline mr-1" />}
        {label} {required && <span className="text-red-500">*</span>}
        {disabled && isDropdownLoading && (
          <span className="text-xs text-gray-500 ml-2">(loading...)</span>
        )}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none
            focus:ring-2 focus:ring-${colorClass}-500 appearance-none bg-white
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
        >
          <option value="">-- Select {label} --</option>
          {options.map((opt, idx) => (
            <option key={idx} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );

  // ─── Tab Config ───────────────────────────────────────────────────────────
  const tabs = [
    { id: 'siteExpenses', label: 'Site Expenses', icon: Receipt,    gradient: 'from-blue-600 to-indigo-600'   },
    { id: 'labour',       label: 'Labour',        icon: Users,      gradient: 'from-emerald-600 to-teal-600'  },
    { id: 'debit',        label: 'Debit',         icon: CreditCard, gradient: 'from-purple-600 to-indigo-600' },
  ];
  const activeTabConfig = tabs.find(t => t.id === activeTab);

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">

        {/* ── Tabs ── */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon     = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg scale-105`
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dropdown error banner */}
        {isDropdownError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            ⚠️ Dropdown data load nahi ho paya. Page refresh karo.
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* ── Header ── */}
          <div className={`bg-gradient-to-r ${activeTabConfig?.gradient} p-6 text-white`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                {activeTabConfig && <activeTabConfig.icon className="w-6 h-6" />}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{activeTabConfig?.label} Form</h1>
                <p className="text-white/80 text-sm mt-1">
                  {activeTab === 'siteExpenses' && 'Enter site expense details'}
                  {activeTab === 'labour'       && 'Request labour for your project'}
                  {activeTab === 'debit'        && 'Create debit entries for contractors'}
                </p>
              </div>
            </div>
          </div>

          {/* ════════════════════ SITE EXPENSES FORM ════════════════════ */}
          {activeTab === 'siteExpenses' && (
            <form onSubmit={handleSubmitSiteExpenses} className="p-6 space-y-6">

              {/* Vendor & Project */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {/* ✅ Required */}
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />Vendor/Payee Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={siteExpensesData.Vendor_Payee_Name_1}
                    onChange={(e) => handleSiteExpenseChange('Vendor_Payee_Name_1', e.target.value)}
                    placeholder="Enter Vendor/Payee Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <SelectField
                  label="Project Name" icon={Building} required
                  value={siteExpensesData.Project_Name_1}
                  onChange={(e) => handleProjectChange('siteExpenses', e.target.value)}
                  options={projectOptions} colorClass="blue" disabled={isDropdownLoading}
                />
              </div>

              {/* Engineer + Bill No + Bill Date */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />Project Engineer
                    <span className="text-xs text-gray-400 ml-1">(auto)</span>
                  </label>
                  <input
                    type="text" readOnly
                    value={siteExpensesData.Project_Engineer_Name_1}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed text-gray-600"
                  />
                </div>
                <div>
                  {/* Bill No — optional (no * star) */}
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Hash className="w-4 h-4 inline mr-1" />Bill No.
                  </label>
                  <input
                    type="text"
                    value={siteExpensesData.Bill_No_1}
                    onChange={(e) => handleSiteExpenseChange('Bill_No_1', e.target.value)}
                    placeholder="Enter Bill Number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  {/* ✅ Required */}
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />Bill Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={siteExpensesData.Bill_Date_1}
                    onChange={(e) => handleSiteExpenseChange('Bill_Date_1', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Head Type — ✅ Required */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Briefcase className="w-4 h-4 inline mr-1" />Head Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={siteExpensesData.Head_Type_1}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSiteExpensesData(prev => ({
                        ...prev,
                        Head_Type_1: val,
                        ...(val !== 'Contractor Head' && { Contractor_Name_1: '', Contractor_Firm_Name_1: '' })
                      }));
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  >
                    <option value="">-- Select Head Type --</option>
                    {['Company Head', 'Contractor Head'].map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* ✅ Bill Photo — Required */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Camera className="w-4 h-4 inline mr-1" />Bill Photo <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handlePhotoChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {billPhotoName && (
                  <p className="text-xs text-green-600 mt-1">✅ {billPhotoName} — Ready to upload</p>
                )}
              </div>

              {/* Contractor fields — only when Contractor Head */}
              {isSiteContractorHead && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    {/* ✅ Required when Contractor Head */}
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <HardHat className="w-4 h-4 inline mr-1" />Contractor Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={siteExpensesData.Contractor_Name_1}
                        onChange={(e) => handleContractorChange('siteExpenses', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                      >
                        <option value="">-- Select Contractor --</option>
                        {contractorOptions.map((opt, i) => (
                          <option key={i} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Building className="w-4 h-4 inline mr-1" />Contractor Firm Name
                      <span className="text-xs text-gray-400 ml-1">(auto)</span>
                    </label>
                    <input
                      type="text" readOnly
                      value={siteExpensesData.Contractor_Firm_Name_1}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed text-gray-600"
                    />
                  </div>
                </div>
              )}

              {/* Expense Items */}
              <div className="border border-blue-200 rounded-xl overflow-hidden">
                <div className="bg-blue-50 px-4 py-3 flex items-center justify-between border-b border-blue-200">
                  <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                    <FileText className="w-5 h-5" />Expense Items <span className="text-red-500">*</span>
                    <span className="text-xs text-blue-600 font-normal">(har item alag row banega sheet mein)</span>
                  </h3>
                  <button
                    type="button" onClick={addItem}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  {siteExpenseItems.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative">
                      {siteExpenseItems.length > 1 && (
                        <button
                          type="button" onClick={() => removeItem(index)}
                          className="absolute top-3 right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}

                      <p className="text-sm font-semibold text-gray-600 mb-3">Item {index + 1}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Expense Head <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={item.Exp_Head_1}
                              onChange={(e) => handleItemChange(index, 'Exp_Head_1', e.target.value)}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                            >
                              <option value="">-- Select --</option>
                              {expenseWorkTypeOptions.map((opt, i) => (
                                <option key={i} value={opt}>{opt}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Amount (₹) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={item.Amount_1}
                            onChange={(e) => handleItemChange(index, 'Amount_1', e.target.value)}
                            placeholder="0.00"
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Details of Work <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={item.Details_of_Work_1}
                            onChange={(e) => handleItemChange(index, 'Details_of_Work_1', e.target.value)}
                            placeholder="Work details..."
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 px-4 py-3 border-t border-blue-200 flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-800">
                    Total Items: {siteExpenseItems.filter(i => i.Exp_Head_1 && i.Amount_1 && i.Details_of_Work_1.trim()).length} valid
                  </span>
                  <span className="text-lg font-bold text-blue-700">
                    ₹{siteExpenseItems.reduce((sum, i) => sum + (parseFloat(i.Amount_1) || 0), 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Remark — optional (no * star) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />Remark
                </label>
                <textarea
                  value={siteExpensesData.Remark_1} rows={2}
                  onChange={(e) => handleSiteExpenseChange('Remark_1', e.target.value)}
                  placeholder="Enter any remarks..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                <button type="button" onClick={resetSiteExpensesForm}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Reset
                </button>
                <button type="submit" disabled={isSiteLoading || isDropdownLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSiteLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    : <><Send className="w-4 h-4" /> Submit Site Expense</>
                  }
                </button>
              </div>
            </form>
          )}

          {/* ════════════════════ LABOUR FORM ════════════════════ */}
          {activeTab === 'labour' && (
            <form onSubmit={handleSubmitLabour} className="p-6 space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  label="Project Name" icon={Building} required
                  value={labourData.Project_Name_1}
                  onChange={(e) => handleProjectChange('labour', e.target.value)}
                  options={projectOptions} colorClass="emerald" disabled={isDropdownLoading}
                />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />Project Engineer
                    <span className="text-xs text-gray-400 ml-1">(auto)</span>
                  </label>
                  <input type="text" readOnly value={labourData.Project_Engineer_1}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed text-gray-600"
                  />
                </div>
              </div>

              {/* ✅ Required */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Wrench className="w-4 h-4 inline mr-1" />Work Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select value={labourData.Work_Type_1}
                    onChange={(e) => handleLabourChange('Work_Type_1', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
                  >
                    <option value="">-- Select Work Type --</option>
                    {labourWorkTypeOptions.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* ✅ Required */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />Work Description <span className="text-red-500">*</span>
                </label>
                <textarea value={labourData.Work_Description_1} rows={3}
                  onChange={(e) => handleLabourChange('Work_Description_1', e.target.value)}
                  placeholder="Describe the work..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-4">
                <h3 className="font-semibold text-emerald-800 flex items-center gap-2">
                  <Users className="w-5 h-5" />Labour Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ✅ Required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Labour Category 1 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select value={labourData.Labour_Category_1}
                        onChange={(e) => handleLabourChange('Labour_Category_1', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
                      >
                        <option value="">-- Select --</option>
                        {labourCategoryOptions.map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  {/* ✅ Required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Labour (Cat 1) <span className="text-red-500">*</span>
                    </label>
                    <input type="number" min="0" placeholder="0"
                      value={labourData.Number_Of_Labour_1}
                      onChange={(e) => handleLabourChange('Number_Of_Labour_1', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  {/* Optional — no * */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Labour Category 2</label>
                    <div className="relative">
                      <select value={labourData.Labour_Category_2}
                        onChange={(e) => handleLabourChange('Labour_Category_2', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
                      >
                        <option value="">-- Select --</option>
                        {labourCategoryOptions.map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  {/* Optional — no * */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Labour (Cat 2)</label>
                    <input type="number" min="0" placeholder="0"
                      value={labourData.Number_Of_Labour_2}
                      onChange={(e) => handleLabourChange('Number_Of_Labour_2', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-emerald-300 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Calculator className="w-4 h-4" />Total Labour (Auto)
                  </span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {labourData.Total_Labour_1 || '0'}
                  </span>
                </div>
              </div>

              {/* ✅ Required */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />Date of Required <span className="text-red-500">*</span>
                </label>
                <input type="date" value={labourData.Date_Of_Required_1}
                  onChange={(e) => handleLabourChange('Date_Of_Required_1', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* ✅ Required */}
              <div className={`grid grid-cols-1 gap-4 ${isLabourContractorHead ? 'md:grid-cols-3' : ''}`}>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Briefcase className="w-4 h-4 inline mr-1" />Head Of Contractor/Company <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select value={labourData.Head_Of_Contractor_Company_1}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLabourData(prev => ({
                          ...prev,
                          Head_Of_Contractor_Company_1: val,
                          ...(val !== 'Contractor Head' && { Name_Of_Contractor_1: '', Contractor_Firm_Name_1: '' })
                        }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
                    >
                      <option value="">-- Select --</option>
                      {['Company Head', 'Contractor Head'].map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {isLabourContractorHead && (
                  <>
                    {/* ✅ Required when Contractor Head */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <HardHat className="w-4 h-4 inline mr-1" />Name of Contractor <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select value={labourData.Name_Of_Contractor_1}
                          onChange={(e) => handleContractorChange('labour', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
                        >
                          <option value="">-- Select --</option>
                          {contractorOptions.map((opt, i) => (
                            <option key={i} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Building className="w-4 h-4 inline mr-1" />Contractor Firm
                        <span className="text-xs text-gray-400 ml-1">(auto)</span>
                      </label>
                      <input type="text" readOnly value={labourData.Contractor_Firm_Name_1}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed text-gray-600"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Remark — optional (no * star) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />Remark
                </label>
                <textarea value={labourData.Remark_1} rows={2}
                  onChange={(e) => handleLabourChange('Remark_1', e.target.value)}
                  placeholder="Enter any remarks..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button type="button" onClick={resetLabourForm}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Reset
                </button>
                <button type="submit" disabled={isLabourLoading || isDropdownLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLabourLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    : <><Send className="w-4 h-4" /> Submit Labour Request</>
                  }
                </button>
              </div>
            </form>
          )}

          {/* ════════════════════ DEBIT FORM ════════════════════ */}
          {activeTab === 'debit' && (
            <form onSubmit={handleSubmitDebit} className="p-6 space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  label="Project Name" icon={Building} required
                  value={debitData.Project_Name_1}
                  onChange={(e) => handleProjectChange('debit', e.target.value)}
                  options={projectOptions} colorClass="purple" disabled={isDropdownLoading}
                />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />Project Engineer
                    <span className="text-xs text-gray-400 ml-1">(auto)</span>
                  </label>
                  <input type="text" readOnly value={debitData.Project_Engineer_1}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed text-gray-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <HardHat className="w-4 h-4 inline mr-1" />Contractor Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select value={debitData.Contractor_Name_1}
                      onChange={(e) => handleContractorChange('debit', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
                    >
                      <option value="">-- Select Contractor --</option>
                      {contractorOptions.map((opt, i) => (
                        <option key={i} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />Contractor Firm
                    <span className="text-xs text-gray-400 ml-1">(auto)</span>
                  </label>
                  <input type="text" readOnly value={debitData.Contractor_Firm_Name_1}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed text-gray-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Wrench className="w-4 h-4 inline mr-1" />Work Type
                  </label>
                  <div className="relative">
                    <select value={debitData.Work_Type_1}
                      onChange={(e) => handleDebitChange('Work_Type_1', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
                    >
                      <option value="">-- Select --</option>
                      {labourWorkTypeOptions.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />Work Date
                  </label>
                  <input type="date" value={debitData.Work_Date_1}
                    onChange={(e) => handleDebitChange('Work_Date_1', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />Work Description
                </label>
                <textarea value={debitData.Work_Description_1} rows={3}
                  onChange={(e) => handleDebitChange('Work_Description_1', e.target.value)}
                  placeholder="Describe the work..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 space-y-4">
                <h3 className="font-semibold text-purple-800 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />Amount Calculation
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Package className="w-4 h-4 inline mr-1" />Particular
                  </label>
                  <div className="relative">
                    <select value={debitData.Particular_1}
                      onChange={(e) => handleDebitChange('Particular_1', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
                    >
                      <option value="">-- Select Particular --</option>
                      {['Labour Work', 'Material Supply', 'Transportation', 'Equipment Rent', 'Advance', 'Other'].map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Hash className="w-4 h-4 inline mr-1" />Quantity
                    </label>
                    <input type="number" min="0" step="0.01" placeholder="0"
                      value={debitData.Qty_1}
                      onChange={(e) => handleDebitChange('Qty_1', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <IndianRupee className="w-4 h-4 inline mr-1" />Rate / Wages (₹)
                    </label>
                    <input type="number" min="0" step="0.01" placeholder="0"
                      value={debitData.Rate_Wages_1}
                      onChange={(e) => handleDebitChange('Rate_Wages_1', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-purple-300 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4" />Total Amount (Auto)
                  </span>
                  <span className="text-2xl font-bold text-purple-600">
                    ₹{debitData.Amount_1 || '0.00'}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button type="button" onClick={resetDebitForm}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Reset
                </button>
                <button type="submit" disabled={isDebitLoading || isDropdownLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDebitLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    : <><Send className="w-4 h-4" /> Submit Debit Entry</>
                  }
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default SiteExpensesForm;