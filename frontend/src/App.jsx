import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RequirementReceived from './components/purchase/RequirementReceived';
import ApproveRequired from './components/purchase/ApproveRequired';
import IndentToGetQuotation from './components/purchase/IndentToGetQuotation';
import Take_Quotation from './components/purchase/Take_Quotation';
import Approval_Quotation from './components/purchase/Approval_Quotation';
import PO from './components/purchase/PO';
import Vendor_FollowUp_Material from './components/purchase/Vendor_FollowUp_Material';
import Material_Received from './components/purchase/Material_Received';
import Final_Material_Received from './components/purchase/Final_Material_Received';
import MRN from './components/purchase/MRN';
import BillingFMS from './components/BillingFMS';
import Payment from './components/purchase/Payment';

import Advance_payment from './components/purchase/Advance_payment';

/////// Billing components ///////////////////////

import Vendor_followup_billing from './components/purchase/Vendor_followup_billing';
import Bill_Processing from './components/purchase/Bill_Processing';
import BillCheckedData from './components/purchase/BillCheckedData';
import BillTallyData from './components/purchase/BillTallyData';
import Bill_Checked_18Step from './components/purchase/Bill_Checked_18Step';
import ContractorPurchseForm from './components/ContractorPurchase/ContractorPurchseForm';

////////

import OutStanding from './components/purchase/OutStanding';

///// office Expenses Form

import SiteExpensesForm from './pages/SiteExpensesForm';


/////// labour 

import Approvel1 from './components/Labour/Approvel1';
import LabourManagment from './components/Labour/LabourManagment';
import Approvel2 from './components/Labour/Approvel2';
import PaidAmount from './components/Labour/PaidAmount';
import LabourPDF from './components/Labour/LabourPDF';

//////// Site Expenses /////

import SiteApprovel from './components/SiteExpenses/SiteApprovel';
import SitePaidAmount from './components/SiteExpenses/SitePaidAmount';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/SiteExpensesform" element={<SiteExpensesForm />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="requirement-received" element={<RequirementReceived />} />
          <Route path="approve-required" element={<ApproveRequired />} />
          <Route path="indent-to-get-quotation" element={<IndentToGetQuotation />} />
          <Route path='Take_Quotation' element={<Take_Quotation/>} />
          <Route path="Approval_Quotation" element={<Approval_Quotation />} />
          <Route path="po" element={<PO />} />
          <Route path="Vendor_FollowUp_Material" element={<Vendor_FollowUp_Material />} />
          <Route path="Material_Received" element={<Material_Received />} />
          <Route path='Final_Material_Received' element={<Final_Material_Received/>} />
          <Route path='MRN' element={<MRN/>}/>
          <Route path='Vendor_followup_billing' element={<Vendor_followup_billing/>}/>
          <Route path='Bill_Processing' element={<Bill_Processing/>}/>
          <Route path='BillCheckedData' element={<BillCheckedData/>}/>
          <Route path='BillTallyData' element={<BillTallyData/>}/>
          <Route path='Payment' element={<Payment/>}/>
          <Route path='Bill_Checked_18Step' element={Bill_Checked_18Step}/>
          <Route path='contractor-purchase-form' element={<ContractorPurchseForm/>}/>
          <Route path='outstanding' element={<OutStanding/>}/>
          <Route path='advance_payment' element={<Advance_payment/>}/>


          ///// labour 

          <Route path='Approvel1' element={<Approvel1/>}/> 
          <Route path='Labourmanagement' element={<LabourManagment/>}/>
          <Route path='Approvel2' element={<Approvel2/>}/>
          <Route path='PaidAmount' element={<PaidAmount/>}/>
          <Route path='LabourPDF' element={<LabourPDF/>}/>

          /////// site Expenses

          <Route path='SiteApprovel' element={<SiteApprovel/>}/>
          <Route path='SitePaidAmount' element={<SitePaidAmount/>}/>
          {/* <Route path="procurement-reports" element={<ProcurementReports />} /> */}

          <Route path="invoice-generation" element={<BillingFMS selectedPage="invoice-generation" />} />
          <Route path="payment-tracking" element={<BillingFMS selectedPage="payment-tracking" />} />
          <Route path="customer-billing" element={<BillingFMS selectedPage="customer-billing" />} />
          <Route path="financial-reports" element={<BillingFMS selectedPage="financial-reports" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;