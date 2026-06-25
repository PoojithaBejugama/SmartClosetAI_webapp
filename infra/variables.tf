variable "subscription_id" {
  description = "Azure subscription ID"
  type        = string
}

variable "project_name" {
  description = "Project name used for Azure resource names"
  type        = string
  default     = "smartclosetai"
}

variable "resource_group_name" {
  description = "Azure resource group name"
  type        = string
  default     = "smartclosetai-rg"
}

variable "location" {
  description = "Azure region for backend resources"
  type        = string
  default     = "canadacentral"
}

variable "static_web_app_location" {
  description = "Azure Static Web App location"
  type        = string
  default     = "eastus2"
}

variable "supabase_url" {
  type      = string
  sensitive = true
}

variable "supabase_anon_key" {
  type      = string
  sensitive = true
}

variable "supabase_service_role_key" {
  type      = string
  sensitive = true
}

variable "database_url" {
  type      = string
  sensitive = true
}

variable "gemini_api_key" {
  type      = string
  sensitive = true
}

variable "gemini_metadata_model" {
  description = "Gemini model used by the backend for clothing metadata generation"
  type        = string
  default     = "gemini-2.0-flash"
}
