import { useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Topbar from "../Topbar";

function Authguard() {
  const { loadingUser } = useSelector((state: RootState) => state.ui);
  const user = useSelector((state: RootState) => state.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user.loggedIn) return navigate("/");
  }, [loadingUser, user.loggedIn, navigate]);

  return (
    <>
      <Topbar></Topbar>
      <Outlet />
    </>
  );
}

export default Authguard;
