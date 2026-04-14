// import React, { useState } from 'react';
// import { useGetAdvanceDropdownDataQuery, usePostAdvancePaymentMutation } from '../../redux/advanceSlice';

// const Advance_payment = () => {
//   // ============================================================
//   // RTK Query Hooks
//   // ============================================================
//   const {
//     data: dropdownData,
//     isLoading: dropdownLoading,
//     isError: dropdownError,
//   } = useGetAdvanceDropdownDataQuery();

//   const [postAdvancePayment, {
//     isLoading: submitLoading,
//     isSuccess,
//     isError: submitError,
//   }] = usePostAdvancePaymentMutation();

//   // ============================================================
//   // Form State
//   // ============================================================
//   const initialState = {
//     siteName: '',
//     vendorFirmName: '',
//     paidAmount: '',
//     bankDetails: '',
//     paymentMode: '',
//     paymentDetails: '',
//     paymentDate: '',
//     expHead: '',
//   };

//   const [formData, setFormData] = useState(initialState);
//   const [errors, setErrors] = useState({});
//   const [successMsg, setSuccessMsg] = useState('');
//   const [errorMsg, setErrorMsg] = useState('');

//   // Dropdown Options from API
//   const siteNames = dropdownData?.data?.siteNames || [];
//   const vendorFirms = dropdownData?.data?.vendorFirms || [];

//   // ============================================================
//   // Handle Input Change
//   // ============================================================
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     // Error clear karo jab user type kare
//     setErrors((prev) => ({ ...prev, [name]: '' }));
//   };

//   // ============================================================
//   // Validation
//   // ============================================================
//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.siteName) newErrors.siteName = 'Site Name is required';
//     if (!formData.vendorFirmName) newErrors.vendorFirmName = 'Vendor Firm Name is required';
//     if (!formData.paidAmount) newErrors.paidAmount = 'Paid Amount is required';
//     if (!formData.bankDetails) newErrors.bankDetails = 'Bank Details is required';
//     if (!formData.paymentMode) newErrors.paymentMode = 'Payment Mode is required';
//     if (!formData.paymentDetails) newErrors.paymentDetails = 'Payment Details is required';
//     if (!formData.paymentDate) newErrors.paymentDate = 'Payment Date is required';
//     if (!formData.expHead) newErrors.expHead = 'Exp. Head is required';

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // ============================================================
//   // Handle Submit
//   // ============================================================
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSuccessMsg('');
//     setErrorMsg('');

//     if (!validateForm()) return;

//     try {
//       const result = await postAdvancePayment(formData).unwrap();
//       setSuccessMsg(`✅ ${result.message} (${result.insertedAt})`);
//       setFormData(initialState); // Form reset karo
//     } catch (err) {
//       setErrorMsg(`❌ Error: ${err?.data?.message || 'Something went wrong'}`);
//     }
//   };

//   // ============================================================
//   // Handle Reset
//   // ============================================================
//   const handleReset = () => {
//     setFormData(initialState);
//     setErrors({});
//     setSuccessMsg('');
//     setErrorMsg('');
//   };

//   // ============================================================
//   // Dropdown Loading State
//   // ============================================================
//   if (dropdownLoading) {
//     return (
//       <div style={styles.loaderContainer}>
//         <div style={styles.loader}></div>
//         <p style={styles.loaderText}>Loading dropdown data...</p>
//       </div>
//     );
//   }

//   if (dropdownError) {
//     return (
//       <div style={styles.errorContainer}>
//         <p style={styles.errorText}>❌ Failed to load dropdown data. Please refresh the page.</p>
//       </div>
//     );
//   }

//   // ============================================================
//   // Render
//   // ============================================================
//   return (
//     <div style={styles.pageWrapper}>
//       <div style={styles.container}>

