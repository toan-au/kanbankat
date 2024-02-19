import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";

function Template() {
  return (
    <>
      <Topbar></Topbar>
      <Outlet />
    </>
  );
}

export default Template;
