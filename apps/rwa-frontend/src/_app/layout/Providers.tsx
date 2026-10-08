'use client'

import { createStore, Provider as JotaiProvider } from 'jotai'
import { type ReactNode, useState } from 'react'

import { queryClientAtom } from 'jotai-tanstack-query'

import { QueryCachePersistence, ServiceWorkerRegistration } from '../offline'
import { createQueryClient } from '../query'
import { WalletProvider } from '../wallet'

interface AppState {
  queryClient: ReturnType<typeof createQueryClient>
  store: ReturnType<typeof createStore>
}

export function Providers({ children }: { children: ReactNode }): ReactNode {
  const [{ queryClient, store }] = useState(createAppState)

  return (
    <JotaiProvider store={store}>
      <WalletProvider queryClient={queryClient}>
        <QueryCachePersistence queryClient={queryClient} />
        <ServiceWorkerRegistration />
        {children}
      </WalletProvider>
    </JotaiProvider>
  )
}

function createAppState(): AppState {
  const queryClient = createQueryClient()
  const store = createStore()
  store.set(queryClientAtom, queryClient)

  return { queryClient, store }
}
