import { useAtom } from 'jotai'
import { useEffect } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'
import { hwAccountIndexAtom, useAccountsLoader } from '@cowprotocol/wallet-provider'

import { web3Modal } from '../../web3Modal'

export function HwAccountIndexUpdater() {
  const [hwAccountIndex, setHwAccountIndex] = useAtom(hwAccountIndexAtom)
  const { chainId, account, active } = useWalletInfo()

  const accountsLoader = useAccountsLoader()

  /**
   * Reactivate connector each time when account index is changed from HwAccountIndexSelector
   * A hardware wallet connector should take into account the second parameter (indexChanged = true) for activate() method
   */
  useEffect(() => {
    if (!active || !accountsLoader) return

    const accounts = accountsLoader.getAccounts()
    const currentAccount = accounts ? accounts[hwAccountIndex] : null

    console.debug('[Hardware wallet] account index changed', hwAccountIndex, currentAccount)

    if (currentAccount) {
      web3Modal.setAddress(currentAccount)
    }
  }, [active, hwAccountIndex, accountsLoader, chainId])

  useEffect(() => {
    if (account) return

    console.debug('[Hardware wallet] reset account index to 0')
    setHwAccountIndex(0)
  }, [setHwAccountIndex, account])

  return null
}
