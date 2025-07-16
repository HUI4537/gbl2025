import { createSlice } from "@reduxjs/toolkit";

interface SiteInfoState {
  siteTitle: string;
  projectName: string;
  year: string;
}

const initialState: SiteInfoState = {
  siteTitle: "GBL2024",
  projectName: "GBL",
  year: "2024",
};

const siteInfoSlice = createSlice({
  name: "siteinfo",
  initialState,
  reducers: {
    setSiteInfo: (state, action) => {
      state.siteTitle = action.payload.siteTitle;
      state.projectName = action.payload.projectName;
      state.year = action.payload.year;
    },
  },
});

export const { setSiteInfo } = siteInfoSlice.actions;
export default siteInfoSlice.reducer; 