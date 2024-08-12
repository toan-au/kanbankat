import prodKeys from "./prodkeys";

export interface Keys {
  googleClientID: string;
  googleClientSecret: string;
  githubClientID: string;
  githubClientSecret: string;
  cookieKey: string;
  mongoURI: string;
}

let keys: Keys = {
  googleClientID: "",
  googleClientSecret: "",
  githubClientID: "",
  githubClientSecret: "",
  cookieKey: "",
  mongoURI: ""
};


if (process.env.NODE_ENV === "production") {
  keys = prodKeys;
} else {
  // Dynamically import devKeys only when running in development mode
  import("./devkeys").then(module => {
    keys = module.default;
  }).catch(err => {
    console.error("Failed to load dev keys", err);
    // Handle the error or set defaults as needed
  });
}

export default keys;