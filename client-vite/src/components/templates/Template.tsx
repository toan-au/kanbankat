import { useSelector } from "react-redux";
import Topbar from "../Topbar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { RootState } from "../../state/store";
import { useEffect } from "react";

function Template() {
  const user = useSelector((state: RootState) => state.currentUser);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {}, [user, navigate, location]);

  return (
    <>
      <Topbar></Topbar>
      <Outlet />
    </>
  );
}

export default Template;
