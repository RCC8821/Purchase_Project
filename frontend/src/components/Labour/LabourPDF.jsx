


// import React, { useState, useEffect, useRef, useMemo } from 'react';
// import {
//   Loader2, RefreshCw, Search, Filter, X, FileText,
//   Building, HardHat, Hash, ChevronDown, ChevronUp,
//   Users, Wrench, User, Clock, Check, CheckSquare,
//   Square, ListChecks, CircleDollarSign, Receipt,
//   AlertCircle
// } from 'lucide-react';

// // ─── Redux imports — apne slice se replace karo ───────────────────────────────
// // import { useGetPDFDataQuery, useGeneratePDFMutation } from '../../redux/Labour/LabourSlice';

// // ─── Temporary fetch hooks (Redux wale hote to inhe hata do) ─────────────────
// const BASE_URL = 'http://localhost:5000/api/labour/pdf'; // ← apna URL yahan daalo

// const useGetPDFDataQuery = () => {
//   const [state, setState] = useState({ data: null, isLoading: true, isError: false, isFetching: false });
//   const refetch = async () => {
//     setState(s => ({ ...s, isFetching: true }));
//     try {
//       const res = await fetch(`${BASE_URL}/Get-PDF-Data`);
//       const json = await res.json();
//       setState({ data: json.success ? json.data : null, isLoading: false, isError: !json.success, isFetching: false });
//     } catch {
//       setState({ data: null, isLoading: false, isError: true, isFetching: false });
//     }
//   };
//   useEffect(() => { refetch(); }, []);
//   return { ...state, refetch };
// };

// const useGeneratePDFMutation = () => {
//   const [isLoading, setIsLoading] = useState(false);
//   const mutate = async (payload) => {
//     setIsLoading(true);
//     try {
//       const res = await fetch(`${BASE_URL}/Generate-PDF`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       const json = await res.json();
//       setIsLoading(false);
//       if (json.success) return json;
//       throw new Error(json.error || 'Failed');
//     } catch (e) { setIsLoading(false); throw e; }
//   };
//   return [mutate, { isLoading }];
// };

// // ─── Format Amount ─────────────────────────────────────────────────────────────
// const formatAmount = (value) => {
//   if (value == null || value === '') return '0';
//   const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
//   if (isNaN(num)) return '0';
//   return num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
// };

// // ─── Searchable Dropdown ───────────────────────────────────────────────────────
// const SearchableDropdown = ({ label, icon: Icon, options = [], value, onChange, placeholder, color = 'amber' }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const ref = useRef(null);

//   const palette = {
//     amber:  { bg: 'bg-amber-50',  text: 'text-amber-700',  hover: 'hover:bg-amber-100',  selected: 'bg-amber-100 text-amber-800',  ring: 'ring-amber-200',  border: 'border-amber-500'  },
//     purple: { bg: 'bg-purple-50', text: 'text-purple-700', hover: 'hover:bg-purple-100', selected: 'bg-purple-100 text-purple-800', ring: 'ring-purple-200', border: 'border-purple-500' },
//     green:  { bg: 'bg-green-50',  text: 'text-green-700',  hover: 'hover:bg-green-100',  selected: 'bg-green-100 text-green-800',  ring: 'ring-green-200',  border: 'border-green-500'  },
//   }[color] || {};

//   const filtered = useMemo(() =>
//     options.filter(o => typeof o === 'string' && o.toLowerCase().includes(searchTerm.toLowerCase())),
//     [options, searchTerm]
//   );

//   useEffect(() => {
//     const h = (e) => { if (ref.current && !ref.current.contains(e.target)) { setIsOpen(false); setSearchTerm(''); } };
//     document.addEventListener('mousedown', h);
//     return () => document.removeEventListener('mousedown', h);
//   }, []);

//   return (
//     <div ref={ref} className="relative">
//       {label && (
//         <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
//           {Icon && <Icon className="w-4 h-4" />}{label}
//         </label>
//       )}
//       <div onClick={() => setIsOpen(o => !o)}
//         className={`w-full px-4 py-3 border-2 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-2
//           ${isOpen ? `${palette.border} ring-2 ${palette.ring}` : 'border-gray-200 hover:border-gray-300'}
//           ${value ? palette.bg : 'bg-white'}`}>
//         {value ? (
//           <span className={`text-sm font-medium truncate flex-1 ${palette.text}`}>{value}</span>
//         ) : (
//           <input value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setIsOpen(true); }}
//             onClick={e => { e.stopPropagation(); setIsOpen(true); }}
//             placeholder={placeholder}
//             className="w-full bg-transparent outline-none text-sm text-gray-600 placeholder-gray-400" />
//         )}
//         <div className="flex items-center gap-1 flex-shrink-0">
//           {value && (
//             <button onClick={e => { e.stopPropagation(); onChange(''); setSearchTerm(''); }}
//               className="p-0.5 hover:bg-white/60 rounded-full">
//               <X className="w-3.5 h-3.5 text-gray-500" />
//             </button>
//           )}
//           {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
//         </div>
//       </div>

//       {isOpen && (
//         <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
//           {value && (
//             <div className="p-2 border-b border-gray-100">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
//                 <input autoFocus value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
//                   placeholder="Search..." className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
//               </div>
//             </div>
//           )}
//           <div className="max-h-48 overflow-y-auto">
//             <button onClick={() => { onChange(''); setIsOpen(false); setSearchTerm(''); }}
//               className={`w-full px-4 py-2.5 text-left text-sm ${!value ? palette.selected : 'hover:bg-gray-50 text-gray-400'}`}>
//               -- Select --
//             </button>
//             {filtered.length > 0 ? filtered.map((opt, i) => (
//               <button key={`${opt}-${i}`} onClick={() => { onChange(opt); setIsOpen(false); setSearchTerm(''); }}
//                 className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors
//                   ${value === opt ? palette.selected : `${palette.hover} text-gray-700`}`}>
//                 <span className="truncate">{opt}</span>
//                 {value === opt && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
//               </button>
//             )) : (
//               <div className="px-4 py-3 text-sm text-gray-400 text-center">No results</div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ─── PDF Modal ──────────────────────────────────────────────────────────────────
// const PDFModal = ({ open, onClose, onConfirm, isLoading, selectedItems }) => {
//   const [billNo, setBillNo]     = useState('');
//   const [paidName, setPaidName] = useState('');

