;<?php http_response_code(403); /*
; config file for PrivateBin — atl.tools
;
; https://github.com/PrivateBin/PrivateBin/wiki/Configuration

[main]
name = "paste.atl.tools"
basepath = "https://paste.atl.tools/"

; features
discussion = true
opendiscussion = false
discussiondatedisplay = true
password = true
fileupload = false
burnafterreadingselected = false
qrcode = true
email = false

; formatting — default to source code for a dev community
defaultformatter = "syntaxhighlighting"
syntaxhighlightingtheme = "sons-of-obsidian"

; 10 MiB
sizelimit = 10485760

; bootstrap5 is the modern default, dark mode via browser preference
template = "bootstrap-dark-page"
templateselection = false

; language — auto-detect from browser
languageselection = false

; tailscale handles encryption
httpwarning = false

compression = "zlib"

; jdenticon doesn't need GD extension
icon = "jdenticon"

; CSP with file upload + PDF preview support
cspheader = "default-src 'none'; base-uri 'self'; form-action 'none'; manifest-src 'self'; connect-src * blob:; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-ancestors 'none'; frame-src blob:; img-src 'self' data: blob:; media-src blob:; object-src blob:"

; info text in bottom right
info = "Powered by <a href='https://atl.tools'>atl.tools</a>"

[expire]
default = "1week"
; hide clone button on expiring pastes
clone = true

[expire_options]
5min = 300
10min = 600
1hour = 3600
1day = 86400
1week = 604800
1month = 2592000
1year = 31536000
never = 0

[formatter_options]
plaintext = "Plain Text"
syntaxhighlighting = "Source Code"
markdown = "Markdown"

[traffic]
limit = 0

[purge]
limit = 300
batchsize = 10

[model]
class = Filesystem
[model_options]
dir = PATH "data"
