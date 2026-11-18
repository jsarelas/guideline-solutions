############################################################################
# Hosts the Vite production build (../dist) on Azure Static Web Apps (Free).
#
# Creates:
#   - the static web app in the existing resource group
#   - the www custom domain binding (TXT-validated, free managed certificate)
# and uploads ../dist with the Static Web Apps CLI whenever it changes.
#
# The old Guideline-react App Service is not referenced here at all, so
# Terraform never changes or deletes it.
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

  # Don't register every Azure resource provider on startup. That step is what
  # made the azurerm provider time out before; Microsoft.Web is already
  # registered in this subscription.
  resource_provider_registrations = "none"
}

data "azurerm_resource_group" "site" {
  name = var.resource_group_name
}

locals {
  dist_dir = abspath("${path.module}/${var.dist_dir}")

  # Changes whenever any file in dist/ changes -> triggers a redeploy.
  dist_hash = sha1(join("", [
    for f in sort(fileset(local.dist_dir, "**")) : "${f}:${filesha1("${local.dist_dir}/${f}")}"
  ]))
}

# ---------------------------------------------------------------------------
# 1. Static web app
# ---------------------------------------------------------------------------

resource "azurerm_static_web_app" "site" {
  name                = var.static_web_app_name
  resource_group_name = data.azurerm_resource_group.site.name
  location            = var.static_web_app_location
  sku_tier            = "Free"
  sku_size            = "Free"
}

# ---------------------------------------------------------------------------
# 2. Custom domain
#
# TXT validation lets the domain be verified and its certificate issued
# while www still points at the old App Service; the CNAME is switched only
# once this shows "Ready" in the portal. See README.md.
# ---------------------------------------------------------------------------

resource "azurerm_static_web_app_custom_domain" "www" {
  count = var.custom_domain == "" ? 0 : 1

  static_web_app_id = azurerm_static_web_app.site.id
  domain_name       = var.custom_domain
  validation_type   = "dns-txt-token"
}

# ---------------------------------------------------------------------------
# 3. Upload ../dist
# ---------------------------------------------------------------------------

resource "null_resource" "deploy" {
  triggers = {
    dist_hash      = local.dist_hash
    static_web_app = azurerm_static_web_app.site.id
  }

  lifecycle {
    precondition {
      condition     = fileexists("${local.dist_dir}/index.html")
      error_message = "No production build found at ${local.dist_dir}. Run `npm run build` first."
    }
    precondition {
      condition     = fileexists("${local.dist_dir}/staticwebapp.config.json")
      error_message = "dist/staticwebapp.config.json is missing. It is copied from public/ by `npm run build`."
    }
  }

  provisioner "local-exec" {
    command = "npx --yes @azure/static-web-apps-cli@${var.swa_cli_version} deploy \"$DIST_DIR\" --env production --deployment-token \"$SWA_DEPLOYMENT_TOKEN\""
    environment = {
      DIST_DIR             = local.dist_dir
      SWA_DEPLOYMENT_TOKEN = azurerm_static_web_app.site.api_key
      SWA_CLI_TELEMETRY    = "false"
    }
  }
}

# ---------------------------------------------------------------------------
# Outputs
# ---------------------------------------------------------------------------

output "static_web_app_url" {
  description = "Test the site here before switching DNS."
  value       = "https://${azurerm_static_web_app.site.default_host_name}"
}

output "dns_txt_record" {
  description = "Add at GoDaddy to validate the custom domain (Type TXT)."
  value = var.custom_domain == "" ? null : {
    type  = "TXT"
    name  = "_dnsauth.${split(".", var.custom_domain)[0]}"
    # Published in public DNS anyway, so it is safe to print.
    value = nonsensitive(azurerm_static_web_app_custom_domain.www[0].validation_token)
  }
}

output "dns_cname_record" {
  description = "Change at GoDaddy once the custom domain shows Ready (Type CNAME)."
  value = var.custom_domain == "" ? null : {
    type  = "CNAME"
    name  = split(".", var.custom_domain)[0]
    value = azurerm_static_web_app.site.default_host_name
  }
}
