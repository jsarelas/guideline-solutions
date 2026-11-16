#!/usr/bin/env bash
# Zips the Vite build output and zip-deploys it to the web app.
set -euo pipefail

: "${SUBSCRIPTION_ID:?}" "${RESOURCE_GROUP:?}" "${WEB_APP_NAME:?}" "${DIST_DIR:?}" "${PLAN_OS:?}"
CLEAN_DEPLOY="${CLEAN_DEPLOY:-true}"
LINUX_STARTUP_COMMAND="${LINUX_STARTUP_COMMAND:-}"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT
ZIP="$TMP_DIR/dist.zip"

(cd "$DIST_DIR" && zip -qr "$ZIP" .)
echo "Packaged $DIST_DIR -> $ZIP ($(du -h "$ZIP" | cut -f1))"

# Linux apps need a runtime process to serve static files.
if [[ "$PLAN_OS" == "Linux" && -n "$LINUX_STARTUP_COMMAND" ]]; then
  RUNTIME="$(az webapp config show \
    --subscription "$SUBSCRIPTION_ID" -g "$RESOURCE_GROUP" -n "$WEB_APP_NAME" \
    --query linuxFxVersion -o tsv)"
  if [[ "$RUNTIME" == NODE* ]]; then
    echo "Linux Node app ($RUNTIME): setting startup command to: $LINUX_STARTUP_COMMAND"
    az webapp config set \
      --subscription "$SUBSCRIPTION_ID" -g "$RESOURCE_GROUP" -n "$WEB_APP_NAME" \
      --startup-file "$LINUX_STARTUP_COMMAND" -o none
  else
    echo "WARNING: Linux app runtime is '$RUNTIME', not Node. Startup command left unchanged;" >&2
    echo "         make sure this runtime serves static files from /home/site/wwwroot." >&2
  fi
fi

echo "Deploying to $WEB_APP_NAME (clean=$CLEAN_DEPLOY)..."
az webapp deploy \
  --subscription "$SUBSCRIPTION_ID" -g "$RESOURCE_GROUP" -n "$WEB_APP_NAME" \
  --src-path "$ZIP" --type zip --clean "$CLEAN_DEPLOY" --restart true

HOST="$(az webapp show \
  --subscription "$SUBSCRIPTION_ID" -g "$RESOURCE_GROUP" -n "$WEB_APP_NAME" \
  --query defaultHostName -o tsv)"
echo "Deployed: https://$HOST"
