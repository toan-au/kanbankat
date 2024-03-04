import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Template from "./components/templates/Template";
import Dashboard from "./pages/Dashboard";
import Authguard from "./components/templates/Authguard";
import Board from "./pages/Board";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./state/store";
import { useEffect } from "react";
import { getUserAsync } from "./state/current-user/current-user";
import Overlay from "./components/UI/Overlay";

function App() {
  const { loggedIn } = useSelector((state: RootState) => state.currentUser);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(getUserAsync());
  }, [dispatch]);

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

  return (
    <>
      <Overlay></Overlay>
      <RouterProvider router={router}></RouterProvider>
    </>
  );
}

export default App;
