/**
 * Universal official brand logo resolver for open-source organizations.
 */

const KNOWN_BRAND_LOGOS: Record<string, string> = {
  // Common orgs
  'apache': 'https://cdn.simpleicons.org/apache',
  'python': 'https://cdn.simpleicons.org/python',
  'kde': 'https://cdn.simpleicons.org/kde',
  'llvm': 'https://cdn.simpleicons.org/llvm',
  'numfocus': 'https://cdn.simpleicons.org/numfocus',
  'jupyter': 'https://cdn.simpleicons.org/jupyter',
  'rocketchat': 'https://cdn.simpleicons.org/rocketchat',
  'rocket-chat': 'https://cdn.simpleicons.org/rocketchat',
  'videolan': 'https://cdn.simpleicons.org/vlc',
  'vlc': 'https://cdn.simpleicons.org/vlc',
  'opencv': 'https://cdn.simpleicons.org/opencv',
  'ros': 'https://cdn.simpleicons.org/ros',
  'open-robotics': 'https://cdn.simpleicons.org/ros',
  'osrf': 'https://cdn.simpleicons.org/ros',
  '52north': 'https://raw.githubusercontent.com/52North/52North.github.io/master/images/52n-logo.png',
  '52north-gmbh': 'https://raw.githubusercontent.com/52North/52North.github.io/master/images/52n-logo.png',
  '52north-spatial-information-research-gmbh': 'https://raw.githubusercontent.com/52North/52North.github.io/master/images/52n-logo.png',
  'aflplusplus': 'https://aflplus.plus/assets/images/logo.png',
  '3dtk': 'https://raw.githubusercontent.com/3DTK/3DTK/master/doc/logo3dtk.png',

  // Foundations & Outreachy / LFX / GSoC orgs
  'gnome': 'https://cdn.simpleicons.org/gnome',
  'mozilla': 'https://cdn.simpleicons.org/mozilla',
  'wikimedia': 'https://cdn.simpleicons.org/wikimedia',
  'fedora': 'https://cdn.simpleicons.org/fedora',
  'tor': 'https://cdn.simpleicons.org/torbrowser',
  'tor-project': 'https://cdn.simpleicons.org/torbrowser',
  'homebrew': 'https://cdn.simpleicons.org/homebrew',
  'bioconductor': 'https://cdn.jsdelivr.net/gh/bioconductor/bioconductor.org@master/assets/images/logo/bioconductor_logo_rgb.svg',
  'creative-commons': 'https://cdn.simpleicons.org/creativecommons',
  'debian': 'https://cdn.simpleicons.org/debian',
  'rust': 'https://cdn.simpleicons.org/rust',
  'meta': 'https://cdn.simpleicons.org/meta',
  'huggingface': 'https://cdn.simpleicons.org/huggingface',
  'hyperledger': 'https://cdn.simpleicons.org/hyperledger',
  'riscv': 'https://cdn.simpleicons.org/riscv',
  'risc-v': 'https://cdn.simpleicons.org/riscv',
  'cncf': 'https://cdn.simpleicons.org/cncf',
  'linux': 'https://cdn.simpleicons.org/linux',
  'linuxfoundation': 'https://cdn.simpleicons.org/linuxfoundation',
  'nokia': 'https://cdn.simpleicons.org/nokia',
  'google': 'https://cdn.simpleicons.org/google',
  'redhat': 'https://cdn.simpleicons.org/redhat',
  'kubernetes': 'https://cdn.simpleicons.org/kubernetes',
  'openrefine': 'https://cdn.simpleicons.org/openrefine',
  'tensorflow': 'https://cdn.simpleicons.org/tensorflow',
  'pytorch': 'https://cdn.simpleicons.org/pytorch',
  'docker': 'https://cdn.simpleicons.org/docker',
  'github': 'https://cdn.simpleicons.org/github',
  'gitlab': 'https://cdn.simpleicons.org/gitlab',
};

