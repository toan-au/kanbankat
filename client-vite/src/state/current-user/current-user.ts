import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { stopLoadingUser } from "../ui/ui";
import { isEmpty } from "lodash";

interface UserAPIResponse {
  _id: string;
  displayName: string;
}

interface CurrentUserState {
  id: string;
  displayName: string;
  loggedIn: boolean;
}

const initialState: CurrentUserState = {
  id: "",
  displayName: "",
  loggedIn: false,
};

const currentUserSlice = createSlice({
  name: "currentUser",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Retrieving current logged in user
      .addCase(getUserAsync.pending, () => {})
      .addCase(
        getUserAsync.fulfilled,
        (state, action: PayloadAction<UserAPIResponse>) => {
          if (!isEmpty(action.payload)) {
            state.id = action.payload._id;
            state.displayName = action.payload.displayName;
            state.loggedIn = action.payload._id.length > 0;
          }
        }
      )

      //logout
      .addCase(logoutAsync.fulfilled, (state) => {
        state.loggedIn = false;
      });
  },
});

export const getUserAsync = createAsyncThunk<UserAPIResponse>(
  "currentUser/getuserAsync",
  async () => {
    const response = await axios.get("/auth/current");
    const user: UserAPIResponse = response.data;
    return user;
  }
);

export const syncUser = createAsyncThunk(
  "currentUser/syncUser",
  async (_, thunkApi) => {
    await thunkApi.dispatch(getUserAsync());
    await thunkApi.dispatch(stopLoadingUser());
  }
);

export const loginAsync = createAsyncThunk(
  "currentUser/loginAsync",
  async () => {
    await axios.get("/auth/google");
  }
);

export const logoutAsync = createAsyncThunk(
  "currentUser/logoutAsync",
  async () => {
    await axios.get("/auth/logout");
  }
);

export default currentUserSlice.reducer;
