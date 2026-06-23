export default async function handler(req, res) {
  try {
    const response = await fetch('https://yalinnews.onrender.com/api/sitemap.xml');
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Backend returned ${response.status}: ${errText.substring(0, 200)}`);
    }
    
    // Backend returns ready-to-use XML!
    const xml = await response.text();

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error fetching sitemap:', error);
    res.status(500).json({ error: 'Sitemap generation failed', details: error.message });
  }
}
