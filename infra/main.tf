terraform {
  required_version = ">= 1.6.0"

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
}

resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
}

resource "azurerm_service_plan" "backend_plan" {
  name                = "${var.project_name}-backend-plan"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location

  os_type  = "Linux"
  sku_name = "B1"
}

resource "azurerm_linux_web_app" "backend" {
  name                = "${var.project_name}-backend"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.backend_plan.id

  site_config {
    application_stack {
      python_version = "3.11"
    }

    always_on = false
  }

  app_settings = {
    "SUPABASE_URL"                   = var.supabase_url
    "SUPABASE_ANON_KEY"              = var.supabase_anon_key
    "SUPABASE_SERVICE_ROLE_KEY"      = var.supabase_service_role_key
    "DATABASE_URL"                   = var.database_url
    "GEMINI_API_KEY"                 = var.gemini_api_key
    "GEMINI_METADATA_MODEL"          = var.gemini_metadata_model
    "ALLOWED_ORIGINS"                = "https://${azurerm_static_web_app.frontend.default_host_name}"
    "SCM_DO_BUILD_DURING_DEPLOYMENT" = "true"
  }
}

resource "azurerm_static_web_app" "frontend" {
  name                = "${var.project_name}-frontend"
  resource_group_name = azurerm_resource_group.rg.name
  location            = var.static_web_app_location
  sku_tier            = "Free"
  sku_size            = "Free"
}
