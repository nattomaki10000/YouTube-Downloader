YouTube direct URL fetcher (Node.js + yt-dlp)
===========================================

Contents of the ZIP:
- index.html       (GitHub Pages / static front-end)
- server.js        (Node.js Express server for Render)
- package.json
- Dockerfile       (optional: use if you want a Docker-based deploy)
- README.md        (this file)

What it does
- The front-end posts a YouTube URL to the server at /api/geturl
- The server runs yt-dlp (via youtube-dl-exec) with --get-url and returns direct media URLs (often googlevideo.com)
- The server does NOT save media to disk — it returns direct playable URLs

Usage (Render)
1. Push these files to a GitHub repo.
2. Create a new Web Service on Render and connect the repo.
3. If not using Docker: set Build Command to `npm install`, Start Command to `npm start`.
   If you see errors related to yt-dlp not found, use the Dockerfile deployment.
4. After deploy, note the Render URL (e.g. https://your-app.onrender.com). Edit index.html to set SERVER_URL to that URL, then host index.html on GitHub Pages (or open locally and test).
5. Open the GitHub Pages page, input YouTube URL, click button — it will show direct googlevideo.com URLs returned by the server.

Notes & troubleshooting
- youtube-dl-exec may download a binary at runtime. If Render blocks that, use the Dockerfile to preinstall yt-dlp via pip3.
- For production, restrict CORS origin and strengthen rate-limiting and authentication.
- Always obey copyright law — use only on videos you own or have rights to.