export function getOfficialOrgLogo(name: string, slug?: string, currentLogoUrl?: string | null): string {
  // If current logoUrl is valid and not a broken/expired S3 URL, use it
  if (currentLogoUrl && currentLogoUrl.trim().length > 0 && !currentLogoUrl.includes('jobspring-prod-uploads')) {
    return currentLogoUrl.trim();
  }

  const s = (slug || '').toLowerCase().trim();
  const n = (name || '').toLowerCase().trim();

  // 1. Direct slug lookup
  if (s && KNOWN_BRAND_LOGOS[s]) return KNOWN_BRAND_LOGOS[s];

  // 2. Cleaned keyword matching
  if (n.includes('52north') || n.includes('52°north')) {
    return 'https://github.com/52North.png';
  }
  if (n.includes('aflplusplus') || n.includes('afl++') || s.includes('aflplusplus')) {
    return 'https://github.com/AFLplusplus.png';
  }
  if (n.includes('3dtk') || s.includes('3dtk')) {
    return 'https://github.com/3DTK.png';
  }
  if (n.includes('ai powered mainframe data')) {
    return 'https://cdn.simpleicons.org/linuxfoundation';
  }
  if (n.includes('hyperledger')) return 'https://cdn.simpleicons.org/hyperledger';
  if (n.includes('risc-v') || n.includes('riscv')) return 'https://cdn.simpleicons.org/riscv';
  if (n.includes('cncf') || n.includes('cloud native')) return 'https://cdn.simpleicons.org/cncf';
  if (n.includes('linux kernel') || n.includes('linux foundation') || n.includes('linux')) return 'https://cdn.simpleicons.org/linux';
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
  if (n.includes('robotics') || n.includes('ros') || n.includes('osrf')) return 'https://cdn.simpleicons.org/ros';
  if (n.includes('python')) return 'https://cdn.simpleicons.org/python';
  if (n.includes('apache') || n.includes('asf')) return 'https://cdn.simpleicons.org/apache';
  if (n.includes('google')) return 'https://cdn.simpleicons.org/google';
  if (n.includes('red hat') || n.includes('redhat')) return 'https://cdn.simpleicons.org/redhat';
  if (n.includes('kubernetes')) return 'https://cdn.simpleicons.org/kubernetes';
  if (n.includes('openrefine')) return 'https://cdn.simpleicons.org/openrefine';
  if (n.includes('firefox')) return 'https://cdn.simpleicons.org/firefox';
  if (n.includes('ocaml')) return 'https://cdn.simpleicons.org/ocaml';
  if (n.includes('conda')) return 'https://cdn.simpleicons.org/anaconda';
  if (n.includes('eclipse')) return 'https://cdn.simpleicons.org/eclipseide';
  if (n.includes('tensorflow')) return 'https://cdn.simpleicons.org/tensorflow';
  if (n.includes('pytorch')) return 'https://cdn.simpleicons.org/pytorch';
  if (n.includes('asf') || n.includes('apache')) return 'https://cdn.simpleicons.org/apache';
  if (n.includes('intermine')) return 'https://cdn.simpleicons.org/intercom';
  if (n.includes('oppia')) return 'https://cdn.simpleicons.org/googleearth';
  if (n.includes('ushahidi')) return 'https://cdn.simpleicons.org/ushahidi';
  if (n.includes('girlscript') || n.includes('gssoc')) return 'https://cdn.simpleicons.org/github';

  // 3. Fall back to current logoUrl if present
  if (currentLogoUrl && currentLogoUrl.trim().length > 0) {
    return currentLogoUrl.trim();
  }

  // 4. Try SimpleIcons slug conversion as generic fallback
  const cleanSlug = s.replace(/-(outreachy|gsoc|lfx|nsoc|gssoc|mlh)$/, '').replace(/[^a-z0-9]/g, '');
  if (cleanSlug.length > 2) {
    return `https://cdn.simpleicons.org/${cleanSlug}`;
  }

  return '';
}
