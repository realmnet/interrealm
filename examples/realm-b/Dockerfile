FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY pnpm-workspace.yaml ./
COPY turbo.json ./

COPY packages/realm-sdk/package.json ./packages/realm-sdk/
COPY examples/realm-b/package.json ./examples/realm-b/

RUN npm install -g pnpm
RUN pnpm install

COPY packages/realm-sdk ./packages/realm-sdk
COPY examples/realm-b ./examples/realm-b
COPY tsconfig.json ./

RUN pnpm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/realm-sdk/dist ./packages/realm-sdk/dist
COPY --from=builder /app/packages/realm-sdk/package.json ./packages/realm-sdk/
COPY --from=builder /app/examples/realm-b/dist ./examples/realm-b/dist
COPY --from=builder /app/examples/realm-b/package.json ./examples/realm-b/

WORKDIR /app/examples/realm-b

EXPOSE 3002

CMD ["node", "dist/agent.js"]