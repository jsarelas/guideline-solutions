variable "subscription_id" {
  description = "Azure subscription that contains the web app."
  type        = string
  default     = "36b72e8a-49f3-4d06-b702-dc3b3ac8e15f"
}

variable "web_app_name" {
  description = "Existing App Service web app to deploy to."
  type        = string
  default     = "Guideline-react"
}

variable "service_plan_name" {
  description = "Existing App Service plan hosting the web app."
  type        = string
  default     = "ServicePlanSouthCentralFree"
}

variable "location" {
  description = "Expected region of the App Service plan (checked, not changed)."
  type        = string
  default     = "South Central US"
}

variable "expected_sku" {
  description = "Expected plan SKU (checked, not changed)."
  type        = string
  default     = "B1"
}

variable "dist_dir" {
  description = "Path to the Vite build output, relative to this folder."
  type        = string
  default     = "../dist"
}

variable "clean_deploy" {
  description = "Delete everything in site/wwwroot before deploying (a backup is always taken first)."
  type        = bool
  default     = true
}

variable "linux_startup_command" {
  description = "Startup command applied only if the app is a Linux Node app, so it serves the static files. Set to \"\" to leave the app's startup command alone."
  type        = string
  default     = "pm2 serve /home/site/wwwroot --no-daemon --spa"
}
