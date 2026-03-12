

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const labourApi = createApi({
  reducerPath: 'labourApi',
  
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000',
    prepareHeaders: (headers) => {
      // Agar token chahiye to yahan add karo
      // const token = localStorage.getItem('token');
      // if (token) {
      //   headers.set('Authorization', `Bearer ${token}`);
      // }
      return headers;
    },
  }),

  tagTypes: ['LabourApprove', 'LabourManagement', 'AshokApproval', 'PaidStep', 'ProjectDropdown'],

  endpoints: (builder) => ({

    // ========== GET APIs ==========

    // 🆕 Get Project Dropdown List (NEW API)
    getProjectDropdown: builder.query({
      query: () => '/api/labour/get-project-dropdown',
      providesTags: ['ProjectDropdown'],
      transformResponse: (response) => response.data || [],
    }),

    // 1️⃣ Get Labour Approve List
    getLabourApprove: builder.query({
      query: () => '/api/labour/get-Labour-Approve',
      providesTags: ['LabourApprove'],
      transformResponse: (response) => response.data || [],
    }),

    // 2️⃣ Get Labour Management List
    getLabourManagement: builder.query({
      query: () => '/api/labour/get-Labour-management',
      providesTags: ['LabourManagement'],
      transformResponse: (response) => response.data || [],
    }),

    // 3️⃣ Get Ashok Sir Approval List
    getApprovelAshokSir: builder.query({
      query: () => '/api/labour/get-Approvel-ashokSir',
      providesTags: ['AshokApproval'],
      transformResponse: (response) => response.data || [],
    }),

    // 4️⃣ Get Paid Step List
    getPaidStep: builder.query({
      query: () => '/api/labour/get-paid-step',
      providesTags: ['PaidStep'],
      transformResponse: (response) => response.data || [],
    }),

    // ========== POST APIs (Mutations) ==========

    // 1️⃣ Post Labour Approval 1
    postLabourApproval1: builder.mutation({
      query: (payload) => ({
        url: '/api/labour/Post-labour-Approvel-1',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['LabourApprove', 'LabourManagement'],
    }),

    // 2️⃣ Post Labour Management
    postLabourManagement: builder.mutation({
      query: (payload) => ({
        url: '/api/labour/Post-labour-management',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['LabourManagement', 'AshokApproval'],
    }),

    // 3️⃣ Post Labour Approval Ashok Sir
    postLabourApprovalAshokSir: builder.mutation({
      query: (payload) => ({
        url: '/api/labour/Post-labour-Approvel-AshokSir',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['AshokApproval', 'PaidStep'],
    }),

    // 4️⃣ Post Labour Paid
    postLabourPaid: builder.mutation({
      query: (payload) => ({
        url: '/api/labour/Post-labour-Paid',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['PaidStep'],
    }),

  }),
});

// ✅ Auto-generated hooks export
export const {
  // Query hooks (GET)
  useGetProjectDropdownQuery,      // 🆕 NEW HOOK
  useGetLabourApproveQuery,
  useGetLabourManagementQuery,
  useGetApprovelAshokSirQuery,
  useGetPaidStepQuery,

  // Lazy query hooks (manual trigger)
  useLazyGetProjectDropdownQuery,  // 🆕 NEW LAZY HOOK
  useLazyGetLabourApproveQuery,
  useLazyGetLabourManagementQuery,
  useLazyGetApprovelAshokSirQuery,
  useLazyGetPaidStepQuery,

  // Mutation hooks (POST)
  usePostLabourApproval1Mutation,
  usePostLabourManagementMutation,
  usePostLabourApprovalAshokSirMutation,
  usePostLabourPaidMutation,
} = labourApi;