//         {/* ---- Header ---- */}
//         <div style={styles.header}>
//           <h2 style={styles.headerTitle}>💰 Advance Payment Form</h2>
//           <p style={styles.headerSubtitle}>Fill in the details to submit advance payment</p>
//         </div>

//         {/* ---- Success Message ---- */}
//         {successMsg && (
//           <div style={styles.successAlert}>
//             {successMsg}
//           </div>
//         )}

//         {/* ---- Error Message ---- */}
//         {errorMsg && (
//           <div style={styles.errorAlert}>
//             {errorMsg}
//           </div>
//         )}

//         {/* ============================================================ */}
//         {/* FORM */}
//         {/* ============================================================ */}
//         <form onSubmit={handleSubmit} style={styles.form}>

//           {/* ---- Row 1: Site Name + Vendor Firm ---- */}
//           <div style={styles.row}>

//             {/* Site Name Dropdown */}
//             <div style={styles.fieldGroup}>
//               <label style={styles.label}>
//                 Site Name <span style={styles.required}>*</span>
//               </label>
//               <select
//                 name="siteName"
//                 value={formData.siteName}
//                 onChange={handleChange}
//                 style={{
//                   ...styles.select,
//                   borderColor: errors.siteName ? '#e74c3c' : '#ddd',
//                 }}
//               >
//                 <option value="">-- Select Site Name --</option>
//                 {siteNames.map((site, index) => (
//                   <option key={index} value={site}>
//                     {site}
//                   </option>
//                 ))}
//               </select>
//               {errors.siteName && (
//                 <span style={styles.errorMsg}>{errors.siteName}</span>
//               )}
//             </div>

//             {/* Vendor Firm Dropdown */}
//             <div style={styles.fieldGroup}>
//               <label style={styles.label}>
//                 Vendor Firm Name <span style={styles.required}>*</span>
//               </label>
//               <select
//                 name="vendorFirmName"
//                 value={formData.vendorFirmName}
//                 onChange={handleChange}
//                 style={{
//                   ...styles.select,
//                   borderColor: errors.vendorFirmName ? '#e74c3c' : '#ddd',
//                 }}
//               >
//                 <option value="">-- Select Vendor Firm --</option>
//                 {vendorFirms.map((firm, index) => (
//                   <option key={index} value={firm}>
//                     {firm}
//                   </option>
//                 ))}
//               </select>
//               {errors.vendorFirmName && (
//                 <span style={styles.errorMsg}>{errors.vendorFirmName}</span>
//               )}
//             </div>

//           </div>

//           {/* ---- Row 2: Paid Amount + Bank Details ---- */}
//           <div style={styles.row}>

//             {/* Paid Amount */}
//             <div style={styles.fieldGroup}>
//               <label style={styles.label}>
//                 Paid Amount <span style={styles.required}>*</span>
//               </label>
//               <input
//                 type="number"
//                 name="paidAmount"
//                 value={formData.paidAmount}
//                 onChange={handleChange}
//                 placeholder="Enter Paid Amount"
//                 style={{
//                   ...styles.input,
//                   borderColor: errors.paidAmount ? '#e74c3c' : '#ddd',
//                 }}
//               />
//               {errors.paidAmount && (
//                 <span style={styles.errorMsg}>{errors.paidAmount}</span>
//               )}
//             </div>

//             {/* Bank Details */}
//             <div style={styles.fieldGroup}>
//               <label style={styles.label}>
//                 Bank Details <span style={styles.required}>*</span>
//               </label>
//               <input
//                 type="text"
//                 name="bankDetails"
//                 value={formData.bankDetails}
//                 onChange={handleChange}
//                 placeholder="Enter Bank Details"
//                 style={{
//                   ...styles.input,
//                   borderColor: errors.bankDetails ? '#e74c3c' : '#ddd',
//                 }}
//               />
//               {errors.bankDetails && (
//                 <span style={styles.errorMsg}>{errors.bankDetails}</span>
//               )}
//             </div>

//           </div>

