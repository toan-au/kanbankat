import { useSelector } from "react-redux";
import Topbar from "../Topbar";
import { Outlet, useNavigate } from "react-router-dom";
import { RootState } from "../../state/store";
import { useEffect } from "react";

function Template() {
  const user = useSelector((state: RootState) => state.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (user.loggedIn) return navigate(-1);
  }, [user, navigate]);

  return (
    <>
      <Topbar></Topbar>
      <Outlet />
    </>
  );
}

export default Template;
