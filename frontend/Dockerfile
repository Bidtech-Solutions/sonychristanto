# syntax=docker/dockerfile:1.7
# ---------- dependencies ----------
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# --ignore-scripts: "postinstall: nuxt prepare" needs the source, which is not copied yet.
RUN --mount=type=cache,target=/root/.npm npm ci --ignore-scripts

# ---------- dev (docker-compose.yml, hot reload) ----------
FROM deps AS dev
ENV HOST=0.0.0.0 PORT=3000 NUXT_TELEMETRY_DISABLED=1
EXPOSE 3000 24678
CMD ["npx", "nuxt", "dev"]

# ---------- build ----------
FROM deps AS build
# Values baked into PRERENDERED pages (canonical URLs, GTM). Passed by CI.
ARG NUXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NUXT_PUBLIC_GTM_ID=
ARG NUXT_PUBLIC_SECURITY_CONTACT=mailto:security@sonychristanto.com
ENV NUXT_PUBLIC_SITE_URL=$NUXT_PUBLIC_SITE_URL \
    NUXT_PUBLIC_GTM_ID=$NUXT_PUBLIC_GTM_ID \
    NUXT_PUBLIC_SECURITY_CONTACT=$NUXT_PUBLIC_SECURITY_CONTACT \
    NUXT_TELEMETRY_DISABLED=1
COPY . .
RUN npm run build

# ---------- runtime ----------
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 TZ=Asia/Jakarta
COPY --from=build --chown=node:node /app/.output ./.output
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/robots.txt > /dev/null || exit 1
CMD ["node", ".output/server/index.mjs"]
