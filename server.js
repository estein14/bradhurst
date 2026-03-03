import express from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5173;
const __dirname = path.resolve();

app.use("/static", express.static(path.join(__dirname, "static")));

app.get("/", (req, res) => {
	const html = fs
		.readFileSync(path.join(__dirname, "index.html"), "utf8")
		.replace("__API_KEY__", process.env.GOOGLE_MAPS_API_KEY || "");
	res.setHeader("Cache-Control", "no-store");
	res.send(html);
});

app.listen(PORT, () => {
	console.log(`Local map running → http://localhost:${PORT}`);
});
