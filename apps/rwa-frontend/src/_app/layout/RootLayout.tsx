import type { ReactNode } from 'react'

import localFont from 'next/font/local'

import { Footer } from './Footer'
import { Providers } from './Providers'

import { APPLE_ICON, FAVICON } from '../seo'

import type { Metadata, Viewport } from 'next'

import { buildPageMetadata, IS_INDEXABLE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/shared/lib/seo/index.server'
import { THEME_INIT_SCRIPT } from '@/shared/lib/theme'
import { OfflineBanner } from '@/shared/ui/offline-banner'
import { Header } from '@/widgets/header'

import '../styles/globals.css'

const inter = localFont({
  src: '../styles/fonts/Inter-roman.var.woff2',
  weight: '100 900',
  display: 'swap',
  variable: '--font-inter',
})

const DEFAULT_TITLE = `${SITE_NAME}: trade tokenized stocks and ETFs`

export const metadata: Metadata = {
  ...buildPageMetadata({ title: DEFAULT_TITLE, description: SITE_DESCRIPTION, path: '' }),
  // Pages inherit an unset field, and the canonical URL of one page must not leak into another
  alternates: null,
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: `%s | ${SITE_NAME}` },
  applicationName: SITE_NAME,
  icons: { icon: FAVICON, apple: APPLE_ICON },
  robots: IS_INDEXABLE ? { index: true, follow: true } : { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export function RootLayout({ children }: { children: ReactNode }): ReactNode {
  return (
    // The init script sets `data-theme` before React hydrates
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <Providers>
          <div className="canvas">
            <OfflineBanner />
            <Header />
            <main className="page">{children}</main>
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
