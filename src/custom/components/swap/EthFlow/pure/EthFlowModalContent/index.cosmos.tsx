import { GpModal } from 'components/Modal'
import { useState } from 'react'
import { useSelect, useValue } from 'react-cosmos/fixture'
import { EthFlowModalContent } from '.'
import { EthFlowState } from '../..'
import { getEthFlowModalContentProps } from '../../mocks'

const ALL_STATES = Object.values(EthFlowState)

const STATE_DESCRIPTIONS = ALL_STATES.map((state) => state)
function getStateFromDescription(description: string) {
  return ALL_STATES.find((state) => state === description)
}

function Custom() {
  const [opened, setOpened] = useState(true)
  const openModal = () => setOpened(true)
  const onDismiss = () => setOpened(false)

  const [stateDescription] = useSelect('state', {
    options: STATE_DESCRIPTIONS,
    defaultValue: EthFlowState.WrapNeeded,
  })
  const state = getStateFromDescription(stateDescription)

  const [isExpertMode] = useValue('isExpertMode', { defaultValue: false })
  const [loading] = useValue('loading', { defaultValue: false })
  const [approveSubmitted] = useValue('approveSubmitted', { defaultValue: false })
  const [wrapSubmitted] = useValue('wrapSubmitted', { defaultValue: false })
  const [isLowBalance] = useValue('isLowBalance', { defaultValue: false })
  const [txsRemaining] = useValue('txsRemaining', { defaultValue: '' })
  const balanceChecks = { isLowBalance, txsRemaining }

  const { bottomContentParams, modalTextContent } = getEthFlowModalContentProps({
    state,
    isExpertMode,
    loading,
    approveSubmitted,
    wrapSubmitted,
  })

  return (
    <>
      {opened ? (
        <GpModal isOpen onDismiss={onDismiss}>
          <EthFlowModalContent
            balanceChecks={balanceChecks}
            bottomContentParams={bottomContentParams}
            modalTextContent={modalTextContent}
            onDismiss={onDismiss}
          />
        </GpModal>
      ) : (
        <button onClick={openModal}>Open ETH Flow</button>
      )}
    </>
  )
}

const Fixture = <Custom />

export default Fixture
