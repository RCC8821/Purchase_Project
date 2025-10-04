import { useState, useEffect } from 'react';
import { Search, User, FileText, ShoppingCart, DollarSign, Package, Truck, Receipt, CreditCard, ChevronDown, LogOut, Menu, Bell, Settings } from 'lucide-react';
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
import { useLocation, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isPurchaseDropdownOpen, setIsPurchaseDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userType, setUserType] = useState(null);
  const [selectedPage, setSelectedPage] = useState('no-access');

  const navigate = useNavigate();

  // Load userType from local storage on component mount
  useEffect(() => {
    const storedUserType = localStorage.getItem('userType');
    if (storedUserType) {
      setUserType(storedUserType);
      // Set the first allowed page as the default selected page
      const purchasePages = getPurchasePages();
      if (purchasePages.length > 0) {
        setSelectedPage(purchasePages[0].id);
        navigate(purchasePages[0].path);
      }
    }
  }, []);

  const allPurchasePages = [
    {
      id: 'requirement-received',
      name: 'Requirement Received',
      icon: <FileText className="w-4 h-4" />,
      component: RequirementReceived,
      path: '/dashboard/requirement-received',
      allowedUserTypes: ['admin', 'Anish'],
    },
    {
      id: 'approve-required',
      name: 'Approve Required',
      icon: <Package className="w-4 h-4" />,
      component: ApproveRequired,
      path: '/dashboard/approve-required',
      allowedUserTypes: ['admin','Ravindra Singh'],
    },
    {
      id: 'indent-to-get-quotation',
      name: 'Indent (To Get Quotation)',
      icon: <Truck className="w-4 h-4" />,
      component: IndentToGetQuotation,
      path: '/dashboard/indent-to-get-quotation',
      allowedUserTypes: ['admin', 'Ravi Rajak'],
    },
    {
      id: 'Take_Quotation',
      name: 'Take_Quotation',
      icon: <Truck className="w-4 h-4" />,
      component: Take_Quotation,
      path: '/dashboard/Take_Quotation',
      allowedUserTypes: ['admin', 'Anjali Malviya'],
    },
    {
      id: 'Approval_Quotation',
      name: 'Approval_Quotation',
      icon: <Truck className="w-4 h-4" />,
      component: Approval_Quotation,
      path: '/dashboard/Approval_Quotation',
      allowedUserTypes: ['admin', 'Ravi Rajak'],
    },
    {
      id: 'PO',
      name: 'PO',
      icon: <Truck className="w-4 h-4" />,
      component: PO,
      path: '/dashboard/PO',
      allowedUserTypes: ['admin', 'Ravi Rajak'],
    },
    {
      id: 'Vendor_FollowUp_Material',
      name: 'Vendor_FollowUp_Material',
      icon: <Truck className="w-4 h-4" />,
      component: Vendor_FollowUp_Material,
      path: '/dashboard/Vendor_FollowUp_Material',
      allowedUserTypes: ['admin', 'Neha Masani'],
    },
    {
      id: 'Material_Received',
      name: 'Material_Received',
      icon: <Truck className="w-4 h-4" />,
      component: Material_Received,
      path: '/dashboard/Material_Received',
      allowedUserTypes: ['admin', 'Gourav Singh'],
    },
    {
      id: 'Final_Material_Received',
      name: 'Final_Material_Received',
      icon: <Truck className="w-4 h-4" />,
      component: Final_Material_Received,
      path: '/dashboard/Final_Material_Received',
      allowedUserTypes: ['admin', 'Ravi Rajak'],
    },
    {
      id: 'MRN',
      name: 'MRN',
      icon: <Truck className="w-4 h-4" />,
      component: MRN,
      path: '/dashboard/MRN',
      allowedUserTypes: ['admin', 'Somesh Chadhar'],
    },
  ];

  const getPurchasePages = () => {
    if (!userType) return [];
    return allPurchasePages.filter(page => page.allowedUserTypes.includes(userType));
  };

  const menuItems = [
    {
      id: 'purchase-fms',
      name: 'Purchase FMS',
      icon: <ShoppingCart className="w-4 h-4" />,
      path: getPurchasePages()[0]?.path || '/dashboard/requirement-received',
      pages: getPurchasePages(),
    },
    {
      id: 'billing-fms',
      name: 'Billing FMS',
      icon: <DollarSign className="w-4 h-4" />,
      path: '/dashboard/invoice-generation',
      pages: [
        { id: 'invoice-generation', name: 'Invoice Generation', icon: <Receipt className="w-4 h-4" />, component: BillingFMS, path: '/dashboard/invoice-generation' },
        { id: 'payment-tracking', name: 'Payment Tracking', icon: <CreditCard className="w-4 h-4" />, component: BillingFMS, path: '/dashboard/payment-tracking' },
        { id: 'customer-billing', name: 'Customer Billing', icon: <User className="w-4 h-4" />, component: BillingFMS, path: '/dashboard/customer-billing' },
        { id: 'financial-reports', name: 'Financial Reports', icon: <FileText className="w-4 h-4" />, component: BillingFMS, path: '/dashboard/financial-reports' },
      ],
    },
  ];

  const pageContent = {
    'requirement-received': { title: 'Requirement Form', content: 'View and manage received procurement requirements.' },
    'approve-required': { title: 'Approve Required', content: 'Review and approve required requests.' },
    'indent-to-get-quotation': { title: 'Indent (To Get Quotation)', content: 'Manage indents to request quotations.' },
    'Take_Quotation': { title: 'Take_Quotation', content: 'Create and manage invoices, automated billing cycles, and invoice templates.' },
    'Approval_Quotation': { title: 'Approval_Quotation', content: 'Monitor payment status, overdue accounts, and payment reconciliation.' },
    'PO': { title: 'PO', content: 'Customer account management, billing history, and payment collection.' },
    'Vendor_FollowUp_Material': { title: 'Vendor_FollowUp_Material', content: 'Financial analytics, revenue reports, and accounting summaries.' },
    'Material_Received': { title: 'Material_Received', content: 'Financial analytics, revenue reports, and accounting summaries.' },
    'Final_Material_Received': { title: 'Final_Material_Received', content: 'Financial analytics, revenue reports, and accounting summaries.' },
    'MRN': { title: 'MRN', content: 'Financial analytics, revenue reports, and accounting summaries.' },
    'no-access': { title: 'No Access', content: 'You do not have permission to access any Purchase FMS pages.' },
  };

  const selectPage = (pageId) => {
    setSelectedPage(pageId);
    setIsPurchaseDropdownOpen(false);
    setIsMobileMenuOpen(false);
    const purchasePages = getPurchasePages();
    const page = purchasePages.find(p => p.id === pageId);
    if (page) navigate(page.path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    setUserType(null);
    setSelectedPage('no-access');
    navigate('/');
    console.log('Logout clicked');
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

  const togglePurchaseDropdown = () => {
    setIsPurchaseDropdownOpen(!isPurchaseDropdownOpen);
  };

  const isPageAllowed = () => {
    const purchasePages = getPurchasePages();
    return purchasePages.some(page => page.id === selectedPage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">                                                         
            <button
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">RCC</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                RCC FMS SYSTEM
              </h1>
              <p className="text-sm text-gray-500">
                Welcome back, <span className="font-medium text-blue-600">{userType || 'Guest'}</span>
              </p>
            </div>
          </div>
          
          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search modules, reports, or data..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 bg-white/95 backdrop-blur-md shadow-xl transition-all duration-300 ease-in-out transform md:sticky md:top-0 md:h-screen ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 ${isSidebarExpanded ? 'w-64' : 'w-20'} border-r border-gray-200/50`}
          onMouseEnter={() => setIsSidebarExpanded(true)}
          onMouseLeave={() => setIsSidebarExpanded(false)}
        >
          <nav className="p-4 space-y-2 flex flex-col h-full">
            <div className="space-y-1">
              {menuItems.map((menu) => (
                <div key={menu.id} className="relative">
                  <button
                    onClick={() => selectPage(menu.pages?.[0]?.id || menu.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      selectedPage === menu.id || menu.pages?.some((p) => p.id === selectedPage)
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  >
                    <div className={`p-1 rounded-lg ${
                      selectedPage === menu.id || menu.pages?.some((p) => p.id === selectedPage)
                        ? 'bg-white/20'
                        : 'group-hover:bg-gray-200'
                    }`}>
                      {menu.icon}
                    </div>
                    {isSidebarExpanded && (
                      <span className="font-medium whitespace-nowrap">{menu.name}</span>
                    )}
                    {!isSidebarExpanded && isMobileMenuOpen && (
                      <span className="font-medium">{menu.name}</span>
                    )}
                  </button>
                  
                  {!isSidebarExpanded && menu.pages && menu.pages.length > 0 && (
                    <div className="absolute left-full top-0 ml-2 hidden group-hover:block z-50">
                      <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-xl py-2 min-w-[200px]">
                        <div className="px-4 py-2 text-sm font-semibold text-gray-700 border-b border-gray-100">
                          {menu.name}
                        </div>
                        {menu.pages.map((page) => (
                          <button
                            key={page.id}
                            onClick={() => selectPage(page.id)}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-50 flex items-center space-x-2 ${
                              selectedPage === page.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                            }`}
                          >
                            {page.icon}
                            <span>{page.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-auto pt-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-600 hover:bg-red-50 hover:text-red-600 group"
              >
                <div className="p-1 rounded-lg group-hover:bg-red-100">
                  <LogOut className="w-4 h-4" />
                </div>
                {isSidebarExpanded && (
                  <span className="font-medium">Logout</span>
                )}
                {!isSidebarExpanded && isMobileMenuOpen && (
                  <span className="font-medium">Logout</span>
                )}
              </button>
            </div>
          </nav>
        </aside>

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}

        <main className="flex-1 p-4 md:p-6 min-h-screen overflow-x-auto">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 min-w-0">
            <div className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200/50 p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {pageContent[selectedPage]?.title || 'Page Not Found'}
                  </h2>
                  <div className="mt-2 h-1 w-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                </div>
                
                {menuItems.find((menu) => menu.id === 'purchase-fms')?.pages.length > 0 && isPageAllowed() && (
                  <div className="relative">
                    <button
                      onClick={togglePurchaseDropdown}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg text-sm"
                    >
                      <span>Select Page</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isPurchaseDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isPurchaseDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden">
                        {menuItems
                          .find((menu) => menu.id === 'purchase-fms')
                          ?.pages.map((page) => (
                            <button
                              key={page.id}
                              onClick={() => selectPage(page.id)}
                              className={`w-full flex items-center space-x-3 px-4 py-3 text-sm transition-all duration-200 ${
                                selectedPage === page.id
                                  ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-500'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                              }`}
                            >
                              <div className={`p-1 rounded-lg ${
                                selectedPage === page.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                              }`}>
                                {page.icon}
                              </div>
                              <span className="truncate">{page.name}</span>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 md:p-6">
              <p className="text-gray-600 leading-relaxed mb-6 text-sm md:text-base">
                {pageContent[selectedPage]?.content || 'Content not available for this page.'}
              </p>
              
              <div className="min-h-[400px] overflow-x-auto">
                {CurrentComponent ? (
                  <CurrentComponent selectedPage={selectedPage} />
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 text-lg">You do not have access to this page.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;