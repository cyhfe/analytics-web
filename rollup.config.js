import dotenv from "dotenv";
dotenv.config();

export default {
  input: "tracker.js",
  output: {
    file: "dist/tracker.js",
    format: "umd",
  },
};
