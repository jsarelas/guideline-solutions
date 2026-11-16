############################################################################
# Back up the existing Guideline-react App Service content, then deploy the
# Vite production build (../dist) to it.
#
# The web app and App Service plan already exist and are only READ here
# (via scripts/lookup.sh and the Azure CLI). Terraform never creates, modifies or destroys them, so
# `terraform destroy` only removes local state, not anything in Azure.
############################################################################

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    external = {
      source  = "hashicorp/external"
      version = "~> 2.3"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.2"
    }
  }
}

# ---------------------------------------------------------------------------
# Look up the existing resources by name with the Azure CLI (read-only).
# This replaces the azurerm provider, which downloads Azure's full
# resource-provider list on every run and was timing out.
# ---------------------------------------------------------------------------

data "external" "azure" {
  program = ["bash", "${path.module}/scripts/lookup.sh"]

  query = {
    subscription_id   = var.subscription_id
    web_app_name      = var.web_app_name
    service_plan_name = var.service_plan_name
  }
}

locals {
  azure      = data.external.azure.result
  web_app_rg = local.azure.web_app_rg
  dist_dir   = abspath("${path.module}/${var.dist_dir}")
  backup_dir = abspath("${path.module}/backups")

  # Changes whenever any file in dist/ changes -> triggers backup + deploy.
  dist_hash = sha1(join("", [
    for f in sort(fileset(local.dist_dir, "**")) : "${f}:${filesha1("${local.dist_dir}/${f}")}"
  ]))
}

# ---------------------------------------------------------------------------
# 1. Back up the current site/wwwroot to ./backups/<app>-<timestamp>.zip
# ---------------------------------------------------------------------------

resource "null_resource" "backup" {
  triggers = {
    dist_hash = local.dist_hash
  }

  lifecycle {
    precondition {
      condition     = local.azure.web_app_count == "1"
      error_message = "Expected exactly one web app named ${var.web_app_name} in the subscription."
    }
    precondition {
      condition     = local.azure.plan_sku == var.expected_sku
      error_message = "Plan ${var.service_plan_name} is ${local.azure.plan_sku}, expected ${var.expected_sku}."
    }
    precondition {
      condition     = lower(replace(local.azure.plan_location, " ", "")) == lower(replace(var.location, " ", ""))
      error_message = "Plan ${var.service_plan_name} is in ${local.azure.plan_location}, expected ${var.location}."
    }
    precondition {
      condition     = fileexists("${local.dist_dir}/index.html")
      error_message = "No production build found at ${local.dist_dir}. Run `npm run build` first."
    }
  }

  provisioner "local-exec" {
    command = "bash ${path.module}/scripts/backup.sh"
    environment = {
      SUBSCRIPTION_ID = var.subscription_id
      RESOURCE_GROUP  = local.web_app_rg
      WEB_APP_NAME    = var.web_app_name
      BACKUP_DIR      = local.backup_dir
    }
  }
}

# ---------------------------------------------------------------------------
# 2. Deploy ../dist (only after the backup succeeded)
# ---------------------------------------------------------------------------

resource "null_resource" "deploy" {
  triggers = {
    dist_hash = local.dist_hash
  }

  depends_on = [null_resource.backup]

  provisioner "local-exec" {
    command = "bash ${path.module}/scripts/deploy.sh"
    environment = {
      SUBSCRIPTION_ID       = var.subscription_id
      RESOURCE_GROUP        = local.web_app_rg
      WEB_APP_NAME          = var.web_app_name
      DIST_DIR              = local.dist_dir
      PLAN_OS               = local.azure.plan_os_type
      CLEAN_DEPLOY          = tostring(var.clean_deploy)
      LINUX_STARTUP_COMMAND = var.linux_startup_command
    }
  }
}

# ---------------------------------------------------------------------------
# Outputs
# ---------------------------------------------------------------------------

output "resource_group" {
  value = local.web_app_rg
}

output "service_plan" {
  value = "${local.azure.plan_name} (${local.azure.plan_sku}, ${local.azure.plan_os_type}, ${local.azure.plan_location})"
}

output "backup_directory" {
  value = local.backup_dir
}
