#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# elemental-erp: backup script
#
# Usage:
#   ./scripts/backup.sh [output_dir]
#
# Creates a timestamped tarball in $output_dir (default: ./backups) containing:
#   - pg_dump of the Postgres data
#   - NocoDB meta export (project + table + view definitions) via the API
#
# Requires:
#   - docker compose stack running (services `postgres` and `nocodb`)
#   - NOCODB_API_TOKEN exported (from .env or a CI secret)
# -----------------------------------------------------------------------------
set -euo pipefail

OUT_DIR="${1:-./backups}"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

mkdir -p "$OUT_DIR"

if [[ -z "${NOCODB_API_TOKEN:-}" ]]; then
  echo "warn: NOCODB_API_TOKEN not set, skipping NocoDB meta export" >&2
fi

echo "==> Dumping Postgres..."
docker compose -f infra/docker-compose.yml exec -T postgres \
  pg_dump -U "${POSTGRES_USER:-elemental}" "${POSTGRES_DB:-elemental}" \
  > "$WORK/postgres.sql"

if [[ -n "${NOCODB_API_TOKEN:-}" ]]; then
  echo "==> Exporting NocoDB meta..."
  curl -fsSL \
    -H "xc-token: ${NOCODB_API_TOKEN}" \
    "${NOCODB_URL:-http://localhost:8080}/api/v2/meta/bases/" \
    > "$WORK/nocodb-bases.json"
fi

ARCHIVE="$OUT_DIR/elemental-backup-$TS.tar.gz"
tar -C "$WORK" -czf "$ARCHIVE" .
echo "==> Wrote $ARCHIVE"
