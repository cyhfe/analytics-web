import "dotenv/config";
import replace from "@rollup/plugin-replace";

export default {
  input: "tracker.js",
  output: {
    name: "tracker",
    file: "dist/tracker.js",
    format: "iife",
  },
  plugins: [
    replace({
      "process.env.ENDPOINT": JSON.stringify(process.env.ENDPOINT),
      preventAssignment: true,
    }),
  ],
};
