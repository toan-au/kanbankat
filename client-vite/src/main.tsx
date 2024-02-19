import ReactDOM from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./state/store.ts";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home.tsx";
import App from "./App.tsx";

const router = createBrowserRouter([
  {
    element: <App></App>,
    children: [
      {
        path: "/",
        element: <Home></Home>,
      },
      {
        path: "/dashboard",
        element: <h1>Boards</h1>,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <RouterProvider router={router}></RouterProvider>
  </Provider>
);
