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
    builder
      .addCase(
        createBoardAsync.fulfilled,
        (state, action: PayloadAction<Board>) => {
          state.userBoards.push(action.payload);
        }
      )
      .addCase(
        getBoardsAsync.fulfilled,
        (state, action: PayloadAction<Board[]>) => {
          state.userBoards = action.payload;
        }
      )
      .addCase(
        deleteBoardAsync.fulfilled,
        (state, action: PayloadAction<Board>) => {
          console.log(action.payload);
          state.userBoards = state.userBoards.filter(
            (board) => board._id != action.payload._id
          );
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

export const deleteBoardAsync = createAsyncThunk(
  "boards/deleteBoardAsync",
  async (boardId: string) => {
    const response = await axios.delete(`/api/board/${boardId}`);
    return response.data;
  }
);

export default boardsSlice.reducer;
