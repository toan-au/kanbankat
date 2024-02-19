import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Template from "./pages/Template";
import Dashboard from "./pages/Dashboard";

function App() {
  const router = createBrowserRouter([
    {
      element: <Template></Template>,
      children: [
        {
          path: "/",
          element: <Home></Home>,
        },
        {
          path: "/dashboard",
          element: <Dashboard></Dashboard>,
        },
      ],
    },
  ]);

  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