//   if (!open) return null;

//   const totalCompany    = selectedItems.reduce((s, r) => s + (parseFloat(String(r.Revised_Company_Head_Amount_4 || '0').replace(/[^0-9.-]/g, '')) || 0), 0);
//   const totalContractor = selectedItems.reduce((s, r) => s + (parseFloat(String(r.Revised_Contractor_Head_Amount_4 || '0').replace(/[^0-9.-]/g, '')) || 0), 0);

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col">
//         {/* Header */}
//         <div className="p-5 border-b bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl flex items-center justify-between">
//           <div>
//             <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
//               <FileText className="w-5 h-5 text-indigo-600" /> Generate Labour PDF
//             </h3>
//             <p className="text-sm text-gray-500 mt-0.5">
//               <span className="font-semibold text-indigo-600">{selectedItems.length}</span> records selected
//             </p>
//           </div>
//           <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
//             <X className="w-5 h-5 text-gray-500" />
//           </button>
//         </div>

//         <div className="p-5 space-y-4">
//           {/* UID Chips */}
//           <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
//             <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2 flex items-center gap-1">
//               <ListChecks className="w-3.5 h-3.5" /> Selected UIDs
//             </p>
//             <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto mb-3">
//               {selectedItems.map((item, i) => (
//                 <span key={item.uid || i} className="px-2 py-0.5 bg-white border border-indigo-200 text-indigo-700 rounded text-xs font-semibold">
//                   {item.uid}
//                 </span>
//               ))}
//             </div>
//             <div className="grid grid-cols-2 gap-2">
//               <div className="bg-white rounded-lg p-2.5 text-center border border-indigo-100">
//                 <p className="text-xs text-gray-400">Company Head Total</p>
//                 <p className="text-base font-bold text-purple-700 mt-0.5">₹{formatAmount(totalCompany)}</p>
//               </div>
//               <div className="bg-white rounded-lg p-2.5 text-center border border-indigo-100">
//                 <p className="text-xs text-gray-400">Contractor Head Total</p>
//                 <p className="text-base font-bold text-green-700 mt-0.5">₹{formatAmount(totalContractor)}</p>
//               </div>
//             </div>
//           </div>

//           {/* Bill No */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
//               <Hash className="w-4 h-4" /> Bill No. <span className="text-red-500">*</span>
//             </label>
//             <input value={billNo} onChange={e => setBillNo(e.target.value)} placeholder="Enter bill number"
//               className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm" />
//           </div>

//           {/* Paid By */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
//               <Receipt className="w-4 h-4" /> Paid By <span className="text-red-500">*</span>
//             </label>
//             <input value={paidName} onChange={e => setPaidName(e.target.value)} placeholder="Enter payer name"
//               className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm" />
//           </div>

//           <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
//             <p className="text-xs text-blue-600">
//               ℹ️ <strong>Note:</strong> PDF Google Drive pe upload hogi aur sheet mein status update ho jaayega.
//             </p>
//           </div>
//         </div>

//         <div className="p-4 border-t bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
//           <button onClick={onClose} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 text-sm font-medium">
//             Cancel
//           </button>
//           <button onClick={() => onConfirm(paidName, billNo)} disabled={isLoading || !paidName || !billNo}
//             className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow">
//             {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</> : <><FileText className="w-4 h-4" />Generate PDF</>}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── Main Component ─────────────────────────────────────────────────────────────
// const LabourPDF = () => {
//   const { data: apiData, isLoading, isError, isFetching, refetch } = useGetPDFDataQuery();
//   const [generatePDF, { isLoading: isPDFLoading }] = useGeneratePDFMutation();

//   const [searchTerm,         setSearchTerm]         = useState('');
//   const [selectedProject,    setSelectedProject]    = useState('');
//   const [selectedContractor, setSelectedContractor] = useState('');
//   const [selectedItems,      setSelectedItems]      = useState([]);
//   const [showModal,          setShowModal]          = useState(false);
//   const [toast,              setToast]              = useState(null);

//   const data             = useMemo(() => (Array.isArray(apiData) ? apiData : []), [apiData]);
//   const uniqueProjects   = useMemo(() => [...new Set(data.map(d => d.projectName).filter(Boolean))].sort(), [data]);
//   const uniqueContractors= useMemo(() => [...new Set(data.map(d => d.Labouar_Contractor_Name_3).filter(Boolean))].sort(), [data]);
//   const hasActiveFilters = searchTerm || selectedProject || selectedContractor;

//   const filteredData = useMemo(() => data.filter(item => {
//     const s = searchTerm.toLowerCase();
//     const matchSearch = !s || [item.uid, item.projectName, item.Labouar_Contractor_Name_3, item.projectEngineer, item.workDescription, item.workType]
//       .some(v => (v || '').toLowerCase().includes(s));
//     return matchSearch && (!selectedProject || item.projectName === selectedProject) && (!selectedContractor || item.Labouar_Contractor_Name_3 === selectedContractor);
//   }), [data, searchTerm, selectedProject, selectedContractor]);

//   const clearFilters = () => { setSearchTerm(''); setSelectedProject(''); setSelectedContractor(''); };
//   const toggleItem = (item) => setSelectedItems(prev => prev.some(s => s.uid === item.uid) ? prev.filter(s => s.uid !== item.uid) : [...prev, item]);
//   const toggleAll  = () => setSelectedItems(selectedItems.length === filteredData.length ? [] : [...filteredData]);
//   const allSelected= filteredData.length > 0 && selectedItems.length === filteredData.length;

