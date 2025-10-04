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
const cloudinary = require("cloudinary").v2;

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173'
})); // Allow requests from React frontend
app.use(express.json());
validateEnv();

// ///////  cloudinary setup /////////

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// //////  Alll api call//////////

app.use('/api', authRoutes);
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
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});