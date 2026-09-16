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
  ".mjs": "application/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  // Demo sections (2026-09-16): sample-call audio + its caption manifest.
  // Neither existed before — a missing entry here silently 404s nothing
  // (fs.readFile still succeeds), but falls back to
  // application/octet-stream, which Safari/WebKit refuses to play as
  // <audio src>. Production's nginx already serves these correctly; this
  // is purely a local-dev gap being closed.
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".json": "application/json",
  ".webp": "image/webp",
};

http
  .createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split("?")[0]);
    if (urlPath.endsWith("/")) urlPath += "index.html";

    let filePath = path.join(ROOT, urlPath);

    fs.stat(filePath, (err, stat) => {
      // Mirrors production's Cloudways "Internal rewrite" Web Rules, which map
      // any extensionless path to its .html file site-wide (both the root
      // marketing pages and /docs/* articles) — see CLAUDE.md "Extensionless
      // URLs" section for the exact rules.
      if (err && !path.extname(filePath)) {
        filePath += ".html";
        fs.stat(filePath, (err2, stat2) => respond(err2, stat2, filePath));
        return;
      }
      respond(err, stat, filePath);
    });

    function respond(err, stat, servedPath) {
      if (err || !stat.isFile()) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found: " + urlPath);
        return;
      }
      const ext = path.extname(servedPath);
      const type = TYPES[ext] || "application/octet-stream";

      // Range support (2026-09-16, demo sections): WebKit/Safari's <audio>
      // requires a working Range response to play at all in some cases —
      // production's nginx already sends one; this dev-only server never
      // needed it before there was any audio on the site.
      const range = req.headers.range;
      if (range) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(range);
        if (match) {
          const start = match[1] ? parseInt(match[1], 10) : 0;
          const end = match[2] ? parseInt(match[2], 10) : stat.size - 1;
          if (start <= end && end < stat.size) {
            res.writeHead(206, {
              "Content-Type": type,
              "Content-Range": `bytes ${start}-${end}/${stat.size}`,
              "Accept-Ranges": "bytes",
              "Content-Length": end - start + 1,
            });
            fs.createReadStream(servedPath, { start, end }).pipe(res);
            return;
          }
        }
      }

      res.writeHead(200, { "Content-Type": type, "Accept-Ranges": "bytes", "Content-Length": stat.size });
      fs.createReadStream(servedPath).pipe(res);
    }
  })
  .listen(PORT, () => {
    console.log(`Mowi site running at http://localhost:${PORT}`);
    console.log("Keep this window open while testing. Close it (or Ctrl+C) to stop the server.");
  });
