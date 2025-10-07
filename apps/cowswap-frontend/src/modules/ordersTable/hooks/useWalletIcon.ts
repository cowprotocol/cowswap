import { useEffect, useState } from 'react'

export function useWalletIcon(): string | null {
  const [walletIcon, setWalletIcon] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    void import('@cowprotocol/assets/cow-swap/wallet-plus.svg')
      .then((module) => {
        if (!isCancelled) {
          setWalletIcon(module.default)
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
