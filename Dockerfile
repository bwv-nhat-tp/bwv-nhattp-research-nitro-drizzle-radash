# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock .yarnrc.yml tsconfig.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/front/package.json apps/front/package.json
COPY packages/domain/package.json packages/domain/package.json
COPY packages/factory/package.json packages/factory/package.json
RUN yarn install --immutable

FROM deps AS builder
COPY apps apps
COPY packages packages
RUN yarn workspace @intern/front build
RUN yarn workspace @intern/api build

FROM deps AS migrator
COPY packages packages
CMD ["yarn", "db:migrate"]

FROM node:22-alpine AS api
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8081
COPY --from=builder /app/apps/api/.output/server ./
EXPOSE 8081
CMD ["node", "index.mjs"]

FROM nginx:1.27-alpine AS front
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/front/dist /usr/share/nginx/html
EXPOSE 80
