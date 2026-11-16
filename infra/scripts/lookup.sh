#!/usr/bin/env bash
# Terraform `external` data source: looks up the existing web app and App
# Service plan with the Azure CLI (read-only) and prints a flat JSON object.
#
# Input (stdin, JSON):  {"subscription_id", "web_app_name", "service_plan_name"}
# Output (stdout, JSON): web_app_count, web_app_rg, plan_rg, plan_name,
#                        plan_sku, plan_location, plan_os_type
set -euo pipefail

eval "$(jq -r '@sh "SUB=\(.subscription_id) APP=\(.web_app_name) PLAN=\(.service_plan_name)"')"

fail() { echo "lookup.sh: $*" >&2; exit 1; }

# Resource IDs of every web app / plan with this name in the subscription.
APP_IDS="$(az resource list --subscription "$SUB" \
  --resource-type Microsoft.Web/sites --name "$APP" --query "[].id" -o json)" \
  || fail "could not list web apps (are you logged in with 'az login'?)"
PLAN_IDS="$(az resource list --subscription "$SUB" \
  --resource-type Microsoft.Web/serverfarms --name "$PLAN" --query "[].id" -o json)" \
  || fail "could not list App Service plans"

APP_COUNT="$(jq 'length' <<<"$APP_IDS")"
[[ "$(jq 'length' <<<"$PLAN_IDS")" == 1 ]] \
  || fail "expected exactly one App Service plan named '$PLAN' in subscription $SUB"

# Resource group is the 5th segment of /subscriptions/<id>/resourceGroups/<rg>/...
APP_RG="$(jq -r '.[0] // "" | split("/") | .[4] // ""' <<<"$APP_IDS")"
PLAN_RG="$(jq -r '.[0] | split("/") | .[4]' <<<"$PLAN_IDS")"

PLAN_JSON="$(az appservice plan show --subscription "$SUB" -g "$PLAN_RG" -n "$PLAN" -o json)" \
  || fail "could not read App Service plan '$PLAN'"

# Same os_type values the azurerm provider reported: Linux, Windows, WindowsContainer.
jq -n \
  --arg app_count "$APP_COUNT" \
  --arg app_rg "$APP_RG" \
  --arg plan_rg "$PLAN_RG" \
  --argjson plan "$PLAN_JSON" \
  '{
    web_app_count: $app_count,
    web_app_rg:    $app_rg,
    plan_rg:       $plan_rg,
    plan_name:     $plan.name,
    plan_sku:      $plan.sku.name,
    plan_location: $plan.location,
    plan_os_type:  (if $plan.reserved then "Linux"
                    elif ($plan.hyperV // false) then "WindowsContainer"
                    else "Windows" end)
  }'
