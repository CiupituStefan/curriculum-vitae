#!/usr/bin/env bash
# Runs the database/RLS test-suite.
#  - With DATABASE_URL set (CI service container): uses that server.
#  - Otherwise: starts a throw-away local PostgreSQL cluster (requires PostgreSQL binaries).
set -euo pipefail
cd "$(dirname "$0")/../.."

cleanup() { :; }
if [[ -z "${DATABASE_URL:-}" ]]; then
  PGBIN="$(dirname "$(command -v pg_ctl 2>/dev/null || ls /usr/lib/postgresql/*/bin/pg_ctl | tail -1)")"
  DATA="$(mktemp -d)"; PORT="${PGPORT_TEST:-54329}"
  RUNAS=()
  if [[ "$(id -u)" == "0" ]]; then chown postgres "$DATA"; RUNAS=(sudo -u postgres); fi
  "${RUNAS[@]}" "$PGBIN/initdb" -D "$DATA" -U postgres -A trust >/dev/null
  "${RUNAS[@]}" "$PGBIN/pg_ctl" -D "$DATA" -o "-p $PORT -k /tmp" -l "$DATA/log" -w start >/dev/null
  cleanup() { "${RUNAS[@]}" "$PGBIN/pg_ctl" -D "$DATA" -m fast stop >/dev/null || true; rm -rf "$DATA"; }
  DATABASE_URL="postgresql://postgres@localhost:$PORT/postgres"
fi
trap cleanup EXIT

run() { psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -f "$1"; }
run supabase/tests/00_supabase_shim.sql
for migration in supabase/migrations/*.sql; do run "$migration"; done
run supabase/seed.sql
run supabase/tests/10_rls.test.sql 2>&1 | sed 's/^psql:[^ ]* NOTICE:  //'
echo "Database tests passed."
