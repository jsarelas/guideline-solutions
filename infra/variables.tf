variable "subscription_id" {
  description = "Azure subscription for the static web app."
  type        = string
  default     = "36b72e8a-49f3-4d06-b702-dc3b3ac8e15f"
}

variable "resource_group_name" {
  description = "Existing resource group to create the static web app in."
  type        = string
  default     = "Guideline-react"
}

variable "static_web_app_name" {
  description = "Name of the static web app."
  type        = string
  default     = "guideline-solutions-swa"
}

variable "static_web_app_location" {
  description = "Region for the static web app's management resource (content is served globally). The Free tier is only offered in a few regions, which don't include South Central US."
  type        = string
  default     = "centralus"
}

variable "custom_domain" {
  description = "Custom domain to bind. Set to \"\" to skip."
  type        = string
  default     = "www.guidelinesolutions.com"
}
