import { useCallback, useState } from 'react'

import { isSolanaChain, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useOpenWalletConnectionModal, useSolanaAccount, useSwitchNetwork, useWalletInfo } from '@cowprotocol/wallet'

export interface SolanaGate {
  solanaAccount: ReturnType<typeof useSolanaAccount>
  connected: boolean
  chainId: ReturnType<typeof useWalletInfo>['chainId']
  /** Painting needs the Solana network; the page shows a gate until it is selected. */
  onSolana: boolean
  switching: boolean
  openSolanaWalletModal: () => void
  switchToSolana: () => Promise<void>
}

/** Wallet connection state and the Solana-network gate. */
export function useSolanaGate(): SolanaGate {
  const solanaAccount = useSolanaAccount()
  const openWalletModal = useOpenWalletConnectionModal()
  const { chainId } = useWalletInfo()
  const switchNetwork = useSwitchNetwork()
  const [switching, setSwitching] = useState(false)

  // Reown's react open() omits 'namespace' in its typing, but the base client
  // honors it — without this the modal opens on the EVM wallet list.
  const openSolanaWalletModal = useCallback(() => {
    ;(openWalletModal as (opts?: { namespace?: string }) => void)({ namespace: 'solana' })
  }, [openWalletModal])

  const switchToSolana = useCallback(async (): Promise<void> => {
    setSwitching(true)
    try {
      await switchNetwork(SupportedChainId.SOLANA)
    } catch (err: unknown) {
      console.error('network switch failed', err)
    } finally {
      setSwitching(false)
    }
  }, [switchNetwork])

  return {
    solanaAccount,
    connected: Boolean(solanaAccount),
    chainId,
    onSolana: isSolanaChain(chainId),
    switching,
    openSolanaWalletModal,
    switchToSolana,
  }
}
