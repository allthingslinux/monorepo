# ──────────────────────────────────────────────
# Hetzner Cloud
# ──────────────────────────────────────────────

variable "hcloud_token" {
  description = "Hetzner Cloud API token"
  type        = string
  sensitive   = true
}

variable "server_name" {
  description = "Name of the staging VPS (matches DNS)"
  type        = string
  default     = "staging.atl.sh"
}

variable "server_type" {
  description = "Hetzner server type (CX32 = 4 vCPU, 8GB RAM)"
  type        = string
  default     = "cx32"
}

variable "server_location" {
  description = "Hetzner datacenter location (fsn1, nbg1, hel1)"
  type        = string
  default     = "fsn1"

  validation {
    condition     = contains(["fsn1", "nbg1", "hel1"], var.server_location)
    error_message = "Server location must be fsn1, nbg1, or hel1."
  }
}

variable "server_image" {
  description = "OS image for the server"
  type        = string
  default     = "debian-13"

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]*$", var.server_image))
    error_message = "Server image must be a valid Hetzner image identifier (e.g. debian-13, ubuntu-24.04)."
  }
}

variable "ssh_public_key_path" {
  description = "Path to the SSH public key for admin access"
  type        = string
  default     = "~/.ssh/id_ed25519.pub"
}

# ──────────────────────────────────────────────
# Cloudflare DNS
# ──────────────────────────────────────────────

variable "cloudflare_api_token" {
  description = "Cloudflare API token with DNS edit permissions"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for atl.sh"
  type        = string

  validation {
    condition     = length(var.cloudflare_zone_id) >= 32 && can(regex("^[a-f0-9]+$", var.cloudflare_zone_id))
    error_message = "Cloudflare zone ID must be a hex string (at least 32 characters)."
  }
}

variable "dns_subdomain" {
  description = "Subdomain for the staging VPS (e.g., 'staging' → staging.atl.sh)"
  type        = string
  default     = "staging"
}
