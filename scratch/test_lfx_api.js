async function inspectManyProjects() {
  const url = 'https://api.mentorship.lfx.linuxfoundation.org/projects?status=active&limit=50';
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(`Fetched ${data.projects?.length} projects.`);
    data.projects.slice(0, 15).forEach((p, idx) => {
      console.log(`\nProject [${idx + 1}]:`);
      console.log(`  Name: ${p.name}`);
      console.log(`  Slug: ${p.slug}`);
      console.log(`  Industry: ${p.industry}`);
      console.log(`  LogoUrl: ${p.logoUrl ? 'Yes' : 'No'}`);
      console.log(`  Repo: ${p.repoLink}`);
      console.log(`  Website: ${p.websiteUrl}`);
      console.log(`  Accepting: ${p.acceptApplications}`);
      // Find all keys that might represent foundation/org
      const orgKeys = Object.keys(p).filter(k => 
        k.toLowerCase().includes('org') || 
        k.toLowerCase().includes('foundation') || 
        k.toLowerCase().includes('parent') ||
        k.toLowerCase().includes('community')
      );
      if (orgKeys.length > 0) {
        console.log(`  Potential Org Keys:`, orgKeys.reduce((acc, k) => ({ ...acc, [k]: p[k] }), {}));
      }
    });
  } catch (err) {
    console.error(err);
  }
}

inspectManyProjects();