//           {/* ---- Row 3: Payment Mode + Payment Date ---- */}
//           <div style={styles.row}>

//             {/* Payment Mode */}
//             <div style={styles.fieldGroup}>
//               <label style={styles.label}>
//                 Payment Mode <span style={styles.required}>*</span>
//               </label>
//               <select
//                 name="paymentMode"
//                 value={formData.paymentMode}
//                 onChange={handleChange}
//                 style={{
//                   ...styles.select,
//                   borderColor: errors.paymentMode ? '#e74c3c' : '#ddd',
//                 }}
//               >
//                 <option value="">-- Select Payment Mode --</option>
//                 <option value="CASH">CASH</option>
//                 <option value="NEFT">NEFT</option>
//                 <option value="RTGS">RTGS</option>
//                 <option value="IMPS">IMPS</option>
//                 <option value="CHEQUE">CHEQUE</option>
//                 <option value="UPI">UPI</option>
//               </select>
//               {errors.paymentMode && (
//                 <span style={styles.errorMsg}>{errors.paymentMode}</span>
//               )}
//             </div>

//             {/* Payment Date */}
//             <div style={styles.fieldGroup}>
//               <label style={styles.label}>
//                 Payment Date <span style={styles.required}>*</span>
//               </label>
//               <input
//                 type="date"
//                 name="paymentDate"
//                 value={formData.paymentDate}
//                 onChange={handleChange}
//                 style={{
//                   ...styles.input,
//                   borderColor: errors.paymentDate ? '#e74c3c' : '#ddd',
//                 }}
//               />
//               {errors.paymentDate && (
//                 <span style={styles.errorMsg}>{errors.paymentDate}</span>
//               )}
//             </div>

//           </div>

//           {/* ---- Row 4: Payment Details + Exp Head ---- */}
//           <div style={styles.row}>

//             {/* Payment Details */}
//             <div style={styles.fieldGroup}>
//               <label style={styles.label}>
//                 Payment Details <span style={styles.required}>*</span>
//               </label>
//               <input
//                 type="text"
//                 name="paymentDetails"
//                 value={formData.paymentDetails}
//                 onChange={handleChange}
//                 placeholder="Enter Payment Details / Reference No."
//                 style={{
//                   ...styles.input,
//                   borderColor: errors.paymentDetails ? '#e74c3c' : '#ddd',
//                 }}
//               />
//               {errors.paymentDetails && (
//                 <span style={styles.errorMsg}>{errors.paymentDetails}</span>
//               )}
//             </div>

//             {/* Exp Head */}
//             <div style={styles.fieldGroup}>
//               <label style={styles.label}>
//                 Exp. Head <span style={styles.required}>*</span>
//               </label>
//               <input
//                 type="text"
//                 name="expHead"
//                 value={formData.expHead}
//                 onChange={handleChange}
//                 placeholder="Enter Exp. Head"
//                 style={{
//                   ...styles.input,
//                   borderColor: errors.expHead ? '#e74c3c' : '#ddd',
//                 }}
//               />
//               {errors.expHead && (
//                 <span style={styles.errorMsg}>{errors.expHead}</span>
//               )}
//             </div>

//           </div>

//           {/* ---- Buttons ---- */}
//           <div style={styles.buttonRow}>

//             {/* Reset Button */}
//             <button
//               type="button"
//               onClick={handleReset}
//               style={styles.resetButton}
//             >
//               🔄 Reset
//             </button>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={submitLoading}
//               style={{
//                 ...styles.submitButton,
//                 opacity: submitLoading ? 0.7 : 1,
//                 cursor: submitLoading ? 'not-allowed' : 'pointer',
//               }}
//             >
//               {submitLoading ? '⏳ Submitting...' : '✅ Submit Payment'}
//             </button>

//           </div>

//         </form>
//       </div>
//     </div>
//   );
// };

