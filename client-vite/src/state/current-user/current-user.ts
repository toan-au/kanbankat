import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface UserAPIResponse {
  _id: string;
  googleId: string;
  displayName: string;
}

interface CurrentUserState {
  id: string;
  googleId: string;
  displayName: string;
  loggedIn: boolean;
}

const initialState: CurrentUserState = {
  id: "",
  googleId: "",
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
      .addCase(getUserAsync.pending, () => {
        console.log("Retriving current user...");
      })
      .addCase(
        getUserAsync.fulfilled,
        (state, action: PayloadAction<UserAPIResponse>) => {
          state.id = action.payload._id;
          state.googleId = action.payload.googleId;
          state.displayName = action.payload.displayName;
          state.loggedIn = action.payload._id.length > 0;
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