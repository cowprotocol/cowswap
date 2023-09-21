import { useEffect } from 'react'

import { useENSAddress } from '@cowprotocol/ens'

import { useTradeState } from '../hooks/useTradeState'

export function RecipientAddressUpdater() {
  const { state, updateState } = useTradeState()
  const { address: recipientAddress } = useENSAddress(state?.recipient)

  useEffect(() => {
    if (state?.recipientAddress !== recipientAddress) {
      updateState?.({ recipientAddress })
    }
  }, [recipientAddress, state?.recipientAddress, updateState])

  return null
}
