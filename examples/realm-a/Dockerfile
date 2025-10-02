FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY pnpm-workspace.yaml ./
COPY turbo.json ./

COPY packages/realm-sdk/package.json ./packages/realm-sdk/
COPY examples/realm-a/package.json ./examples/realm-a/

RUN npm install -g pnpm
RUN pnpm install

COPY packages/realm-sdk ./packages/realm-sdk
COPY examples/realm-a ./examples/realm-a
COPY tsconfig.json ./

RUN pnpm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/realm-sdk/dist ./packages/realm-sdk/dist
COPY --from=builder /app/packages/realm-sdk/package.json ./packages/realm-sdk/
COPY --from=builder /app/examples/realm-a/dist ./examples/realm-a/dist
COPY --from=builder /app/examples/realm-a/package.json ./examples/realm-a/

WORKDIR /app/examples/realm-a

EXPOSE 3001

CMD ["node", "dist/agent.js"]