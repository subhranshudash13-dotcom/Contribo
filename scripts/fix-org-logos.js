require('dotenv').config();
const { MongoClient } = require('mongodb');

// Comprehensive official brand logo resolver for open-source organizations
const OFFICIAL_LOGO_MAP = {
  // Specific Slugs
  '52north': 'https://github.com/52North.png',
  '52north-gmbh': 'https://github.com/52North.png',
  '52north-spatial-information-research-gmbh': 'https://github.com/52North.png',
  '52north-initiative-for-geospatial-open-source-software-gmbh': 'https://github.com/52North.png',
  'aflplusplus': 'https://github.com/AFLplusplus.png',
  '3dtk': 'https://github.com/3DTK.png',

  // Foundations & Ecosystems
  'nokia-nsoc': 'https://cdn.simpleicons.org/nokia',
  'wikimedia-outreachy': 'https://cdn.simpleicons.org/wikimedia',
  'gnome-outreachy': 'https://cdn.simpleicons.org/gnome',
  'mozilla-outreachy': 'https://cdn.simpleicons.org/mozilla',
  'fedora-outreachy': 'https://cdn.simpleicons.org/fedora',
  'osrf-outreachy': 'https://cdn.simpleicons.org/ros',
  'open-robotics-osrf-outreachy': 'https://cdn.simpleicons.org/ros',
  'tor-outreachy': 'https://cdn.simpleicons.org/torbrowser',
  'tor-project-outreachy': 'https://cdn.simpleicons.org/torbrowser',
  'homebrew-outreachy': 'https://cdn.simpleicons.org/homebrew',
  'bioconductor-outreachy': 'https://cdn.jsdelivr.net/gh/bioconductor/bioconductor.org@master/assets/images/logo/bioconductor_logo_rgb.svg',
  'creative-commons-outreachy': 'https://cdn.simpleicons.org/creativecommons',
  'debian-outreachy': 'https://cdn.simpleicons.org/debian',
  'rust-outreachy': 'https://cdn.simpleicons.org/rust',
  'the-rust-project-outreachy': 'https://cdn.simpleicons.org/rust',
  'cncf-lfx': 'https://cdn.simpleicons.org/cncf',
  'hyperledger-lfx': 'https://cdn.simpleicons.org/hyperledger',
  'meta-mlh': 'https://cdn.simpleicons.org/meta',
  'huggingface-mlh': 'https://cdn.simpleicons.org/huggingface',
};

function getOfficialLogoUrl(name, slug) {
  const s = (slug || '').toLowerCase().trim();
  const n = (name || '').toLowerCase().trim();

  if (OFFICIAL_LOGO_MAP[s]) return OFFICIAL_LOGO_MAP[s];

  if (s.includes('52north') || n.includes('52°north') || n.includes('52north')) {
    return 'https://github.com/52North.png';
  }
  if (s.includes('aflplusplus') || n.includes('aflplusplus') || n.includes('afl++')) {
    return 'https://github.com/AFLplusplus.png';
  }
  if (n.includes('3dtk') || s.includes('3dtk')) {
    return 'https://github.com/3DTK.png';
  }
  if (n.includes('ai powered mainframe data')) {
    return 'https://cdn.simpleicons.org/linuxfoundation';
  }
  if (n.includes('hyperledger')) return 'https://cdn.simpleicons.org/hyperledger';
  if (n.includes('risc-v') || s.includes('risc-v')) return 'https://cdn.simpleicons.org/riscv';
  if (n.includes('cncf') || n.includes('cloud native')) return 'https://cdn.simpleicons.org/cncf';
  if (n.includes('linux kernel') || n.includes('linux foundation')) return 'https://cdn.simpleicons.org/linux';
  if (n.includes('mozilla')) return 'https://cdn.simpleicons.org/mozilla';
  if (n.includes('wikimedia')) return 'https://cdn.simpleicons.org/wikimedia';
  if (n.includes('gnome')) return 'https://cdn.simpleicons.org/gnome';
  if (n.includes('fedora')) return 'https://cdn.simpleicons.org/fedora';
  if (n.includes('homebrew')) return 'https://cdn.simpleicons.org/homebrew';
  if (n.includes('tor project') || n.includes('tor')) return 'https://cdn.simpleicons.org/torbrowser';
  if (n.includes('rust')) return 'https://cdn.simpleicons.org/rust';
  if (n.includes('debian')) return 'https://cdn.simpleicons.org/debian';
  if (n.includes('meta')) return 'https://cdn.simpleicons.org/meta';
  if (n.includes('hugging face') || n.includes('huggingface')) return 'https://cdn.simpleicons.org/huggingface';
  if (n.includes('creative commons')) return 'https://cdn.simpleicons.org/creativecommons';
  if (n.includes('bioconductor')) return 'https://cdn.jsdelivr.net/gh/bioconductor/bioconductor.org@master/assets/images/logo/bioconductor_logo_rgb.svg';
  if (n.includes('nokia')) return 'https://cdn.simpleicons.org/nokia';
  if (n.includes('robotics') || n.includes('osrf') || n.includes('ros')) return 'https://cdn.simpleicons.org/ros';
  if (n.includes('python')) return 'https://cdn.simpleicons.org/python';
  if (n.includes('apache')) return 'https://cdn.simpleicons.org/apache';
  if (n.includes('google')) return 'https://cdn.simpleicons.org/google';
  if (n.includes('red hat') || n.includes('redhat')) return 'https://cdn.simpleicons.org/redhat';
  if (n.includes('kubernetes')) return 'https://cdn.simpleicons.org/kubernetes';
  if (n.includes('openrefine')) return 'https://cdn.simpleicons.org/openrefine';

  return null;
}

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MONGODB_URI found');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('gsoc-hub');
  const collection = db.collection('organizations');

  const orgs = await collection.find({}).toArray();
  console.log(`Auditing ${orgs.length} organizations in database...`);

  let updatedCount = 0;

  for (const org of orgs) {
    const officialUrl = getOfficialLogoUrl(org.name, org.slug);

    if (officialUrl) {
      // Overwrite or update missing/outdated logoUrl
      if (!org.logoUrl || org.logoUrl !== officialUrl) {
        await collection.updateOne({ _id: org._id }, { $set: { logoUrl: officialUrl } });
        updatedCount++;
      }
    }
  }

  console.log(`Successfully updated ${updatedCount} organizations with official brand logos in database.`);
  await client.close();
}

run().catch(console.error);
