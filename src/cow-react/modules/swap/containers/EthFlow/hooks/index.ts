import { useState } from 'react'

export * from './useEthFlowActions'
export * from './useRemainingNativeTxsAndCosts'
export * from './useSetupEthFlow'

export function useOpenNativeWrapModal() {
  // Native wrap modals
  const [showNativeWrapModal, setOpenNativeWrapModal] = useState(false)
  const openNativeWrapModal = () => setOpenNativeWrapModal(true)
  const dismissNativeWrapModal = () => setOpenNativeWrapModal(false)

  return {
    showNativeWrapModal,
    openNativeWrapModal,
    dismissNativeWrapModal,
  }
}
