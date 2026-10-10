import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://learnhub.example.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/instructor/', '/profile/', '/my-learning/', '/learn/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
