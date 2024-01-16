import { useEffect } from 'react'

import { useENSAddress } from '@cowprotocol/ens'

import { useTradeState } from '../hooks/useTradeState'

export function RecipientAddressUpdater() {
  const { state, updateState } = useTradeState()
  const { address: recipientAddress } = useENSAddress(state?.recipient)

  useEffect(() => {
    if (state?.recipientAddress !== recipientAddress) {
      updateState?.({ ...state, recipientAddress })
    }
  }, [recipientAddress, state, updateState])

  return null
}
