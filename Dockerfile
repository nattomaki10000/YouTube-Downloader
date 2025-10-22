# Dockerfile (simple)
FROM node:20-bullseye

RUN apt-get update && apt-get install -y python3 python3-pip ffmpeg && rm -rf /var/lib/apt/lists/*

RUN pip3 install --no-cache-dir yt-dlp

WORKDIR /app
COPY package.json package-lock.json* /app/
RUN npm install --production

COPY . /app

EXPOSE 3000
CMD ["node", "server.js"]
