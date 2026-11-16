#!/usr/bin/env bash
# Backs up the current site/wwwroot of the web app to a local zip.
#
# Files are downloaded one at a time through the Kudu VFS API (with retries)
# rather than as one server-generated zip: on slow links to Azure the single
# zip stream gets reset after ~100s, while small per-file requests succeed.
set -euo pipefail

: "${SUBSCRIPTION_ID:?}" "${RESOURCE_GROUP:?}" "${WEB_APP_NAME:?}" "${BACKUP_DIR:?}"

mkdir -p "$BACKUP_DIR"
BACKUP_DIR="$(cd "$BACKUP_DIR" && pwd)"
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
VFS_ROOT="https://$SCM_HOST/api/vfs/site/wwwroot/"

STAGING="$(mktemp -d)"
trap 'rm -rf "$STAGING"' EXIT

kudu_get() { # url [curl args...]
  local url="$1"; shift
  curl -fsSL --retry 5 --retry-all-errors --retry-delay 3 --max-time 300 \
    -H "Authorization: Bearer $TOKEN" "$@" "$url"
}

COUNT=0
# Walk the directory tree breadth-first.
DIRS=("$VFS_ROOT")
while ((${#DIRS[@]})); do
  DIR="${DIRS[0]}"; DIRS=("${DIRS[@]:1}")
  while IFS=$'\t' read -r MIME HREF; do
    REL="${HREF#"$VFS_ROOT"}"
    if [[ "$MIME" == "inode/directory" ]]; then
      DIRS+=("$HREF")
    else
      mkdir -p "$STAGING/$(dirname "$REL")"
      kudu_get "$HREF" -o "$STAGING/$REL"
      COUNT=$((COUNT + 1))
    fi
  done < <(kudu_get "$DIR" | jq -r '.[] | "\(.mime)\t\(.href)"')
done

if ((COUNT == 0)); then
  echo "No files found in site/wwwroot; nothing backed up." >&2
  exit 1
fi

(cd "$STAGING" && zip -qr "$OUT" .)
echo "Backup complete: $OUT ($COUNT files, $(du -h "$OUT" | cut -f1))"

# Also save the site configuration (runtime, startup command, etc.).
# App settings are not saved, so no secrets end up on disk.
az webapp config show \
  --subscription "$SUBSCRIPTION_ID" -g "$RESOURCE_GROUP" -n "$WEB_APP_NAME" \
  -o json > "$SETTINGS_OUT"
echo "Site config saved: $SETTINGS_OUT"
