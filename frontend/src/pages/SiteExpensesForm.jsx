// import React, { useState, useEffect, useRef } from 'react';
// import Swal from 'sweetalert2';

// const SiteExpensesForm = () => {
//   const [activeTab, setActiveTab] = useState('contractor');
//   const [loading, setLoading] = useState(false);
//   const [dropdownData, setDropdownData] = useState({
//     sites: [],
//     supervisors: [],
//     contractors: [],
//     firms: [],
//     headTypes: [],
//     workTypes: [],
//     labourCategories: [],
//     headOfCompanies: ['Company Head', 'Contractor Head']
//   });

//   // Form States
//   const [contractorForm, setContractorForm] = useState({
//     site: '', supervisor: '', contractorName: '', contractorFirmName: '',
//     workName: '', workDate: '', workDescription: '', quantity: '',
//     companyHeadAmount: '', contractorDebitAmount: ''
//   });

//   const [labourForm, setLabourForm] = useState({
//     projectName: '', projectEngineer: '', workType: '', dateRequired: '',
//     workDescription: '', labourCategory: '', numberOfLabour: '',
//     headOfCompany: '', contractorName: '', remark: ''
//   });

//   const [siteExpForm, setSiteExpForm] = useState({
//     payeeName: '', projectName: '', projectEngineer: '', headType: '',
//     detailsOfWork: '', costAmount: '', remark: '', photo: null
//   });

//   const [showContractorField, setShowContractorField] = useState(false);

//   useEffect(() => {
//     fetchOptions();
//   }, []);

//   useEffect(() => {
//     const val = labourForm.headOfCompany.toLowerCase();
//     setShowContractorField(val.includes('contractor') && !val.includes('company'));
//   }, [labourForm.headOfCompany]);

//   const fetchOptions = async () => {
//     try {
//       const res = await fetch('/api/form-options');
//       const data = await res.json();
//       if (data.success) setDropdownData(prev => ({ ...prev, ...data.data }));
//     } catch (err) {
//       console.error('Failed to load options:', err);
//     }
//   };

//   const showSuccess = (title, uid) => {
//     Swal.fire({
//       icon: 'success',
//       title,
//       html: `<p class="text-gray-600">Data saved successfully!</p><p class="font-bold text-lg mt-2">UID: ${uid}</p>`,
//       confirmButtonColor: '#6366f1'
//     });
//   };

//   const showError = (msg) => {
//     Swal.fire({ icon: 'error', title: 'Error!', text: msg, confirmButtonColor: '#ef4444' });
//   };

//   // Submit Handlers
//   const handleContractorSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const res = await fetch('/api/submit-contractor', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(contractorForm)
//       });
//       const result = await res.json();
//       if (result.success) {
//         showSuccess('Contractor Saved!', result.uid);
//         setContractorForm({
//           site: '', supervisor: '', contractorName: '', contractorFirmName: '',
//           workName: '', workDate: '', workDescription: '', quantity: '',
//           companyHeadAmount: '', contractorDebitAmount: ''
//         });
//       } else throw new Error(result.message);
//     } catch (err) {
//       showError(err.message || 'Something went wrong');
//     }
//     setLoading(false);
//   };

//   const handleLabourSubmit = async (e) => {
//     e.preventDefault();
//     if (showContractorField && !labourForm.contractorName) {
//       Swal.fire('Warning', 'Please select contractor name', 'warning');
//       return;
//     }
//     setLoading(true);
//     try {
//       const res = await fetch('/api/submit-labour', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(labourForm)
//       });
//       const result = await res.json();
//       if (result.success) {
//         showSuccess('Labour Entry Saved!', result.uid);
//         setLabourForm({
//           projectName: '', projectEngineer: '', workType: '', dateRequired: '',
//           workDescription: '', labourCategory: '', numberOfLabour: '',
//           headOfCompany: '', contractorName: '', remark: ''
//         });
//       } else throw new Error(result.message);
//     } catch (err) {
//       showError(err.message || 'Something went wrong');
//     }
//     setLoading(false);
//   };

//   const handleSiteExpSubmit = async (e) => {
//     e.preventDefault();
//     if (!siteExpForm.photo) {
//       Swal.fire('Warning', 'Please upload bill/photo', 'warning');
//       return;
//     }
//     setLoading(true);
//     const formData = new FormData();
//     Object.keys(siteExpForm).forEach(key => formData.append(key, siteExpForm[key]));
//     try {
//       const res = await fetch('/api/submit-site-expenses', { method: 'POST', body: formData });
//       const result = await res.json();
//       if (result.success) {
//         showSuccess('Expense Saved!', result.uid);
//         setSiteExpForm({
//           payeeName: '', projectName: '', projectEngineer: '', headType: '',
//           detailsOfWork: '', costAmount: '', remark: '', photo: null
//         });
//       } else throw new Error(result.message);
//     } catch (err) {
//       showError(err.message || 'Something went wrong');
//     }
//     setLoading(false);
//   };

