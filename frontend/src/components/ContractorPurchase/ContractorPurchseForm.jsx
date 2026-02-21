// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const parseContractorEntry = (entry) => {
//   const match = entry.match(/^(.+?)\s*\((.+)\)\s*$/);
//   if (match) return { name: match[1].trim(), firm: match[2].trim() };
//   return { name: entry.trim(), firm: '' };
// };

// const ContractorPurchaseForm = () => {
//   const [dropdownData, setDropdownData] = useState({
//     siteNames: [],
//     materialTypes: [],
//     remarksList: [],
//     materialMap: {},
//     unitMap: {},
//     siteSupervisorMap: {},
//   });

//   const [contractorList, setContractorList] = useState([]);

//   const [formData, setFormData] = useState({
//     siteName: '',
//     supervisorName: '',
//     remark: '',
//     challanNo: '',
//     contractorName: '',
//     contractorFirm: '',
//     challanPhoto: null,
//     items: [{ materialType: '', materialName: '', skuCode: '', units: '', quantity: '', reason: '' }],
//   });

//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState({ text: '', type: '' });
//   const [isDataLoaded, setIsDataLoaded] = useState(false);

//   useEffect(() => {
//     const fetchDropdowns = async () => {
//       try {
//         const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/contractor/dropdowns`);
//         const data = res.data;
//         setDropdownData(data);
//         const list = (data.remarksList || []).map(parseContractorEntry);
//         setContractorList(list);
//         setIsDataLoaded(true);
//       } catch (err) {
//         setMessage({ text: 'Data load nahi ho paya. Please refresh.', type: 'error' });
//       }
//     };
//     fetchDropdowns();
//   }, []);

//   // Site → Supervisor auto-fill
//   useEffect(() => {
//     if (formData.siteName && isDataLoaded) {
//       const supervisors = dropdownData.siteSupervisorMap[formData.siteName.toLowerCase().trim()] || [];
//       if (supervisors.length === 1) {
//         setFormData(prev => ({ ...prev, supervisorName: supervisors[0] }));
//       } else {
//         setFormData(prev => ({ ...prev, supervisorName: '' }));
//       }
//     }
//   }, [formData.siteName, isDataLoaded]);

//   // Contractor Name → Firm auto-fill
//   useEffect(() => {
//     if (formData.contractorName) {
//       const found = contractorList.find(c => c.name === formData.contractorName);
//       setFormData(prev => ({ ...prev, contractorFirm: found?.firm || '' }));
//     } else {
//       setFormData(prev => ({ ...prev, contractorFirm: '' }));
//     }
//   }, [formData.contractorName, contractorList]);

//   const handleTypeChange = (index, value) => {
//     const newItems = [...formData.items];
//     newItems[index] = { ...newItems[index], materialType: value, materialName: '', skuCode: '', units: '' };
//     setFormData({ ...formData, items: newItems });
//   };

//   const handleNameChange = (index, value) => {
//     const newItems = [...formData.items];
//     newItems[index].materialName = value;
//     const info = dropdownData.unitMap[value.toLowerCase().trim()] || {};
//     newItems[index].units = info.unit || '';
//     newItems[index].skuCode = info.skuCode || '';
//     setFormData({ ...formData, items: newItems });
//   };

//   const addItem = () => {
//     setFormData({
//       ...formData,
//       items: [...formData.items, { materialType: '', materialName: '', skuCode: '', units: '', quantity: '', reason: '' }],
//     });
//   };

//   const removeItem = (index) => {
//     if (formData.items.length === 1) return;
//     setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleItemChange = (index, e) => {
//     const { name, value } = e.target;
//     const newItems = [...formData.items];
//     newItems[index][name] = value;
//     setFormData({ ...formData, items: newItems });
//   };

//   const handlePhotoChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onloadend = () => setFormData({ ...formData, challanPhoto: reader.result });
//     reader.readAsDataURL(file);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage({ text: '', type: '' });
//     try {
//       const res = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/contractor/submit-requirement`,
//         { ...formData, challanPhoto: formData.challanPhoto || undefined }
//       );
//       setMessage({ text: `✅ Success! Req No: ${res.data.reqNo} (${res.data.rowsAdded} items)`, type: 'success' });
//       setFormData({
//         siteName: '', supervisorName: '', remark: '', challanNo: '',
//         contractorName: '', contractorFirm: '', challanPhoto: null,
//         items: [{ materialType: '', materialName: '', skuCode: '', units: '', quantity: '', reason: '' }],
//       });
//     } catch (err) {
//       setMessage({ text: '❌ ' + (err.response?.data?.error || 'Submit fail ho gaya'), type: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const inputStyle = {
//     width: '100%',
//     padding: '9px 12px',
//     border: '1px solid #d1d5db',
//     borderRadius: '6px',
//     fontSize: '14px',
//     outline: 'none',
//     backgroundColor: '#fff',
//     boxSizing: 'border-box',
//   };

//   const labelStyle = {
//     display: 'block',
//     fontSize: '13px',
//     fontWeight: '600',
//     color: '#374151',
//     marginBottom: '5px',
//   };

//   const sectionStyle = {
//     background: '#fff',
//     border: '1px solid #e5e7eb',
//     borderRadius: '10px',
//     padding: '24px',
//     marginBottom: '20px',
//   };

