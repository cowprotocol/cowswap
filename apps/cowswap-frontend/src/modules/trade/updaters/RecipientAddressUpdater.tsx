import { useEffect } from 'react'

import { useENSAddress } from '@cowprotocol/ens'

import { useTradeState } from '../hooks/useTradeState'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function RecipientAddressUpdater() {
  const { state, updateState } = useTradeState()
  const { address: recipientAddress } = useENSAddress(state?.recipient)

  useEffect(() => {
    console.log(
      '[DIAG RecipientAddressUpdater] render, recipient=',
      state?.recipient?.slice(0, 12),
      'len=',
      state?.recipient?.length,
      'state.recipientAddress=',
      state?.recipientAddress,
      'ens recipientAddress=',
      recipientAddress,
    )
    if (state?.recipientAddress !== recipientAddress) {
      console.log('[DIAG RecipientAddressUpdater] WRITING recipientAddress =', recipientAddress)
      updateState?.({ ...state, recipientAddress })
    }
  }, [recipientAddress, state?.recipientAddress, updateState, state])

  return null
}
