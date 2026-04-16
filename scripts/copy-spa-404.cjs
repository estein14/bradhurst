/**
 * GitHub Pages: duplicate index.html as 404.html so refreshes and deep links
 * load the CRA shell (see https://create-react-app.dev/docs/deployment/#notes-on-client-side-routing).
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const from = path.join(root, "build", "index.html");
const to = path.join(root, "build", "404.html");

if (!fs.existsSync(from)) {
	console.warn("copy-spa-404: build/index.html missing; skip");
	process.exit(0);
}
fs.copyFileSync(from, to);
console.log("copy-spa-404: wrote build/404.html");
