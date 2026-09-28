import type { MetadataRoute } from 'next'

export function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CoW RWA',
    short_name: 'CoW RWA',
    description: 'Trade tokenized stocks with CoW Protocol',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#052b65',
    icons: [{ src: 'https://swap.cow.fi/favicon.png', sizes: '192x192', type: 'image/png' }],
  }
}
