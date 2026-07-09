import { useEffect } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useSetNonEvmReceiverConfirmed } from '../state/nonEvmReceiverConfirmedAtom.atoms'

/**
 * Resets the non-EVM receiver confirmation whenever the connected wallet
 * account or chain changes, preventing stale confirmations from persisting
 * across wallet switches.
 */
export function useResetReceiverConfirmationOnWalletChange(): void {
  const { account, chainId } = useWalletInfo()
  const setNonEvmReceiverConfirmed = useSetNonEvmReceiverConfirmed()

  useEffect(() => {
    setNonEvmReceiverConfirmed(false)
  }, [account, chainId, setNonEvmReceiverConfirmed])
}