//   const totalSelectedCompany    = selectedItems.reduce((s, r) => s + (parseFloat(String(r.Revised_Company_Head_Amount_4 || '0').replace(/[^0-9.-]/g, '')) || 0), 0);
//   const totalSelectedContractor = selectedItems.reduce((s, r) => s + (parseFloat(String(r.Revised_Contractor_Head_Amount_4 || '0').replace(/[^0-9.-]/g, '')) || 0), 0);

//   const handleGenerate = async (paidName, billNo) => {
//     try {
//       const result = await generatePDF({ uids: selectedItems.map(i => i.uid), paidName, billNo });
//       setToast({ type: 'success', msg: `✅ PDF ban gayi! ${result.updatedUids?.length || 0} records update ho gaye.`, url: result.pdfUrl });
//       setSelectedItems([]);
//       setShowModal(false);
//       refetch();
//     } catch (e) {
//       setToast({ type: 'error', msg: `❌ ${e.message || 'PDF generate nahi hui'}` });
//     }
//   };

//   useEffect(() => {
//     if (toast) { const t = setTimeout(() => setToast(null), 6000); return () => clearTimeout(t); }
//   }, [toast]);

//   // Table columns — same fields as PaidAmount
//   const columns = [
//       { key: 'planned5',                         label: 'Planned Date',      icon: Clock                           },
//     { key: 'uid',                              label: 'UID No.',           icon: Hash,              isUid: true   },
//     { key: 'projectName',                      label: 'Project Name',      icon: Building                        },
//     { key: 'projectEngineer',                  label: 'Engineer',          icon: User                            },
//     { key: 'workType',                         label: 'Work Type',         icon: Wrench                          },
//     { key: 'workDescription',                  label: 'Work Description',  icon: FileText                        },
//     { key: 'Labouar_Contractor_Name_3',        label: 'Contractor',        icon: HardHat                         },
//     { key: 'Labour_Category_1_3',              label: 'Cat 1',             icon: Users                           },
//     { key: 'Number_Of_Labour_1_3',             label: 'Labour No.1',       icon: Users,             isNum: true   },
//     { key: 'Labour_Category_2_3',              label: 'Cat 2',             icon: Users                           },
//     { key: 'Number_Of_Labour_2_3',             label: 'Labour No.2',       icon: Users,             isNum: true   },
//     { key: 'totalLabour',                      label: 'Total Labour',      icon: Users,             isNum: true   },
//     { key: 'Deployed_Category_1_Labour_No_4',  label: 'Deployed Cat1',     icon: Users,             isNum: true   },
//     { key: 'Deployed_Category_2_Labour_No_4',  label: 'Deployed Cat2',     icon: Users,             isNum: true   },
//     { key: 'Revised_Company_Head_Amount_4',    label: 'Company Head Amt',  icon: CircleDollarSign,  isAmt: true, amtColor: 'text-purple-700'  },
//     { key: 'Revised_Contractor_Head_Amount_4', label: 'Contractor Amt',    icon: CircleDollarSign,  isAmt: true, amtColor: 'text-green-700'   },
//   ];

//   if (isLoading) return (
//     <div className="flex items-center justify-center h-64">
//       <div className="text-center">
//         <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
//         <p className="text-gray-500 font-medium">Data load ho raha hai...</p>
//       </div>
//     </div>
//   );

//   if (isError) return (
//     <div className="flex items-center justify-center h-64">
//       <div className="text-center bg-red-50 p-6 rounded-xl border border-red-200">
//         <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
//         <p className="text-red-600 font-semibold mb-3">Data load nahi hua</p>
//         <button onClick={refetch} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 mx-auto text-sm">
//           <RefreshCw className="w-4 h-4" /> Retry
//         </button>
//       </div>
//     </div>
//   );

//   return (
//     <div className="space-y-5 p-4 bg-gray-50 min-h-screen">

//       {/* Toast */}
//       {toast && (
//         <div className={`fixed top-4 right-4 z-[100] max-w-sm p-4 rounded-xl shadow-xl border flex flex-col gap-1.5
//           ${toast.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
//           <span className={`text-sm font-semibold ${toast.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>{toast.msg}</span>
//           {toast.url && <a href={toast.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 underline">PDF dekhen →</a>}
//         </div>
//       )}

//       {/* Page Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
//             <FileText className="w-7 h-7 text-indigo-600" /> Labour PDF Generator
//           </h2>
//           <p className="text-gray-500 mt-1 text-sm">Records select karein aur PDF generate karein</p>
//         </div>
//         <button onClick={refetch} disabled={isFetching}
//           className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-medium disabled:opacity-60">
//           <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
//         </button>
//       </div>

