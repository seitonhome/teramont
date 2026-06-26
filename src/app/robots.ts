import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: 'https://teramont.seitonhome.com/sitemap.xml',
    host: 'https://teramont.seitonhome.com',
  }
}
