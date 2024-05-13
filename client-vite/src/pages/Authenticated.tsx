import { useEffect } from "react";

function Authenticated() {
  useEffect(() => {
    const url = "/dashboard";
    window.opener.open(url, "_self");
    window.opener.focus();
    window.close();
  }, []);

  return <div>Authenticated!</div>;
}

export default Authenticated;
