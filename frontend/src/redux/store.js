import { configureStore } from '@reduxjs/toolkit';
import { labourApi } from '../redux/Labour/LabourSlice';
import { formApi } from '../redux/formSlice';
import {siteExpensesApi} from '../redux/SiteExpenses/SiteExpensesSlice'
export const store = configureStore({
  reducer: {
    [labourApi.reducerPath]: labourApi.reducer,
    [formApi.reducerPath]: formApi.reducer,
    [siteExpensesApi.reducerPath]: siteExpensesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
  .concat(labourApi.middleware)
  .concat(formApi.middleware)
  .concat(siteExpensesApi.middleware),
});
