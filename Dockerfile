FROM node:22.12-slim AS base
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# 1. FORCE Prisma to be silent during the install phase
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
# 2. Tell pnpm to ignore all scripts (like prisma postinstall)
ENV pnpm_config_ignore_scripts=true

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/ ./packages/

# Install without running any scripts
RUN pnpm install --frozen-lockfile

# Now copy the rest of your source code
COPY . .

# 3. MANUALLY run the generate command now that the file definitely exists
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Build the project
RUN pnpm run build:api

EXPOSE 3000
CMD ["node", "apps/api/dist/main.js"]