// // ============================================================
// // Styles
// // ============================================================
// const styles = {
//   pageWrapper: {
//     minHeight: '100vh',
//     background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: '30px 15px',
//   },
//   container: {
//     background: '#ffffff',
//     borderRadius: '16px',
//     boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
//     padding: '40px',
//     width: '100%',
//     maxWidth: '860px',
//   },
//   header: {
//     marginBottom: '30px',
//     borderBottom: '2px solid #f0f0f0',
//     paddingBottom: '20px',
//   },
//   headerTitle: {
//     fontSize: '26px',
//     fontWeight: '700',
//     color: '#2c3e50',
//     margin: '0 0 6px 0',
//   },
//   headerSubtitle: {
//     fontSize: '14px',
//     color: '#7f8c8d',
//     margin: 0,
//   },
//   form: {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '20px',
//   },
//   row: {
//     display: 'grid',
//     gridTemplateColumns: '1fr 1fr',
//     gap: '20px',
//   },
//   fieldGroup: {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '6px',
//   },
//   label: {
//     fontSize: '14px',
//     fontWeight: '600',
//     color: '#34495e',
//   },
//   required: {
//     color: '#e74c3c',
//     marginLeft: '2px',
//   },
//   input: {
//     padding: '11px 14px',
//     borderRadius: '8px',
//     border: '1.5px solid #ddd',
//     fontSize: '14px',
//     color: '#2c3e50',
//     outline: 'none',
//     transition: 'border-color 0.2s',
//     background: '#fafafa',
//   },
//   select: {
//     padding: '11px 14px',
//     borderRadius: '8px',
//     border: '1.5px solid #ddd',
//     fontSize: '14px',
//     color: '#2c3e50',
//     outline: 'none',
//     background: '#fafafa',
//     cursor: 'pointer',
//   },
//   errorMsg: {
//     fontSize: '12px',
//     color: '#e74c3c',
//     marginTop: '2px',
//   },
//   buttonRow: {
//     display: 'flex',
//     justifyContent: 'flex-end',
//     gap: '14px',
//     marginTop: '10px',
//   },
//   resetButton: {
//     padding: '12px 28px',
//     borderRadius: '8px',
//     border: '1.5px solid #bdc3c7',
//     background: '#ecf0f1',
//     color: '#2c3e50',
//     fontSize: '15px',
//     fontWeight: '600',
//     cursor: 'pointer',
//   },
//   submitButton: {
//     padding: '12px 32px',
//     borderRadius: '8px',
//     border: 'none',
//     background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
//     color: '#ffffff',
//     fontSize: '15px',
//     fontWeight: '600',
//     cursor: 'pointer',
//     boxShadow: '0 4px 15px rgba(46,204,113,0.4)',
//   },
//   successAlert: {
//     background: '#d5f5e3',
//     border: '1px solid #2ecc71',
//     borderRadius: '8px',
//     padding: '14px 18px',
//     color: '#1e8449',
//     fontSize: '14px',
//     fontWeight: '500',
//     marginBottom: '10px',
//   },
//   errorAlert: {
//     background: '#fdecea',
//     border: '1px solid #e74c3c',
//     borderRadius: '8px',
//     padding: '14px 18px',
//     color: '#c0392b',
//     fontSize: '14px',
//     fontWeight: '500',
//     marginBottom: '10px',
//   },
//   loaderContainer: {
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     justifyContent: 'center',
//     minHeight: '100vh',
//     gap: '14px',
//   },
//   loader: {
//     width: '44px',
//     height: '44px',
//     border: '4px solid #f0f0f0',
//     borderTop: '4px solid #2ecc71',
//     borderRadius: '50%',
//     animation: 'spin 0.8s linear infinite',
//   },
//   loaderText: {
//     color: '#7f8c8d',
//     fontSize: '15px',
//   },
//   errorContainer: {
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     minHeight: '100vh',
//   },
//   errorText: {
//     color: '#e74c3c',
//     fontSize: '16px',
//   },
// };

