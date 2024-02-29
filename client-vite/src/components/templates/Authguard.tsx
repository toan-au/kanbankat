import { useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import Topbar from "../Topbar";

function Authguard() {
  const user = useSelector((state: RootState) => state.currentUser);
  const location = useLocation();
  const navigate = useNavigate();

  

  useEffect(() => {
    function authorize() {
      if (!user.loggedIn) return navigate("/");
    }
    setTimeout(authorize, 100);
  }, [user.loggedIn, navigate, location.pathname]);

  return (
    <>
      <Topbar></Topbar>
      <Outlet />
    </>
  );
}

export default Authguard;
