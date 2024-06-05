FROM node:20-alpine as builder

# 1. essential downloads
RUN apk update
RUN apk add bash
RUN apk add curl
RUN apk add --no-cache crond
RUN apk --no-cache add ca-certificates wget
RUN wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub
RUN wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.28-r0/glibc-2.28-r0.apk
RUN apk add --no-cache --force-overwrite glibc-2.28-r0.apk

# 2. install bun
RUN npm install -g bun


# 3. install python, ffmpeg, and yt-dlp
RUN apk add --no-cache python3 py3-pip
RUN apk add --no-cache ffmpeg
RUN apk -U add yt-dlp


# 4. install dependencies
WORKDIR /usr/src/app
COPY package*.json ./
COPY bun.lockb ./
RUN bun install

# 5. copy app code, install frontend dependencies.
COPY . .
RUN npm install --prefix frontend

FROM builder as development
# 6. run app
EXPOSE 3000
CMD ["bun", "start"]

FROM builder as production

# 6. run app
EXPOSE 80
CMD ["bun", "start"]


# keep environment variables secret in env, push to deplyment and then put.