//   const sectionTitleStyle = {
//     fontSize: '14px',
//     fontWeight: '700',
//     color: '#1f2937',
//     marginBottom: '18px',
//     paddingBottom: '10px',
//     borderBottom: '1px solid #f3f4f6',
//   };

//   return (
//     <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '30px 20px', fontFamily: 'Inter, Segoe UI, sans-serif' }}>
//       <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

//         {/* Header */}
//         <div style={{ marginBottom: '24px' }}>
//           <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0 }}>
//             Contractor Material Purchase Request
//           </h2>
//           <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
//             Fill in the details below to submit a material requirement
//           </p>
//         </div>

//         {/* Message */}
//         {message.text && (
//           <div style={{
//             padding: '12px 16px',
//             borderRadius: '8px',
//             marginBottom: '20px',
//             fontSize: '14px',
//             fontWeight: '500',
//             background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
//             border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
//             color: message.type === 'success' ? '#166534' : '#991b1b',
//           }}>
//             {message.text}
//           </div>
//         )}

//         {!isDataLoaded ? (
//           <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Loading...</div>
//         ) : (
//           <form onSubmit={handleSubmit}>

//             {/* Section 1: Site Info */}
//             <div style={sectionStyle}>
//               <div style={sectionTitleStyle}>Site Information</div>
//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>

//                 <div>
//                   <label style={labelStyle}>Site / Project Name <span style={{ color: 'red' }}>*</span></label>
//                   <select name="siteName" value={formData.siteName} onChange={handleChange} required style={inputStyle}>
//                     <option value="">-- Select --</option>
//                     {dropdownData.siteNames.map(s => <option key={s} value={s}>{s}</option>)}
//                   </select>
//                 </div>

//                 <div>
//                   <label style={labelStyle}>Supervisor / Engineer <span style={{ color: 'red' }}>*</span></label>
//                   <select name="supervisorName" value={formData.supervisorName} onChange={handleChange} required disabled={!formData.siteName} style={{ ...inputStyle, backgroundColor: !formData.siteName ? '#f9fafb' : '#fff' }}>
//                     <option value="">-- Select --</option>
//                     {(dropdownData.siteSupervisorMap[formData.siteName?.toLowerCase()?.trim()] || []).map(s => (
//                       <option key={s} value={s}>{s}</option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label style={labelStyle}>Remark <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
//                   <input
//                     type="text"
//                     name="remark"
//                     value={formData.remark}
//                     onChange={handleChange}
//                     placeholder="Enter remark..."
//                     style={inputStyle}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Section 2: Contractor Info */}
//             <div style={sectionStyle}>
//               <div style={sectionTitleStyle}>Contractor Information</div>
//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>

//                 <div>
//                   <label style={labelStyle}>Contractor Name <span style={{ color: 'red' }}>*</span></label>
//                   <select name="contractorName" value={formData.contractorName} onChange={handleChange} required style={inputStyle}>
//                     <option value="">-- Select Contractor --</option>
//                     {contractorList.map(c => (
//                       <option key={c.name} value={c.name}>{c.name}</option>
//                     ))}
//                   </select>
//                   {contractorList.length === 0 && (
//                     <small style={{ color: '#ef4444', fontSize: '11px' }}>No contractors found</small>
//                   )}
//                 </div>

//                 <div>
//                   <label style={labelStyle}>Contractor Firm <span style={{ color: 'red' }}>*</span></label>
//                   <input
//                     type="text"
//                     name="contractorFirm"
//                     value={formData.contractorFirm}
//                     onChange={handleChange}
//                     required
//                     placeholder="Auto-filled on contractor selection"
//                     style={{
//                       ...inputStyle,
//                       backgroundColor: formData.contractorFirm ? '#f0fdf4' : '#fff',
//                       borderColor: formData.contractorFirm ? '#86efac' : '#d1d5db',
//                     }}
//                   />
//                 </div>

//                 <div>
//                   <label style={labelStyle}>Challan No. <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
//                   <input
//                     type="text"
//                     name="challanNo"
//                     value={formData.challanNo}
//                     onChange={handleChange}
//                     placeholder="Enter challan number"
//                     style={inputStyle}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Section 3: Photo */}
//             <div style={sectionStyle}>
//               <div style={sectionTitleStyle}>
//                 Challan Photo <span style={{ color: '#9ca3af', fontWeight: 400, fontSize: '13px' }}>(optional)</span>
//               </div>
//               <input type="file" accept="image/*" onChange={handlePhotoChange} />
//               {formData.challanPhoto && (
//                 <span style={{ marginLeft: '12px', fontSize: '13px', color: '#16a34a' }}>✓ Photo selected</span>
//               )}
//             </div>

//             {/* Section 4: Materials Table */}
//             <div style={sectionStyle}>
//               <div style={sectionTitleStyle}>Materials Required</div>

//               <div style={{ overflowX: 'auto' }}>
//                 <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
//                   <thead>
//                     <tr style={{ background: '#f3f4f6' }}>
//                       {['#', 'Type *', 'Material Name *', 'SKU Code', 'Unit', 'Qty *', 'Purpose *', ''].map((h, i) => (
//                         <th key={i} style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>
//                           {h}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {formData.items.map((item, index) => (
//                       <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>

//                         <td style={{ padding: '8px 10px', color: '#6b7280', fontWeight: '600' }}>{index + 1}</td>

