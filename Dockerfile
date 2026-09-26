# Docs site for pixi-silk: static Astro build served by nginx.
# Timeweb Cloud App Platform builds this file from the repository root (framework: Dockerfile);
# it also runs anywhere Docker does. The container listens on 8080 (EXPOSE, the App Platform default).

# Base images. If the builder cannot reach Docker Hub, point these at a mirror, e.g.
# dockerhub.timeweb.cloud/library/node:24-slim and dockerhub.timeweb.cloud/library/nginx:1.27-alpine.
ARG NODE_IMAGE=node:24-slim
ARG NGINX_IMAGE=nginx:1.27-alpine

# ---- build ---------------------------------------------------------------------------------
FROM ${NODE_IMAGE} AS build
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH CI=true
RUN corepack enable
WORKDIR /repo

# install first (cached while only sources change); every workspace manifest must be present
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/pixi-silk/package.json packages/pixi-silk/
COPY apps/site/package.json apps/site/
RUN pnpm install --frozen-lockfile

COPY . .
# Build settings. App Platform environment variables reach only the running container, not this
# build, so change the defaults here. Verification codes are public: they end up in every <head>.
ARG SITE_URL=https://pixi-silk.schmooky.dev
ARG GOOGLE_SITE_VERIFICATION=
ARG YANDEX_VERIFICATION=
ARG BING_SITE_VERIFICATION=
ENV SITE_URL=$SITE_URL \
    GOOGLE_SITE_VERIFICATION=$GOOGLE_SITE_VERIFICATION \
    YANDEX_VERIFICATION=$YANDEX_VERIFICATION \
    BING_SITE_VERIFICATION=$BING_SITE_VERIFICATION
RUN pnpm site:build

# ---- serve ---------------------------------------------------------------------------------
FROM ${NGINX_IMAGE}
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/site/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
