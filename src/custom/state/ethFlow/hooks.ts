import { useState } from 'react'
import { useSwapState } from 'state/swap/hooks'
import { useCurrency } from 'hooks/Tokens'
import { Field } from 'state/swap/actions'
import { useDetectNativeToken } from 'state/swap/hooks'

export function useShowNativeEthFlowSlippageWarning() {
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  const { isNativeIn } = useDetectNativeToken({ currency: inputCurrency }, { currency: outputCurrency })

  return isNativeIn
}

export function useEthFlowActionHandlers() {
  // modal
  const [isModalOpen, setOpenNativeWrapModal] = useState(false)
  const openModal = () => setOpenNativeWrapModal(true)
  const closeModal = () => setOpenNativeWrapModal(false)

  return {
    openModal,
    closeModal,
    isModalOpen,
  }
}
