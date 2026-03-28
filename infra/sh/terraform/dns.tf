# ──────────────────────────────────────────────
# Cloudflare DNS Records
# ──────────────────────────────────────────────

resource "cloudflare_dns_record" "staging_a" {
  zone_id = var.cloudflare_zone_id
  name    = var.dns_subdomain
  content = hcloud_server.staging.ipv4_address
  type    = "A"
  ttl     = 300
  proxied = false # Direct connection needed for SSH/Gemini/Gopher
  comment = "atl.sh staging VPS - IPv4"
}

resource "cloudflare_dns_record" "staging_aaaa" {
  zone_id = var.cloudflare_zone_id
  name    = var.dns_subdomain
  content = hcloud_server.staging.ipv6_address
  type    = "AAAA"
  ttl     = 300
  proxied = false
  comment = "atl.sh staging VPS - IPv6"
}
