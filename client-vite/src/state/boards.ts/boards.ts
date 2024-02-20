import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface boardsState {}

const initialState: boardsState = {};

const boardsSlice = createSlice({
  name: "boards",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(createBoardAsync.fulfilled, (state, action) => {});
  },
});

export const createBoardAsync = createAsyncThunk(
  "boards/createBoardAsync",
  async (name: string) => {
    const newBoard = await axios.post("/api/board", { name });
    return newBoard;
  }
);

export default boardsSlice.reducer;
