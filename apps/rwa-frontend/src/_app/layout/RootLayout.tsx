import type { ReactNode } from 'react'

import { Providers } from './Providers'

import type { Metadata, Viewport } from 'next'

import { OfflineBanner } from '@/shared/ui/offline-banner'
import { Header } from '@/widgets/header'

import '../styles/globals.css'

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
    <html lang="en">
      <body>
        <Providers>
          <OfflineBanner />
          <Header />
          <main className="page">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