//   const tabs = [
//     { id: 'contractor', label: 'Contractor Debit', icon: '🏗️' },
//     { id: 'labour', label: 'Labour', icon: '👷' },
//     { id: 'site', label: 'Site Expenses', icon: '💰' }
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-6 px-4">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
//             RCC Site Expenses
//           </h1>
//           <p className="text-purple-200 text-sm">Manage your site expenses efficiently</p>
//         </div>

//         {/* Tab Buttons */}
//         <div className="flex flex-wrap justify-center gap-2 mb-6">
//           {tabs.map(tab => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2
//                 ${activeTab === tab.id
//                   ? 'bg-white text-purple-700 shadow-lg shadow-purple-500/30 scale-105'
//                   : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
//                 }`}
//             >
//               <span>{tab.icon}</span>
//               <span className="hidden sm:inline">{tab.label}</span>
//             </button>
//           ))}
//         </div>

//         {/* Form Card */}
//         <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
//           {/* Contractor Form */}
//           {activeTab === 'contractor' && (
//             <form onSubmit={handleContractorSubmit} className="p-6 md:p-8">
//               <FormTitle icon="🏗️" title="Contractor Material Information" />
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                 <SearchableDropdown
//                   label="Site Name"
//                   value={contractorForm.site}
//                   onChange={val => setContractorForm({ ...contractorForm, site: val })}
//                   options={dropdownData.sites}
//                   required
//                 />
//                 <SearchableDropdown
//                   label="Site Supervisor"
//                   value={contractorForm.supervisor}
//                   onChange={val => setContractorForm({ ...contractorForm, supervisor: val })}
//                   options={dropdownData.supervisors}
//                   required
//                 />
//                 <SearchableDropdown
//                   label="Contractor Name"
//                   value={contractorForm.contractorName}
//                   onChange={val => setContractorForm({ ...contractorForm, contractorName: val })}
//                   options={dropdownData.contractors}
//                   required
//                 />
//                 <SearchableDropdown
//                   label="Contractor Firm"
//                   value={contractorForm.contractorFirmName}
//                   onChange={val => setContractorForm({ ...contractorForm, contractorFirmName: val })}
//                   options={dropdownData.firms}
//                   required
//                 />
//                 <InputField
//                   label="Work Type"
//                   value={contractorForm.workName}
//                   onChange={e => setContractorForm({ ...contractorForm, workName: e.target.value })}
//                   required
//                 />
//                 <InputField
//                   label="Work Date"
//                   type="date"
//                   value={contractorForm.workDate}
//                   onChange={e => setContractorForm({ ...contractorForm, workDate: e.target.value })}
//                   required
//                 />
//                 <div className="md:col-span-2">
//                   <TextArea
//                     label="Work Description"
//                     value={contractorForm.workDescription}
//                     onChange={e => setContractorForm({ ...contractorForm, workDescription: e.target.value })}
//                     required
//                   />
//                 </div>
//                 <InputField
//                   label="Quantity"
//                   type="number"
//                   value={contractorForm.quantity}
//                   onChange={e => setContractorForm({ ...contractorForm, quantity: e.target.value })}
//                   required
//                 />
//                 <InputField
//                   label="Company Amount"
//                   type="number"
//                   value={contractorForm.companyHeadAmount}
//                   onChange={e => setContractorForm({ ...contractorForm, companyHeadAmount: e.target.value })}
//                   required
//                   prefix="₹"
//                 />
//                 <div className="md:col-span-2">
//                   <InputField
//                     label="Contractor Debit Amount"
//                     type="number"
//                     value={contractorForm.contractorDebitAmount}
//                     onChange={e => setContractorForm({ ...contractorForm, contractorDebitAmount: e.target.value })}
//                     required
//                     prefix="₹"
//                   />
//                 </div>
//               </div>

//               <SubmitButton loading={loading} text="Submit Contractor Entry" />
//             </form>
//           )}

