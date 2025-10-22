// server.js (シンプル版: APIキー・ジョブIDなし)
const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sanitize = require('sanitize-filename');

const PORT = process.env.PORT || 3000;
const DL_DIR = path.resolve(__dirname, 'downloads');

if (!fs.existsSync(DL_DIR)) fs.mkdirSync(DL_DIR, { recursive: true });

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Validate simple YouTube URL
function isYoutubeUrl(u) {
  try {
    const p = new URL(u);
    return /(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(p.hostname);
  } catch (e) { return false; }
}

// POST /api/download
// body: { url, format, owner_confirm }
app.post('/api/download', async (req, res) => {
  const { url, format, owner_confirm } = req.body || {};
  if (!url || !isYoutubeUrl(url)) return res.status(400).json({ message: '有効なYouTube URLを送ってください。' });
  if (!owner_confirm) return res.status(403).json({ message: '所有者確認が必要です（owner_confirm:true）' });

  // create output directory
  const outDirName = Date.now().toString(36) + '-' + crypto.randomBytes(3).toString('hex');
  const outDir = path.join(DL_DIR, outDirName);
  fs.mkdirSync(outDir, { recursive: true });

  // output template
  const outTemplate = path.join(outDir, '%(title)s.%(ext)s');

  const args = ['-o', outTemplate, '--no-playlist'];
  if (format) {
    const f = String(format).toLowerCase();
    if (f === 'mp3') {
      args.push('-x', '--audio-format', 'mp3');
    } else if (['mp4','m4a','webm'].includes(f)) {
      args.push('-f', f);
    }
  }
  args.push(url);

  const proc = spawn('yt-dlp', args, { env: process.env });

  let lastStdout = '';
  proc.stdout.on('data', chunk => {
    lastStdout += chunk.toString();
  });
  proc.stderr.on('data', chunk => {
    lastStdout += chunk.toString();
  });

  proc.on('error', err => {
    return res.status(500).json({ message: 'yt-dlp の実行に失敗しました: ' + err.message });
  });

  proc.on('close', code => {
    if (code !== 0) {
      return res.status(500).json({ message: 'yt-dlp は非ゼロ終了コードで終了しました (' + code + ')', detail: lastStdout });
    }
    // list files
    const files = [];
    try {
      const names = fs.readdirSync(outDir);
      for (const n of names) {
        const stat = fs.statSync(path.join(outDir, n));
        if (stat.isFile()) {
          const urlPath = '/files/' + encodeURIComponent(outDirName) + '/' + encodeURIComponent(n);
          files.push({ name: n, url: urlPath });
        }
      }
    } catch (e) {
      // ignore
    }
    return res.json({ message: 'download finished', output: files });
  });
});

// serve downloaded files
app.get('/files/:dir/:filename', (req, res) => {
  const dir = req.params.dir;
  const filename = sanitize(req.params.filename);
  const filePath = path.join(DL_DIR, dir, filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('not found');
  res.download(filePath, filename);
});

app.get('/', (req, res) => res.send('yt-dlp simple server alive'));

app.listen(PORT, () => {
  console.log('Server listening on', PORT);
  console.log('Downloads directory:', DL_DIR);
});
