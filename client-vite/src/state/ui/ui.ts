import { createSlice } from "@reduxjs/toolkit";

interface Ui {
  showShroud: boolean;
  topDrawer: boolean;
  loadingUser: boolean;
}

const initialState: Ui = {
  showShroud: false,
  topDrawer: false,
  loadingUser: true,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    showTopDrawer(state) {
      state.topDrawer = true;
    },
    hideTopDrawer(state) {
      state.topDrawer = false;
    },
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
export const { showShroud, hideShroud, startLoadingUser, stopLoadingUser, showTopDrawer, hideTopDrawer } =
  actions;
export default reducer;
