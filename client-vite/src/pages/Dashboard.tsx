import ArchivedBoards from "../components/dashboard/ArchivedBoards";
import Boards from "../components/dashboard/Boards";

function Dashboard() {
  return (
    <main id="dashboard" className="container mx-auto">
      <Boards />
      <ArchivedBoards />
    </main>
  );
}

export default Dashboard;
