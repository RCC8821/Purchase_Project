// import React, { useState, useEffect } from 'react';
// import { Search, User, FileText, ShoppingCart, DollarSign, Package, Truck, Receipt, CreditCard, ChevronDown, LogOut, Menu, Bell, X } from 'lucide-react';
// import { useNavigate, useLocation } from 'react-router-dom';

// // Placeholder components (replace with actual imports in your project)
// import RequirementReceived from '../components/purchase/RequirementReceived';
// import ApproveRequired from '../components/purchase/ApproveRequired';
// import IndentToGetQuotation from '../components/purchase/IndentToGetQuotation';
// import BillingFMS from '../components/BillingFMS';
// import Take_Quotation from '../components/purchase/Take_Quotation';
// import Approval_Quotation from '../components/purchase/Approval_Quotation';
// import PO from '../components/purchase/PO';
// import Vendor_FollowUp_Material from '../components/purchase/Vendor_FollowUp_Material';
// import Material_Received from '../components/purchase/Material_Received';
// import Final_Material_Received from '../components/purchase/Final_Material_Received';
// import MRN from '../components/purchase/MRN';
// import BillCheckedData from '../components/purchase/BillCheckedData';
// //  billing components 

// import Vendor_followup_billing from '../components/purchase/Vendor_followup_billing';
// import Bill_Processing from '../components/purchase/Bill_Processing';
// import BillTallyData from '../components/purchase/BillTallyData';



// const Dashboard = () => {
//   const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
//   const [isPurchaseDropdownOpen, setIsPurchaseDropdownOpen] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [userType, setUserType] = useState(null);
//   const [selectedPage, setSelectedPage] = useState('no-access');
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Load userType from local storage on component mount and set default to Purchase FMS
//   useEffect(() => {
//     const storedUserType = localStorage.getItem('userType');
//     if (storedUserType) {
//       setUserType(storedUserType);
//       const purchasePages = getPurchasePages();
//       if (purchasePages.length > 0) {
//         const defaultPage = purchasePages[0].id;
//         setSelectedPage(defaultPage);
//         // Navigate to default page only if not already on a valid route
//         if (!purchasePages.some(page => location.pathname === page.path)) {
//           navigate(purchasePages[0].path);
//         }
//       }
//     } else {
//       setSelectedPage('no-access');
//       navigate('/');
//     }
//   }, [navigate, location.pathname]);

//   // Sync selectedPage with current route
//   useEffect(() => {
//     const purchasePages = getPurchasePages();
//     const allPages = [...purchasePages, ...menuItems.find(m => m.id === 'billing-fms')?.pages || []];
//     const currentPage = allPages.find(page => location.pathname === page.path);
//     if (currentPage) {
//       setSelectedPage(currentPage.id);
//     } else if (!purchasePages.length && userType) {
//       setSelectedPage('no-access');
//     }
//   }, [location.pathname, userType]);

//   const allPurchasePages = [
//     {
//       id: 'requirement-received',
//       name: 'Requirement Received',
//       icon: FileText,
//       component: RequirementReceived,
//       path: '/dashboard/requirement-received',
//       allowedUserTypes: ['admin', 'Anish'],
//     },
//     {
//       id: 'approve-required',
//       name: 'Approve Required',
//       icon: Package,
//       component: ApproveRequired,
//       path: '/dashboard/approve-required',
//       allowedUserTypes: ['admin', 'Aakash Chouhan'],
//     },
//     {
//       id: 'indent-to-get-quotation',
//       name: 'Indent (To Get Quotation)',
//       icon: Truck,
//       component: IndentToGetQuotation,
//       path: '/dashboard/indent-to-get-quotation',
//       allowedUserTypes: ['admin', 'Ravi Rajak'],
//     },
//     {
//       id: 'Take_Quotation',
//       name: 'Take Quotation',
//       icon: Truck,
//       component: Take_Quotation,
//       path: '/dashboard/Take_Quotation',
//       allowedUserTypes: ['admin', 'Anjali Malviya'],
//     },
//     {
//       id: 'Approval_Quotation',
//       name: 'Approval Quotation',
//       icon: Truck,
//       component: Approval_Quotation,
//       path: '/dashboard/Approval_Quotation',
//       allowedUserTypes: ['admin', 'Ravi Rajak'],
//     },
//     {
//       id: 'PO',
//       name: 'PO',
//       icon: Truck,
//       component: PO,
//       path: '/dashboard/PO',
//       allowedUserTypes: ['admin', 'Ravi Rajak'],
//     },
//     {
//       id: 'Vendor_FollowUp_Material',
//       name: 'Vendor Follow Up Material',
//       icon: Truck,
//       component: Vendor_FollowUp_Material,
//       path: '/dashboard/Vendor_FollowUp_Material',
//       allowedUserTypes: ['admin', 'Neha Masani'],
//     },
//     {
//       id: 'Material_Received',
//       name: 'Material Received',
//       icon: Truck,
//       component: Material_Received,
//       path: '/dashboard/Material_Received',
//       allowedUserTypes: ['admin', 'Gourav Singh','Anish'],
//     },
//     {
//       id: 'Final_Material_Received',
//       name: 'Final Material Received',
//       icon: Truck,
//       component: Final_Material_Received,
//       path: '/dashboard/Final_Material_Received',
//       allowedUserTypes: ['admin', 'Aakash Chouhan'],
//     },
//     {
//       id: 'MRN',
//       name: 'MRN',
//       icon: Truck,
//       component: MRN,
//       path: '/dashboard/MRN',
//       allowedUserTypes: ['admin', 'Somesh Chadhar'],
//     },

