# syntax=docker/dockerfile:1

# ── 1. Build the SPA ─────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Baked into the bundle at build time. "/" means "same origin as the page",
# which is what this single-container setup uses.
ARG VITE_API_URL=/
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── 2. Bundle the server ─────────────────────────────────────────────────────
# @libsql/client and libsql stay external: libsql is a native module loaded from
# node_modules at runtime, so it must not be inlined into the bundle.
RUN npx esbuild server/index.ts \
      --bundle --platform=node --format=esm --target=node22 \
      --outfile=server/index.mjs \
      --external:@libsql/client --external:libsql

# ── 3. Runtime ───────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    DIST_DIR=/app/dist \
    PORT=3000 \
    HOST=0.0.0.0 \
    TURSO_DATABASE_URL=file:/data/leaderboard.db

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/server/index.mjs ./server/index.mjs
COPY --from=build /app/dist ./dist

# Writable dir for the SQLite file, owned by the unprivileged user.
RUN mkdir -p /data && chown -R node:node /data
USER node

EXPOSE 3000
VOLUME ["/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server/index.mjs"]