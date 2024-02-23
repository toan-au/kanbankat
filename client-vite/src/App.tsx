import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Template from "./pages/Template";
import Dashboard from "./pages/Dashboard";
import Authguard from "./components/templates/Authguard";

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
          path: "/board/:id",
          element: <></>,
        },
      ],
    },
  ]);

  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
