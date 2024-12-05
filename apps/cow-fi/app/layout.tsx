import { Metadata, Viewport } from 'next'
import { CONFIG } from '@/const/meta'
import { Providers } from './providers'

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: CONFIG.title,
  description: CONFIG.description,
  metadataBase: new URL(CONFIG.url.root),
  alternates: { canonical: './' },
  icons: {
    icon: [
      { url: '/favicon-light-mode.png', type: 'image/png', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-dark-mode.png', type: 'image/png', media: '(prefers-color-scheme: dark)' },
      { url: '/favicon-dark-mode.png', type: 'image/png', media: '(prefers-color-scheme: no-preference)' },
    ],
    apple: '/apple-touch-icon.png',
    // TODO: <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />
    // TODO: <meta name="msapplication-TileColor" content="#000000" />
    // TODO: <link rel="preconnect" href="https://strapiapp.com" crossOrigin="anonymous" />
    // TODO: <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
  },
  twitter: {
    card: 'summary_large_image',
    site: CONFIG.social.twitter.account,
    title: CONFIG.title,
    description: CONFIG.description,
    images: [{ url: `${CONFIG.url.root}/images/og-meta-cowdao.png` }],
  },
  openGraph: {
    type: 'website',
    title: CONFIG.title,
    description: CONFIG.description,
    url: './',
    images: [{ url: `${CONFIG.url.root}/images/og-meta-cowdao.png` }],
  },
  manifest: '/site.webmanifest',
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
