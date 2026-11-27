import { useCallback } from 'react'

import { useAppKit } from '@reown/appkit/react'

import type { OpenWalletModalEventDetail } from '../../constants'

export function useOpenWalletConnectionModal(): (options?: OpenWalletModalEventDetail) => void {
  const { open } = useAppKit()

  return useCallback(
    (options?: OpenWalletModalEventDetail) => {
      // Only our own fields may reach AppKit. It stores `options.view` in a valtio proxy, and a
      // DOM event — which `onClick={openModal}` passes as `options` — carries `view === window`.
      // Valtio then proxies `window` in place, replacing globals with Proxy wrappers, and the page
      // dies with "Illegal invocation" in React, lit and injected wallets.
      void open({ namespace: options?.namespace })
    },
    [open],
  )
}
