# ──────────────────────────────────────────────
# SSH Key
# ──────────────────────────────────────────────

resource "hcloud_ssh_key" "admin" {
  name       = "${var.server_name}-admin"
  public_key = file(var.ssh_public_key_path)
}

# ──────────────────────────────────────────────
# Firewall
# ──────────────────────────────────────────────

resource "hcloud_firewall" "staging" {
  name   = "atl-sh-staging"
  labels = local.common_labels

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "22"
    source_ips = ["0.0.0.0/0", "::/0"]
  }

  # HTTP
  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "80"
    source_ips = ["0.0.0.0/0", "::/0"]
  }

  # HTTPS
  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "443"
    source_ips = ["0.0.0.0/0", "::/0"]
  }

  # Gopher
  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "70"
    source_ips = ["0.0.0.0/0", "::/0"]
  }

  # Gemini
  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "1965"
    source_ips = ["0.0.0.0/0", "::/0"]
  }
}

# ──────────────────────────────────────────────
# Server
# ──────────────────────────────────────────────

locals {
  # Hetzner Cloud project: ATL (ID 10473475) — token is project-scoped
  hcloud_project_id = "10473475"

  common_labels = {
    project           = "atl-sh"
    environment       = "staging"
    hcloud_project_id = local.hcloud_project_id
  }
}

resource "hcloud_server" "staging" {
  name        = var.server_name
  server_type = var.server_type
  location    = var.server_location
  image       = var.server_image

  public_net {
    ipv4_enabled = true
    ipv6_enabled = true
  }

  ssh_keys = [hcloud_ssh_key.admin.id]

  firewall_ids = [hcloud_firewall.staging.id]

  labels = local.common_labels
}

# ──────────────────────────────────────────────
# Reverse DNS
# ──────────────────────────────────────────────

resource "hcloud_rdns" "staging_ipv4" {
  server_id  = hcloud_server.staging.id
  ip_address = hcloud_server.staging.ipv4_address
  dns_ptr    = "${var.dns_subdomain}.atl.sh"
}

resource "hcloud_rdns" "staging_ipv6" {
  server_id  = hcloud_server.staging.id
  ip_address = hcloud_server.staging.ipv6_address
  dns_ptr    = "${var.dns_subdomain}.atl.sh"
}
