/**
 * Serves the Create React App production build from `build/`.
 * Run `npm run build` first. For development use `npm start` (CRA dev server).
 *
 * Optional: load .env if you use dotenv for PORT etc. (API key is baked in at build time via REACT_APP_GOOGLE_MAPS_API_KEY).
 */
require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5173;
const buildDir = path.join(__dirname, "build");

app.use(express.static(buildDir));

app.get("*", (req, res) => {
	res.sendFile(path.join(buildDir, "index.html"));
});

app.listen(PORT, () => {
	console.log(`Production build → http://localhost:${PORT}`);
	console.log(`(Run "npm run build" first if build/ is missing)`);
});
