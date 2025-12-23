#!/bin/sh
# Helper script to update pnpm-lock.yaml
# Run this before building Docker images if lockfile is outdated

echo "Updating pnpm-lock.yaml..."
pnpm install

echo "Lockfile updated successfully!"
echo "You can now run: docker-compose build"

