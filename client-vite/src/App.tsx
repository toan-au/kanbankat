import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Template from "./components/templates/Template";
import Dashboard from "./pages/Dashboard";
import Authguard from "./components/templates/Authguard";
import Board from "./pages/Board";

function App() {
  const router = createBrowserRouter([
    {
      element: <Template></Template>,
      children: [
        {
          path: "/",
          element: <Home></Home>,
        },
      ],
    },
    {
      element: <Authguard></Authguard>,
      children: [
        {
          path: "/dashboard",
          element: <Dashboard></Dashboard>,
        },
        {
          path: "/board/:boardId",
          element: <Board></Board>,
        },
      ],
    },
  ]);

  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