// export default Advance_payment;






////



import React, { useState } from 'react';
import { useGetAdvanceDropdownDataQuery, usePostAdvancePaymentMutation } from '../../redux/advanceSlice';

const Advance_payment = () => {
  // ============================================================
  // RTK Query Hooks
  // ============================================================
  const {
    data: dropdownData,
    isLoading: dropdownLoading,
    isError: dropdownError,
  } = useGetAdvanceDropdownDataQuery();

  const [postAdvancePayment, {
    isLoading: submitLoading,
    isSuccess,
    isError: submitError,
  }] = usePostAdvancePaymentMutation();

  // ============================================================
  // Form State
  // ============================================================
  const initialState = {
    siteName: '',
    vendorFirmName: '',
    paidAmount: '',
    bankDetails: '',
    paymentMode: '',
    paymentDetails: '',
    paymentDate: '',
    expHead: '',
  };

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Dropdown Options from API
  const siteNames = dropdownData?.data?.siteNames || [];
  const vendorFirms = dropdownData?.data?.vendorFirms || [];

  // ============================================================
  // Bank Details Options
  // ============================================================
  const bankOptions = [
    'SVC Main A/C(202)',
    'SVC VENDOR PAY A/C(328)',
    'HDFC Kabir Ahuja(341)',
    'HDFC Rajeev Abott(313)',
    'HDFC Madhav Gupta (375)',
    'HDFC Scope Clg(215)',
    'ICICI RNTU(914)',
    'HDFC Alka Upadhyay(902)',
    'SVC Udit Agrawal(696)',
  ];


  // ============================================================
  // Exp. Head Options
  // ============================================================
  const expHeadOptions = [
    'Purchase',
    'Contractor',
   
  ];

  // ============================================================
  // Handle Input Change
  // ============================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // ============================================================
  // Validation
  // ============================================================
  const validateForm = () => {
    const newErrors = {};

    if (!formData.siteName) newErrors.siteName = 'Site Name is required';
    if (!formData.vendorFirmName) newErrors.vendorFirmName = 'Vendor Firm Name is required';
    if (!formData.paidAmount) newErrors.paidAmount = 'Paid Amount is required';
    if (!formData.bankDetails) newErrors.bankDetails = 'Bank Details is required';
    if (!formData.paymentMode) newErrors.paymentMode = 'Payment Mode is required';
    if (!formData.paymentDetails) newErrors.paymentDetails = 'Payment Details is required';
    if (!formData.paymentDate) newErrors.paymentDate = 'Payment Date is required';
    if (!formData.expHead) newErrors.expHead = 'Exp. Head is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // Handle Submit
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!validateForm()) return;

    try {
      const result = await postAdvancePayment(formData).unwrap();
      setSuccessMsg(`✅ ${result.message} (${result.insertedAt})`);
      setFormData(initialState);
    } catch (err) {
      setErrorMsg(`❌ Error: ${err?.data?.message || 'Something went wrong'}`);
    }
  };

  // ============================================================
  // Handle Reset
  // ============================================================
  const handleReset = () => {
    setFormData(initialState);
    setErrors({});
    setSuccessMsg('');
    setErrorMsg('');
  };

  // ============================================================
  // Dropdown Loading State
  // ============================================================
  if (dropdownLoading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.loader}></div>
        <p style={styles.loaderText}>Loading dropdown data...</p>
      </div>
    );
  }

  if (dropdownError) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorText}>❌ Failed to load dropdown data. Please refresh the page.</p>
      </div>
    );
  }

  // ============================================================
  // Render
  // ============================================================
  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>

        {/* ---- Header ---- */}
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>💰 Advance Payment Form</h2>
          <p style={styles.headerSubtitle}>Fill in the details to submit advance payment</p>
        </div>

        {/* ---- Success Message ---- */}
        {successMsg && (
          <div style={styles.successAlert}>
            {successMsg}
          </div>
        )}

        {/* ---- Error Message ---- */}
        {errorMsg && (
          <div style={styles.errorAlert}>
            {errorMsg}
          </div>
        )}

        {/* ============================================================ */}
        {/* FORM */}
        {/* ============================================================ */}
        <form onSubmit={handleSubmit} style={styles.form}>

          {/* ---- Row 1: Site Name + Vendor Firm ---- */}
          <div style={styles.row}>

            {/* Site Name Dropdown */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Site Name <span style={styles.required}>*</span>
              </label>
              <select
                name="siteName"
                value={formData.siteName}
                onChange={handleChange}
                style={{
                  ...styles.select,
                  borderColor: errors.siteName ? '#e74c3c' : '#ddd',
                }}
              >
                <option value="">-- Select Site Name --</option>
                {siteNames.map((site, index) => (
                  <option key={index} value={site}>
                    {site}
                  </option>
                ))}
              </select>
              {errors.siteName && (
                <span style={styles.errorMsg}>{errors.siteName}</span>
              )}
            </div>

            {/* Vendor Firm Dropdown */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Vendor Firm Name <span style={styles.required}>*</span>
              </label>
              <select
                name="vendorFirmName"
                value={formData.vendorFirmName}
                onChange={handleChange}
                style={{
                  ...styles.select,
                  borderColor: errors.vendorFirmName ? '#e74c3c' : '#ddd',
                }}
              >
                <option value="">-- Select Vendor Firm --</option>
                {vendorFirms.map((firm, index) => (
                  <option key={index} value={firm}>
                    {firm}
                  </option>
                ))}
              </select>
              {errors.vendorFirmName && (
                <span style={styles.errorMsg}>{errors.vendorFirmName}</span>
              )}
            </div>

          </div>

          {/* ---- Row 2: Paid Amount + Bank Details ---- */}
          <div style={styles.row}>

            {/* Paid Amount */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Paid Amount <span style={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="paidAmount"
                value={formData.paidAmount}
                onChange={handleChange}
                placeholder="Enter Paid Amount"
                style={{
                  ...styles.input,
                  borderColor: errors.paidAmount ? '#e74c3c' : '#ddd',
                }}
              />
              {errors.paidAmount && (
                <span style={styles.errorMsg}>{errors.paidAmount}</span>
              )}
            </div>

            {/* Bank Details Dropdown */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Bank Details <span style={styles.required}>*</span>
              </label>
              <select
                name="bankDetails"
                value={formData.bankDetails}
                onChange={handleChange}
                style={{
                  ...styles.select,
                  borderColor: errors.bankDetails ? '#e74c3c' : '#ddd',
                }}
              >
                <option value="">-- Select Bank --</option>
                {bankOptions.map((bank, index) => (
                  <option key={index} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
              {errors.bankDetails && (
                <span style={styles.errorMsg}>{errors.bankDetails}</span>
              )}
            </div>

          </div>

          {/* ---- Row 3: Payment Mode + Payment Date ---- */}
          <div style={styles.row}>

            {/* Payment Mode */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Payment Mode <span style={styles.required}>*</span>
              </label>
              <select
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                style={{
                  ...styles.select,
                  borderColor: errors.paymentMode ? '#e74c3c' : '#ddd',
                }}
              >
                <option value="">-- Select Payment Mode --</option>
                <option value="CASH">CASH</option>
                <option value="NEFT">NEFT</option>
                <option value="RTGS">RTGS</option>
                <option value="CHEQUE">CHEQUE</option>
            
              </select>
              {errors.paymentMode && (
                <span style={styles.errorMsg}>{errors.paymentMode}</span>
              )}
            </div>

            {/* Payment Date */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Payment Date <span style={styles.required}>*</span>
              </label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  borderColor: errors.paymentDate ? '#e74c3c' : '#ddd',
                }}
              />
              {errors.paymentDate && (
                <span style={styles.errorMsg}>{errors.paymentDate}</span>
              )}
            </div>

          </div>

          {/* ---- Row 4: Payment Details + Exp Head ---- */}
          <div style={styles.row}>

            {/* Payment Details */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Payment Details <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="paymentDetails"
                value={formData.paymentDetails}
                onChange={handleChange}
                placeholder="Enter Payment Details / Reference No."
                style={{
                  ...styles.input,
                  borderColor: errors.paymentDetails ? '#e74c3c' : '#ddd',
                }}
              />
              {errors.paymentDetails && (
                <span style={styles.errorMsg}>{errors.paymentDetails}</span>
              )}
            </div>

            {/* Exp Head Dropdown */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Exp. Head <span style={styles.required}>*</span>
              </label>
              <select
                name="expHead"
                value={formData.expHead}
                onChange={handleChange}
                style={{
                  ...styles.select,
                  borderColor: errors.expHead ? '#e74c3c' : '#ddd',
                }}
              >
                <option value="">-- Select Exp. Head --</option>
                {expHeadOptions.map((head, index) => (
                  <option key={index} value={head}>
                    {head}
                  </option>
                ))}
              </select>
              {errors.expHead && (
                <span style={styles.errorMsg}>{errors.expHead}</span>
              )}
            </div>

          </div>

          {/* ---- Buttons ---- */}
          <div style={styles.buttonRow}>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleReset}
              style={styles.resetButton}
            >
              🔄 Reset
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitLoading}
              style={{
                ...styles.submitButton,
                opacity: submitLoading ? 0.7 : 1,
                cursor: submitLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {submitLoading ? '⏳ Submitting...' : '✅ Submit Payment'}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

// ============================================================
// Styles
// ============================================================
const styles = {
  pageWrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px 15px',
  },
  container: {
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
    padding: '40px',
    width: '100%',
    maxWidth: '860px',
  },
  header: {
    marginBottom: '30px',
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: '20px',
  },
  headerTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#2c3e50',
    margin: '0 0 6px 0',
  },
  headerSubtitle: {
    fontSize: '14px',
    color: '#7f8c8d',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#34495e',
  },
  required: {
    color: '#e74c3c',
    marginLeft: '2px',
  },
  input: {
    padding: '11px 14px',
    borderRadius: '8px',
    border: '1.5px solid #ddd',
    fontSize: '14px',
    color: '#2c3e50',
    outline: 'none',
    transition: 'border-color 0.2s',
    background: '#fafafa',
  },
  select: {
    padding: '11px 14px',
    borderRadius: '8px',
    border: '1.5px solid #ddd',
    fontSize: '14px',
    color: '#2c3e50',
    outline: 'none',
    background: '#fafafa',
    cursor: 'pointer',
  },
  errorMsg: {
    fontSize: '12px',
    color: '#e74c3c',
    marginTop: '2px',
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '14px',
    marginTop: '10px',
  },
  resetButton: {
    padding: '12px 28px',
    borderRadius: '8px',
    border: '1.5px solid #bdc3c7',
    background: '#ecf0f1',
    color: '#2c3e50',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '12px 32px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(46,204,113,0.4)',
  },
  successAlert: {
    background: '#d5f5e3',
    border: '1px solid #2ecc71',
    borderRadius: '8px',
    padding: '14px 18px',
    color: '#1e8449',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '10px',
  },
  errorAlert: {
    background: '#fdecea',
    border: '1px solid #e74c3c',
    borderRadius: '8px',
    padding: '14px 18px',
    color: '#c0392b',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '10px',
  },
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '14px',
  },
  loader: {
    width: '44px',
    height: '44px',
    border: '4px solid #f0f0f0',
    borderTop: '4px solid #2ecc71',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loaderText: {
    color: '#7f8c8d',
    fontSize: '15px',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: '16px',
  },
};

export default Advance_payment;