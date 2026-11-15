import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Contribo',
    short_name: 'Contribo',
    description: 'Discover and apply to open-source programs and projects.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FBF9F6',
    theme_color: '#FBF9F6',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
