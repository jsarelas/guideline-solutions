############################################################################
# Back up the existing Guideline-react App Service content, then deploy the
# Vite production build (../dist) to it.
#
# The web app and App Service plan already exist and are only READ here
# (data sources). Terraform never creates, modifies or destroys them, so
# `terraform destroy` only removes local state, not anything in Azure.
############################################################################

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.2"
    }
  }
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

# ---------------------------------------------------------------------------
# Look up the existing resources by name (resource group is discovered).
# ---------------------------------------------------------------------------

data "azurerm_resources" "web_app" {
  name = var.web_app_name
  type = "Microsoft.Web/sites"
}

data "azurerm_resources" "service_plan" {
  name = var.service_plan_name
  type = "Microsoft.Web/serverfarms"
}

locals {
  web_app_id     = one(data.azurerm_resources.web_app.resources[*].id)
  web_app_rg     = split("/", local.web_app_id)[4]
  plan_id        = one(data.azurerm_resources.service_plan.resources[*].id)
  plan_rg        = split("/", local.plan_id)[4]
  dist_dir       = abspath("${path.module}/${var.dist_dir}")
  backup_dir     = abspath("${path.module}/backups")

  # Changes whenever any file in dist/ changes -> triggers backup + deploy.
  dist_hash = sha1(join("", [
    for f in sort(fileset(local.dist_dir, "**")) : "${f}:${filesha1("${local.dist_dir}/${f}")}"
  ]))
}

data "azurerm_service_plan" "plan" {
  name                = var.service_plan_name
  resource_group_name = local.plan_rg
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
      condition     = length(data.azurerm_resources.web_app.resources) == 1
      error_message = "Expected exactly one web app named ${var.web_app_name} in the subscription."
    }
    precondition {
      condition     = data.azurerm_service_plan.plan.sku_name == var.expected_sku
      error_message = "Plan ${var.service_plan_name} is ${data.azurerm_service_plan.plan.sku_name}, expected ${var.expected_sku}."
    }
    precondition {
      condition     = lower(replace(data.azurerm_service_plan.plan.location, " ", "")) == lower(replace(var.location, " ", ""))
      error_message = "Plan ${var.service_plan_name} is in ${data.azurerm_service_plan.plan.location}, expected ${var.location}."
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
      PLAN_OS               = data.azurerm_service_plan.plan.os_type
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
  value = "${data.azurerm_service_plan.plan.name} (${data.azurerm_service_plan.plan.sku_name}, ${data.azurerm_service_plan.plan.os_type}, ${data.azurerm_service_plan.plan.location})"
}

output "backup_directory" {
  value = local.backup_dir
}
