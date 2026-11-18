#!/usr/bin/env bash
# Creates the storage account that holds Terraform's state (the backend in
# main.tf). Run once, before the first `terraform init`; it is safe to re-run.
#
# The state lives outside Terraform on purpose: Terraform can't create the
# place it stores its own state. Blob versioning and soft delete keep earlier
# state versions recoverable.
#
#   bash infra/scripts/bootstrap-state.sh
set -euo pipefail

SUBSCRIPTION_ID="${SUBSCRIPTION_ID:-36b72e8a-49f3-4d06-b702-dc3b3ac8e15f}"
RESOURCE_GROUP="${RESOURCE_GROUP:-Guideline-react}"
LOCATION="${LOCATION:-centralus}"
STORAGE_ACCOUNT="${STORAGE_ACCOUNT:-guidelinetfstate}"
CONTAINER="${CONTAINER:-tfstate}"

az account set --subscription "$SUBSCRIPTION_ID"

az storage account create \
  --name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --sku Standard_LRS \
  --kind StorageV2 \
  --min-tls-version TLS1_2 \
  --allow-blob-public-access false \
  --output none

az storage account blob-service-properties update \
  --account-name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --enable-versioning true \
  --enable-delete-retention true \
  --delete-retention-days 30 \
  --output none

az storage container create \
  --name "$CONTAINER" \
  --account-name "$STORAGE_ACCOUNT" \
  --auth-mode key \
  --output none

echo "State storage ready: $STORAGE_ACCOUNT/$CONTAINER"