//     // /////  Billing pages 

//     {
//       id: 'Vendor_followup_billing',
//       name: 'Vendor_followup_billing',
//       icon: Truck,
//       component: Vendor_followup_billing,
//       path: '/dashboard/Vendor_followup_billing',
//       allowedUserTypes: ['admin', 'Neha Masani'],
//     },

//       {
//       id: 'Bill_Processing',
//       name: 'Bill_Processing',
//       icon: Truck,
//       component:Bill_Processing,
//       path: '/dashboard/Bill_Processing',
//       allowedUserTypes: ['admin', 'Somesh Chadhar'],
//     },
//        {
//       id: 'BillCheckedData',
//       name: 'BillCheckedData',
//       icon: Truck,
//       component:BillCheckedData,
//       path: '/dashboard/BillCheckedData',
//       allowedUserTypes: ['admin', 'Abhishek Sharma'],
//     },
//     {
//       id: 'BillTallyData',
//       name: 'BillTallyData',
//       icon: Truck,
//       component:BillTallyData,
//       path: '/dashboard/BillTallyData',
//       allowedUserTypes: ['admin','Govind Ram Nagar'],
//     },
//   ];

//   const getPurchasePages = () => {
//     if (!userType) return [];
//     return allPurchasePages.filter(page => page.allowedUserTypes.includes(userType));
//   };

//   const menuItems = [
//     {
//       id: 'purchase-fms',
//       name: 'Purchase FMS',
//       icon: ShoppingCart,
//       path: null, // No direct navigation, acts as dropdown trigger
//       pages: getPurchasePages(),
//     },
//     // {
//     //   id: 'billing-fms',
//     //   name: 'Billing FMS',
//     //   icon: DollarSign,
//     //   path: '/dashboard/invoice-generation',
//     //   pages: [
//     //     { id: 'invoice-generation', name: 'Invoice Generation', icon: Receipt, component: BillingFMS, path: '/dashboard/invoice-generation' },
//     //     { id: 'payment-tracking', name: 'Payment Tracking', icon: CreditCard, component: BillingFMS, path: '/dashboard/payment-tracking' },
//     //     { id: 'customer-billing', name: 'Customer Billing', icon: User, component: BillingFMS, path: '/dashboard/customer-billing' },
//     //     { id: 'financial-reports', name: 'Financial Reports', icon: FileText, component: BillingFMS, path: '/dashboard/financial-reports' },
//     //   ],
//     // },
//     {
//   id: 'Sheet-Link',
//   name: 'Sheet Link',
//   icon: FileText, // Ya jo icon chahiye, DollarSign se change kar sakte hain
//   url: 'https://docs.google.com/spreadsheets/d/18bmeQLqAOqleKS9628izEnirrRwOqkC0G_pEYGOsO-Y/edit?gid=0#gid=0', // <-- Apna Sheet URL yahan daalein
//   pages: [], // Khali rakhein ya null
// }
//   ];

