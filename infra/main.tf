############################################################################
# Hosts the Vite production build (../dist) on Azure Static Web Apps (Free).
#
# Creates:
#   - the static web app in the existing resource group
#   - the www custom domain binding (CNAME-validated, free managed certificate)
#
# The site itself is deployed by GitHub Actions on every push to main
# (.github/workflows/deploy.yml), not by Terraform.
#
# State is stored in Azure Storage (guidelinetfstate/tfstate), created once by
# scripts/bootstrap-state.sh.
#
# The old Guideline-react App Service is not referenced here at all, so
# Terraform never changes or deletes it.
############################################################################

terraform {
  required_version = ">= 1.5.0"

  backend "azurerm" {
    subscription_id      = "36b72e8a-49f3-4d06-b702-dc3b3ac8e15f"
    resource_group_name  = "Guideline-react"
    storage_account_name = "guidelinetfstate"
    container_name       = "tfstate"
    key                  = "guideline-solutions.tfstate"
  }

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
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
# Validated by CNAME, so point the www CNAME at the static web app's
# hostname first (a TXT record can't sit beside a CNAME on www). See README.md.
# ---------------------------------------------------------------------------

resource "azurerm_static_web_app_custom_domain" "www" {
  count = var.custom_domain == "" ? 0 : 1

  static_web_app_id = azurerm_static_web_app.site.id
  domain_name       = var.custom_domain
  validation_type   = "cname-delegation"
}

# ---------------------------------------------------------------------------
# Outputs
# ---------------------------------------------------------------------------

output "static_web_app_url" {
  description = "Test the site here before switching DNS."
  value       = "https://${azurerm_static_web_app.site.default_host_name}"
}

output "dns_cname_record" {
  description = "Set at GoDaddy before binding the custom domain (Type CNAME)."
  value = var.custom_domain == "" ? null : {
    type  = "CNAME"
    name  = split(".", var.custom_domain)[0]
    value = azurerm_static_web_app.site.default_host_name
  }
}

output "deployment_token" {
  description = "Deployment token for GitHub Actions (repo secret AZURE_STATIC_WEB_APPS_API_TOKEN)."
  value       = azurerm_static_web_app.site.api_key
  sensitive   = true
}
