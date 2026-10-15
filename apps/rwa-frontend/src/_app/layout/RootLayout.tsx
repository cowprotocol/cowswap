import type { ReactNode } from 'react'

import localFont from 'next/font/local'

import { Footer } from './Footer'
import { Providers } from './Providers'

import type { Metadata, Viewport } from 'next'

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

export const metadata: Metadata = {
  title: { default: 'CoW RWA', template: '%s | CoW RWA' },
  description: 'Trade tokenized stocks with CoW Protocol',
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