//           {/* Labour Form */}
//           {activeTab === 'labour' && (
//             <form onSubmit={handleLabourSubmit} className="p-6 md:p-8">
//               <FormTitle icon="👷" title="Labour Information" />
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                 <SearchableDropdown
//                   label="Project Name"
//                   value={labourForm.projectName}
//                   onChange={val => setLabourForm({ ...labourForm, projectName: val })}
//                   options={dropdownData.sites}
//                   required
//                 />
//                 <SearchableDropdown
//                   label="Project Engineer"
//                   value={labourForm.projectEngineer}
//                   onChange={val => setLabourForm({ ...labourForm, projectEngineer: val })}
//                   options={dropdownData.supervisors}
//                   required
//                 />
//                 <SearchableDropdown
//                   label="Work Type"
//                   value={labourForm.workType}
//                   onChange={val => setLabourForm({ ...labourForm, workType: val })}
//                   options={dropdownData.workTypes}
//                   required
//                 />
//                 <InputField
//                   label="Date Required"
//                   type="date"
//                   value={labourForm.dateRequired}
//                   onChange={e => setLabourForm({ ...labourForm, dateRequired: e.target.value })}
//                   required
//                 />
//                 <div className="md:col-span-2">
//                   <TextArea
//                     label="Work Description"
//                     value={labourForm.workDescription}
//                     onChange={e => setLabourForm({ ...labourForm, workDescription: e.target.value })}
//                     required
//                   />
//                 </div>
//                 <SearchableDropdown
//                   label="Labour Category"
//                   value={labourForm.labourCategory}
//                   onChange={val => setLabourForm({ ...labourForm, labourCategory: val })}
//                   options={dropdownData.labourCategories}
//                   required
//                 />
//                 <InputField
//                   label="Number of Labour"
//                   type="number"
//                   value={labourForm.numberOfLabour}
//                   onChange={e => setLabourForm({ ...labourForm, numberOfLabour: e.target.value })}
//                   required
//                   min="1"
//                 />
//                 <SearchableDropdown
//                   label="Head of Contractor/Company"
//                   value={labourForm.headOfCompany}
//                   onChange={val => setLabourForm({ ...labourForm, headOfCompany: val })}
//                   options={dropdownData.headOfCompanies}
//                   required
//                 />
//                 {showContractorField && (
//                   <SearchableDropdown
//                     label="Contractor Name"
//                     value={labourForm.contractorName}
//                     onChange={val => setLabourForm({ ...labourForm, contractorName: val })}
//                     options={dropdownData.contractors}
//                     required
//                   />
//                 )}
//                 <div className={showContractorField ? '' : 'md:col-span-2'}>
//                   <TextArea
//                     label="Remark"
//                     value={labourForm.remark}
//                     onChange={e => setLabourForm({ ...labourForm, remark: e.target.value })}
//                     rows={2}
//                   />
//                 </div>
//               </div>

//               <SubmitButton loading={loading} text="Submit Labour Entry" />
//             </form>
//           )}

//           {/* Site Expenses Form */}
//           {activeTab === 'site' && (
//             <form onSubmit={handleSiteExpSubmit} className="p-6 md:p-8">
//               <FormTitle icon="💰" title="Site Expenses Details" />
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                 <InputField
//                   label="Payee Name"
//                   value={siteExpForm.payeeName}
//                   onChange={e => setSiteExpForm({ ...siteExpForm, payeeName: e.target.value })}
//                   required
//                 />
//                 <SearchableDropdown
//                   label="Project Name"
//                   value={siteExpForm.projectName}
//                   onChange={val => setSiteExpForm({ ...siteExpForm, projectName: val })}
//                   options={dropdownData.sites}
//                   required
//                 />
//                 <SearchableDropdown
//                   label="Project Engineer"
//                   value={siteExpForm.projectEngineer}
//                   onChange={val => setSiteExpForm({ ...siteExpForm, projectEngineer: val })}
//                   options={dropdownData.supervisors}
//                   required
//                 />
//                 <SearchableDropdown
//                   label="Head Type"
//                   value={siteExpForm.headType}
//                   onChange={val => setSiteExpForm({ ...siteExpForm, headType: val })}
//                   options={dropdownData.headTypes}
//                   required
//                 />
//                 <div className="md:col-span-2">
//                   <TextArea
//                     label="Details of Work"
//                     value={siteExpForm.detailsOfWork}
//                     onChange={e => setSiteExpForm({ ...siteExpForm, detailsOfWork: e.target.value })}
//                     required
//                   />
//                 </div>
//                 <InputField
//                   label="Cost Amount"
//                   type="number"
//                   value={siteExpForm.costAmount}
//                   onChange={e => setSiteExpForm({ ...siteExpForm, costAmount: e.target.value })}
//                   required
//                   prefix="₹"
//                 />
//                 <InputField
//                   label="Remark"
//                   value={siteExpForm.remark}
//                   onChange={e => setSiteExpForm({ ...siteExpForm, remark: e.target.value })}
//                 />
//                 <div className="md:col-span-2">
//                   <FileUpload
//                     label="Upload Bill/Photo"
//                     onChange={file => setSiteExpForm({ ...siteExpForm, photo: file })}
//                     required
//                   />
//                 </div>
//               </div>

//               <SubmitButton loading={loading} text="Submit Expense" />
//             </form>
//           )}
//         </div>

//         {/* Footer */}
//         <p className="text-center text-purple-200/60 text-xs mt-6">
//           © 2024 RCC Site Management System
//         </p>
//       </div>
//     </div>
//   );
// };

// // Reusable Components
// const FormTitle = ({ icon, title }) => (
//   <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
//     <span className="text-2xl">{icon}</span>
//     <h2 className="text-xl font-bold text-gray-800">{title}</h2>
//   </div>
// );

// const InputField = ({ label, type = 'text', value, onChange, required, prefix, min }) => (
//   <div>
//     <label className="block text-sm font-semibold text-gray-700 mb-2">
//       {label} {required && <span className="text-red-500">*</span>}
//     </label>
//     <div className="relative">
//       {prefix && (
//         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
//           {prefix}
//         </span>
//       )}
//       <input
//         type={type}
//         value={value}
//         onChange={onChange}
//         required={required}
//         min={min}
//         className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 
//           focus:ring-4 focus:ring-purple-500/20 outline-none transition-all duration-200
//           ${prefix ? 'pl-8' : ''}`}
//       />
//     </div>
//   </div>
// );

