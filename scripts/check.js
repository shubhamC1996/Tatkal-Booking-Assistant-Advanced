const fs = require("node:fs");
const path = require("node:path");
const required = ["index.html", "styles.css", "app.js", "manifest.json", "sw.js", "icon.svg"];
for (const file of required) {
  if (!fs.existsSync(path.join(process.cwd(), file))) throw new Error("Missing required file: " + file);
}
const html = fs.readFileSync("index.html", "utf8");
for (const id of ["installApp", "exportData", "importData", "passengerList", "tripDetailsForm"]) {
  if (!html.includes('id="' + id + '"')) throw new Error("Missing UI element: " + id);
}
const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));
if (manifest.display !== "standalone" || !manifest.start_url) throw new Error("PWA manifest configuration is incomplete");
const sw = fs.readFileSync("sw.js", "utf8");
for (const asset of ["./index.html", "./styles.css", "./app.js", "./manifest.json", "./icon.svg"]) {
  if (!sw.includes(asset)) throw new Error("Service worker cache missing: " + asset);
}
console.log("PWA project checks passed.");
