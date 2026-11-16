#!/usr/bin/env bash
# Downloads the current site/wwwroot of the web app as a zip via the Kudu API.
set -euo pipefail

: "${SUBSCRIPTION_ID:?}" "${RESOURCE_GROUP:?}" "${WEB_APP_NAME:?}" "${BACKUP_DIR:?}"

mkdir -p "$BACKUP_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$BACKUP_DIR/${WEB_APP_NAME}-wwwroot-${STAMP}.zip"
SETTINGS_OUT="$BACKUP_DIR/${WEB_APP_NAME}-config-${STAMP}.json"

# Kudu (SCM) host, e.g. guideline-react.scm.azurewebsites.net
SCM_HOST="$(az webapp show \
  --subscription "$SUBSCRIPTION_ID" -g "$RESOURCE_GROUP" -n "$WEB_APP_NAME" \
  --query "enabledHostNames[?contains(@, '.scm.')] | [0]" -o tsv)"

if [[ -z "$SCM_HOST" ]]; then
  echo "Could not determine the SCM host for $WEB_APP_NAME" >&2
  exit 1
fi

TOKEN="$(az account get-access-token --subscription "$SUBSCRIPTION_ID" --query accessToken -o tsv)"

echo "Backing up https://$SCM_HOST/api/zip/site/wwwroot/ -> $OUT"
curl -fsSL \
  -H "Authorization: Bearer $TOKEN" \
  -o "$OUT" \
  "https://$SCM_HOST/api/zip/site/wwwroot/"

if [[ ! -s "$OUT" ]]; then
  echo "Backup file is empty: $OUT" >&2
  exit 1
fi

# Also save the site configuration (runtime, startup command, etc.).
# App settings are not saved, so no secrets end up on disk.
az webapp config show \
  --subscription "$SUBSCRIPTION_ID" -g "$RESOURCE_GROUP" -n "$WEB_APP_NAME" \
  -o json > "$SETTINGS_OUT"

echo "Backup complete: $OUT ($(du -h "$OUT" | cut -f1))"
echo "Site config saved: $SETTINGS_OUT"
