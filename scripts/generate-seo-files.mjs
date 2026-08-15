import { writeFileSync } from 'node:fs'

const siteUrl = (process.env.VITE_SITE_URL || 'https://www.alemipaintindustry.com').replace(/\/$/, '')
const pages = ['/', '/products', '/projects', '/agencies', '/about', '/contact']
const today = new Date().toISOString().slice(0, 10)

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((path) => `  <url>
    <loc>${siteUrl}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${path === '/' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${path === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>
`

const robots = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${siteUrl}/sitemap.xml
`

writeFileSync('public/sitemap.xml', sitemap)
writeFileSync('public/robots.txt', robots)
