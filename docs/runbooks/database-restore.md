# Database Operations & Disaster Recovery Runbook

## 1. Overview & Architecture
LearnHub utilizes Neon (serverless PostgreSQL 16) with two dedicated connection modes:
1. **Runtime Pooled Connection (`pgsql`)**:
   - Host: `ep-xxxx-pooler.REGION.aws.neon.tech`
   - Mode: Transaction pooling via PgBouncer.
   - Used by: Web API requests, queue workers, Laravel Horizon.
   - Strict rule: No session-level locks or state (`SET`, `LISTEN/NOTIFY`, advisory locks).
2. **Direct Unpooled Connection (`pgsql_direct`)**:
   - Host: `ep-xxxx.REGION.aws.neon.tech`
   - Mode: Direct PostgreSQL connection.
   - Used by: `php artisan migrate`, `db:seed`, logical backups (`pg_dump`).

---

## 2. Point-In-Time Recovery (PITR) via Neon Console/CLI
Neon maintains continuous WAL archives allowing point-in-time branch creation without downtime.

### Recovery Steps:
1. Identify incident timestamp (UTC): e.g. `2026-10-10T14:32:00Z`.
2. Create a new recovery branch from parent at the exact recovery timestamp:
   ```bash
   neonctl branches create \
     --project-id <PROJECT_ID> \
     --name recovery-20261010-point \
     --parent main \
     --timestamp 2026-10-10T14:32:00Z
   ```
3. Retrieve connection string for the recovery branch:
   ```bash
   neonctl connection-string recovery-20261010-point
   ```
4. Update `DB_URL` and `DB_URL_DIRECT` in production environment or Kubernetes Secrets.
5. Restart application containers:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```

---

## 3. Scheduled Logical Backups (S3 `pg_dump`)
For financial and ledger compliance (`SRS 7.2`), run daily logical backups via the direct connection:

```bash
#!/usr/bin/env bash
set -euo pipefail

BACKUP_NAME="learnhub_backup_$(date +%Y%m%d_%H%M%S).sql.gz"

echo "Executing pg_dump against direct Neon connection..."
pg_dump "${DB_URL_DIRECT}" \
  --format=custom \
  --no-owner \
  --no-privileges \
  | gzip > "/tmp/${BACKUP_NAME}"

echo "Uploading to S3 cold storage bucket..."
aws s3 cp "/tmp/${BACKUP_NAME}" "s3://learnhub-db-backups/daily/${BACKUP_NAME}"

rm "/tmp/${BACKUP_NAME}"
echo "Backup complete: ${BACKUP_NAME}"
```

---

## 4. Cold Start & Connection Pool Sizing
- **Autosuspend:** Dev and preview branches may autosuspend. In production, compute sizing must disable autosuspend or use minimum reserve compute.
- **Max Client Connections:** Sized to `(FPM_MAX_CHILDREN + HORIZON_MAX_PROCESSES) <= POOLER_CONNECTION_LIMIT`.
- **Health Probes:** Deep health probe endpoint available at `/api/v1/health/deep` monitoring pooler latency and query execution.
