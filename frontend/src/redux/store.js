import { configureStore } from '@reduxjs/toolkit';
import { labourApi } from '../redux/Labour/LabourSlice';
export const store = configureStore({
  reducer: {
    [labourApi.reducerPath]: labourApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(labourApi.middleware),
});
