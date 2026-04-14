import type { ReactNode } from 'react'

import { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'cow.fi Maintenance',
}

export default function RootLayout({ children }: { children: ReactNode }): ReactNode {
  return (
    <html lang="en" style={{ margin: 0 }}>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
