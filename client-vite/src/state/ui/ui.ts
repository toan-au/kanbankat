import { createSlice } from "@reduxjs/toolkit";

interface Ui {
  showShroud: boolean;
}

const initialState: Ui = {
  showShroud: false,
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
  },
});

const { actions, reducer } = uiSlice;
export const { showShroud, hideShroud } = actions;
export default reducer;
