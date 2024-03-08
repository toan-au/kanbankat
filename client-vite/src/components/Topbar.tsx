import { useSelector } from "react-redux";
import { RootState } from "../state/store";
import { Link } from "react-router-dom";

function Topbar() {
  const user = useSelector((state: RootState) => state.currentUser);

  function LoggedOutMenu() {
    return (
      <>
        <li>
          <a
            href="#"
            className="block py-2 px-3 md:p-0 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700"
            aria-current="page"
          >
            Features
          </a>
        </li>
        <li>
          <a
            href="#"
            className="block py-2 px-3 md:p-0 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 "
          >
            About
          </a>
        </li>
        <li>
          <a
            href="#"
            className="block py-2 px-3 md:p-0 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 "
          >
            Plans
          </a>
        </li>
      </>
    );
  }

  function LoggedInMenu() {
    return (
      <>
        <li>
          <Link
            to="/dashboard"
            className="block py-2 px-3 md:p-0  rounded"
            aria-current="page"
          >
            Dashboard
          </Link>
        </li>
      </>
    );
  }

  return (
    <nav className="fixed w-full bg-white border-gray-200 z-10">
      <div className="container flex flex-wrap items-center justify-between mx-auto p-2">
        <Link
          to={user.loggedIn ? "/dashboard" : "/"}
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <img
            src="https://flowbite.com/docs/images/logo.svg"
            className="h-8"
            alt="Flowbite Logo"
          />
          <span className="self-center text-2xl font-semibold whitespace-nowrap">
            Kanban Kat
          </span>
        </Link>
        <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          {!user.loggedIn && (
            <a
              type="button"
              href="/auth/google"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center"
            >
              Get started
            </a>
          )}
          {user.loggedIn && (
            <a
              type="button"
              href="/auth/logout"
              className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center"
            >
              Log out
            </a>
          )}
          <button
            data-collapse-toggle="navbar-cta"
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-controls="navbar-cta"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>
        <div
          className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
          id="navbar-cta"
        >
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white">
            {user.loggedIn ? <LoggedInMenu /> : <LoggedOutMenu />}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Topbar;
