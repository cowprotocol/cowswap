import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'

import useENSAddress from 'legacy/hooks/useENSAddress'

import { useAdvancedOrdersDerivedState } from '../hooks/useAdvancedOrdersDerivedState'
import { updateAdvancedOrdersAtom } from '../state/advancedOrdersAtom'

export function RecipientUpdater() {
  const { recipient } = useAdvancedOrdersDerivedState()
  const updateAdvancedOrdersState = useUpdateAtom(updateAdvancedOrdersAtom)

  const { address: recipientAddress } = useENSAddress(recipient)

  useEffect(() => {
    updateAdvancedOrdersState({ recipientAddress })
  }, [recipientAddress, updateAdvancedOrdersState])

  return null
}
