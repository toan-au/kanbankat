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
      // createBoardAsync.fulfilled
      .addCase(
        createBoardAsync.fulfilled,
        (state, action: PayloadAction<BoardSummary>) => {
          state.userBoards.push(action.payload);
        }
      )
      // getBoardsAsync.fulfilled
      .addCase(
        getBoardsAsync.fulfilled,
        (state, action: PayloadAction<BoardSummary[]>) => {
          state.userBoards = action.payload;
        }
      )
      // getBoardAsync.fulfilled
      .addCase(
        getBoardAsync.fulfilled,
        (state, action: PayloadAction<Board>) => {
          state.activeBoard = action.payload;
        }
      )
      // renameBoardAsync.fulfilled
      .addCase(
        renameBoardAsync.fulfilled,
        (state, action: PayloadAction<Board>) => {
          const { _id, about, name, user } = action.payload;
          const id = state.userBoards.findIndex(
            (board) => board._id == action.payload._id
          );
          state.userBoards.splice(id, 1, { _id, about, name, user });
        }
      )
      // deleteBoardAsync.fulfilled
      .addCase(
        deleteBoardAsync.fulfilled,
        (state, action: PayloadAction<BoardSummary>) => {
          state.userBoards = state.userBoards.filter(
            (board) => board._id != action.payload._id
          );
        }
      )
      // createListAsync.fulfilled
      .addCase(
        createListAsync.fulfilled,
        (state, action: PayloadAction<List>) => {
          state.activeBoard.lists.push(action.payload);
        }
      )
      // deleteListAsync.fulfilled
      .addCase(
        deleteListAsync.fulfilled,
        (state, action: PayloadAction<string>) => {
          const index = state.activeBoard.lists.findIndex(
            (list) => list._id == action.payload
          );
          state.activeBoard.lists.splice(index, 1);
        }
      )
      // renameListAsync.fulfilled
      .addCase(
        renameListAsync.fulfilled,
        (state, action: PayloadAction<List>) => {
          const { _id, name } = action.payload;
          const index = state.activeBoard.lists.findIndex(
            (list) => list._id == _id
          );
          state.activeBoard.lists[index] = {
            ...state.activeBoard.lists[index],
            name,
          };
        }
      )
      // createTaskAsync.fulfilled
      .addCase(
        createTaskAsync.fulfilled,
        (state, action: PayloadAction<{ task: Task; listId: string }>) => {
          const { task, listId } = action.payload;
          const listIndex = state.activeBoard.lists.findIndex(
            (list) => list._id == listId
          );

          state.activeBoard.lists[listIndex].tasks.push(task);
        }
      )
      // deleteTaskAsync.fulfilled
      .addCase(
        deleteTaskAsync.fulfilled,
        (state, action: PayloadAction<{ task: Task; listId: string }>) => {
          const { task, listId } = action.payload;
          const listIndex = state.activeBoard.lists.findIndex(
            (list) => list._id == listId
          );

          const taskIndex = state.activeBoard.lists[listIndex].tasks.findIndex(
            (t) => t._id == task._id
          );
          state.activeBoard.lists[listIndex].tasks.splice(taskIndex, 1);
        }
      )
      // renameTaskAsync.fulfilled
      .addCase(
        renameTaskAsync.fulfilled,
        (state, action: PayloadAction<{ task: Task; listId: string }>) => {
          const { task, listId } = action.payload;
          const listIndex = state.activeBoard.lists.findIndex(
            (list) => list._id == listId
          );

          const taskId = state.activeBoard.lists[listIndex].tasks.findIndex(
            (t) => t._id == task._id
          );
          state.activeBoard.lists[listIndex].tasks.splice(taskId, 1, task);
        }
      );
  },
});

// BOARD ACTIONS

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

export const renameBoardAsync = createAsyncThunk<
  Board,
  { boardId: string; name: string }
>("boards/renameBoardAsync", async ({ boardId, name }) => {
  const response = await axios.patch(`/api/board/${boardId}`, { name });
  const board: Board = response.data;
  return board;
});

export const deleteBoardAsync = createAsyncThunk(
  "boards/deleteBoardAsync",
  async (boardId: string) => {
    const response = await axios.delete(`/api/board/${boardId}`);
    return response.data;
  }
);

// LIST ACTIONS

export const createListAsync = createAsyncThunk<
  List,
  { boardId: string; listName: string }
>("boards/createListAsync", async ({ boardId, listName }) => {
  const response = await axios.post(`/api/board/${boardId}/list`, {
    name: listName,
  });
  const list: List = response.data;
  return list;
});

export const deleteListAsync = createAsyncThunk<
  string,
  { boardId: string; listId: string }
>("boards/deleteListAsync", async ({ boardId, listId }) => {
  const response = await axios.delete(`/api/board/${boardId}/list/${listId}`);
  const id = response.data;
  return id;
});

export const renameListAsync = createAsyncThunk<
  List,
  { boardId: string; listId: string; name: string }
>("boards/renameListAsync", async ({ boardId, listId, name }) => {
  const response = await axios.patch(`/api/board/${boardId}/list/${listId}`, {
    name,
  });
  const list: List = response.data;
  return list;
});

export const createTaskAsync = createAsyncThunk<
  { task: Task; listId: string },
  { boardId: string; listId: string; name: string }
>("boards/createTaskAsync", async ({ boardId, listId, name }) => {
  const response = await axios.post(
    `/api/board/${boardId}/list/${listId}/task`,
    {
      name,
    }
  );
  const res: { task: Task; listId: string } = response.data;
  return res;
});

export const deleteTaskAsync = createAsyncThunk<
  { task: Task; listId: string },
  { boardId: string; listId: string; taskId: string }
>("boards/deleteTaskAsync", async ({ boardId, listId, taskId }) => {
  const response = await axios.delete(
    `/api/board/${boardId}/list/${listId}/task/${taskId}`
  );

  const res: { task: Task; listId: string } = response.data;
  return res;
});

export const renameTaskAsync = createAsyncThunk<
  { task: Task; listId: string },
  { boardId: string; listId: string; taskId: string; name: string }
>("boards/renameTaskAsync", async ({ boardId, listId, name, taskId }) => {
  const response = await axios.patch(
    `/api/board/${boardId}/list/${listId}/task/${taskId}`,
    {
      name,
    }
  );
  const res: { task: Task; listId: string } = response.data;
  return res;
});

export default boardsSlice.reducer;
