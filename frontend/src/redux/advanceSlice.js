// advanceSlice.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const advanceApi = createApi({
  reducerPath: 'advanceApi',

  baseQuery: fetchBaseQuery({
    // baseUrl: 'https://purchase-project-3iia.vercel.app',
    baseUrl: 'http://localhost:5000',
    prepareHeaders: (headers) => {
      return headers;
    },
  }),

  tagTypes: ['AdvanceDropdown', 'AdvancePayment'],

  endpoints: (builder) => ({


    getAdvanceDropdownData: builder.query({
      query: () => ({
        url: '/api/advance/dropdown-data',
        method: 'GET',
      }),
      providesTags: ['AdvanceDropdown'],
    }),

    
    postAdvancePayment: builder.mutation({
      query: (payload) => ({
        url: '/api/advance/submit-payment',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['AdvancePayment'],
    }),

  }),
});

// ============================================================
// ✅ Hooks Export — inhe Advance form components mein use karo
// ============================================================
export const {
  useGetAdvanceDropdownDataQuery,   // Dropdown data fetch karne ke liye
  usePostAdvancePaymentMutation,    // Payment form submit karne ke liye
} = advanceApi;