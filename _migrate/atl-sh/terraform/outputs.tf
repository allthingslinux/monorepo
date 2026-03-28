output "server_ip" {
  description = "IPv4 address of the staging VPS"
  value       = hcloud_server.staging.ipv4_address
}

output "server_id" {
  description = "Hetzner server ID"
  value       = hcloud_server.staging.id
}

output "server_status" {
  description = "Server status"
  value       = hcloud_server.staging.status
}

output "dns_record" {
  description = "DNS record pointing to the VPS"
  value       = "${var.dns_subdomain}.atl.sh"
}
