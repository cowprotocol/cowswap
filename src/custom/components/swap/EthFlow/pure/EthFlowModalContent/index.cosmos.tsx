import { GpModal } from 'components/Modal'
import { useState } from 'react'
import { useSelect, useValue } from 'react-cosmos/fixture'
import { EthFlowModalContent } from '.'
import { EthFlowState } from '../..'
import { getEthFlowModalContentProps } from '../../mocks'

const ALL_STATES = [
  EthFlowState.ApproveFailed,
  EthFlowState.ApproveInsufficient,
  EthFlowState.ApproveNeeded,
  EthFlowState.ApprovePending,
  EthFlowState.Loading,
  EthFlowState.SwapReady,
  EthFlowState.WrapAndApproveFailed,
  EthFlowState.WrapAndApproveNeeded,
  EthFlowState.WrapAndApprovePending,
  EthFlowState.WrapNeeded,
  EthFlowState.WrapUnwrapFailed,
  EthFlowState.WrapUnwrapPending,
]

const STATE_DESCRIPTIONS = ALL_STATES.map((state) => describeState(state))
function getStateFromDescription(description: string) {
  return ALL_STATES.find((state) => describeState(state) === description)
}

function describeState(state: EthFlowState) {
  switch (state) {
    case EthFlowState.ApproveFailed:
      return 'ApproveFailed'
    case EthFlowState.ApproveInsufficient:
      return 'ApproveInsufficient'
    case EthFlowState.ApproveNeeded:
      return 'ApproveNeeded'
    case EthFlowState.ApprovePending:
      return 'ApprovePending'
    case EthFlowState.Loading:
      return 'Loading'
    case EthFlowState.SwapReady:
      return 'SwapReady'
    case EthFlowState.WrapAndApproveFailed:
      return 'WrapAndApproveFailed'
    case EthFlowState.WrapAndApproveNeeded:
      return 'WrapAndApproveNeeded'
    case EthFlowState.WrapAndApprovePending:
      return 'WrapAndApprovePending'
    case EthFlowState.WrapNeeded:
      return 'WrapNeeded'
    case EthFlowState.WrapUnwrapFailed:
      return 'WrapUnwrapFailed'
    case EthFlowState.WrapUnwrapPending:
      return 'WrapUnwrapPending'
  }
}

function Custom() {
  const [opened, setOpened] = useState(true)
  const openModal = () => setOpened(true)
  const onDismiss = () => setOpened(false)

  const [stateDescription] = useSelect('state', {
    options: STATE_DESCRIPTIONS,
    defaultValue: describeState(EthFlowState.WrapNeeded),
  })
  const state = getStateFromDescription(stateDescription)

  const [isUnwrap] = useValue('isUnwrap', { defaultValue: false })
  const [isExpertMode] = useValue('isExpertMode', { defaultValue: false })
  const [isNativeIn] = useValue('isUnwrap', { defaultValue: false })
  const [loading] = useValue('loading', { defaultValue: false })
  const [isWrap] = useValue('isWrap', { defaultValue: false })
  const [approveSubmitted] = useValue('approveSubmitted', { defaultValue: false })
  const [wrapSubmitted] = useValue('wrapSubmitted', { defaultValue: false })

  const { balanceChecks, bottomContentParams, modalTextContent } = getEthFlowModalContentProps({
    state,
    isWrap,
    isUnwrap,
    isExpertMode,
    isNativeIn,
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
