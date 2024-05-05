import { FaGoogle } from "react-icons/fa6";
import logo from "../assets/images/kanbankat-logo.png";

function Home() {
  return (
    <main id="home" className="h-full">
      <div className="flex container mx-auto mt-5 flex-col gap-5 md:flex-row-reverse">
        <div
          id="login-box"
          className="flex flex-col gap-8 mx-auto bg-white p-8 w-full rounded-md md:flex-row"
        >
          <div className="flex-1">
            <h2 className="text-3xl mb-6 font-bold">
              The purr-fect Kanban platform
            </h2>
            <ul className="flex flex-col gap-7">
              <li>
                <h5 className="font-bold">Boards, Lists and tasks</h5>
                <p>
                  Organize your projects in boards, track progress with lists
                  and work items with tasks
                </p>
              </li>
              <li>
                <h5 className="font-bold">Drag and drop</h5>
                <p>
                  Highly interactive drag and drop makes it easy for anyone to
                  learn
                </p>
              </li>
              <li>
                <h5 className="font-bold">Auto-sync</h5>
                <p>
                  All changes are saved automatically so you never lose progress
                </p>
              </li>
              <li>
                <h5 className="font-bold">Labels</h5>
                <p>
                  Tag tasks with colours for better visibility. Add meaning to
                  your colours by giving them labels
                </p>
              </li>
              <li>
                <h5 className="font-bold">OAuth</h5>
                <p>
                  Single in with Google OAuth, we never store personal data.
                </p>
              </li>
              <li>
                <h5 className="font-bold">Collaboration</h5>
                <p>Coming soon...</p>
              </li>
              <li>
                <h5 className="font-bold">File upload</h5>
                <p>Coming soon...</p>
              </li>
            </ul>
          </div>
          <div className="flex-1"></div>
        </div>
        <div
          id="login-box"
          className="flex flex-col mx-auto bg-white p-8 w-full rounded-md md:w-[calc(40%)]"
        >
          <div className="mb-4">
            <img src={logo} className="h-18" alt="Flowbite Logo" />
          </div>
          <div className="flex flex-col flex-1">
            <h3 className="font-bold mb-2">Sign in to your account </h3>
            <ul className="flex flex-col content-stretch gap-2 w-full">
              <li>
                <a
                  className="inline-block relative bg-catLightBlue hover:bg-catDarkBlue text-white font-bold py-2 px-4 rounded w-full"
                  href="/auth/google"
                >
                  <FaGoogle className="inline mr-1 relative -top-0.5" />
                  Continue with Google
                </a>
              </li>
              <li>
                <a
                  className="inline-block relative bg-catLightBlue hover:bg-catDarkBlue text-white font-bold py-2 px-4 rounded w-full"
                  href="/auth/google"
                >
                  <FaGoogle className="inline mr-1 relative -top-0.5" />
                  Continue as guest
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Home;