//                         <td style={{ padding: '8px 6px' }}>
//                           <select value={item.materialType} onChange={e => handleTypeChange(index, e.target.value)} required style={{ ...inputStyle, minWidth: '120px' }}>
//                             <option value="">-- Type --</option>
//                             {dropdownData.materialTypes.map(t => <option key={t} value={t}>{t}</option>)}
//                           </select>
//                         </td>

//                         <td style={{ padding: '8px 6px' }}>
//                           <select value={item.materialName} onChange={e => handleNameChange(index, e.target.value)} required disabled={!item.materialType} style={{ ...inputStyle, minWidth: '160px', backgroundColor: !item.materialType ? '#f9fafb' : '#fff' }}>
//                             <option value="">-- Select --</option>
//                             {(dropdownData.materialMap[item.materialType?.toLowerCase()?.trim() || ''] || []).map(n => (
//                               <option key={n} value={n}>{n}</option>
//                             ))}
//                           </select>
//                         </td>

//                         <td style={{ padding: '8px 6px' }}>
//                           <input type="text" value={item.skuCode} readOnly style={{ ...inputStyle, minWidth: '90px', backgroundColor: '#f9fafb', color: '#6b7280' }} />
//                         </td>

//                         <td style={{ padding: '8px 6px' }}>
//                           <input type="text" value={item.units} readOnly style={{ ...inputStyle, minWidth: '70px', backgroundColor: '#f9fafb', color: '#6b7280' }} />
//                         </td>

//                         <td style={{ padding: '8px 6px' }}>
//                           <input type="number" name="quantity" value={item.quantity} onChange={e => handleItemChange(index, e)} required min="1" placeholder="0" style={{ ...inputStyle, minWidth: '80px' }} />
//                         </td>

//                         <td style={{ padding: '8px 6px' }}>
//                           <input type="text" name="reason" value={item.reason} onChange={e => handleItemChange(index, e)} required placeholder="e.g. Foundation" style={{ ...inputStyle, minWidth: '150px' }} />
//                         </td>

