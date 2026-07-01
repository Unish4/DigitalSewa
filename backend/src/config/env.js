import dotenv from "dotenv";

dotenv.config();

const REQUIRED_ENV_VARS = ["MONGODB_URI", "PORT", "NODE_ENV", "CLIENT_URL"];

REQUIRED_ENV_VARS.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Environment variable not set: ${varName}`);
  }
});

const ENV = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI,
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
};

export default ENV;
