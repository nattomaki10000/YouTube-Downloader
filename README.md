# yt-downloader-simple

シンプル版の yt-dlp サーバー。**APIキー・ジョブID 機能はありません**。  
代わりに、フロントエンドから `owner_confirm: true` を必ず送る（UI にチェック）ことで所有者確認を行います。

## ファイル
- index.html - フロントエンド（公開ディレクトリに置いてください）
- server.js - サーバー（yt-dlp を実行して同期的にダウンロード）
- package.json, Dockerfile, docker-compose.yml

## 使い方（ローカル）
1. Node.js をインストール
2. `npm install`
3. `node server.js`
4. ブラウザで `index.html` を開き、URL を入力、所有者チェックを入れて実行

## 注意
- このツールでダウンロードするのは **あなたが権利を持つ動画のみ** にしてください。
- 本番運用する場合は、認証やレート制限、ログ保管、保存期間ポリシー等を追加してください。
