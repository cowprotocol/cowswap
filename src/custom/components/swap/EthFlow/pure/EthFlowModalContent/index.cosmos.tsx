import { GpModal } from 'components/Modal'
import { useState } from 'react'
import { EthFlowModalContent } from '.'
import { wrappingPreviewProps, actionButton, modalTextContent } from '../../mocks'
import { BottomContentParams } from './EthFlowModalBottomContent'

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