//   const pageContent = {
//     'requirement-received': { title: 'Requirement Form', content: 'View and manage received procurement requirements.' },
//     'approve-required': { title: 'Approve Required', content: 'Review and approve required requests.' },
//     'indent-to-get-quotation': { title: 'Indent (To Get Quotation)', content: 'Manage indents to request quotations.' },
//     'Take_Quotation': { title: 'Take Quotation', content: 'Create and manage invoices, automated billing cycles, and invoice templates.' },
//     'Approval_Quotation': { title: 'Approval Quotation', content: 'Monitor payment status, overdue accounts, and payment reconciliation.' },
//     'PO': { title: 'PO', content: 'Customer account management, billing history, and payment collection.' },
//     'Vendor_FollowUp_Material': { title: 'Vendor Follow Up Material', content: 'Financial analytics, revenue reports, and accounting summaries.' },
//     'Material_Received': { title: 'Material Received', content: 'Financial analytics, revenue reports, and accounting summaries.' },
//     'Final_Material_Received': { title: 'Final Material Received', content: 'Financial analytics, revenue reports, and accounting summaries.' },
//     'MRN': { title: 'MRN', content: 'MRN, revenue reports, and accounting summaries.' },
//     'Vendor_followup_billing': { title: 'Vendor_followup_billing', content: 'You do not have permission to access any Purchase FMS pages.' },
//     'Bill_Processing': { title: 'Bill_Processing', content: 'You do not have permission to access any Purchase FMS pages.' },
//     'BillCheckedData': { title: 'BillCheckedData', content: 'You do not have permission to access any Purchase FMS pages.' },
//     'BillTallyData': { title: 'BillTallyData', content: 'You do not have permission to access any BillTallyData FMS pages.' },
//     'no-access': { title: 'No Access', content: 'You do not have permission to access any Purchase FMS pages.' },
//     'invoice-generation': { title: 'Invoice Generation', content: 'Generate and manage invoices.' },
//     'payment-tracking': { title: 'Payment Tracking', content: 'Track payment statuses.' },
//     'customer-billing': { title: 'Customer Billing', content: 'Manage customer billing.' },
//     'financial-reports': { title: 'Financial Reports', content: 'View financial summaries.' },
//   };

//   const selectPage = (pageId) => {
//     setSelectedPage(pageId);
//     setIsPurchaseDropdownOpen(false);
//     setIsMobileMenuOpen(false);
//     const purchasePages = getPurchasePages();
//     const page = [...purchasePages, ...menuItems.find(m => m.id === 'billing-fms')?.pages || []].find(p => p.id === pageId);
//     if (page) navigate(page.path);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('userType');
//     setUserType(null);
//     setSelectedPage('no-access');
//     navigate('/');
//   };

//   const getCurrentComponent = () => {
//     for (const menu of menuItems) {
//       if (menu.pages) {
//         const page = menu.pages.find((p) => p.id === selectedPage);
//         if (page) return page.component;
//       }
//     }
//     return null;
//   };

//   const CurrentComponent = getCurrentComponent();

//   const togglePurchaseDropdown = () => {
//     setIsPurchaseDropdownOpen(!isPurchaseDropdownOpen);
//   };

