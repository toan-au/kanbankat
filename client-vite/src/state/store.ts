import { configureStore } from "@reduxjs/toolkit";
import currentUserReducer from "./current-user/current-user";
import boardsReducer from "./boards/boards";
import uiReducer from "./ui/ui";

export const store = configureStore({
  reducer: {
    currentUser: currentUserReducer,
    boards: boardsReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
