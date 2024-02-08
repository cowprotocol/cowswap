import { useCallback } from 'react'

import { Order } from 'legacy/state/orders/actions'

import { useToggleAccountModal } from './useToggleAccountModal'

import { useCopyToNew } from '../../trade/hooks/useCopyToNew'

export function useCopyToNewSwap(order: Order | undefined): undefined | (() => void) {
  const copyToNew = useCopyToNew(order)
  const handleCloseOrdersPanel = useToggleAccountModal()

  const copyToNewSwap = useCallback(() => {
    copyToNew?.()
    handleCloseOrdersPanel()
  }, [copyToNew, handleCloseOrdersPanel])

  return copyToNew ? copyToNewSwap : undefined
}
