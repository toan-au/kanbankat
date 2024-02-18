import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../state/store";
import { getUserAsync, logoutAsync } from "../state/current-user/current-user";

function Home() {
  const currentUser = useSelector((state: RootState) => state.currentUser);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(getUserAsync());
  }, [dispatch]);

  return (
    <main id="home" className="h-screen">
      <div className="container mx-auto">
        {!currentUser.loggedIn && (
          <a
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            href="/auth/google"
          >
            Sign in with Google
          </a>
        )}
        {currentUser.loggedIn && (
          <a
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => dispatch(logoutAsync())}
          >
            Log out
          </a>
        )}
      </div>
    </main>
  );
}

export default Home;
