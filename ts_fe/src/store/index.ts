import { configureStore } from "@reduxjs/toolkit";

import AuthSlice from "./auth-slice";
import AdminAuthSlice from "./adminauth-slice";
import siteInfoReducer from './siteinfo-slice';

const store = configureStore({
	reducer: {
		auth: AuthSlice.reducer,
		adminauth: AdminAuthSlice.reducer,
		siteinfo: siteInfoReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
