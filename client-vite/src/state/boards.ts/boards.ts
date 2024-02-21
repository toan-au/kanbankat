import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface Board {
  _id: string;
  name: string;
  about: string;
  user: string;
}

interface BoardsState {
  userBoards: Board[];
}

const initialState: BoardsState = {
  userBoards: [],
};

const boardsSlice = createSlice({
  name: "boards",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      createBoardAsync.fulfilled,
      (state, action: PayloadAction<Board>) => {
        state.userBoards.push(action.payload);
      }
    );
    builder.addCase(
      getBoardsAsync.fulfilled,
      (state, action: PayloadAction<Board[]>) => {
        state.userBoards = action.payload;
      }
    );
  },
});

export const createBoardAsync = createAsyncThunk(
  "boards/createBoardAsync",
  async (name: string) => {
    const response = await axios.post("/api/board", { name });
    const newBoard: Board = response.data;
    return newBoard;
  }
);

export const getBoardsAsync = createAsyncThunk<Board[]>(
  "boards/getBoardAsync",
  async () => {
    const response = await axios.get("/api/boards");
    const boards: Board[] = response.data;
    return boards;
  }
);

export default boardsSlice.reducer;
