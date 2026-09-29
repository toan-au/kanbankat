import { describe, it, expect } from "vitest";
import uiReducer, { showShroud, hideShroud, startLoadingUser, stopLoadingUser } from "../../../state/ui/ui";

describe("ui reducer", () => {
  it("has loadingUser true and showShroud false initially", () => {
    const state = uiReducer(undefined, { type: "@@INIT" });
    expect(state).toEqual({ showShroud: false, loadingUser: true });
  });

  it("showShroud sets showShroud to true", () => {
    const state = uiReducer({ showShroud: false, loadingUser: false }, showShroud());
    expect(state.showShroud).toBe(true);
  });

  it("hideShroud sets showShroud to false", () => {
    const state = uiReducer({ showShroud: true, loadingUser: false }, hideShroud());
    expect(state.showShroud).toBe(false);
  });

  it("startLoadingUser sets loadingUser to true", () => {
    const state = uiReducer({ showShroud: false, loadingUser: false }, startLoadingUser());
    expect(state.loadingUser).toBe(true);
  });

  it("stopLoadingUser sets loadingUser to false", () => {
    const state = uiReducer({ showShroud: false, loadingUser: true }, stopLoadingUser());
    expect(state.loadingUser).toBe(false);
  });
});
