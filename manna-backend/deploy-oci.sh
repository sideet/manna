#!/bin/bash
set -e

DEPLOY_DIR=~/manna

cd "$DEPLOY_DIR"

echo ">>> Logging in to GHCR..."
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GITHUB_OWNER" --password-stdin

echo ">>> Pulling latest image..."
docker compose -f docker-compose.oci.yaml pull manna-server

echo ">>> Restarting services..."
docker compose -f docker-compose.oci.yaml up -d

echo ">>> Cleaning up old images..."
docker image prune -f

echo ">>> Deploy complete!"
