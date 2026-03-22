FROM denoland/deno:alpine

WORKDIR /app

COPY . .

RUN deno cache src/main.ts

EXPOSE 8000

CMD ["run","--allow-net","--allow-env","--allow-read","--allow-write","--allow-sys","--allow-ffi","src/main.ts"]