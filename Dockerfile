FROM node:22.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

# enable pnpm
RUN corepack enable

# copy repo
COPY . .

# install deps
RUN pnpm install --frozen-lockfile

# 🔥 build ONLY the API
RUN pnpm --filter api build

# production start
CMD cd apps/api && \
    echo "Starting API..." && \
    pnpm exec prisma migrate deploy && \
    echo "Running Nest..." && \
    node dist/main.js