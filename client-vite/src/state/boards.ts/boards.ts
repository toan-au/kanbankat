import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface Task {
  _id: string;
  name: string;
  content: string;
  color: string;
}

interface List {
  _id: string;
  name: string;
  tasks: Task[];
}

interface BoardSummary {
  _id: string;
  name: string;
  about: string;
  user: string;
}

interface Board extends BoardSummary {
  lists: List[];
}

interface BoardsState {
  userBoards: BoardSummary[];
  activeBoard: Board;
}

const initialState: BoardsState = {
  userBoards: [],
  activeBoard: {
    lists: [],
    _id: "",
    name: "",
    about: "",
    user: "",
  },
};

const boardsSlice = createSlice({
  name: "boards",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(
        createBoardAsync.fulfilled,
        (state, action: PayloadAction<BoardSummary>) => {
          state.userBoards.push(action.payload);
        }
      )
      .addCase(
        getBoardsAsync.fulfilled,
        (state, action: PayloadAction<BoardSummary[]>) => {
          state.userBoards = action.payload;
        }
      )
      .addCase(
        deleteBoardAsync.fulfilled,
        (state, action: PayloadAction<BoardSummary>) => {
          console.log(action.payload);
          state.userBoards = state.userBoards.filter(
            (board) => board._id != action.payload._id
          );
        }
      )
      .addCase(
        getBoardAsync.fulfilled,
        (state, action: PayloadAction<Board>) => {
          state.activeBoard = action.payload;
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
  "boards/getBoardsAsync",
  async () => {
    const response = await axios.get("/api/boards");
    const boards: Board[] = response.data;
    return boards;
  }
);

export const getBoardAsync = createAsyncThunk(
  "boards/getBoardAsync",
  async (boardId: string) => {
    const response = await axios.get(`/api/board/${boardId}`);
    const board: Board = response.data;
    return board;
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
