import prodKeys from "./prodkeys";
import devKeys from "./devkeys";

export interface Keys {
  googleClientID: string;
  googleClientSecret: string;
  githubClientID: string;
  githubClientSecret: string;
  cookieKey: string;
  mongoURI: string;
}

let keys: Keys;
if (process.env.NODE_ENV === "production") {
  keys = prodKeys;
} else {
  keys = devKeys;
}

export default keys;
