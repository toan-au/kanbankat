import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { makeTestStore } from "../../setup/renderWithProviders";
import Authguard from "../../../components/templates/Authguard";

vi.mock("axios");

function ProtectedPage() {
  return <div>Protected Content</div>;
}

function HomePage() {
  return <div>Home Page</div>;
}

function renderAuthguard(loggedIn: boolean) {
  const store = makeTestStore({
    currentUser: { id: loggedIn ? "user-1" : "", displayName: "", loggedIn },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<Authguard />}>
            <Route path="/dashboard" element={<ProtectedPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe("Authguard", () => {
  it("renders the protected route's content when the user is logged in", () => {
    renderAuthguard(true);

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("redirects to / when the user is not logged in", () => {
    renderAuthguard(false);

    expect(screen.getByText("Home Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});