//       {/* Sticky Selected Banner */}
//       {selectedItems.length > 0 && (
//         <div className="sticky top-0 z-20 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl p-4 text-white shadow-lg">
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
//             <div className="flex flex-wrap items-center gap-3">
//               <div className="flex items-center gap-2 font-bold">
//                 <ListChecks className="w-5 h-5" />{selectedItems.length} Selected
//               </div>
//               <div className="flex gap-2 flex-wrap">
//                 <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-medium">
//                   🏢 Company: ₹{formatAmount(totalSelectedCompany)}
//                 </span>
//                 <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-medium">
//                   👷 Contractor: ₹{formatAmount(totalSelectedContractor)}
//                 </span>
//               </div>
//             </div>
//             <div className="flex gap-2">
//               <button onClick={() => setSelectedItems([])}
//                 className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium">
//                 Clear All
//               </button>
//               <button onClick={() => setShowModal(true)}
//                 className="px-5 py-2 bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg font-bold text-sm flex items-center gap-2 shadow">
//                 <FileText className="w-4 h-4" /> Generate PDF
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Filters */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 space-y-4">
//         <div className="flex items-center justify-between">
//           <h3 className="font-semibold text-gray-700 flex items-center gap-2">
//             <Filter className="w-4 h-4 text-amber-500" /> Filters
//           </h3>
//           {hasActiveFilters && (
//             <button onClick={clearFilters} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
//               <X className="w-4 h-4" /> Clear All
//             </button>
//           )}
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {/* Search */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
//               <Search className="w-4 h-4" /> Search
//             </label>
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//               <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
//                 placeholder="Search UID, engineer, work type..."
//                 className="w-full pl-10 pr-9 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm" />
//               {searchTerm && (
//                 <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
//                   <X className="w-4 h-4 text-gray-400" />
//                 </button>
//               )}
//             </div>
//           </div>

//           <SearchableDropdown label="Project Name" icon={Building} options={uniqueProjects}
//             value={selectedProject} onChange={setSelectedProject}
//             placeholder="Search & select project..." color="purple" />

//           <SearchableDropdown label="Labour Contractor" icon={HardHat} options={uniqueContractors}
//             value={selectedContractor} onChange={setSelectedContractor}
//             placeholder="Search & select contractor..." color="green" />
//         </div>

//         {/* Active pills */}
//         {hasActiveFilters && (
//           <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 items-center">
//             <span className="text-xs text-gray-400">Active:</span>
//             {searchTerm && (
//               <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
//                 "{searchTerm}" <button onClick={() => setSearchTerm('')}><X className="w-3 h-3" /></button>
//               </span>
//             )}
//             {selectedProject && (
//               <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
//                 <Building className="w-3 h-3" />{selectedProject} <button onClick={() => setSelectedProject('')}><X className="w-3 h-3" /></button>
//               </span>
//             )}
//             {selectedContractor && (
//               <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
//                 <HardHat className="w-3 h-3" />{selectedContractor} <button onClick={() => setSelectedContractor('')}><X className="w-3 h-3" /></button>
//               </span>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Count + Select All row */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//         <div className="flex items-center gap-3">
//           <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 text-sm">
//             <FileText className="w-4 h-4 text-gray-400" />
//             Showing: <span className="text-indigo-600 font-bold ml-1">{filteredData.length}</span>
//             <span className="text-gray-400"> of {data.length}</span>
//           </div>
//           {selectedItems.length > 0 && (
//             <span className="text-sm text-indigo-600 font-medium">{selectedItems.length} selected</span>
//           )}
//         </div>
//         <button onClick={toggleAll} disabled={filteredData.length === 0}
//           className={`px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-40
//             ${allSelected ? 'bg-indigo-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300'}`}>
//           {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
//           {allSelected ? 'Deselect All' : 'Select All'}
//         </button>
//       </div>

//       {/* ─── Table ─────────────────────────────────────────────────────────────── */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
//         {filteredData.length === 0 ? (
//           <div className="py-16 text-center">
//             <FileText className="w-14 h-14 text-gray-200 mx-auto mb-3" />
//             <p className="text-gray-400 font-medium">Koi record nahi mila</p>
//             <p className="text-gray-300 text-sm mt-1">{hasActiveFilters ? 'Filters adjust karein' : 'Koi data nahi hai'}</p>
//             {hasActiveFilters && (
//               <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-sm font-medium">
//                 Clear Filters
//               </button>
//             )}
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm border-collapse">
//               <thead>
//                 <tr className="bg-[#1a3c6e]">
//                   {/* Checkbox TH */}
//                   <th className="px-4 py-3.5 w-12 sticky left-0 z-10 bg-[#1a3c6e]">
//                     <div onClick={toggleAll}
//                       className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer mx-auto transition-all
//                         ${allSelected ? 'bg-white border-white' : 'border-white/40 hover:border-white'}`}>
//                       {allSelected && <Check className="w-3 h-3 text-indigo-600" />}
//                     </div>
//                   </th>
//                   <th className="px-3 py-3.5 text-center text-white text-xs font-bold w-10">Sr.</th>
//                   {columns.map(col => (
//                     <th key={col.key} className="px-3 py-3.5 text-left text-white text-xs font-bold whitespace-nowrap">
//                       <div className="flex items-center gap-1.5">
//                         {col.icon && <col.icon className="w-3.5 h-3.5 opacity-70" />}
//                         {col.label}
//                       </div>
//                     </th>
//                   ))}
//                 </tr>
//               </thead>

//               <tbody>
//                 {filteredData.map((row, i) => {
//                   const isSel = selectedItems.some(s => s.uid === row.uid);
//                   return (
//                     <tr key={row.uid || i} onClick={() => toggleItem(row)}
//                       className={`border-b border-gray-100 cursor-pointer transition-colors
//                         ${isSel ? 'bg-indigo-50' : i % 2 === 0 ? 'bg-white hover:bg-indigo-50/40' : 'bg-gray-50/60 hover:bg-indigo-50/40'}`}>
//                       {/* Checkbox TD */}
//                       <td className="px-4 py-3 sticky left-0 z-10" style={{ background: 'inherit' }}>
//                         <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition-all
//                           ${isSel ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 hover:border-indigo-400'}`}>
//                           {isSel && <Check className="w-3 h-3 text-white" />}
//                         </div>
//                       </td>
//                       {/* Sr No */}
//                       <td className="px-3 py-3 text-center text-gray-400 text-xs font-medium">{i + 1}</td>
//                       {/* Data cells */}
//                       {columns.map(col => (
//                         <td key={col.key} className="px-3 py-3 whitespace-nowrap">
//                           {col.isUid ? (
//                             <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
//                               {row[col.key] || '—'}
//                             </span>
//                           ) : col.isAmt ? (
//                             <span className={`font-semibold text-sm ${col.amtColor}`}>
//                               {row[col.key] ? `₹${formatAmount(row[col.key])}` : <span className="text-gray-300 font-normal">—</span>}
//                             </span>
//                           ) : col.isNum ? (
//                             <span className={`font-semibold ${row[col.key] ? 'text-gray-800' : 'text-gray-300'}`}>
//                               {row[col.key] || '—'}
//                             </span>
//                           ) : (
//                             <span className={`block max-w-[160px] truncate ${row[col.key] ? 'text-gray-700' : 'text-gray-300'}`}
//                               title={row[col.key] || ''}>
//                               {row[col.key] || '—'}
//                             </span>
//                           )}
//                         </td>
//                       ))}
//                     </tr>
//                   );
//                 })}
//               </tbody>

//               {/* Totals footer */}
//               {selectedItems.length > 0 && (
//                 <tfoot>
//                   <tr className="bg-indigo-600 text-white text-xs font-bold">
//                     <td colSpan={2 + columns.length - 2} className="px-4 py-3 text-right tracking-wide">
//                       {selectedItems.length} records selected — Total:
//                     </td>
//                     <td className="px-3 py-3 text-purple-200 whitespace-nowrap">
//                       ₹{formatAmount(totalSelectedCompany)}
//                     </td>
//                     <td className="px-3 py-3 text-green-200 whitespace-nowrap">
//                       ₹{formatAmount(totalSelectedContractor)}
//                     </td>
//                   </tr>
//                 </tfoot>
//               )}
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Footer */}
//       <div className="bg-white rounded-xl p-3.5 border border-gray-200 flex flex-wrap items-center justify-between gap-3">
//         <p className="text-sm text-gray-500">
//           <span className="font-semibold text-indigo-600">{filteredData.length}</span> records
//           {selectedItems.length > 0 && <> · <span className="font-semibold text-indigo-600">{selectedItems.length}</span> selected</>}
//         </p>
//         <p className="text-xs text-gray-400">Row click karke select karein · Filters se narrow down karein</p>
//       </div>

