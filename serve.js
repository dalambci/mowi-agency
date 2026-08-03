/* Tiny static file server for local testing — not part of the shipped site.
   Run directly with `node serve.js`, or just double-click
   start-local-server.bat in the same folder. No dependencies. */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8765;
const ROOT = __dirname;

const TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

http
  .createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split("?")[0]);
    if (urlPath.endsWith("/")) urlPath += "index.html";

    let filePath = path.join(ROOT, urlPath);

    fs.readFile(filePath, (err, data) => {
      // Mirrors production's Cloudways "Internal rewrite" Web Rule, which is
      // scoped to /docs/* only (^/docs/([a-z0-9-]+)$ -> /docs/$1.html) — kept
      // scoped the same way here so local testing doesn't imply extensionless
      // URLs work anywhere they actually don't. See js/docs-nav.js for details.
      if (err && !path.extname(filePath) && urlPath.startsWith("/docs/")) {
        filePath += ".html";
        fs.readFile(filePath, (err2, data2) => respond(err2, data2, filePath));
        return;
      }
      respond(err, data, filePath);
    });

    function respond(err, data, servedPath) {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found: " + urlPath);
        return;
      }
      const ext = path.extname(servedPath);
      res.writeHead(200, { "Content-Type": TYPES[ext] || "application/octet-stream" });
      res.end(data);
    }
  })
  .listen(PORT, () => {
    console.log(`Mowi site running at http://localhost:${PORT}`);
    console.log("Keep this window open while testing. Close it (or Ctrl+C) to stop the server.");
  });
