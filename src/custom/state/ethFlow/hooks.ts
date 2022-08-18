import { useCallback, useState } from 'react'
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
  // modal open mounts eth-flow modal to swapmod
  const [isModalOpen, setOpenNativeWrapModal] = useState(false)

  const openModal = useCallback((forceWrap?: boolean) => {
    if (forceWrap) {
      setForceWrap(true)
    }

    setOpenNativeWrapModal(true)
  }, [])

  const closeModal = useCallback(() => {
    setOpenNativeWrapModal(false)
    setForceWrap(false)
  }, [])

  // force wrap
  // forces useWrapCallback to return wrap cb and needsWrap to true
  const [forceWrap, setForceWrap] = useState(false)

  return {
    openModal,
    closeModal,
    isModalOpen,
    forceWrap,
    setForceWrap,
  }
}
