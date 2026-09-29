import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import axios from "axios";

vi.mock("axios");
const mockedGet = vi.mocked(axios.get);

import currentUserReducer, { getUserAsync, syncUser, logoutAsync } from "../../../state/current-user/current-user";
import uiReducer from "../../../state/ui/ui";

function initialState() {
  return currentUserReducer(undefined, { type: "@@INIT" });
}

describe("currentUser reducer", () => {
  it("getUserAsync.fulfilled ignores an empty payload", () => {
    // lodash's isEmpty only treats an object with zero own keys as empty, so
    // the payload here must genuinely be `{}` (not `{_id: "", ...}`) to
    // exercise that guard; cast to satisfy the thunk's payload type.
    const emptyPayload = {} as { _id: string; displayName: string };
    const state = currentUserReducer(initialState(), getUserAsync.fulfilled(emptyPayload, "req-1", undefined));

    expect(state).toEqual(initialState());
  });

  it("getUserAsync.fulfilled sets id/displayName/loggedIn from a populated payload", () => {
    const payload = { _id: "user-1", displayName: "Ada" };
    const state = currentUserReducer(initialState(), getUserAsync.fulfilled(payload, "req-1", undefined));

    expect(state).toEqual({ id: "user-1", displayName: "Ada", loggedIn: true });
  });

  it("logoutAsync.fulfilled sets loggedIn to false", () => {
    const loggedInState = { id: "user-1", displayName: "Ada", loggedIn: true };
    const state = currentUserReducer(loggedInState, logoutAsync.fulfilled(undefined, "req-1", undefined));

    expect(state.loggedIn).toBe(false);
  });
});

describe("currentUser async thunks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getUserAsync GETs /auth/current", async () => {
    mockedGet.mockResolvedValue({ data: { _id: "user-1", displayName: "Ada" } });
    const dispatch = vi.fn();

    await getUserAsync()(dispatch, () => ({}), undefined);

    expect(axios.get).toHaveBeenCalledWith("/auth/current");
  });

  it("logoutAsync GETs /auth/logout", async () => {
    mockedGet.mockResolvedValue({ data: {} });
    const dispatch = vi.fn();

    await logoutAsync()(dispatch, () => ({}), undefined);

    expect(axios.get).toHaveBeenCalledWith("/auth/logout");
  });

  it("syncUser fetches the current user and then stops the loading-user flag", async () => {
    mockedGet.mockResolvedValue({ data: { _id: "user-1", displayName: "Ada" } });

    const store = configureStore({
      reducer: { currentUser: currentUserReducer, ui: uiReducer },
    });

    expect(store.getState().ui.loadingUser).toBe(true);

    await store.dispatch(syncUser());

    expect(store.getState().currentUser).toEqual({ id: "user-1", displayName: "Ada", loggedIn: true });
    expect(store.getState().ui.loadingUser).toBe(false);
  });
});
