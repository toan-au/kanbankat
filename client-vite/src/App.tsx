import { Outlet } from "react-router-dom";
import Topbar from "./components/Topbar";

function App() {
  return (
    <>
      <Topbar></Topbar>
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default App;
