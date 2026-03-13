import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const formApi = createApi({
  reducerPath: 'formApi',

  baseQuery: fetchBaseQuery({
    baseUrl: 'https://purchase-project-3iia.vercel.app',
    // baseUrl: 'http://localhost:5000',
    prepareHeaders: (headers) => {
      // Agar token chahiye to yahan add karo
      // const token = localStorage.getItem('token');
      // if (token) {
      //   headers.set('Authorization', `Bearer ${token}`);
      // }
      return headers;
    },
  }),

  tagTypes: ['SiteExpense', 'LabourRequest', 'ContractorDebit'],

  endpoints: (builder) => ({

    // ============================================================
    // 1️⃣  POST /api/labour/site-expense  →  Sheet: Site_Exp_FMS
    // ============================================================
    // Payload structure:
    // {
    //   Vendor_Payee_Name_1: '',
    //   Project_Name_1: '',
    //   Project_Engineer_Name_1: '',
    //   Bill_No_1: '',
    //   Bill_Date_1: '',
    //   Contractor_Name_1: '',
    //   Contractor_Firm_Name_1: '',
    //   Remark_1: '',
    //   items: [
    //     {
    //       Head_Type_1: '',
    //       Exp_Head_1: '',        ← REQUIRED
    //       Details_of_Work_1: '',
    //       Amount_1: '',          ← REQUIRED
    //       Bill_Photo_1: '',
    //     }
    //   ]
    // }
    // Backend khud RCC Bill No (RCC/2026/0001...) aur UID (SITE0001...) generate karta hai
    postSiteExpense: builder.mutation({
      query: (payload) => ({
        url: '/api/site-expense',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['SiteExpense'],
    }),

    // ============================================================
    // 2️⃣  POST /api/labour/labour-request  →  Sheet: Labour_FMS
    // ============================================================
    // Payload structure:
    // {
    //   Project_Name_1: '',       ← REQUIRED
    //   Project_Engineer_1: '',
    //   Work_Type_1: '',          ← REQUIRED
    //   Work_Description_1: '',
    //   Labour_Category_1: '',
    //   Number_Of_Labour_1: '',
    //   Labour_Category_2: '',
    //   Number_Of_Labour_2: '',
    //   Total_Labour_1: '',
    //   Date_Of_Required_1: '',
    //   Head_Of_Contractor_Company_1: '',
    //   Name_Of_Contractor_1: '',
    //   Contractor_Firm_Name_1: '',
    //   Remark_1: '',
    // }
    // Backend khud UID (LAB0001...) generate karta hai
    postLabourRequest: builder.mutation({
      query: (payload) => ({
        url: '/api/labour-request',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['LabourRequest'],
    }),

    // ============================================================
    // 3️⃣  POST /api/labour/contractor-debit  →  Sheet: Contractor_Debit_FMS
    // ============================================================
    // Payload structure:
    // {
    //   Project_Name_1: '',       ← REQUIRED
    //   Project_Engineer_1: '',
    //   Contractor_Name_1: '',    ← REQUIRED
    //   Contractor_Firm_Name_1: '',
    //   Work_Type_1: '',
    //   Work_Date_1: '',
    //   Work_Description_1: '',
    //   Particular_1: '',
    //   Qty_1: '',
    //   Rate_Wages_1: '',
    //   Amount_1: '',
    // }
    // Backend khud UID (DEBIT0001...) generate karta hai
    postContractorDebit: builder.mutation({
      query: (payload) => ({
        url: '/api/contractor-debit',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['ContractorDebit'],
    }),

  }),
});

// ============================================================
// ✅ Hooks Export — inhe apne form components mein use karo
// ============================================================
export const {
  usePostSiteExpenseMutation,     // Site Expense form ke liye
  usePostLabourRequestMutation,   // Labour Request form ke liye
  usePostContractorDebitMutation, // Contractor Debit form ke liye
} = formApi;