//                         <td style={{ padding: '8px 6px' }}>
//                           {formData.items.length > 1 && (
//                             <button type="button" onClick={() => removeItem(index)} style={{ padding: '6px 12px', background: '#fff', border: '1px solid #fca5a5', borderRadius: '6px', color: '#dc2626', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
//                               Remove
//                             </button>
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               <button type="button" onClick={addItem} style={{ marginTop: '14px', padding: '8px 18px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
//                 + Add Material
//               </button>
//             </div>

//             {/* Submit */}
//             <div style={{ textAlign: 'right' }}>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 style={{
//                   padding: '12px 32px',
//                   background: loading ? '#9ca3af' : '#2563eb',
//                   color: '#fff',
//                   border: 'none',
//                   borderRadius: '8px',
//                   fontSize: '15px',
//                   fontWeight: '600',
//                   cursor: loading ? 'not-allowed' : 'pointer',
//                 }}
//               >
//                 {loading ? 'Submitting...' : 'Submit Requirement'}
//               </button>
//             </div>

//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ContractorPurchaseForm;





// import React, { useState, useEffect ,useRef} from 'react';
// import axios from 'axios';

// const parseContractorEntry = (entry) => {
//   const match = entry.match(/^(.+?)\s*\((.+)\)\s*$/);
//   if (match) return { name: match[1].trim(), firm: match[2].trim() };
//   return { name: entry.trim(), firm: '' };
// };

// const ContractorPurchaseForm = () => {
//   const [dropdownData, setDropdownData] = useState({
//     siteNames: [],
//     materialTypes: [],
//     remarksList: [],
//     materialMap: {},
//     unitMap: {},
//     siteSupervisorMap: {},
//   });

//   const fileInputRef = useRef(null);
//   const [contractorList, setContractorList] = useState([]);

//   const [formData, setFormData] = useState({
//     siteName: '',
//     supervisorName: '',
//     remark: '',
//     challanNo: '',
//     contractorName: '',
//     contractorFirm: '',
//     challanPhoto: null,
//     items: [{ materialType: '', materialName: '', skuCode: '', units: '', quantity: '', reason: '' }],
//   });


//   const [challanError, setChallanError] = useState('');

//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState({ text: '', type: '' });
//   const [isDataLoaded, setIsDataLoaded] = useState(false);

//   useEffect(() => {
//     const fetchDropdowns = async () => {
//       try {
//         const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/contractor/dropdowns`);
//         const data = res.data;
//         setDropdownData(data);
//         const list = (data.remarksList || []).map(parseContractorEntry);
//         setContractorList(list);
//         setIsDataLoaded(true);
//       } catch (err) {
//         setMessage({ text: 'Data load nahi ho paya. Please refresh.', type: 'error' });
//       }
//     };
//     fetchDropdowns();
//   }, []);

//   // Auto-fill supervisor when site is selected
//   useEffect(() => {
//     if (formData.siteName && isDataLoaded) {
//       const supervisors = dropdownData.siteSupervisorMap[formData.siteName.toLowerCase().trim()] || [];
//       if (supervisors.length === 1) {
//         setFormData((prev) => ({ ...prev, supervisorName: supervisors[0] }));
//       } else {
//         setFormData((prev) => ({ ...prev, supervisorName: '' }));
//       }
//     }
//   }, [formData.siteName, isDataLoaded, dropdownData.siteSupervisorMap]);

//   // Auto-fill firm when contractor name is selected
//   useEffect(() => {
//     if (formData.contractorName) {
//       const found = contractorList.find((c) => c.name === formData.contractorName);
//       setFormData((prev) => ({ ...prev, contractorFirm: found?.firm || '' }));
//     } else {
//       setFormData((prev) => ({ ...prev, contractorFirm: '' }));
//     }
//   }, [formData.contractorName, contractorList]);

//   const handleTypeChange = (index, value) => {
//     const newItems = [...formData.items];
//     newItems[index] = { ...newItems[index], materialType: value, materialName: '', skuCode: '', units: '' };
//     setFormData({ ...formData, items: newItems });
//   };

//   const handleNameChange = (index, value) => {
//     const newItems = [...formData.items];
//     newItems[index].materialName = value;
//     const info = dropdownData.unitMap[value.toLowerCase().trim()] || {};
//     newItems[index].units = info.unit || '';
//     newItems[index].skuCode = info.skuCode || '';
//     setFormData({ ...formData, items: newItems });
//   };

//   // ← This was missing — now Quantity & Purpose will work
//   const handleItemChange = (index, e) => {
//     const { name, value } = e.target;
//     const newItems = [...formData.items];
//     newItems[index][name] = value;
//     setFormData({ ...formData, items: newItems });
//   };

//   const addItem = () => {
//     setFormData({
//       ...formData,
//       items: [...formData.items, { materialType: '', materialName: '', skuCode: '', units: '', quantity: '', reason: '' }],
//     });
//   };

//   const removeItem = (index) => {
//     if (formData.items.length === 1) return;
//     setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//     if (name === 'challanNo') setChallanError('');
//   };

//   const handlePhotoChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setFormData({ ...formData, challanPhoto: reader.result });
//       setChallanError('');
//     };
//     reader.readAsDataURL(file);
//   };

//   const validateChallan = () => {
//     const hasChallanNo = formData.challanNo.trim().length > 0;
//     const hasPhoto = !!formData.challanPhoto;

//     if (!hasChallanNo && !hasPhoto) {
//       setChallanError('Challan Number ya Challan Photo — kam se kam ek toh dena zaroori hai');
//       return false;
//     }
//     setChallanError('');
//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateChallan()) {
//       return;
//     }

//     setLoading(true);
//     setMessage({ text: '', type: '' });

//     try {
//       const payload = {
//         ...formData,
//         challanPhoto: formData.challanPhoto || undefined,
//       };

//       const res = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/contractor/submit-requirement`,
//         payload
//       );

//       setMessage({
//         text: `✅ Success! Req No: ${res.data.reqNo} (${res.data.rowsAdded} items)`,
//         type: 'success',
//       });

//       // Reset form
//       setFormData({
//         siteName: '',
//         supervisorName: '',
//         remark: '',
//         challanNo: '',
//         contractorName: '',
//         contractorFirm: '',
//         challanPhoto: null,
//         items: [{ materialType: '', materialName: '', skuCode: '', units: '', quantity: '', reason: '' }],
//       });
//       setChallanError('');
//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';   // This clears the browser's file selection
//       }
//     } catch (err) {
//       setMessage({
//         text: '❌ ' + (err.response?.data?.error || 'Submit fail ho gaya'),
//         type: 'error',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const inputStyle = {
//     width: '100%',
//     padding: '9px 12px',
//     border: '1px solid #d1d5db',
//     borderRadius: '6px',
//     fontSize: '14px',
//     outline: 'none',
//     backgroundColor: '#fff',
//     boxSizing: 'border-box',
//   };

//   const errorInputStyle = {
//     ...inputStyle,
//     borderColor: '#ef4444',
//     backgroundColor: '#fef2f2',
//   };

//   const labelStyle = {
//     display: 'block',
//     fontSize: '13px',
//     fontWeight: '600',
//     color: '#374151',
//     marginBottom: '5px',
//   };

//   const sectionStyle = {
//     background: '#fff',
//     border: '1px solid #e5e7eb',
//     borderRadius: '10px',
//     padding: '24px',
//     marginBottom: '20px',
//   };

//   const sectionTitleStyle = {
//     fontSize: '14px',
//     fontWeight: '700',
//     color: '#1f2937',
//     marginBottom: '18px',
//     paddingBottom: '10px',
//     borderBottom: '1px solid #f3f4f6',
//   };

//   return (
//     <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '30px 20px', fontFamily: 'Inter, Segoe UI, sans-serif' }}>
//       <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

//         <div style={{ marginBottom: '24px' }}>
//           <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0 }}>
//             Contractor Material Purchase Request
//           </h2>
//           <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
//             Fill in the details below to submit a material requirement
//           </p>
//         </div>

//         {message.text && (
//           <div
//             style={{
//               padding: '12px 16px',
//               borderRadius: '8px',
//               marginBottom: '20px',
//               fontSize: '14px',
//               fontWeight: '500',
//               background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
//               border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
//               color: message.type === 'success' ? '#166534' : '#991b1b',
//             }}
//           >
//             {message.text}
//           </div>
//         )}

//         {!isDataLoaded ? (
//           <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Loading...</div>
//         ) : (
//           <form onSubmit={handleSubmit}>

//             {/* Site Information */}
//             <div style={sectionStyle}>
//               <div style={sectionTitleStyle}>Site Information</div>
//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
//                 <div>
//                   <label style={labelStyle}>
//                     Site / Project Name <span style={{ color: 'red' }}>*</span>
//                   </label>
//                   <select name="siteName" value={formData.siteName} onChange={handleChange} required style={inputStyle}>
//                     <option value="">-- Select --</option>
//                     {dropdownData.siteNames.map((s) => (
//                       <option key={s} value={s}>{s}</option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label style={labelStyle}>
//                     Supervisor / Engineer <span style={{ color: 'red' }}>*</span>
//                   </label>
//                   <select
//                     name="supervisorName"
//                     value={formData.supervisorName}
//                     onChange={handleChange}
//                     required
//                     disabled={!formData.siteName}
//                     style={{ ...inputStyle, backgroundColor: !formData.siteName ? '#f9fafb' : '#fff' }}
//                   >
//                     <option value="">-- Select --</option>
//                     {(dropdownData.siteSupervisorMap[formData.siteName?.toLowerCase()?.trim()] || []).map((s) => (
//                       <option key={s} value={s}>{s}</option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label style={labelStyle}>Remark <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
//                   <input
//                     type="text"
//                     name="remark"
//                     value={formData.remark}
//                     onChange={handleChange}
//                     placeholder="Enter remark..."
//                     style={inputStyle}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Contractor + Challan */}
//             <div style={sectionStyle}>
//               <div style={sectionTitleStyle}>Contractor Information</div>
//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
//                 <div>
//                   <label style={labelStyle}>
//                     Contractor Name <span style={{ color: 'red' }}>*</span>
//                   </label>
//                   <select name="contractorName" value={formData.contractorName} onChange={handleChange} required style={inputStyle}>
//                     <option value="">-- Select Contractor --</option>
//                     {contractorList.map((c) => (
//                       <option key={c.name} value={c.name}>{c.name}</option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label style={labelStyle}>
//                     Contractor Firm <span style={{ color: 'red' }}>*</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="contractorFirm"
//                     value={formData.contractorFirm}
//                     onChange={handleChange}
//                     required
//                     placeholder="Auto-filled on contractor selection"
//                     style={{
//                       ...inputStyle,
//                       backgroundColor: formData.contractorFirm ? '#f0fdf4' : '#fff',
//                       borderColor: formData.contractorFirm ? '#86efac' : '#d1d5db',
//                     }}
//                   />
//                 </div>

//                 <div>
//                   <label style={labelStyle}>
//                     Challan No. <span style={{ color: 'red' }}>*</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="challanNo"
//                     value={formData.challanNo}
//                     onChange={handleChange}
//                     placeholder="Enter challan number"
//                     style={challanError && !formData.challanNo.trim() ? errorInputStyle : inputStyle}
//                   />
//                 </div>
//               </div>

//               <div style={{ marginTop: '20px' }}>
//                 <label style={labelStyle}>
//                   Challan Photo <span style={{ color: 'red' }}>*</span>
//                 </label>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handlePhotoChange}
//                   ref={fileInputRef}
//                   style={challanError && !formData.challanPhoto ? { ...inputStyle, borderColor: '#ef4444' } : inputStyle}
//                 />
//                 {formData.challanPhoto && (
//                   <span style={{ marginLeft: '12px', fontSize: '13px', color: '#16a34a' }}>✓ Photo selected</span>
//                 )}

//                 {challanError && (
//                   <div style={{
//                     color: '#dc2626',
//                     fontSize: '13px',
//                     marginTop: '6px',
//                     fontWeight: '500',
//                   }}>
//                     {challanError}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Materials Table */}
//             <div style={sectionStyle}>
//               <div style={sectionTitleStyle}>Materials Required</div>

//               <div style={{ overflowX: 'auto' }}>
//                 <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
//                   <thead>
//                     <tr style={{ background: '#f3f4f6' }}>
//                       {['#', 'Type *', 'Material Name *', 'SKU Code', 'Unit', 'Qty *', 'Purpose *', ''].map((h, i) => (
//                         <th
//                           key={i}
//                           style={{
//                             padding: '10px',
//                             textAlign: 'left',
//                             fontWeight: '600',
//                             color: '#374151',
//                             borderBottom: '1px solid #e5e7eb',
//                             whiteSpace: 'nowrap',
//                           }}
//                         >
//                           {h}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {formData.items.map((item, index) => (
//                       <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
//                         <td style={{ padding: '8px 10px', color: '#6b7280', fontWeight: '600' }}>{index + 1}</td>

//                         <td style={{ padding: '8px 6px' }}>
//                           <select
//                             value={item.materialType}
//                             onChange={(e) => handleTypeChange(index, e.target.value)}
//                             required
//                             style={{ ...inputStyle, minWidth: '120px' }}
//                           >
//                             <option value="">-- Type --</option>
//                             {dropdownData.materialTypes.map((t) => (
//                               <option key={t} value={t}>{t}</option>
//                             ))}
//                           </select>
//                         </td>

//                         <td style={{ padding: '8px 6px' }}>
//                           <select
//                             value={item.materialName}
//                             onChange={(e) => handleNameChange(index, e.target.value)}
//                             required
//                             disabled={!item.materialType}
//                             style={{
//                               ...inputStyle,
//                               minWidth: '160px',
//                               backgroundColor: !item.materialType ? '#f9fafb' : '#fff',
//                             }}
//                           >
//                             <option value="">-- Select --</option>
//                             {(dropdownData.materialMap[item.materialType?.toLowerCase()?.trim() || ''] || []).map((n) => (
//                               <option key={n} value={n}>{n}</option>
//                             ))}
//                           </select>
//                         </td>

//                         <td style={{ padding: '8px 6px' }}>
//                           <input
//                             type="text"
//                             value={item.skuCode}
//                             readOnly
//                             style={{ ...inputStyle, minWidth: '90px', backgroundColor: '#f9fafb', color: '#6b7280' }}
//                           />
//                         </td>

//                         <td style={{ padding: '8px 6px' }}>
//                           <input
//                             type="text"
//                             value={item.units}
//                             readOnly
//                             style={{ ...inputStyle, minWidth: '70px', backgroundColor: '#f9fafb', color: '#6b7280' }}
//                           />
//                         </td>

//                         <td style={{ padding: '8px 6px' }}>
//                           <input
//                             type="number"
//                             name="quantity"
//                             value={item.quantity}
//                             onChange={(e) => handleItemChange(index, e)}
//                             required
//                             min="1"
//                             step="any"
//                             placeholder="0"
//                             style={{ ...inputStyle, minWidth: '80px' }}
//                           />
//                         </td>

//                         <td style={{ padding: '8px 6px' }}>
//                           <input
//                             type="text"
//                             name="reason"
//                             value={item.reason}
//                             onChange={(e) => handleItemChange(index, e)}
//                             required
//                             placeholder="e.g. Foundation work"
//                             style={{ ...inputStyle, minWidth: '150px' }}
//                           />
//                         </td>

//                         <td style={{ padding: '8px 6px' }}>
//                           {formData.items.length > 1 && (
//                             <button
//                               type="button"
//                               onClick={() => removeItem(index)}
//                               style={{
//                                 padding: '6px 12px',
//                                 background: '#fff',
//                                 border: '1px solid #fca5a5',
//                                 borderRadius: '6px',
//                                 color: '#dc2626',
//                                 cursor: 'pointer',
//                                 fontSize: '12px',
//                                 fontWeight: '600',
//                               }}
//                             >
//                               Remove
//                             </button>
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               <button
//                 type="button"
//                 onClick={addItem}
//                 style={{
//                   marginTop: '14px',
//                   padding: '8px 18px',
//                   background: '#fff',
//                   border: '1px solid #d1d5db',
//                   borderRadius: '6px',
//                   fontSize: '13px',
//                   fontWeight: '600',
//                   color: '#374151',
//                   cursor: 'pointer',
//                 }}
//               >
//                 + Add Material
//               </button>
//             </div>

//             {/* Submit */}
//             <div style={{ textAlign: 'right' }}>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 style={{
//                   padding: '12px 32px',
//                   background: loading ? '#9ca3af' : '#2563eb',
//                   color: '#fff',
//                   border: 'none',
//                   borderRadius: '8px',
//                   fontSize: '15px',
//                   fontWeight: '600',
//                   cursor: loading ? 'not-allowed' : 'pointer',
//                 }}
//               >
//                 {loading ? 'Submitting...' : 'Submit Requirement'}
//               </button>
//             </div>

//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ContractorPurchaseForm;




import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ContractorPurchaseForm = () => {
  const [dropdownData, setDropdownData] = useState({
    siteNames: [],
    materialTypes: [],
    remarksList: [],
    materialMap: {},
    unitMap: {},
    siteSupervisorMap: {},
    remarksToAutoFillMap: {},  // NEW: for firm auto-fill
  });

  const fileInputRef = useRef(null);
  const [contractorList, setContractorList] = useState([]);

  const [siteSearch, setSiteSearch] = useState('');
  const [contractorSearch, setContractorSearch] = useState('');

  const [formData, setFormData] = useState({
    siteName: '',
    supervisorName: '',
    remark: '',
    challanNo: '',
    contractorName: '',
    contractorFirm: '',
    challanPhoto: null,
    items: [{ materialType: '', materialName: '', skuCode: '', units: '', quantity: '', reason: '' }],
  });

  const [challanError, setChallanError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successDetails, setSuccessDetails] = useState({ reqNo: '', rowsAdded: 0 });

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/contractor/dropdowns`);
        const data = res.data;
        setDropdownData(data);
        setContractorList(data.remarksList || []);  // names from P
        setIsDataLoaded(true);
      } catch (err) {
        setMessage({ text: 'Data load nahi ho paya. Please refresh.', type: 'error' });
      }
    };
    fetchDropdowns();
  }, []);

  // Auto-fill supervisor
  useEffect(() => {
    if (formData.siteName && isDataLoaded) {
      const supervisors = dropdownData.siteSupervisorMap[formData.siteName.toLowerCase().trim()] || [];
      if (supervisors.length === 1) {
        setFormData((prev) => ({ ...prev, supervisorName: supervisors[0] }));
      } else {
        setFormData((prev) => ({ ...prev, supervisorName: '' }));
      }
    }
  }, [formData.siteName, isDataLoaded, dropdownData.siteSupervisorMap]);

  // Auto-fill firm from map (Q value)
  useEffect(() => {
    if (formData.contractorName) {
      const firm = dropdownData.remarksToAutoFillMap[formData.contractorName] || '';
      setFormData((prev) => ({ ...prev, contractorFirm: firm }));
    } else {
      setFormData((prev) => ({ ...prev, contractorFirm: '' }));
    }
  }, [formData.contractorName, dropdownData.remarksToAutoFillMap]);

  const filteredSites = dropdownData.siteNames.filter((site) =>
    site.toLowerCase().includes(siteSearch.toLowerCase().trim())
  );

  const filteredContractors = contractorList.filter((name) =>
    name.toLowerCase().includes(contractorSearch.toLowerCase().trim())
  );

  const handleTypeChange = (index, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], materialType: value, materialName: '', skuCode: '', units: '' };
    setFormData({ ...formData, items: newItems });
  };

  const handleNameChange = (index, value) => {
    const newItems = [...formData.items];
    newItems[index].materialName = value;
    const info = dropdownData.unitMap[value.toLowerCase().trim()] || {};
    newItems[index].units = info.unit || '';
    newItems[index].skuCode = info.skuCode || '';
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    newItems[index][name] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { materialType: '', materialName: '', skuCode: '', units: '', quantity: '', reason: '' }],
    });
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'challanNo') setChallanError('');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, challanPhoto: reader.result });
      setChallanError('');
    };
    reader.readAsDataURL(file);
  };

  const validateChallan = () => {
    const hasChallanNo = formData.challanNo.trim().length > 0;
    const hasPhoto = !!formData.challanPhoto;

    if (!hasChallanNo && !hasPhoto) {
      setChallanError('Challan Number ya Challan Photo — kam se kam ek toh dena zaroori hai');
      return false;
    }
    setChallanError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateChallan()) return;

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const payload = { ...formData, challanPhoto: formData.challanPhoto || undefined };
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/contractor/submit-requirement`,
        payload
      );

      const { reqNo, rowsAdded } = res.data;

      setSuccessDetails({ reqNo, rowsAdded });
      setShowSuccessPopup(true);

      setMessage({
        text: `✅ Success! Req No: ${reqNo} (${rowsAdded} items)`,
        type: 'success',
      });

      setTimeout(() => setShowSuccessPopup(false), 4000);

      setFormData({
        siteName: '',
        supervisorName: '',
        remark: '',
        challanNo: '',
        contractorName: '',
        contractorFirm: '',
        challanPhoto: null,
        items: [{ materialType: '', materialName: '', skuCode: '', units: '', quantity: '', reason: '' }],
      });
      setSiteSearch('');
      setContractorSearch('');
      setChallanError('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setMessage({
        text: '❌ ' + (err.response?.data?.error || 'Submit fail ho gaya'),
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#fff',
    boxSizing: 'border-box',
  };

  const errorInputStyle = {
    ...inputStyle,
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '5px',
  };

  const sectionStyle = {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '24px',
    marginBottom: '20px',
  };

  const sectionTitleStyle = {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '18px',
    paddingBottom: '10px',
    borderBottom: '1px solid #f3f4f6',
  };

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '30px 20px', fontFamily: 'Inter, Segoe UI, sans-serif', position: 'relative' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0 }}>
            Contractor Material Purchase Request
          </h2>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
            Fill in the details below to submit a material requirement
          </p>
        </div>

        {message.text && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              fontWeight: '500',
              background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
              color: message.type === 'success' ? '#166534' : '#991b1b',
            }}
          >
            {message.text}
          </div>
        )}

        {showSuccessPopup && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowSuccessPopup(false)}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '32px 40px',
                maxWidth: '420px',
                width: '90%',
                textAlign: 'center',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowSuccessPopup(false)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#6b7280',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>

              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 12px' }}>
                Submission Successful!
              </h3>
              <p style={{ fontSize: '16px', color: '#374151', margin: '0 0 20px' }}>
                Requirement submitted successfully.
              </p>
              <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                <p style={{ margin: '8px 0', fontSize: '15px' }}>
                  <strong>Request No:</strong> {successDetails.reqNo}
                </p>
                <p style={{ margin: '8px 0', fontSize: '15px' }}>
                  <strong>Items Added:</strong> {successDetails.rowsAdded}
                </p>
              </div>
              <button
                onClick={() => setShowSuccessPopup(false)}
                style={{
                  padding: '12px 32px',
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>
        )}

        {!isDataLoaded ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Loading...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Site Information */}
            <div style={sectionStyle}>
              <div style={sectionTitleStyle}>Site Information</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>
                    Site / Project Name <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select name="siteName" value={formData.siteName} onChange={handleChange} required style={inputStyle}>
                    <option value="">-- Select --</option>
                    {dropdownData.siteNames.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>
                    Supervisor / Engineer <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    name="supervisorName"
                    value={formData.supervisorName}
                    onChange={handleChange}
                    required
                    disabled={!formData.siteName}
                    style={{ ...inputStyle, backgroundColor: !formData.siteName ? '#f9fafb' : '#fff' }}
                  >
                    <option value="">-- Select --</option>
                    {(dropdownData.siteSupervisorMap[formData.siteName?.toLowerCase()?.trim()] || []).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Remark <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
                  <input
                    type="text"
                    name="remark"
                    value={formData.remark}
                    onChange={handleChange}
                    placeholder="Enter remark..."
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Contractor + Challan */}
            <div style={sectionStyle}>
              <div style={sectionTitleStyle}>Contractor Information</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>
                    Contractor Name <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={contractorSearch}
                    onChange={(e) => setContractorSearch(e.target.value)}
                    placeholder="Type to search contractor..."
                    style={inputStyle}
                  />
                  {contractorSearch && (
                    <div
                      style={{
                        maxHeight: '200px',
                        overflowY: 'auto',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        marginTop: '4px',
                        background: '#fff',
                        zIndex: 10,
                      }}
                    >
                      {filteredContractors.length > 0 ? (
                        filteredContractors.map((name) => (
                          <div
                            key={name}
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, contractorName: name }));
                              setContractorSearch(name);
                            }}
                            style={{
                              padding: '8px 12px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f3f4f6',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.background = '#f3f4f6')}
                            onMouseOut={(e) => (e.currentTarget.style.background = '#fff')}
                          >
                            {name}
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '8px 12px', color: '#9ca3af' }}>No contractors found</div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>
                    Contractor Firm <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="contractorFirm"
                    value={formData.contractorFirm}
                    onChange={handleChange}
                    required
                    placeholder="Auto-filled on contractor selection"
                    style={{
                      ...inputStyle,
                      backgroundColor: formData.contractorFirm ? '#f0fdf4' : '#fff',
                      borderColor: formData.contractorFirm ? '#86efac' : '#d1d5db',
                    }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Challan No. <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="challanNo"
                    value={formData.challanNo}
                    onChange={handleChange}
                    placeholder="Enter challan number"
                    style={challanError && !formData.challanNo.trim() ? errorInputStyle : inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <label style={labelStyle}>
                  Challan Photo <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  ref={fileInputRef}
                  style={challanError && !formData.challanPhoto ? { ...inputStyle, borderColor: '#ef4444' } : inputStyle}
                />
                {formData.challanPhoto && (
                  <span style={{ marginLeft: '12px', fontSize: '13px', color: '#16a34a' }}>✓ Photo selected</span>
                )}

                {challanError && (
                  <div style={{
                    color: '#dc2626',
                    fontSize: '13px',
                    marginTop: '6px',
                    fontWeight: '500',
                  }}>
                    {challanError}
                  </div>
                )}
              </div>
            </div>

            {/* Materials Table */}
            <div style={sectionStyle}>
              <div style={sectionTitleStyle}>Materials Required</div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6' }}>
                      {['#', 'Type *', 'Material Name *', 'SKU Code', 'Unit', 'Qty *', 'Purpose *', ''].map((h, i) => (
                        <th
                          key={i}
                          style={{
                            padding: '10px',
                            textAlign: 'left',
                            fontWeight: '600',
                            color: '#374151',
                            borderBottom: '1px solid #e5e7eb',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '8px 10px', color: '#6b7280', fontWeight: '600' }}>{index + 1}</td>

                        <td style={{ padding: '8px 6px' }}>
                          <select
                            value={item.materialType}
                            onChange={(e) => handleTypeChange(index, e.target.value)}
                            required
                            style={{ ...inputStyle, minWidth: '120px' }}
                          >
                            <option value="">-- Type --</option>
                            {dropdownData.materialTypes.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </td>

                        <td style={{ padding: '8px 6px' }}>
                          <select
                            value={item.materialName}
                            onChange={(e) => handleNameChange(index, e.target.value)}
                            required
                            disabled={!item.materialType}
                            style={{
                              ...inputStyle,
                              minWidth: '160px',
                              backgroundColor: !item.materialType ? '#f9fafb' : '#fff',
                            }}
                          >
                            <option value="">-- Select --</option>
                            {(dropdownData.materialMap[item.materialType?.toLowerCase()?.trim() || ''] || []).map((n) => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        </td>

                        <td style={{ padding: '8px 6px' }}>
                          <input
                            type="text"
                            value={item.skuCode}
                            readOnly
                            style={{ ...inputStyle, minWidth: '90px', backgroundColor: '#f9fafb', color: '#6b7280' }}
                          />
                        </td>

                        <td style={{ padding: '8px 6px' }}>
                          <input
                            type="text"
                            value={item.units}
                            readOnly
                            style={{ ...inputStyle, minWidth: '70px', backgroundColor: '#f9fafb', color: '#6b7280' }}
                          />
                        </td>

                        <td style={{ padding: '8px 6px' }}>
                          <input
                            type="number"
                            name="quantity"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, e)}
                            required
                            min="1"
                            step="any"
                            placeholder="0"
                            style={{ ...inputStyle, minWidth: '80px' }}
                          />
                        </td>

                        <td style={{ padding: '8px 6px' }}>
                          <input
                            type="text"
                            name="reason"
                            value={item.reason}
                            onChange={(e) => handleItemChange(index, e)}
                            required
                            placeholder="e.g. Foundation work"
                            style={{ ...inputStyle, minWidth: '150px' }}
                          />
                        </td>

                        <td style={{ padding: '8px 6px' }}>
                          {formData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              style={{
                                padding: '6px 12px',
                                background: '#fff',
                                border: '1px solid #fca5a5',
                                borderRadius: '6px',
                                color: '#dc2626',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600',
                              }}
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={addItem}
                style={{
                  marginTop: '14px',
                  padding: '8px 18px',
                  background: '#fff',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#374151',
                  cursor: 'pointer',
                }}
              >
                + Add Material
              </button>
            </div>

            {/* Submit */}
            <div style={{ textAlign: 'right' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 32px',
                  background: loading ? '#9ca3af' : '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Submitting...' : 'Submit Requirement'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContractorPurchaseForm;