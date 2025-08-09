export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url)
      let assetPath = url.pathname

      // Handle clean URLs for HTML files
      if (url.pathname === '/panel') {
        assetPath = '/src/panel.html'
      } else if (url.pathname === '/register') {
        assetPath = '/src/register.html'
      } else if (url.pathname === '/' || url.pathname === '') {
        assetPath = '/src/index.html'
      } else if (url.pathname.endsWith('.html')) {
        // Other HTML files are in src/
        assetPath = '/src' + url.pathname
      } else if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
        // CSS and JS files are in src/
        assetPath = '/src' + url.pathname
      }
      // Assets like images and other files stay as-is

      // Create request with the correct path
      const modifiedUrl = new URL(request.url)
      modifiedUrl.pathname = assetPath
      const asset = await env.STATIC_ASSETS.fetch(new Request(modifiedUrl.toString(), request))

      if (asset.status === 404) {
        // Fallback to index.html for SPA routing
        const indexUrl = new URL(request.url)
        indexUrl.pathname = '/src/index.html'
        return await env.STATIC_ASSETS.fetch(new Request(indexUrl.toString(), request))
      }

      return asset
    } catch (e) {
      return new Response('Error: ' + e.message, { status: 500 })
    }
  }
}