// const TextArea = ({ label, value, onChange, required, rows = 3 }) => (
//   <div>
//     <label className="block text-sm font-semibold text-gray-700 mb-2">
//       {label} {required && <span className="text-red-500">*</span>}
//     </label>
//     <textarea
//       value={value}
//       onChange={onChange}
//       required={required}
//       rows={rows}
//       className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 
//         focus:ring-4 focus:ring-purple-500/20 outline-none transition-all duration-200 resize-none"
//     />
//   </div>
// );

// const SearchableDropdown = ({ label, value, onChange, options, required }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [search, setSearch] = useState('');
//   const ref = useRef(null);

//   useEffect(() => {
//     setSearch(value);
//   }, [value]);

//   useEffect(() => {
//     const handleClick = (e) => {
//       if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
//     };
//     document.addEventListener('mousedown', handleClick);
//     return () => document.removeEventListener('mousedown', handleClick);
//   }, []);

//   const filtered = options.filter(opt => 
//     opt.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div ref={ref} className="relative">
//       <label className="block text-sm font-semibold text-gray-700 mb-2">
//         {label} {required && <span className="text-red-500">*</span>}
//       </label>
//       <input
//         type="text"
//         value={search}
//         onChange={e => { setSearch(e.target.value); onChange(''); }}
//         onFocus={() => setIsOpen(true)}
//         required={required}
//         placeholder="Search..."
//         className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 
//           focus:ring-4 focus:ring-purple-500/20 outline-none transition-all duration-200"
//       />
//       {isOpen && (
//         <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl 
//           shadow-xl max-h-48 overflow-y-auto">
//           {filtered.length === 0 ? (
//             <div className="px-4 py-3 text-gray-500 text-sm">No results found</div>
//           ) : (
//             filtered.map((opt, i) => (
//               <div
//                 key={i}
//                 onClick={() => { setSearch(opt); onChange(opt); setIsOpen(false); }}
//                 className="px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors text-gray-700
//                   border-b border-gray-100 last:border-0"
//               >
//                 {opt}
//               </div>
//             ))
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// const FileUpload = ({ label, onChange, required }) => {
//   const [fileName, setFileName] = useState('');
//   const inputRef = useRef(null);

//   const handleChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFileName(file.name);
//       onChange(file);
//     }
//   };

//   return (
//     <div>
//       <label className="block text-sm font-semibold text-gray-700 mb-2">
//         {label} {required && <span className="text-red-500">*</span>}
//       </label>
//       <div
//         onClick={() => inputRef.current?.click()}
//         className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center 
//           cursor-pointer hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-200"
//       >
//         <input
//           ref={inputRef}
//           type="file"
//           accept="image/*"
//           onChange={handleChange}
//           className="hidden"
//           required={required}
//         />
//         <div className="text-4xl mb-2">📷</div>
//         {fileName ? (
//           <p className="text-purple-600 font-medium">{fileName}</p>
//         ) : (
//           <>
//             <p className="text-gray-600 font-medium">Click to upload</p>
//             <p className="text-gray-400 text-sm mt-1">JPG, PNG, GIF up to 10MB</p>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// const SubmitButton = ({ loading, text }) => (
//   <div className="mt-8 flex justify-center">
//     <button
//       type="submit"
//       disabled={loading}
//       className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold 
//         rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 
//         hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
//         flex items-center gap-3 text-lg"
//     >
//       {loading ? (
//         <>
//           <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
//           </svg>
//           <span>Processing...</span>
//         </>
//       ) : (
//         <>
//           <span>✓</span>
//           <span>{text}</span>
//         </>
//       )}
//     </button>
//   </div>
// );

// export default SiteExpensesForm;


import React, { useState, useEffect, useMemo } from 'react';
import {
  useGetProjectDropdownQuery,
  // Add your POST mutation hooks here when ready
  // usePostSiteExpenseMutation,
  // usePostLabourRequestMutation,
  // usePostDebitEntryMutation,
} from '../redux/Labour/LabourSlice';
import {
  Loader2,
  Receipt,
  Users,
  CreditCard,
  Building,
  User,
  Hash,
  FileText,
  IndianRupee,
  Calendar,
  Camera,
  Briefcase,
  HardHat,
  MessageSquare,
  Send,
  RefreshCw,
  X,
  ChevronDown,
  Wrench,
  Calculator,
  Package,
  CheckCircle2
} from 'lucide-react';

