import { useEffect, useState } from 'react'

import { reownAppKit } from '../config'

export interface WalletMetaData {
  walletName?: string
  icon?: string
}

export function useAppKitWalletInfo(): WalletMetaData | null {
  const [walletMetaData, setWalletMetaData] = useState<WalletMetaData | null>(null)

  useEffect(() => {
    if (!reownAppKit) return undefined

    return reownAppKit.subscribeWalletInfo((state) => {
      if (state) {
        setWalletMetaData({ walletName: state.name, icon: state.icon })
      } else {
        setWalletMetaData(null)
      }
    })
  }, [])

  return walletMetaData
}