//   const isPageAllowed = () => {
//     const purchasePages = getPurchasePages();
//     const billingPages = menuItems.find(m => m.id === 'billing-fms')?.pages || [];
//     return [...purchasePages, ...billingPages].some(page => page.id === selectedPage);
//   };

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* Sidebar */}
//       <div
//         className={`${
//           isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
//         } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 bg-white shadow-xl transform transition-all duration-300 ease-in-out ${
//           isSidebarExpanded ? 'lg:w-64' : 'lg:w-20'
//         }`}
//         onMouseEnter={() => setIsSidebarExpanded(true)}
//         onMouseLeave={() => setIsSidebarExpanded(false)}
//       >
//         <div className="flex flex-col h-full">
//           <div
//             className={`flex items-center p-6 border-b border-gray-100 transition-all duration-300 ${
//               isSidebarExpanded ? 'justify-between' : 'lg:justify-center'
//             }`}
//           >
//             <div className="flex items-center space-x-3">
//   <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
//     <img src="/rcc-logo.png" alt="RCC logo" className="w-full h-full object-contain" />
//   </div>
//   <h1
//     className={`text-xl font-bold text-gray-800 transition-all duration-300 whitespace-nowrap ${
//       isSidebarExpanded ? 'lg:opacity-100' : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'
//     }`}
//   >
//     RCC FMS
//   </h1>
// </div>
//             <button
//               onClick={() => setIsMobileMenuOpen(false)}
//               className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
//             >
//               <X className="w-6 h-6 text-gray-500" />
//             </button>
//           </div>
//           <nav className="flex-1 p-4">
//             <ul className="space-y-2">
//               {menuItems.map((menu) => (
//   <li key={menu.id} className="relative">
//     <button
//       onClick={() => {
//         if (menu.url) {
//           // External URL open in new tab
//           window.open(menu.url, '_blank', 'noopener,noreferrer');
//         } else if (menu.id === 'purchase-fms' && menu.pages.length > 0) {
//           togglePurchaseDropdown();
//         } else if (menu.path) {
//           selectPage(menu.id);
//         }
//       }}
//       className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
//         selectedPage === menu.id || (menu.pages && menu.pages.some(p => p.id === selectedPage))
//           ? 'bg-blue-50 text-blue-600 border border-blue-200'
//           : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
//       } ${!isSidebarExpanded ? 'lg:justify-center' : ''}`}
//       title={!isSidebarExpanded ? menu.name : ''}
//     >
//       <menu.icon className="w-5 h-5 flex-shrink-0" />
//       <span
//         className={`font-medium transition-all duration-300 whitespace-nowrap ${
//           isSidebarExpanded
//             ? 'lg:opacity-100'
//             : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'
//         }`}
//       >
//         {menu.name}
//       </span>
//       {menu.pages && menu.pages.length > 0 && isSidebarExpanded && (
//         <ChevronDown
//           className={`w-4 h-4 ml-auto transition-transform duration-200 ${
//             isPurchaseDropdownOpen && menu.id === 'purchase-fms' ? 'rotate-180' : ''
//           }`}
//         />
//       )}
//       {!isSidebarExpanded && (
//         <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap hidden lg:block">
//           {menu.name}
//         </div>
//       )}
//     </button>

//     {/* Dropdown sirf purchase-fms ke liye */}
//     {isSidebarExpanded && menu.pages && menu.pages.length > 0 && isPurchaseDropdownOpen && menu.id === 'purchase-fms' && (
//       <ul className="ml-6 mt-2 space-y-1 bg-white border border-gray-200 rounded-lg shadow-md">
//         {menu.pages.map((page) => (
//           <li key={page.id}>
//             <button
//               onClick={() => selectPage(page.id)}
//               className={`w-full flex items-center space-x-3 px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
//                 selectedPage === page.id
//                   ? 'bg-blue-100 text-blue-700'
//                   : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
//               }`}
//             >
//               <page.icon className="w-4 h-4 flex-shrink-0" />
//               <span className="truncate">{page.name}</span>
//             </button>
//           </li>
//         ))}
//       </ul>
//     )}
//   </li>
// ))}
//             </ul>
//           </nav>
//           <div className="p-4 border-t border-gray-100">
//             <div
//               className={`flex items-center mb-4 transition-all duration-300 ${
//                 isSidebarExpanded ? 'space-x-3' : 'lg:justify-center lg:space-x-0'
//               }`}
//             >
//               <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
//                 <User className="w-5 h-5 text-white" />
//               </div>
//               <div
//                 className={`transition-all duration-300 whitespace-nowrap ${
//                   isSidebarExpanded
//                     ? 'lg:opacity-100'
//                     : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'
//                 }`}
//               >
//                 <p className="font-semibold text-gray-800">{userType || 'Guest'}</p>
//                 <p className="text-sm text-gray-600">{userType === 'admin' ? 'Admin' : 'User'}</p>
//               </div>
//             </div>
//             <button
//               onClick={handleLogout}
//               className={`w-full flex items-center px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 group relative ${
//                 isSidebarExpanded ? 'space-x-3' : 'lg:justify-center lg:space-x-0'
//               }`}
//               title={!isSidebarExpanded ? 'Logout' : ''}
//             >
//               <LogOut className="w-5 h-5 flex-shrink-0" />
//               <span
//                 className={`font-medium transition-all duration-300 whitespace-nowrap ${
//                   isSidebarExpanded
//                     ? 'lg:opacity-100'
//                     : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'
//                 }`}
//               >
//                 Logout
//               </span>
//               {!isSidebarExpanded && (
//                 <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap hidden lg:block">
//                   Logout
//                 </div>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <header className="bg-white shadow-sm border-b border-gray-100 p-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <button
//                 onClick={() => setIsMobileMenuOpen(true)}
//                 className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
//               >
//                 <Menu className="w-6 h-6 text-gray-600" />
//               </button>
//             </div>
//             <div className="flex items-center space-x-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search modules, reports, or data..."
//                   className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//               <button className="relative p-2 rounded-xl hover:bg-gray-100">
//                 <Bell className="w-6 h-6 text-gray-600" />
//                 <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
//               </button>
//             </div>
//           </div>
//         </header>
//         <main className="flex-1 overflow-auto p-6">
//           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//               <div>
//                 <h3 className="text-xl font-bold text-gray-800">
//                   {pageContent[selectedPage]?.title || 'Page Not Found'}
//                 </h3>
//                 <div className="mt-2 h-1 w-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
//               </div>
//               {menuItems.find((menu) => menu.id === 'purchase-fms')?.pages.length > 0 && isPageAllowed() && (
//                 <div className="relative">
//                   <button
//                     onClick={togglePurchaseDropdown}
//                     className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200"
//                   >
//                     <span>Select Page</span>
//                     <ChevronDown
//                       className={`w-4 h-4 transition-transform duration-200 ${
//                         isPurchaseDropdownOpen ? 'rotate-180' : ''
//                       }`}
//                     />
//                   </button>
//                   {isPurchaseDropdownOpen && (
//                     <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-10">
//                       {menuItems
//                         .find((menu) => menu.id === 'purchase-fms')
//                         ?.pages.map((page) => (
//                           <button
//                             key={page.id}
//                             onClick={() => selectPage(page.id)}
//                             className={`w-full flex items-center space-x-3 px-4 py-3 text-sm transition-all duration-200 ${
//                               selectedPage === page.id
//                                 ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-500'
//                                 : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
//                             }`}
//                           >
//                             <page.icon className="w-4 h-4 flex-shrink-0" />
//                             <span className="truncate">{page.name}</span>
//                           </button>
//                         ))}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//             <p className="text-gray-600 mb-6">
//               {pageContent[selectedPage]?.content || 'Content not available for this page.'}
//             </p>
//             <div className="min-h-[400px]">
//               {CurrentComponent ? (
//                 <CurrentComponent selectedPage={selectedPage} />
//               ) : (
//                 <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
//                   <div className="text-center">
//                     <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//                     <p className="text-gray-500 text-lg">You do not have access to this page.</p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </main>
//       </div>

