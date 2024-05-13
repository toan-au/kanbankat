import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Template from "./components/templates/Template";
import Dashboard from "./pages/Dashboard";
import Authguard from "./components/templates/Authguard";
import Board from "./pages/Board";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./state/store";
import { useEffect } from "react";
import { syncUser } from "./state/current-user/current-user";
import Overlay from "./components/UI/Overlay";
import Authenticated from "./pages/Authenticated";

function App() {
  const { loadingUser } = useSelector((state: RootState) => state.ui);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(syncUser());
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
          path: "/oauth/success",
          element: <Authenticated></Authenticated>,
        },
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
      {!loadingUser && <RouterProvider router={router}></RouterProvider>}
    </>
  );
}

export default App;
