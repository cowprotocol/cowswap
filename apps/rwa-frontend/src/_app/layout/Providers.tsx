'use client'

import { Provider as JotaiProvider } from 'jotai'
import type { ReactNode } from 'react'

import { ServiceWorkerRegistration } from '../offline'
import { WalletProvider } from '../wallet'

export function Providers({ children }: { children: ReactNode }): ReactNode {
  return (
    <JotaiProvider>
      <WalletProvider>
        <ServiceWorkerRegistration />
        {children}
      </WalletProvider>
    </JotaiProvider>
  )
}
