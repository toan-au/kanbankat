import dotenv from 'dotenv'

export interface Keys {
  googleClientID: string;
  googleClientSecret: string;
  githubClientID: string;
  githubClientSecret: string;
  cookieKey: string;
  mongoURI: string;
}

if (process.env.NODE_ENV != 'production') {
  dotenv.config({path:__dirname+'/.env'})
}

let keys: Keys = {
  googleClientID: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  githubClientID: process.env.GITHUB_CLIENT_ID || "",
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET || "",
  cookieKey: process.env.COOKIE_KEY || "",
  mongoURI: process.env.MONGO_URI || "",
};

export default keys;
