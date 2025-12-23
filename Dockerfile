# Multi-stage Dockerfile for TaskOPedia Microservices

# Stage 1: Dependencies
FROM node:18-alpine AS dependencies
RUN corepack enable && corepack prepare pnpm@10.18.1 --activate
WORKDIR /app

# Copy package files
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/gateway/package.json ./apps/gateway/
COPY apps/logger/package.json ./apps/logger/

# Install dependencies without running postinstall scripts
# Postinstall (db:generate) will run in build stage where all files are available
# Note: Using --no-frozen-lockfile to handle outdated lockfiles gracefully
RUN pnpm install --no-frozen-lockfile --ignore-scripts

# Stage 2: Build
FROM node:18-alpine AS build
RUN corepack enable && corepack prepare pnpm@10.18.1 --activate
WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=dependencies /app/apps/gateway/node_modules ./apps/gateway/node_modules
COPY --from=dependencies /app/apps/logger/node_modules ./apps/logger/node_modules

# Copy all source files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api ./apps/api
COPY apps/gateway ./apps/gateway
COPY apps/logger ./apps/logger
COPY packages ./packages

# Generate Prisma Client
RUN pnpm run db:generate

# Build all services
RUN pnpm run build

# Stage 3: Production
FROM node:18-alpine AS production
RUN corepack enable && corepack prepare pnpm@10.18.1 --activate
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/gateway/package.json ./apps/gateway/
COPY apps/logger/package.json ./apps/logger/

# Copy production dependencies from dependencies stage
# This avoids lockfile issues and is faster
# Note: Dev dependencies are included but won't affect runtime
# For smaller images, consider installing only production deps in a separate stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=dependencies /app/apps/gateway/node_modules ./apps/gateway/node_modules
COPY --from=dependencies /app/apps/logger/node_modules ./apps/logger/node_modules

# Copy built applications and Prisma
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/apps/gateway/dist ./apps/gateway/dist
COPY --from=build /app/apps/logger/dist ./apps/logger/dist

# Copy Prisma client generated files from build stage
# Prisma generates files in .pnpm directory structure for pnpm workspaces
# Copy the entire .pnpm directory to ensure Prisma client works
COPY --from=build /app/node_modules/.pnpm ./node_modules/.pnpm

# Copy entrypoint script for API service (auto-migration)
COPY apps/api/docker-entrypoint.sh ./apps/api/docker-entrypoint.sh
RUN chmod +x ./apps/api/docker-entrypoint.sh

# Install netcat for database connection check
RUN apk add --no-cache netcat-openbsd

# Create logs directory for logger service
RUN mkdir -p /app/apps/logger/logs

# Expose ports
EXPOSE 3000 4000 4001

# Default command (will be overridden in docker-compose)
CMD ["node", "apps/api/dist/main.js"]