const SiteExpensesForm = () => {
  // ========== Active Tab State ==========
  const [activeTab, setActiveTab] = useState('siteExpenses'); // 'siteExpenses' | 'labour' | 'debit'

  // ========== API Hooks ==========
  const { data: dropdownData = [], isLoading: isDropdownLoading } = useGetProjectDropdownQuery();

  // Uncomment when you have mutations
  // const [postSiteExpense, { isLoading: isSubmittingSite }] = usePostSiteExpenseMutation();
  // const [postLabourRequest, { isLoading: isSubmittingLabour }] = usePostLabourRequestMutation();
  // const [postDebitEntry, { isLoading: isSubmittingDebit }] = usePostDebitEntryMutation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [billPhotoPreview, setBillPhotoPreview] = useState(null);

  // ========== Form States ==========
  const [siteExpensesData, setSiteExpensesData] = useState({
    Rcc_Bill_No_1: '',
    Vendor_Payee_Name_1: '',
    Project_Name_1: '',
    Project_Engineer_Name_1: '',
    Head_Type_1: '',
    Details_of_Work_1: '',
    Amount_1: '',
    Bill_No_1: '',
    Bill_Date_1: '',
    Bill_Photo_1: '',
    Exp_Head_1: '',
    Contractor_Name_1: '',
    Contractor_Firm_Name_1: '',
    Remark_1: ''
  });

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
    Remark_1: ''
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
    Amount_1: ''
  });

  // ========== Auto Calculate Total Labour ==========
  useEffect(() => {
    const labour1 = parseInt(labourData.Number_Of_Labour_1) || 0;
    const labour2 = parseInt(labourData.Number_Of_Labour_2) || 0;
    const total = labour1 + labour2;

    setLabourData(prev => ({
      ...prev,
      Total_Labour_1: total.toString()
    }));
  }, [labourData.Number_Of_Labour_1, labourData.Number_Of_Labour_2]);

  // ========== Auto Calculate Debit Amount ==========
  useEffect(() => {
    const qty = parseFloat(debitData.Qty_1) || 0;
    const rate = parseFloat(debitData.Rate_Wages_1) || 0;
    const amount = qty * rate;

    setDebitData(prev => ({
      ...prev,
      Amount_1: amount.toFixed(2)
    }));
  }, [debitData.Qty_1, debitData.Rate_Wages_1]);

  // ========== Project Options with full info ==========
  const projectOptions = useMemo(() => {
    if (!Array.isArray(dropdownData) || dropdownData.length === 0) return [];

    const unique = [];
    const seen = new Set();

    for (const item of dropdownData) {
      const name = (item.projectName || item.value || '').trim();
      if (name && !seen.has(name)) {
        seen.add(name);
        unique.push({
          value: name,
          label: item.label || `${name}${item.projectEngineer ? ` - ${item.projectEngineer}` : ''}`,
          engineer: item.projectEngineer || '',
          extra: item.extraField || ''
        });
      }
    }

    return unique;
  }, [dropdownData]);

  // ========== Handle Project Selection (auto-fill engineer) ==========
  const handleProjectChange = (tab, value) => {
    const selected = projectOptions.find(opt => opt.value === value);

    if (tab === 'siteExpenses') {
      setSiteExpensesData(prev => ({
        ...prev,
        Project_Name_1: value,
        Project_Engineer_Name_1: selected?.engineer || ''
      }));
    } else if (tab === 'labour') {
      setLabourData(prev => ({
        ...prev,
        Project_Name_1: value,
        Project_Engineer_1: selected?.engineer || ''
      }));
    } else if (tab === 'debit') {
      setDebitData(prev => ({
        ...prev,
        Project_Name_1: value,
        Project_Engineer_1: selected?.engineer || ''
      }));
    }
  };

  // ========== Handle Input Changes ==========
  const handleSiteExpenseChange = (field, value) => {
    setSiteExpensesData(prev => ({ ...prev, [field]: value }));
  };

  const handleLabourChange = (field, value) => {
    setLabourData(prev => ({ ...prev, [field]: value }));
  };

  const handleDebitChange = (field, value) => {
    setDebitData(prev => ({ ...prev, [field]: value }));
  };

  // ========== Handle File Upload ==========
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBillPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      handleSiteExpenseChange('Bill_Photo_1', file.name);
    }
  };

  // ========== Generate UID ==========
  const generateUID = (prefix) => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${dateStr}${random}`;
  };

  // ========== Submit Handlers ==========
  const handleSubmitSiteExpenses = async (e) => {
    e.preventDefault();

    if (!siteExpensesData.Project_Name_1 || !siteExpensesData.Amount_1) {
      alert('Please fill required fields: Project Name and Amount');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        Timestamp: new Date().toISOString(),
        UID: generateUID('SE'),
        ...siteExpensesData
      };

      console.log('Submitting Site Expense:', payload);

      // const result = await postSiteExpense(payload).unwrap();

      await new Promise(resolve => setTimeout(resolve, 1000)); // simulation

      alert('✅ Site Expense submitted successfully!');
      resetSiteExpensesForm();
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Failed to submit: ' + (error?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitLabour = async (e) => {
    e.preventDefault();

    if (!labourData.Project_Name_1 || !labourData.Work_Type_1) {
      alert('Please fill required fields: Project Name and Work Type');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        Timestamp: new Date().toISOString(),
        UID: generateUID('LAB'),
        ...labourData
      };

      console.log('Submitting Labour Request:', payload);

      // const result = await postLabourRequest(payload).unwrap();

      await new Promise(resolve => setTimeout(resolve, 1000));

      alert('✅ Labour request submitted successfully!');
      resetLabourForm();
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Failed to submit: ' + (error?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDebit = async (e) => {
    e.preventDefault();

    if (!debitData.Project_Name_1 || !debitData.Contractor_Name_1) {
      alert('Please fill required fields: Project Name and Contractor Name');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        Timestamp: new Date().toISOString(),
        UID: generateUID('DEB'),
        ...debitData
      };

      console.log('Submitting Debit Entry:', payload);

      // const result = await postDebitEntry(payload).unwrap();

      await new Promise(resolve => setTimeout(resolve, 1000));

      alert('✅ Debit entry submitted successfully!');
      resetDebitForm();
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Failed to submit: ' + (error?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========== Reset Functions ==========
  const resetSiteExpensesForm = () => {
    setSiteExpensesData({
      Rcc_Bill_No_1: '',
      Vendor_Payee_Name_1: '',
      Project_Name_1: '',
      Project_Engineer_Name_1: '',
      Head_Type_1: '',
      Details_of_Work_1: '',
      Amount_1: '',
      Bill_No_1: '',
      Bill_Date_1: '',
      Bill_Photo_1: '',
      Exp_Head_1: '',
      Contractor_Name_1: '',
      Contractor_Firm_Name_1: '',
      Remark_1: ''
    });
    setBillPhotoPreview(null);
  };

  const resetLabourForm = () => {
    setLabourData({
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
      Remark_1: ''
    });
  };

  const resetDebitForm = () => {
    setDebitData({
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
      Amount_1: ''
    });
  };

  // ========== Tab Configuration ==========
  const tabs = [
    { id: 'siteExpenses', label: 'Site Expenses', icon: Receipt, color: 'blue', gradient: 'from-blue-600 to-indigo-600' },
    { id: 'labour', label: 'Labour', icon: Users, color: 'emerald', gradient: 'from-emerald-600 to-teal-600' },
    { id: 'debit', label: 'Debit', icon: CreditCard, color: 'purple', gradient: 'from-purple-600 to-indigo-600' }
  ];

  const activeTabConfig = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
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
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* Header */}
          <div className={`bg-gradient-to-r ${activeTabConfig?.gradient} p-6 text-white`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                {activeTabConfig && <activeTabConfig.icon className="w-6 h-6" />}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{activeTabConfig?.label} Form</h1>
                <p className="text-white/80 text-sm mt-1">
                  {activeTab === 'siteExpenses' && 'Enter site expense details'}
                  {activeTab === 'labour' && 'Request labour for your project'}
                  {activeTab === 'debit' && 'Create debit entries for contractors'}
                </p>
              </div>
            </div>
          </div>

          {/* ==================== SITE EXPENSES FORM ==================== */}
          {activeTab === 'siteExpenses' && (
            <form onSubmit={handleSubmitSiteExpenses} className="p-6 space-y-6">

              {/* RCC Bill No & Vendor Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Hash className="w-4 h-4 inline mr-1" />
                    RCC Bill No.
                  </label>
                  <input
                    type="text"
                    value={siteExpensesData.Rcc_Bill_No_1}
                    onChange={(e) => handleSiteExpenseChange('Rcc_Bill_No_1', e.target.value)}
                    placeholder="Enter RCC Bill Number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Vendor/Payee Name
                  </label>
                  <input
                    type="text"
                    value={siteExpensesData.Vendor_Payee_Name_1}
                    onChange={(e) => handleSiteExpenseChange('Vendor_Payee_Name_1', e.target.value)}
                    placeholder="Enter Vendor/Payee Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Project Name & Engineer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    Project Name <span className="text-red-500">*</span>
                    {isDropdownLoading && <span className="text-xs text-gray-500 ml-2">(loading...)</span>}
                  </label>
                  <div className="relative">
                    <select
                      value={siteExpensesData.Project_Name_1}
                      onChange={(e) => handleProjectChange('siteExpenses', e.target.value)}
                      disabled={isDropdownLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    >
                      <option value="">-- Select Project --</option>
                      {projectOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Project Engineer Name
                  </label>
                  <input
                    type="text"
                    value={siteExpensesData.Project_Engineer_Name_1}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Head Type & Expense Head */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Briefcase className="w-4 h-4 inline mr-1" />
                    Head Type
                  </label>
                  <div className="relative">
                    <select
                      value={siteExpensesData.Head_Type_1}
                      onChange={(e) => handleSiteExpenseChange('Head_Type_1', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    >
                      <option value="">-- Select Head Type --</option>
                      {['Company Head', 'Contractor Head'].map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Expense Head
                  </label>
                  <div className="relative">
                    <select
                      value={siteExpensesData.Exp_Head_1}
                      onChange={(e) => handleSiteExpenseChange('Exp_Head_1', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    >
                      <option value="">-- Select Expense Head --</option>
                      {['Material', 'Labour', 'Transport', 'Miscellaneous', 'Electrical', 'Plumbing'].map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Details of Work */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Details of Work
                </label>
                <textarea
                  value={siteExpensesData.Details_of_Work_1}
                  onChange={(e) => handleSiteExpenseChange('Details_of_Work_1', e.target.value)}
                  rows={3}
                  placeholder="Enter work details..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Amount, Bill No, Bill Date */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <IndianRupee className="w-4 h-4 inline mr-1" />
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={siteExpensesData.Amount_1}
                    onChange={(e) => handleSiteExpenseChange('Amount_1', e.target.value)}
                    placeholder="Enter Amount"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Hash className="w-4 h-4 inline mr-1" />
                    Bill No.
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Bill Date
                  </label>
                  <input
                    type="date"
                    value={siteExpensesData.Bill_Date_1}
                    onChange={(e) => handleSiteExpenseChange('Bill_Date_1', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Bill Photo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Camera className="w-4 h-4 inline mr-1" />
                  Bill Photo
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Camera className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload bill photo</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
                  </label>

                  {billPhotoPreview && (
                    <div className="relative">
                      <img
                        src={billPhotoPreview}
                        alt="Bill Preview"
                        className="w-24 h-24 object-cover rounded-xl border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setBillPhotoPreview(null);
                          handleSiteExpenseChange('Bill_Photo_1', '');
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Contractor Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <HardHat className="w-4 h-4 inline mr-1" />
                    Contractor Name
                  </label>
                  <input
                    type="text"
                    value={siteExpensesData.Contractor_Name_1}
                    onChange={(e) => handleSiteExpenseChange('Contractor_Name_1', e.target.value)}
                    placeholder="Enter Contractor Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    Contractor Firm Name
                  </label>
                  <input
                    type="text"
                    value={siteExpensesData.Contractor_Firm_Name_1}
                    onChange={(e) => handleSiteExpenseChange('Contractor_Firm_Name_1', e.target.value)}
                    placeholder="Enter Contractor Firm Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Remark */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Remark
                </label>
                <textarea
                  value={siteExpensesData.Remark_1}
                  onChange={(e) => handleSiteExpenseChange('Remark_1', e.target.value)}
                  rows={2}
                  placeholder="Enter any remarks..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={resetSiteExpensesForm}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isDropdownLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Site Expense
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ==================== LABOUR FORM ==================== */}
          {activeTab === 'labour' && (
            <form onSubmit={handleSubmitLabour} className="p-6 space-y-6">

              {/* Project & Engineer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    Project Name <span className="text-red-500">*</span>
                    {isDropdownLoading && <span className="text-xs text-gray-500 ml-2">(loading...)</span>}
                  </label>
                  <div className="relative">
                    <select
                      value={labourData.Project_Name_1}
                      onChange={(e) => handleProjectChange('labour', e.target.value)}
                      disabled={isDropdownLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
                    >
                      <option value="">-- Select Project --</option>
                      {projectOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Project Engineer
                  </label>
                  <input
                    type="text"
                    value={labourData.Project_Engineer_1}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Work Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Wrench className="w-4 h-4 inline mr-1" />
                  Work Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={labourData.Work_Type_1}
                    onChange={(e) => handleLabourChange('Work_Type_1', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
                  >
                    <option value="">-- Select Work Type --</option>
                    {['RCC', 'Shuttering', 'Plastering', 'Painting', 'Electrical', 'Plumbing', 'Fabrication', 'Civil'].map((opt, idx) => (
                      <option key={idx} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Work Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Work Description
                </label>
                <textarea
                  value={labourData.Work_Description_1}
                  onChange={(e) => handleLabourChange('Work_Description_1', e.target.value)}
                  rows={3}
                  placeholder="Describe the work..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              {/* Labour Details */}
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-4">
                <h3 className="font-semibold text-emerald-800 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Labour Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Labour Category 1</label>
                    <div className="relative">
                      <select
                        value={labourData.Labour_Category_1}
                        onChange={(e) => handleLabourChange('Labour_Category_1', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
                      >
                        <option value="">-- Select Category --</option>
                        {['Skilled', 'Semi-Skilled', 'Unskilled', 'Mistri', 'Helper', 'Mason', 'Carpenter'].map((opt, idx) => (
                          <option key={idx} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Labour (Cat 1)</label>
                    <input
                      type="number"
                      value={labourData.Number_Of_Labour_1}
                      onChange={(e) => handleLabourChange('Number_Of_Labour_1', e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Labour Category 2</label>
                    <div className="relative">
                      <select
                        value={labourData.Labour_Category_2}
                        onChange={(e) => handleLabourChange('Labour_Category_2', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
                      >
                        <option value="">-- Select Category --</option>
                        {['Skilled', 'Semi-Skilled', 'Unskilled', 'Mistri', 'Helper', 'Mason', 'Carpenter'].map((opt, idx) => (
                          <option key={idx} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Labour (Cat 2)</label>
                    <input
                      type="number"
                      value={labourData.Number_Of_Labour_2}
                      onChange={(e) => handleLabourChange('Number_Of_Labour_2', e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-emerald-300">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Calculator className="w-4 h-4" />
                      Total Labour (Auto Calculated)
                    </span>
                    <span className="text-2xl font-bold text-emerald-600">
                      {labourData.Total_Labour_1 || '0'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Date Required */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date of Required
                </label>
                <input
                  type="date"
                  value={labourData.Date_Of_Required_1}
                  onChange={(e) => handleLabourChange('Date_Of_Required_1', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Head, Contractor */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Briefcase className="w-4 h-4 inline mr-1" />
                    Head Of Contractor/Company
                  </label>
                  <div className="relative">
                    <select
                      value={labourData.Head_Of_Contractor_Company_1}
                      onChange={(e) => handleLabourChange('Head_Of_Contractor_Company_1', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
                    >
                      <option value="">-- Select Head --</option>
                      {['Company Head', 'Contractor Head'].map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <HardHat className="w-4 h-4 inline mr-1" />
                    Name of Contractor
                  </label>
                  <input
                    type="text"
                    value={labourData.Name_Of_Contractor_1}
                    onChange={(e) => handleLabourChange('Name_Of_Contractor_1', e.target.value)}
                    placeholder="Enter Contractor Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    Contractor Firm Name
                  </label>
                  <input
                    type="text"
                    value={labourData.Contractor_Firm_Name_1}
                    onChange={(e) => handleLabourChange('Contractor_Firm_Name_1', e.target.value)}
                    placeholder="Enter Firm Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Remark */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Remark
                </label>
                <textarea
                  value={labourData.Remark_1}
                  onChange={(e) => handleLabourChange('Remark_1', e.target.value)}
                  rows={2}
                  placeholder="Enter any remarks..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={resetLabourForm}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isDropdownLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Labour Request
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ==================== DEBIT FORM ==================== */}
          {activeTab === 'debit' && (
            <form onSubmit={handleSubmitDebit} className="p-6 space-y-6">

              {/* Project & Engineer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    Project Name <span className="text-red-500">*</span>
                    {isDropdownLoading && <span className="text-xs text-gray-500 ml-2">(loading...)</span>}
                  </label>
                  <div className="relative">
                    <select
                      value={debitData.Project_Name_1}
                      onChange={(e) => handleProjectChange('debit', e.target.value)}
                      disabled={isDropdownLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
                    >
                      <option value="">-- Select Project --</option>
                      {projectOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Project Engineer
                  </label>
                  <input
                    type="text"
                    value={debitData.Project_Engineer_1}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Contractor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <HardHat className="w-4 h-4 inline mr-1" />
                    Contractor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={debitData.Contractor_Name_1}
                    onChange={(e) => handleDebitChange('Contractor_Name_1', e.target.value)}
                    placeholder="Enter Contractor Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    Contractor Firm Name
                  </label>
                  <input
                    type="text"
                    value={debitData.Contractor_Firm_Name_1}
                    onChange={(e) => handleDebitChange('Contractor_Firm_Name_1', e.target.value)}
                    placeholder="Enter Firm Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Work Type & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Wrench className="w-4 h-4 inline mr-1" />
                    Work Type
                  </label>
                  <div className="relative">
                    <select
                      value={debitData.Work_Type_1}
                      onChange={(e) => handleDebitChange('Work_Type_1', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
                    >
                      <option value="">-- Select Work Type --</option>
                      {['RCC', 'Shuttering', 'Plastering', 'Painting', 'Electrical', 'Plumbing', 'Fabrication', 'Civil'].map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Work Date
                  </label>
                  <input
                    type="date"
                    value={debitData.Work_Date_1}
                    onChange={(e) => handleDebitChange('Work_Date_1', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Work Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Work Description
                </label>
                <textarea
                  value={debitData.Work_Description_1}
                  onChange={(e) => handleDebitChange('Work_Description_1', e.target.value)}
                  rows={3}
                  placeholder="Describe the work..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Calculation Section */}
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 space-y-4">
                <h3 className="font-semibold text-purple-800 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Amount Calculation
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Package className="w-4 h-4 inline mr-1" />
                    Particular
                  </label>
                  <div className="relative">
                    <select
                      value={debitData.Particular_1}
                      onChange={(e) => handleDebitChange('Particular_1', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
                    >
                      <option value="">-- Select Particular --</option>
                      {['Labour Work', 'Material Supply', 'Transportation', 'Equipment Rent', 'Advance', 'Other'].map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Hash className="w-4 h-4 inline mr-1" />
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={debitData.Qty_1}
                      onChange={(e) => handleDebitChange('Qty_1', e.target.value)}
                      placeholder="Enter Quantity"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <IndianRupee className="w-4 h-4 inline mr-1" />
                      Rate / Wages (₹)
                    </label>
                    <input
                      type="number"
                      value={debitData.Rate_Wages_1}
                      onChange={(e) => handleDebitChange('Rate_Wages_1', e.target.value)}
                      placeholder="Enter Rate"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-purple-300">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <IndianRupee className="w-4 h-4" />
                      Total Amount (Auto Calculated)
                    </span>
                    <span className="text-2xl font-bold text-purple-600">
                      ₹{debitData.Amount_1 || '0.00'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    = Quantity × Rate/Wages
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={resetDebitForm}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isDropdownLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Debit Entry
                    </>
                  )}
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