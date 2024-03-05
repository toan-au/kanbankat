import { createSlice } from "@reduxjs/toolkit";

interface Ui {
  showShroud: boolean;
  loadingUser: boolean;
}

const initialState: Ui = {
  showShroud: false,
  loadingUser: true,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    showShroud(state) {
      state.showShroud = true;
    },
    hideShroud(state) {
      state.showShroud = false;
    },
    startLoadingUser(state) {
      state.loadingUser = true;
    },
    stopLoadingUser(state) {
      state.loadingUser = false;
    },
  },
});

const { actions, reducer } = uiSlice;
export const { showShroud, hideShroud, startLoadingUser, stopLoadingUser } =
  actions;
export default reducer;