//       {/* Modal */}
//       <PDFModal open={showModal} onClose={() => setShowModal(false)}
//         onConfirm={handleGenerate} isLoading={isPDFLoading} selectedItems={selectedItems} />
//     </div>
//   );
// };

// export default LabourPDF;




/////// 


import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Loader2, RefreshCw, Search, Filter, X, FileText,
  Building, HardHat, Hash, ChevronDown, ChevronUp,
  Users, Wrench, User, Clock, Check, CheckSquare,
  Square, ListChecks, CircleDollarSign, Receipt,
  AlertCircle, BadgeCheck
} from 'lucide-react';

// ─── Redux imports — apne slice se replace karo ───────────────────────────────
// import { useGetPDFDataQuery, useGeneratePDFMutation } from '../../redux/Labour/LabourSlice';

const BASE_URL = 'https://purchase-project-3iia-jwvzmdp1g.vercel.app/api/labour/pdf'; // ← apna URL yahan daalo

// ─── Temporary fetch hooks ─────────────────────────────────────────────────────
const useGetPDFDataQuery = () => {
  const [state, setState] = useState({ data: null, isLoading: true, isError: false, isFetching: false });
  const refetch = async () => {
    setState(s => ({ ...s, isFetching: true }));
    try {
      const res  = await fetch(`${BASE_URL}/Get-PDF-Data`);
      const json = await res.json();
      setState({ data: json.success ? json.data : null, isLoading: false, isError: !json.success, isFetching: false });
    } catch {
      setState({ data: null, isLoading: false, isError: true, isFetching: false });
    }
  };
  useEffect(() => { refetch(); }, []);
  return { ...state, refetch };
};

const useGeneratePDFMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const mutate = async (payload) => {
    setIsLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/Generate-PDF`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      setIsLoading(false);
      if (json.success) return json;
      throw new Error(json.error || 'Failed');
    } catch (e) { setIsLoading(false); throw e; }
  };
  return [mutate, { isLoading }];
};

// ─── Format Amount ─────────────────────────────────────────────────────────────
const formatAmount = (value) => {
  if (value == null || value === '') return '0';
  const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
};

// ─── Searchable Dropdown ───────────────────────────────────────────────────────
const SearchableDropdown = ({ label, icon: Icon, options = [], value, onChange, placeholder, color = 'amber' }) => {
  const [isOpen, setIsOpen]     = useState(false);
  const [searchTerm, setSearch] = useState('');
  const ref = useRef(null);

  const palette = {
    amber:  { bg: 'bg-amber-50',  text: 'text-amber-700',  hover: 'hover:bg-amber-100',  selected: 'bg-amber-100 text-amber-800',  ring: 'ring-amber-200',  border: 'border-amber-500'  },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', hover: 'hover:bg-purple-100', selected: 'bg-purple-100 text-purple-800', ring: 'ring-purple-200', border: 'border-purple-500' },
    green:  { bg: 'bg-green-50',  text: 'text-green-700',  hover: 'hover:bg-green-100',  selected: 'bg-green-100 text-green-800',  ring: 'ring-green-200',  border: 'border-green-500'  },
  }[color] || {};

  const filtered = useMemo(() =>
    options.filter(o => typeof o === 'string' && o.toLowerCase().includes(searchTerm.toLowerCase())),
    [options, searchTerm]
  );

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) { setIsOpen(false); setSearch(''); } };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" />}{label}
        </label>
      )}
      <div onClick={() => setIsOpen(o => !o)}
        className={`w-full px-4 py-3 border-2 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-2
          ${isOpen ? `${palette.border} ring-2 ${palette.ring}` : 'border-gray-200 hover:border-gray-300'}
          ${value ? palette.bg : 'bg-white'}`}>
        {value ? (
          <span className={`text-sm font-medium truncate flex-1 ${palette.text}`}>{value}</span>
        ) : (
          <input value={searchTerm} onChange={e => { setSearch(e.target.value); setIsOpen(true); }}
            onClick={e => { e.stopPropagation(); setIsOpen(true); }}
            placeholder={placeholder}
            className="w-full bg-transparent outline-none text-sm text-gray-600 placeholder-gray-400" />
        )}
        <div className="flex items-center gap-1 flex-shrink-0">
          {value && (
            <button onClick={e => { e.stopPropagation(); onChange(''); setSearch(''); }}
              className="p-0.5 hover:bg-white/60 rounded-full">
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {value && (
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input autoFocus value={searchTerm} onChange={e => setSearch(e.target.value)}
                  placeholder="Search..." className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
            </div>
          )}
          <div className="max-h-48 overflow-y-auto">
            <button onClick={() => { onChange(''); setIsOpen(false); setSearch(''); }}
              className={`w-full px-4 py-2.5 text-left text-sm ${!value ? palette.selected : 'hover:bg-gray-50 text-gray-400'}`}>
              -- Select --
            </button>
            {filtered.length > 0 ? filtered.map((opt, i) => (
              <button key={`${opt}-${i}`} onClick={() => { onChange(opt); setIsOpen(false); setSearch(''); }}
                className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors
                  ${value === opt ? palette.selected : `${palette.hover} text-gray-700`}`}>
                <span className="truncate">{opt}</span>
                {value === opt && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
              </button>
            )) : (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── PDF Modal ─────────────────────────────────────────────────────────────────
const PDFModal = ({ open, onClose, onConfirm, isLoading, selectedItems }) => {
  const [paidName, setPaidName]   = useState('');
  const [billNo, setBillNo]       = useState('');
  const [billLoading, setBillLoad]= useState(false);
  const [billError, setBillError] = useState('');

  // Modal khulne par Bill No auto-fetch karo
  useEffect(() => {
    if (!open) return;
    setPaidName('');
    setBillNo('');
    setBillError('');

    const fetchBillNo = async () => {
      setBillLoad(true);
      try {
        const res  = await fetch(`${BASE_URL}/Get-Next-BillNo`);
        const json = await res.json();
        if (json.success) setBillNo(json.billNo);
        else setBillError('Bill No. generate nahi hua');
      } catch {
        setBillError('Server se Bill No. nahi mila');
      } finally {
        setBillLoad(false);
      }
    };
    fetchBillNo();
  }, [open]);

  if (!open) return null;

  const totalCompany    = selectedItems.reduce((s, r) => s + (parseFloat(String(r.Revised_Company_Head_Amount_4 || '0').replace(/[^0-9.-]/g, '')) || 0), 0);
  const totalContractor = selectedItems.reduce((s, r) => s + (parseFloat(String(r.Revised_Contractor_Head_Amount_4 || '0').replace(/[^0-9.-]/g, '')) || 0), 0);

  const canSubmit = !isLoading && !billLoading && !!billNo && !!paidName && !billError;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col">

        {/* Header */}
        <div className="p-5 border-b bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" /> Generate Labour PDF
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              <span className="font-semibold text-indigo-600">{selectedItems.length}</span> records selected
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* UID chips + Totals */}
          <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2 flex items-center gap-1">
              <ListChecks className="w-3.5 h-3.5" /> Selected UIDs
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto mb-3">
              {selectedItems.map((item, i) => (
                <span key={item.uid || i} className="px-2 py-0.5 bg-white border border-indigo-200 text-indigo-700 rounded text-xs font-semibold">
                  {item.uid}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-lg p-2.5 text-center border border-indigo-100">
                <p className="text-xs text-gray-400">Company Head Total</p>
                <p className="text-base font-bold text-purple-700 mt-0.5">₹{formatAmount(totalCompany)}</p>
              </div>
              <div className="bg-white rounded-lg p-2.5 text-center border border-indigo-100">
                <p className="text-xs text-gray-400">Contractor Head Total</p>
                <p className="text-base font-bold text-green-700 mt-0.5">₹{formatAmount(totalContractor)}</p>
              </div>
            </div>
          </div>

          {/* ✅ Bill No — auto generated, read only */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Hash className="w-4 h-4" /> Bill No.
              <span className="ml-auto text-xs font-normal text-indigo-500 flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5" /> Auto Generated
              </span>
            </label>
            <div className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold border-2 flex items-center justify-between
              ${billError ? 'border-red-300 bg-red-50 text-red-600' : 'border-indigo-200 bg-indigo-50 text-indigo-700'}`}>
              {billLoading ? (
                <span className="flex items-center gap-2 text-gray-400 font-normal">
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                </span>
              ) : billError ? (
                <span className="text-red-500 font-normal text-xs">{billError}</span>
              ) : (
                <>
                  <span className="tracking-wide">{billNo}</span>
                  <span className="text-xs font-normal text-indigo-400 flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5 text-indigo-400" /> Unique
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1 ml-1">
              Bill number backend se auto-generate hota hai — duplicate nahi banega
            </p>
          </div>

          {/* Paid By */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Receipt className="w-4 h-4" /> Paid By <span className="text-red-500">*</span>
            </label>
            <input value={paidName} onChange={e => setPaidName(e.target.value)}
              placeholder="Enter payer name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm" />
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-600">
              ℹ️ <strong>Note:</strong> PDF Google Drive pe upload hogi aur sheet mein{' '}
              <span className="font-semibold">{billNo || '...'}</span> ke saath status update ho jaayega.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 text-sm font-medium">
            Cancel
          </button>
          <button onClick={() => onConfirm(paidName, billNo)} disabled={!canSubmit}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow">
            {isLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</>
              : <><FileText className="w-4 h-4" />Generate PDF</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── PDF Success Modal ─────────────────────────────────────────────────────────
const PDFSuccessModal = ({ open, billNo, pdfUrl, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col items-center p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
          <svg className="w-10 h-10 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-1">PDF Ready!</h3>
        <p className="text-sm text-gray-500 mb-2">Labour PDF successfully generate ho gayi</p>

        {/* Bill No Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl mb-6">
          <BadgeCheck className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-bold text-indigo-700">{billNo}</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium text-sm transition-colors"
          >
            Cancel
          </button>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow transition-all"
          >
            <FileText className="w-4 h-4" /> View PDF
          </a>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────────
const LabourPDF = () => {
  const { data: apiData, isLoading, isError, isFetching, refetch } = useGetPDFDataQuery();
  const [generatePDF, { isLoading: isPDFLoading }] = useGeneratePDFMutation();

  const [searchTerm,         setSearchTerm]         = useState('');
  const [selectedProject,    setSelectedProject]    = useState('');
  const [selectedContractor, setSelectedContractor] = useState('');
  const [selectedItems,      setSelectedItems]      = useState([]);
  const [showModal,          setShowModal]          = useState(false);
  const [toast,              setToast]              = useState(null);
  const [pdfSuccess,         setPdfSuccess]         = useState(null);

  const data              = useMemo(() => (Array.isArray(apiData) ? apiData : []), [apiData]);
  const uniqueProjects    = useMemo(() => [...new Set(data.map(d => d.projectName).filter(Boolean))].sort(), [data]);
  const uniqueContractors = useMemo(() => [...new Set(data.map(d => d.Labouar_Contractor_Name_3).filter(Boolean))].sort(), [data]);
  const hasActiveFilters  = searchTerm || selectedProject || selectedContractor;

  const filteredData = useMemo(() => data.filter(item => {
    const s = searchTerm.toLowerCase();
    const matchSearch = !s || [item.uid, item.projectName, item.Labouar_Contractor_Name_3, item.projectEngineer, item.workDescription, item.workType]
      .some(v => (v || '').toLowerCase().includes(s));
    return matchSearch && (!selectedProject || item.projectName === selectedProject) && (!selectedContractor || item.Labouar_Contractor_Name_3 === selectedContractor);
  }), [data, searchTerm, selectedProject, selectedContractor]);

  const clearFilters = () => { setSearchTerm(''); setSelectedProject(''); setSelectedContractor(''); };
  const toggleItem   = (item) => setSelectedItems(prev => prev.some(s => s.uid === item.uid) ? prev.filter(s => s.uid !== item.uid) : [...prev, item]);
  const toggleAll    = () => setSelectedItems(selectedItems.length === filteredData.length ? [] : [...filteredData]);
  const allSelected  = filteredData.length > 0 && selectedItems.length === filteredData.length;

  const totalSelCompany    = selectedItems.reduce((s, r) => s + (parseFloat(String(r.Revised_Company_Head_Amount_4 || '0').replace(/[^0-9.-]/g, '')) || 0), 0);
  const totalSelContractor = selectedItems.reduce((s, r) => s + (parseFloat(String(r.Revised_Contractor_Head_Amount_4 || '0').replace(/[^0-9.-]/g, '')) || 0), 0);

  // ✅ Frontend se billNo nahi bhejte — backend generate karta hai
  const handleGenerate = async (paidName, billNo) => {
    try {
      const result = await generatePDF({ uids: selectedItems.map(i => i.uid), paidName });
      setSelectedItems([]);
      setShowModal(false);
      refetch();
      // ✅ Success modal open karo
      setPdfSuccess({ billNo: result.billNo, pdfUrl: result.pdfUrl });
    } catch (e) {
      setToast({ type: 'error', msg: `❌ ${e.message || 'PDF generate nahi hui'}` });
    }
  };

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 7000); return () => clearTimeout(t); }
  }, [toast]);

  const columns = [
      { key: 'planned5',                         label: 'Planned Date',     icon: Clock                          },
    { key: 'uid',                              label: 'UID No.',          icon: Hash,              isUid: true  },
    { key: 'projectName',                      label: 'Project Name',     icon: Building                       },
    { key: 'projectEngineer',                  label: 'Engineer',         icon: User                           },
    { key: 'workType',                         label: 'Work Type',        icon: Wrench                         },
    { key: 'workDescription',                  label: 'Work Description', icon: FileText                       },
    { key: 'Labouar_Contractor_Name_3',        label: 'Contractor',       icon: HardHat                        },
    { key: 'Labour_Category_1_3',              label: 'Cat 1',            icon: Users                          },
    { key: 'Number_Of_Labour_1_3',             label: 'Labour No.1',      icon: Users,             isNum: true  },
    { key: 'Labour_Category_2_3',              label: 'Cat 2',            icon: Users                          },
    { key: 'Number_Of_Labour_2_3',             label: 'Labour No.2',      icon: Users,             isNum: true  },
    { key: 'totalLabour',                      label: 'Total Labour',     icon: Users,             isNum: true  },
    { key: 'Deployed_Category_1_Labour_No_4',  label: 'Deployed Cat1',    icon: Users,             isNum: true  },
    { key: 'Deployed_Category_2_Labour_No_4',  label: 'Deployed Cat2',    icon: Users,             isNum: true  },
    { key: 'Revised_Company_Head_Amount_4',    label: 'Company Head Amt', icon: CircleDollarSign,  isAmt: true, amtColor: 'text-purple-700' },
    { key: 'Revised_Contractor_Head_Amount_4', label: 'Contractor Amt',   icon: CircleDollarSign,  isAmt: true, amtColor: 'text-green-700'  },
  ];

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Data load ho raha hai...</p>
      </div>
    </div>
  );

  if (isError) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center bg-red-50 p-6 rounded-xl border border-red-200">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-600 font-semibold mb-3">Data load nahi hua</p>
        <button onClick={refetch} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 mx-auto text-sm">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 p-4 bg-gray-50 min-h-screen">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] max-w-sm p-4 rounded-xl shadow-xl border flex flex-col gap-1.5
          ${toast.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <span className={`text-sm font-semibold ${toast.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>{toast.msg}</span>
          {toast.url && <a href={toast.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 underline">PDF dekhen →</a>}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-600" /> Labour PDF Generator
          </h2>
          <p className="text-gray-500 mt-1 text-sm">Records select karein aur PDF generate karein</p>
        </div>
        <button onClick={refetch} disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-medium disabled:opacity-60">
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Sticky Selection Banner */}
      {selectedItems.length > 0 && (
        <div className="sticky top-0 z-20 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl p-4 text-white shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 font-bold">
                <ListChecks className="w-5 h-5" />{selectedItems.length} Selected
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-medium">
                  🏢 Company: ₹{formatAmount(totalSelCompany)}
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-medium">
                  👷 Contractor: ₹{formatAmount(totalSelContractor)}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelectedItems([])}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium">
                Clear All
              </button>
              <button onClick={() => setShowModal(true)}
                className="px-5 py-2 bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg font-bold text-sm flex items-center gap-2 shadow">
                <FileText className="w-4 h-4" /> Generate PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-500" /> Filters
          </h3>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-sm text-indigo-600 font-medium flex items-center gap-1">
              <X className="w-4 h-4" /> Clear All
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Search className="w-4 h-4" /> Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search UID, engineer, work type..."
                className="w-full pl-10 pr-9 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm" />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>
          <SearchableDropdown label="Project Name" icon={Building} options={uniqueProjects}
            value={selectedProject} onChange={setSelectedProject}
            placeholder="Search & select project..." color="purple" />
          <SearchableDropdown label="Labour Contractor" icon={HardHat} options={uniqueContractors}
            value={selectedContractor} onChange={setSelectedContractor}
            placeholder="Search & select contractor..." color="green" />
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 items-center">
            <span className="text-xs text-gray-400">Active:</span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                "{searchTerm}" <button onClick={() => setSearchTerm('')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedProject && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                <Building className="w-3 h-3" />{selectedProject} <button onClick={() => setSelectedProject('')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedContractor && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                <HardHat className="w-3 h-3" />{selectedContractor} <button onClick={() => setSelectedContractor('')}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Count + Select All */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 text-sm">
            <FileText className="w-4 h-4 text-gray-400" />
            Showing: <span className="text-indigo-600 font-bold ml-1">{filteredData.length}</span>
            <span className="text-gray-400"> of {data.length}</span>
          </div>
          {selectedItems.length > 0 && (
            <span className="text-sm text-indigo-600 font-medium">{selectedItems.length} selected</span>
          )}
        </div>
        <button onClick={toggleAll} disabled={filteredData.length === 0}
          className={`px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-40
            ${allSelected ? 'bg-indigo-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300'}`}>
          {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredData.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-14 h-14 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">Koi record nahi mila</p>
            <p className="text-gray-300 text-sm mt-1">{hasActiveFilters ? 'Filters adjust karein' : 'Koi data nahi hai'}</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-sm font-medium">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#1a3c6e]">
                  <th className="px-4 py-3.5 w-12 sticky left-0 z-10 bg-[#1a3c6e]">
                    <div onClick={toggleAll}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer mx-auto transition-all
                        ${allSelected ? 'bg-white border-white' : 'border-white/40 hover:border-white'}`}>
                      {allSelected && <Check className="w-3 h-3 text-indigo-600" />}
                    </div>
                  </th>
                  <th className="px-3 py-3.5 text-center text-white text-xs font-bold w-10">Sr.</th>
                  {columns.map(col => (
                    <th key={col.key} className="px-3 py-3.5 text-left text-white text-xs font-bold whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {col.icon && <col.icon className="w-3.5 h-3.5 opacity-70" />}
                        {col.label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, i) => {
                  const isSel = selectedItems.some(s => s.uid === row.uid);
                  return (
                    <tr key={row.uid || i} onClick={() => toggleItem(row)}
                      className={`border-b border-gray-100 cursor-pointer transition-colors
                        ${isSel ? 'bg-indigo-50' : i % 2 === 0 ? 'bg-white hover:bg-indigo-50/40' : 'bg-gray-50/60 hover:bg-indigo-50/40'}`}>
                      <td className="px-4 py-3 sticky left-0 z-10" style={{ background: 'inherit' }}>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition-all
                          ${isSel ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 hover:border-indigo-400'}`}>
                          {isSel && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center text-gray-400 text-xs font-medium">{i + 1}</td>
                      {columns.map(col => (
                        <td key={col.key} className="px-3 py-3 whitespace-nowrap">
                          {col.isUid ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                              {row[col.key] || '—'}
                            </span>
                          ) : col.isAmt ? (
                            <span className={`font-semibold text-sm ${col.amtColor}`}>
                              {row[col.key] ? `₹${formatAmount(row[col.key])}` : <span className="text-gray-300 font-normal">—</span>}
                            </span>
                          ) : col.isNum ? (
                            <span className={`font-semibold ${row[col.key] ? 'text-gray-800' : 'text-gray-300'}`}>
                              {row[col.key] || '—'}
                            </span>
                          ) : (
                            <span className={`block max-w-[160px] truncate ${row[col.key] ? 'text-gray-700' : 'text-gray-300'}`}
                              title={row[col.key] || ''}>
                              {row[col.key] || '—'}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>

              {/* Totals Footer */}
              {selectedItems.length > 0 && (
                <tfoot>
                  <tr className="bg-indigo-600 text-white text-xs font-bold">
                    <td colSpan={2 + columns.length - 2} className="px-4 py-3 text-right tracking-wide">
                      {selectedItems.length} records selected — Total:
                    </td>
                    <td className="px-3 py-3 text-purple-200 whitespace-nowrap">₹{formatAmount(totalSelCompany)}</td>
                    <td className="px-3 py-3 text-green-200 whitespace-nowrap">₹{formatAmount(totalSelContractor)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white rounded-xl p-3.5 border border-gray-200 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-indigo-600">{filteredData.length}</span> records
          {selectedItems.length > 0 && <> · <span className="font-semibold text-indigo-600">{selectedItems.length}</span> selected</>}
        </p>
        <p className="text-xs text-gray-400">Row click karke select karein · Filters se narrow down karein</p>
      </div>

      {/* Modal */}
      <PDFModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleGenerate}
        isLoading={isPDFLoading}
        selectedItems={selectedItems}
      />

      {/* ✅ PDF Success Modal */}
      <PDFSuccessModal
        open={!!pdfSuccess}
        billNo={pdfSuccess?.billNo}
        pdfUrl={pdfSuccess?.pdfUrl}
        onClose={() => setPdfSuccess(null)}
      />
    </div>
  );
};

export default LabourPDF;