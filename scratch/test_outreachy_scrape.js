async function testCommunityScrape() {
  const commUrl = 'https://www.outreachy.org/outreachy-dec-2024-internship-cohort/communities/bioconductor/';
  console.log(`Fetching live community page: ${commUrl}`);
  try {
    const res = await fetch(commUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    const text = await res.text();
    console.log('Status:', res.status, 'Length:', text.length);

    // Look for headings and paragraph snippets
    const headings = [...text.matchAll(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/gi)]
      .map(m => m[1].replace(/<[^>]+>/g, '').trim())
      .filter(Boolean);
    console.log('Headings:', headings);

    // Look for project links
    const projectLinks = [...text.matchAll(/<a[^>]+href=["']([^"']*projects[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi)]
      .map(m => ({ href: m[1], text: m[2].replace(/<[^>]+>/g, '').trim() }));
    console.log('Project links:', projectLinks);
  } catch (err) {
    console.error('Error fetching community page:', err);
  }
}

testCommunityScrape();
