import { FaGoogle } from "react-icons/fa6";

function Home() {
  return (
    <main id="home" className="h-full">
      <div className="container mx-auto mt-5">
        <div
          id="login-box"
          className="flex flex-col-reverse mx-auto bg-white p-5 w-full rounded-md md:w-[calc(60%)] md:flex-row"
        >
          <div className="flex flex-col flex-1">
            <h3 className="font-bold mb-2">Sign in to your account </h3>
            <a
              className="relative bg-catLightBlue hover:bg-catDarkBlue text-white font-bold py-2 px-4 rounded w-fit"
              href="/auth/google"
            >
              <FaGoogle className="inline mr-1 relative -top-0.5" />
              Continue with Google
            </a>
          </div>
          <div className="flex-1">
            <h1 className="text-5xl font-bold">Kanban Kat</h1>
            <h3>Easy project management for cats and cat lovers</h3>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Home;
