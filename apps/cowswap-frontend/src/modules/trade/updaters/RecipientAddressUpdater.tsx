import { useEffect } from 'react'

import useENSAddress from 'legacy/hooks/useENSAddress'

import { useTradeState } from '../hooks/useTradeState'

export function RecipientAddressUpdater() {
  const { state, updateState } = useTradeState()
  const { address: recipientAddress } = useENSAddress(state?.recipient)

  useEffect(() => {
    updateState?.({ ...state, recipientAddress })
  }, [recipientAddress, state, updateState])

  return null
}
