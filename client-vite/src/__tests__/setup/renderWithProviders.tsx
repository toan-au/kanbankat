import { PropsWithChildren, ReactElement } from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import boardsReducer from "../../state/boards/boards";
import currentUserReducer from "../../state/current-user/current-user";
import uiReducer from "../../state/ui/ui";

const rootReducer = combineReducers({
  boards: boardsReducer,
  currentUser: currentUserReducer,
  ui: uiReducer,
});

export type TestRootState = Partial<ReturnType<typeof rootReducer>>;

export function makeTestStore(preloadedState?: TestRootState) {
  return configureStore({ reducer: rootReducer, preloadedState });
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState,
    store = makeTestStore(preloadedState),
    route = "/",
  }: { preloadedState?: TestRootState; store?: ReturnType<typeof makeTestStore>; route?: string } = {}
) {
  function Wrapper({ children }: PropsWithChildren) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper }) };
}
