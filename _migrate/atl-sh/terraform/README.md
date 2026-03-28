# atl.sh Infrastructure

This directory contains the Terraform configuration for the All Things Linux `atl.sh` infrastructure.

<!-- BEGIN_TF_DOCS -->
## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | >= 1.8 |
| <a name="requirement_cloudflare"></a> [cloudflare](#requirement\_cloudflare) | ~> 5 |
| <a name="requirement_hcloud"></a> [hcloud](#requirement\_hcloud) | ~> 1.60 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_cloudflare"></a> [cloudflare](#provider\_cloudflare) | 5.18.0 |
| <a name="provider_hcloud"></a> [hcloud](#provider\_hcloud) | 1.60.1 |

## Modules

No modules.

## Resources

| Name | Type |
|------|------|
| [cloudflare_dns_record.staging_a](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs/resources/dns_record) | resource |
| [cloudflare_dns_record.staging_aaaa](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs/resources/dns_record) | resource |
| [hcloud_firewall.staging](https://registry.terraform.io/providers/hetznercloud/hcloud/latest/docs/resources/firewall) | resource |
| [hcloud_rdns.staging_ipv4](https://registry.terraform.io/providers/hetznercloud/hcloud/latest/docs/resources/rdns) | resource |
| [hcloud_rdns.staging_ipv6](https://registry.terraform.io/providers/hetznercloud/hcloud/latest/docs/resources/rdns) | resource |
| [hcloud_server.staging](https://registry.terraform.io/providers/hetznercloud/hcloud/latest/docs/resources/server) | resource |
| [hcloud_ssh_key.admin](https://registry.terraform.io/providers/hetznercloud/hcloud/latest/docs/resources/ssh_key) | resource |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_cloudflare_api_token"></a> [cloudflare\_api\_token](#input\_cloudflare\_api\_token) | Cloudflare API token with DNS edit permissions | `string` | n/a | yes |
| <a name="input_cloudflare_zone_id"></a> [cloudflare\_zone\_id](#input\_cloudflare\_zone\_id) | Cloudflare Zone ID for atl.sh | `string` | n/a | yes |
| <a name="input_dns_subdomain"></a> [dns\_subdomain](#input\_dns\_subdomain) | Subdomain for the staging VPS (e.g., 'staging' → staging.atl.sh) | `string` | `"staging"` | no |
| <a name="input_hcloud_token"></a> [hcloud\_token](#input\_hcloud\_token) | Hetzner Cloud API token | `string` | n/a | yes |
| <a name="input_server_image"></a> [server\_image](#input\_server\_image) | OS image for the server | `string` | `"debian-13"` | no |
| <a name="input_server_location"></a> [server\_location](#input\_server\_location) | Hetzner datacenter location (fsn1, nbg1, hel1) | `string` | `"fsn1"` | no |
| <a name="input_server_name"></a> [server\_name](#input\_server\_name) | Name of the staging VPS (matches DNS) | `string` | `"staging.atl.sh"` | no |
| <a name="input_server_type"></a> [server\_type](#input\_server\_type) | Hetzner server type (CX32 = 4 vCPU, 8GB RAM) | `string` | `"cx32"` | no |
| <a name="input_ssh_public_key_path"></a> [ssh\_public\_key\_path](#input\_ssh\_public\_key\_path) | Path to the SSH public key for admin access | `string` | `"~/.ssh/id_ed25519.pub"` | no |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_dns_record"></a> [dns\_record](#output\_dns\_record) | DNS record pointing to the VPS |
| <a name="output_server_id"></a> [server\_id](#output\_server\_id) | Hetzner server ID |
| <a name="output_server_ip"></a> [server\_ip](#output\_server\_ip) | IPv4 address of the staging VPS |
| <a name="output_server_status"></a> [server\_status](#output\_server\_status) | Server status |
<!-- END_TF_DOCS -->
