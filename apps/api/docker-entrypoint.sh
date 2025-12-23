#!/bin/sh
set -e

echo "Waiting for database to be ready..."

# Wait for MySQL to be ready (commented - using PostgreSQL now)
# until nc -z mysql 3306; do
#   echo "Waiting for MySQL..."
#   sleep 2
# done

# Wait for PostgreSQL to be ready
until nc -z postgres 5432; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

echo "Database is ready!"

# Run Prisma migrations
echo "Running Prisma migrations..."
cd /app/apps/api
pnpm prisma migrate deploy --schema=prisma/schema.prisma || pnpm prisma db push --schema=prisma/schema.prisma --accept-data-loss

echo "Starting API server..."
# Start the application
exec node dist/src/main.js
