import { useCallback, useState } from 'react'

import { isSolanaChain, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useOpenWalletConnectionModal, useSolanaAccount, useWalletInfo } from '@cowprotocol/wallet'

import { useOnSelectNetwork } from 'common/hooks/useOnSelectNetwork'

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
  // Reown cannot move an EVM-only session to Solana: the same flow as the header network
  // selector confirms the swap, disconnects the EVM wallet and opens the Solana wallet list.
  const onSelectNetwork = useOnSelectNetwork()
  const [switching, setSwitching] = useState(false)

  // Without the namespace the modal opens on the EVM wallet list.
  const openSolanaWalletModal = useCallback(() => {
    openWalletModal({ namespace: 'solana' })
  }, [openWalletModal])

  const switchToSolana = useCallback(async (): Promise<void> => {
    setSwitching(true)
    try {
      await onSelectNetwork(SupportedChainId.SOLANA)
    } finally {
      setSwitching(false)
    }
  }, [onSelectNetwork])

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
