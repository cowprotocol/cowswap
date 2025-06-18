import { useEffect } from 'react'

import { useENSAddress } from '@cowprotocol/ens'

import { useTradeState } from '../hooks/useTradeState'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function RecipientAddressUpdater() {
  const { state, updateState } = useTradeState()
  const { address: recipientAddress } = useENSAddress(state?.recipient)

  useEffect(() => {
    if (state?.recipientAddress !== recipientAddress) {
      updateState?.({ ...state, recipientAddress })
    }
  }, [recipientAddress, state?.recipientAddress, updateState, state])

  return null
}
