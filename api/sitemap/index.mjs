export default async function handler(req, res) {
  try {
    const response = await fetch('https://yalinnews.onrender.com/api/Sitemap');
    const news = await response.json();
    
    // In case the backend wraps it in { data: [...] }
    const records = Array.isArray(news) ? news : (news.data || []);
    
    const urls = records.map(item => `
  <url>
    <loc>https://yalinnews.com/news/${item.slug}</loc>
    <lastmod>${new Date(item.publishDate || item.publishedAt || new Date()).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yalinnews.com/</loc>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>${urls}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(xml);
  } catch (error) {
    res.status(500).send('Sitemap generation failed');
  }
}
