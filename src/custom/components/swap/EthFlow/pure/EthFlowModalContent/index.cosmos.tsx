import { GpModal } from '@src/custom/components/Modal'
import { useState } from 'react'
import { EthFlowModalContent, ModalTextContentProps } from '.'
import { EthFlowState } from '../../helpers'
import { wrappingPreviewProps } from '../../mocks'
import { ActionButtonParams, BottomContentParams } from './EthFlowModalBottomContent'

const actionButton: ActionButtonParams = {
  approveError: null,
  wrapError: null,
  approveState: null,
  wrapState: null,
  isExpertMode: false,
  nativeSymbol: wrappingPreviewProps.nativeSymbol,
  wrappedSymbol: wrappingPreviewProps.wrappedSymbol,
  state: EthFlowState.WrapNeeded,
  isWrap: false,
  isNativeIn: false,
  loading: false,
  handleSwap: async ({ showConfirm, straightSwap }) => {
    console.log('handleSwap', { showConfirm, straightSwap })
  },
  handleApprove: async () => console.log('handleApprove'),
  handleWrap: async () => console.log('handleApprove'),
  handleMountInExpertMode: async () => console.log('handleApprove'),
}

const Fixture = () => {
  const [opened, setOpened] = useState(false)
  const openModal = () => setOpened(true)
  const onDismiss = () => setOpened(false)

  const balanceChecks = { isLowBalance: false, txsRemaining: null }

  const bottomContentParams: BottomContentParams = {
    isUnwrap: false,
    pendingHashMap: { approveHash: undefined, wrapHash: undefined },
    actionButton,
    wrappingPreview: wrappingPreviewProps,
  }

  const modalTextContent: ModalTextContentProps = {
    wrappedSymbol: actionButton.wrappedSymbol,
    nativeSymbol: actionButton.nativeSymbol,
    state: actionButton.state,
    isExpertMode: actionButton.isExpertMode,
    isNative: actionButton.isNativeIn,
    wrapSubmitted: false,
    approveSubmitted: false,
  }

  return (
    <>
      <button onClick={openModal}>Open ETH Flow</button>
      {opened && (
        <GpModal isOpen onDismiss={onDismiss}>
          <EthFlowModalContent
            balanceChecks={balanceChecks}
            bottomContentParams={bottomContentParams}
            modalTextContent={modalTextContent}
            onDismiss={onDismiss}
          />
        </GpModal>
      )}
    </>
  )
}

export default Fixture