//       {/* Mobile Menu Overlay */}
//       {isMobileMenuOpen && (
//         <div
//           className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
//           onClick={() => setIsMobileMenuOpen(false)}
//         ></div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;






import React, { useState, useEffect } from 'react';
import { Search, User, FileText, ShoppingCart, DollarSign, Package, Truck, Receipt, CreditCard, ChevronDown, LogOut, Menu, Bell, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

import RequirementReceived from '../components/purchase/RequirementReceived';
import ApproveRequired from '../components/purchase/ApproveRequired';
import IndentToGetQuotation from '../components/purchase/IndentToGetQuotation';
import BillingFMS from '../components/BillingFMS';
import Take_Quotation from '../components/purchase/Take_Quotation';
import Approval_Quotation from '../components/purchase/Approval_Quotation';
import PO from '../components/purchase/PO';
import Vendor_FollowUp_Material from '../components/purchase/Vendor_FollowUp_Material';
import Material_Received from '../components/purchase/Material_Received';
import Final_Material_Received from '../components/purchase/Final_Material_Received';
import MRN from '../components/purchase/MRN';
import BillCheckedData from '../components/purchase/BillCheckedData';
import Vendor_followup_billing from '../components/purchase/Vendor_followup_billing';
import Bill_Processing from '../components/purchase/Bill_Processing';
import BillTallyData from '../components/purchase/BillTallyData';

const Dashboard = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isPurchaseDropdownOpen, setIsPurchaseDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userType, setUserType] = useState(null);
  const [selectedPage, setSelectedPage] = useState('no-access');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUserType = localStorage.getItem('userType');
    if (storedUserType) {
      setUserType(storedUserType);
      const purchasePages = getPurchasePages();
      if (purchasePages.length > 0) {
        const defaultPage = purchasePages[0].id;
        setSelectedPage(defaultPage);
        if (!purchasePages.some(page => location.pathname === page.path)) {
          navigate(purchasePages[0].path);
        }
      }
    } else {
      setSelectedPage('no-access');
      navigate('/');
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    const purchasePages = getPurchasePages();
    const allPages = [...purchasePages, ...menuItems.find(m => m.id === 'billing-fms')?.pages || []];
    const currentPage = allPages.find(page => location.pathname === page.path);
    if (currentPage) {
      setSelectedPage(currentPage.id);
    } else if (!purchasePages.length && userType) {
      setSelectedPage('no-access');
    }
  }, [location.pathname, userType]);

  const allPurchasePages = [
    { id: 'requirement-received', name: 'Requirement Received', icon: FileText, component: RequirementReceived, path: '/dashboard/requirement-received', allowedUserTypes: ['admin', 'Anish'] },
    { id: 'approve-required', name: 'Approve Required', icon: Package, component: ApproveRequired, path: '/dashboard/approve-required', allowedUserTypes: ['admin', 'Aakash Chouhan'] },
    { id: 'indent-to-get-quotation', name: 'Indent (To Get Quotation)', icon: Truck, component: IndentToGetQuotation, path: '/dashboard/indent-to-get-quotation', allowedUserTypes: ['admin', 'Ravi Rajak'] },
    { id: 'Take_Quotation', name: 'Take Quotation', icon: Truck, component: Take_Quotation, path: '/dashboard/Take_Quotation', allowedUserTypes: ['admin', 'Anjali Malviya'] },
    { id: 'Approval_Quotation', name: 'Approval Quotation', icon: Truck, component: Approval_Quotation, path: '/dashboard/Approval_Quotation', allowedUserTypes: ['admin', 'Ravi Rajak'] },
    { id: 'PO', name: 'PO', icon: Truck, component: PO, path: '/dashboard/PO', allowedUserTypes: ['admin', 'Ravi Rajak'] },
    { id: 'Vendor_FollowUp_Material', name: 'Vendor Follow Up Material', icon: Truck, component: Vendor_FollowUp_Material, path: '/dashboard/Vendor_FollowUp_Material', allowedUserTypes: ['admin', 'Neha Masani'] },
    { id: 'Material_Received', name: 'Material Received', icon: Truck, component: Material_Received, path: '/dashboard/Material_Received', allowedUserTypes: ['admin', 'Gourav Singh','Anish'] },
    { id: 'Final_Material_Received', name: 'Final Material Received', icon: Truck, component: Final_Material_Received, path: '/dashboard/Final_Material_Received', allowedUserTypes: ['admin', 'Aakash Chouhan'] },
    { id: 'MRN', name: 'MRN', icon: Truck, component: MRN, path: '/dashboard/MRN', allowedUserTypes: ['admin', 'Somesh Chadhar'] },
    { id: 'Vendor_followup_billing', name: 'Vendor_followup_billing', icon: Truck, component: Vendor_followup_billing, path: '/dashboard/Vendor_followup_billing', allowedUserTypes: ['admin', 'Neha Masani'] },
    { id: 'Bill_Processing', name: 'Bill_Processing', icon: Truck, component: Bill_Processing, path: '/dashboard/Bill_Processing', allowedUserTypes: ['admin', 'Somesh Chadhar'] },
    { id: 'BillCheckedData', name: 'BillCheckedData', icon: Truck, component: BillCheckedData, path: '/dashboard/BillCheckedData', allowedUserTypes: ['admin', 'Abhishek Sharma'] },
    { id: 'BillTallyData', name: 'BillTallyData', icon: Truck, component: BillTallyData, path: '/dashboard/BillTallyData', allowedUserTypes: ['admin','Govind Ram Nagar'] },
  ];

  const getPurchasePages = () => {
    if (!userType) return [];
    return allPurchasePages.filter(page => page.allowedUserTypes.includes(userType));
  };

  const menuItems = [
    { id: 'purchase-fms', name: 'Purchase FMS', icon: ShoppingCart, path: null, pages: getPurchasePages() },
    { id: 'Sheet-Link', name: 'Sheet Link', icon: FileText, url: 'https://docs.google.com/spreadsheets/d/18bmeQLqAOqleKS9628izEnirrRwOqkC0G_pEYGOsO-Y/edit?gid=0#gid=0', pages: [] }
  ];

  const pageContent = {
    'requirement-received': { title: 'Requirement Form', content: 'View and manage received procurement requirements.' },
    'approve-required': { title: 'Approve Required', content: 'Review and approve required requests.' },
    'indent-to-get-quotation': { title: 'Indent (To Get Quotation)', content: 'Manage indents to request quotations.' },
    'Take_Quotation': { title: 'Take Quotation', content: 'Create and manage invoices, automated billing cycles, and invoice templates.' },
    'Approval_Quotation': { title: 'Approval Quotation', content: 'Monitor payment status, overdue accounts, and payment reconciliation.' },
    'PO': { title: 'PO', content: 'Customer account management, billing history, and payment collection.' },
    'Vendor_FollowUp_Material': { title: 'Vendor Follow Up Material', content: 'Financial analytics, revenue reports, and accounting summaries.' },
    'Material_Received': { title: 'Material Received', content: 'Financial analytics, revenue reports, and accounting summaries.' },
    'Final_Material_Received': { title: 'Final Material Received', content: 'Financial analytics, revenue reports, and accounting summaries.' },
    'MRN': { title: 'MRN', content: 'MRN, revenue reports, and accounting summaries.' },
    'Vendor_followup_billing': { title: 'Vendor_followup_billing', content: 'You do not have permission to access any Purchase FMS pages.' },
    'Bill_Processing': { title: 'Bill_Processing', content: 'You do not have permission to access any Purchase FMS pages.' },
    'BillCheckedData': { title: 'BillCheckedData', content: 'You do not have permission to access any Purchase FMS pages.' },
    'BillTallyData': { title: 'BillTallyData', content: 'You do not have permission to access any BillTallyData FMS pages.' },
    'no-access': { title: 'No Access', content: 'You do not have permission to access any Purchase FMS pages.' },
  };

  const selectPage = (pageId) => {
    setSelectedPage(pageId);
    setIsPurchaseDropdownOpen(false);
    setIsMobileMenuOpen(false);
    const purchasePages = getPurchasePages();
    const page = [...purchasePages, ...menuItems.find(m => m.id === 'billing-fms')?.pages || []].find(p => p.id === pageId);
    if (page) navigate(page.path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    setUserType(null);
    setSelectedPage('no-access');
    navigate('/');
  };

  const getCurrentComponent = () => {
    for (const menu of menuItems) {
      if (menu.pages) {
        const page = menu.pages.find((p) => p.id === selectedPage);
        if (page) return page.component;
      }
    }
    return null;
  };

  const CurrentComponent = getCurrentComponent();
  const togglePurchaseDropdown = () => setIsPurchaseDropdownOpen(!isPurchaseDropdownOpen);
  const isPageAllowed = () => [...getPurchasePages(), ...menuItems.find(m => m.id === 'billing-fms')?.pages || []].some(page => page.id === selectedPage);

  return (
    <div className="flex h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Sidebar */}
      <div
        className={`${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 bg-gradient-to-b from-indigo-900 to-indigo-800 shadow-2xl transform transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? 'lg:w-64' : 'lg:w-20'
        }`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        <div className="flex flex-col h-full">
          <div className={`flex items-center p-6 border-b border-indigo-700 transition-all duration-300 ${isSidebarExpanded ? 'justify-between' : 'lg:justify-center'}`}>
            <div className="flex items-center space-x-3">
              {/* FIXED: No blue background */}
              <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center overflow-hidden">
                <img src="/rcc-logo.png" alt="RCC logo" className="w-10 h-10 object-contain" />
              </div>
              <h1 className={`text-xl font-bold text-white transition-all duration-300 whitespace-nowrap ${isSidebarExpanded ? 'lg:opacity-100' : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'}`}>
                RCC FMS
              </h1>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-white/10">
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((menu) => (
                <li key={menu.id} className="relative">
                  <button
                    onClick={() => {
                      if (menu.url) window.open(menu.url, '_blank', 'noopener,noreferrer');
                      else if (menu.id === 'purchase-fms' && menu.pages.length > 0) togglePurchaseDropdown();
                      else if (menu.path) selectPage(menu.id);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative text-white/90 hover:bg-white/10 hover:text-white ${
                      selectedPage === menu.id || (menu.pages && menu.pages.some(p => p.id === selectedPage))
                        ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50'
                        : ''
                    } ${!isSidebarExpanded ? 'lg:justify-center' : ''}`}
                    title={!isSidebarExpanded ? menu.name : ''}
                  >
                    <menu.icon className="w-5 h-5 flex-shrink-0" />
                    <span className={`font-medium transition-all duration-300 whitespace-nowrap ${isSidebarExpanded ? 'lg:opacity-100' : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'}`}>
                      {menu.name}
                    </span>
                    {menu.pages && menu.pages.length > 0 && isSidebarExpanded && (
                      <ChevronDown className={`w-4 h-4 ml-auto transition-transform duration-200 ${isPurchaseDropdownOpen && menu.id === 'purchase-fms' ? 'rotate-180' : ''}`} />
                    )}
                  </button>

                  {isSidebarExpanded && menu.pages && menu.pages.length > 0 && isPurchaseDropdownOpen && menu.id === 'purchase-fms' && (
                    <ul className="ml-6 mt-2 space-y-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg shadow-md">
                      {menu.pages.map((page) => (
                        <li key={page.id}>
                          <button
                            onClick={() => selectPage(page.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-2 text-sm rounded-lg transition-all duration-200 text-white/80 hover:bg-white/10 ${
                              selectedPage === page.id ? 'bg-cyan-500/30 text-cyan-200' : ''
                            }`}
                          >
                            <page.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{page.name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-indigo-700">
            <div className={`flex items-center mb-4 transition-all duration-300 ${isSidebarExpanded ? 'space-x-3' : 'lg:justify-center lg:space-x-0'}`}>
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className={`transition-all duration-300 whitespace-nowrap ${isSidebarExpanded ? 'lg:opacity-100' : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'}`}>
                <p className="font-semibold text-white">{userType || 'Guest'}</p>
                <p className="text-sm text-indigo-200">{userType === 'admin' ? 'Admin' : 'User'}</p>
              </div>
            </div>
            <button onClick={handleLogout} className={`w-full flex items-center px-4 py-3 rounded-xl text-pink-300 hover:bg-pink-500/20 transition-all duration-200 group relative ${isSidebarExpanded ? 'space-x-3' : 'lg:justify-center lg:space-x-0'}`}>
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className={`font-medium transition-all duration-300 whitespace-nowrap ${isSidebarExpanded ? 'lg:opacity-100' : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'}`}>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-indigo-100 p-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-indigo-50">
              <Menu className="w-6 h-6 text-indigo-700" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Search modules, reports, or data..." className="pl-10 pr-4 py-2 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <button className="relative p-2 rounded-xl hover:bg-indigo-50">
                <Bell className="w-6 h-6 text-indigo-700" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-indigo-100">
            
            {/* FIXED: Title + Select Page together at top */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-indigo-100">
              <div>
                <h3 className="text-2xl font-bold text-indigo-900">
                  {pageContent[selectedPage]?.title || 'Page Not Found'}
                </h3>
                <div className="mt-2 h-1 w-20 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full"></div>
                <p className="text-gray-600 mt-3">
                  {pageContent[selectedPage]?.content || 'Content not available for this page.'}
                </p>
              </div>

              {/* FIXED: Select Page at top-right */}
              {menuItems.find(m => m.id === 'purchase-fms')?.pages.length > 0 && isPageAllowed() && (
                <div className="relative">
                  <button
                    onClick={togglePurchaseDropdown}
                    className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-md font-medium"
                  >
                    Select Page
                    <ChevronDown className={`w-4 h-4 transition-transform ${isPurchaseDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isPurchaseDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-indigo-200 rounded-xl shadow-2xl z-10">
                      {getPurchasePages().map((page) => (
                        <button
                          key={page.id}
                          onClick={() => selectPage(page.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 text-sm transition-all ${
                            selectedPage === page.id
                              ? 'bg-gradient-to-r from-pink-100 to-indigo-100 text-indigo-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <page.icon className="w-4 h-4" />
                          <span>{page.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Page Content */}
            <div className="min-h-[400px]">
              {CurrentComponent ? (
                <CurrentComponent selectedPage={selectedPage} />
              ) : (
                <div className="flex items-center justify-center h-64 bg-gradient-to-br from-pink-50 to-indigo-50 rounded-xl border-2 border-dashed border-indigo-200">
                  <div className="text-center">
                    <Package className="mx-auto h-12 w-12 text-indigo-400 mb-4" />
                    <p className="text-indigo-700 text-lg font-medium">You do not have access to this page.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}
    </div>
  );
};

export default Dashboard;