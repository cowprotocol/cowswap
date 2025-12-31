import { useEffect, useState } from 'react'

import { loadWalletPlusIcon } from 'assets/lazy-loaders'

export function useWalletIcon(): string | null {
  const [walletIcon, setWalletIcon] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    void loadWalletPlusIcon()
      .then((icon) => {
        if (!isCancelled) {
          setWalletIcon(icon)
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          console.error('[useWalletIcon] Failed to load wallet icon', error)
          setWalletIcon(null)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [])

  return walletIcon
}
