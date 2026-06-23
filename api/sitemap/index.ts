export default async function handler(req: any, res: any) {
  try {
    const backendUrl = 'https://yalinnews.onrender.com';
    const frontendUrl = 'https://yalinnews.com';
    
    // Fetch sitemap data from backend
    const response = await fetch(`${backendUrl}/api/Sitemap`);
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }
    
    const result = await response.json();
    const newsList = result.data || [];

    // Construct XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static Routes
    xml += `  <url>\n`;
    xml += `    <loc>${frontendUrl}/</loc>\n`;
    xml += `    <changefreq>hourly</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    // Dynamic News Routes
    for (const news of newsList) {
      if (!news.slug) continue;
      const date = news.publishedAt || news.publishDate || new Date().toISOString();
      xml += `  <url>\n`;
      xml += `    <loc>${frontendUrl}/news/${news.slug}</loc>\n`;
      xml += `    <lastmod>${date}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(xml);

  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}
