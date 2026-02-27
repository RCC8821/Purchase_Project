const express = require('express');
const { google } = require('googleapis');
// const dotenv = require('dotenv');
const { validateEnv } = require('./config/env');
const cors = require("cors");
const authRoutes = require('./routes/auth');
const AllFMS = require('./All_Fms_Api/RequirementForm')
const AllFMSData = require('./All_Fms_Api/All_Fms')
const IndentData= require("./All_Fms_Api/Indent")
const TakeQuotation = require("./All_Fms_Api/Take_Quotation")
const ApprovalQuotation = require('./All_Fms_Api/Approval_Quotation')
const PO = require("./All_Fms_Api/PO")
const vendorFollowUpMaterial = require("./All_Fms_Api/Vendor_FollowUp_Material")
const MaterialReceived = require('./All_Fms_Api/Material_Received')
const FinalMaterial=require('./All_Fms_Api/Final_Material')
const MRNDATA=require("./All_Fms_Api/MRN")
const VendorFollowupBlling = require("./All_Fms_Api/Vendor_Followup_Billing")
const BillProcessing = require("./All_Fms_Api/Bill_Processing")
const Bill_Checked = require('./All_Fms_Api/Bill_Checked')
const Bill_Tally= require('./All_Fms_Api/BILL_TALLY_ENTRY')
const Payment = require('./All_Fms_Api/Payment')
const Bill_Checked_Step18 = require('./All_Fms_Api/BILL _CHECKD_18Step')
const cloudinary = require("cloudinary").v2;

const contractorForm = require('./All_Fms_Api/ContractorForm/ContractorForm')

////// Site expeses api 

const DebitApprovel1=require('./SiteExpenses/Debit/DebitApprovel1')

const SiteApprovels= require('./SiteExpenses/SiteExpenses/SiteApprovels')

const LabourApprovel = require("./SiteExpenses/Labour/LabourExpenses")


/////// OutStanding Form 

const OutStanding= require('./All_Fms_Api/OutStanding')



const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json());
app.use(cors()); // Allow requests from React frontend
app.use(express.json());
validateEnv();

// ///////  cloudinary setup /////////

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// //////  Alll api call//////////

app.use('/api', authRoutes)
app.use('/api', AllFMS)
app.use('/api', AllFMSData)
app.use('/api',IndentData)
app.use('/api',TakeQuotation)
app.use('/api',ApprovalQuotation)
app.use('/api',PO)
app.use('/api',vendorFollowUpMaterial)
app.use('/api',MaterialReceived)
app.use('/api',FinalMaterial)
app.use('/api',MRNDATA)

// /// Billing Api 

app.use('/api',VendorFollowupBlling)
app.use('/api',BillProcessing)
app.use('/api',Bill_Checked)
app.use('/api',Bill_Tally)
app.use('/api',Payment)
app.use('/api',Bill_Checked_Step18)


/////  Contractor Form 

app.use('/api/contractor',contractorForm)

/////// outStanding form 

app.use('/api/outStading',OutStanding)

//// // Site Expenses 

app.use('/api/DebitExpenses',DebitApprovel1)

app.use('/api/SiteExpenses',SiteApprovels)

app.use('/api/labour',LabourApprovel)



// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});