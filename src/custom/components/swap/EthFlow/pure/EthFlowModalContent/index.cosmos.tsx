import { GpModal } from 'components/Modal'
import { useState } from 'react'
import { useSelect, useValue } from 'react-cosmos/fixture'
import { EthFlowModalContent } from '.'
import { getEthFlowModalContentProps } from '../../mocks'
import { EthFlowState } from '../../typings'
import {
  ApprovePendingTxHashMock,
  ApproveSuccessfulTxHashMock,
  mockEthFlowPendingTxs,
  WrapPendingTxHashMock,
  WrapSuccessfulTxHashMock,
} from 'components/swap/EthFlow/transactionsMocks'
import styled from 'styled-components/macro'

const ALL_STATES = Object.values(EthFlowState)

const STATE_DESCRIPTIONS = ALL_STATES.map((state) => state)
function getStateFromDescription(description: string) {
  return ALL_STATES.find((state) => state === description)
}

const Wrapper = styled.div`
  position: absolute;
  left: calc(50% - 210px);
  top: 100px;
  width: 420px;
  background: #d5e8f0;
  border-radius: 20px;

  > * {
    box-sizing: border-box;
  }
`

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
  const balanceChecks = {
    isLowBalance: useValue('isLowBalance', { defaultValue: false })[0],
    txsRemaining: useValue('txsRemaining', { defaultValue: '' })[0],
  }
  const [wrapTransaction] = useSelect('wrapTransaction', {
    options: ['none', 'pending', 'successful'],
    defaultValue: 'none',
  })
  const [approveTransaction] = useSelect('approveTransaction', {
    options: ['none', 'pending', 'successful'],
    defaultValue: 'none',
  })
  const pendingHashMap = {
    approveHash:
      approveTransaction === 'none'
        ? undefined
        : approveTransaction === 'pending'
        ? ApprovePendingTxHashMock
        : ApproveSuccessfulTxHashMock,
    wrapHash:
      wrapTransaction === 'none'
        ? undefined
        : wrapTransaction === 'pending'
        ? WrapPendingTxHashMock
        : WrapSuccessfulTxHashMock,
  }

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
          <Wrapper>
            <EthFlowModalContent
              balanceChecks={balanceChecks}
              bottomContentParams={{ ...bottomContentParams, pendingHashMap }}
              modalTextContent={modalTextContent}
              onDismiss={onDismiss}
            />
          </Wrapper>
        </GpModal>
      ) : (
        <button onClick={openModal}>Open ETH Flow</button>
      )}
    </>
  )
}

mockEthFlowPendingTxs()

const Fixture = <Custom />

export default Fixture
