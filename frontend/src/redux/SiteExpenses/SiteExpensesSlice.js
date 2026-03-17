import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const siteExpensesApi = createApi({
  reducerPath: 'siteExpensesApi',

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

  tagTypes: ['SiteApproval', 'SitePaidStep'],

  endpoints: (builder) => ({

    // ========== GET APIs ==========

    // 1️⃣ Get Site Approval List (Pending approvals)
    getSiteApproval: builder.query({
      query: () => '/api/SiteExpenses/Site-Approvel-1',
      providesTags: ['SiteApproval'],
      transformResponse: (response) => response.data || [],
    }),

    // 2️⃣ Get Site Paid Step List
    getSitePaidStep: builder.query({
      query: () => '/api/SiteExpenses/Site-Paid-Step',
      providesTags: ['SitePaidStep'],
      transformResponse: (response) => response.data || [],
    }),

    // ========== POST APIs (Mutations) ==========

    // 1️⃣ Post Site Approval 1 (status, Approve_Amount, Confirm_Head, remark)
    postSiteApproval: builder.mutation({
      query: (payload) => ({
        url: '/api/SiteExpenses/Post-Site-Approvel-1',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['SiteApproval', 'SitePaidStep'],
    }),

    // 2️⃣ Post Site Paid Step (Payment fields - columns W to AH)
    postSitePaidStep: builder.mutation({
      query: (payload) => ({
        url: '/api/SiteExpenses/Post-Site-Paid-Step',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['SitePaidStep'],
    }),

  }),
});

// ✅ Auto-generated hooks export
export const {
  // Query hooks (GET)
  useGetSiteApprovalQuery,
  useGetSitePaidStepQuery,

  // Lazy query hooks (manual trigger)
  useLazyGetSiteApprovalQuery,
  useLazyGetSitePaidStepQuery,

  // Mutation hooks (POST)
  usePostSiteApprovalMutation,
  usePostSitePaidStepMutation,
} = siteExpensesApi;