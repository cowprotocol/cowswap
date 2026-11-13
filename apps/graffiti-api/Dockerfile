# syntax=docker/dockerfile:1

# Build context is the repo root: the install reads the workspace lockfile, not this directory.

FROM node:22.15.1-bookworm-slim AS builder

# CI=true: pnpm aborts removing a node_modules directory non-interactively without it.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    CI=true
WORKDIR /repo

RUN corepack enable

COPY . .

# better-sqlite3 is native; `pnpm.allowBuilds` in the root package.json lets its build script run.
RUN pnpm install --filter @cowprotocol/graffiti-api --frozen-lockfile

RUN pnpm --filter @cowprotocol/graffiti-api run build

# `pnpm deploy` requires --legacy on pnpm 10, and --legacy re-installs the workspace *root*
# importer as well — whose prod dependencies are next, WalletConnect and Lingui, ~640MB this
# image never loads. graffiti-api depends on no workspace package, so emptying the root importer
# leaves graffiti-api's own resolution to the lockfile while cutting the deployed closure from
# 630 packages to 227.
RUN node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));p.dependencies={};p.devDependencies={};delete p.scripts.prepare;fs.writeFileSync('package.json',JSON.stringify(p,null,2))" \
  && pnpm --filter @cowprotocol/graffiti-api deploy --prod --legacy --no-frozen-lockfile /out

# `pnpm deploy` packs the project the way `npm pack` would, so it honours
# apps/graffiti-api/.gitignore and drops the very dist/ the build just produced.
RUN cp -r apps/graffiti-api/dist /out/dist

FROM node:22.15.1-bookworm-slim AS runtime

ARG COMMIT_HASH=unknown
ENV NODE_ENV=production \
    COMMIT_HASH=$COMMIT_HASH \
    HOST=0.0.0.0 \
    PORT=3199 \
    GRAFFITI_DB=/data/graffiti.db

RUN groupadd --gid 10001 graffiti \
  && useradd --uid 10001 --gid 10001 --no-create-home --shell /usr/sbin/nologin graffiti \
  && install -d -o 10001 -g 10001 /data

WORKDIR /app
COPY --from=builder --chown=10001:10001 /out /app

USER 10001:10001
EXPOSE 3199
VOLUME ["/data"]

CMD ["node", "dist/src/server.js"]
