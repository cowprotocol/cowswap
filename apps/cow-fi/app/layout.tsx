import { Metadata, Viewport } from 'next'
import { CONFIG } from '@/const/meta'
import { Providers } from './providers'
import { getPageMetadata } from '@/util/getPageMetadata'

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

const defaultMetadata = getPageMetadata({ description: CONFIG.description })

export const metadata: Metadata = {
  ...defaultMetadata,
  metadataBase: new URL(CONFIG.url.root),
  alternates: { canonical: './' },
  icons: {
    icon: [
      { url: '/favicon-light-mode.png', type: 'image/png', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-dark-mode.png', type: 'image/png', media: '(prefers-color-scheme: dark)' },
      { url: '/favicon-dark-mode.png', type: 'image/png', media: '(prefers-color-scheme: no-preference)' },
    ],
    apple: '/apple-touch-icon.png',
    other: {
      rel: 'mask-icon',
      url: '/safari-pinned-tab.svg',
      color: '#000000',
    },
  },
  twitter: {
    ...defaultMetadata.twitter,
    card: 'summary_large_image',
    site: CONFIG.social.twitter.account,
    images: [{ url: `${CONFIG.url.root}/images/og-meta-cowdao.png` }],
  },
  openGraph: {
    ...defaultMetadata.openGraph,
    type: 'website',
    url: './',
    images: [{ url: `${CONFIG.url.root}/images/og-meta-cowdao.png` }],
  },
  manifest: '/site.webmanifest',
  other: {
    'msapplication-TileColor': '#000000',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
