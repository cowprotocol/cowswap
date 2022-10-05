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
import { EthFlowActionContext } from '../../state/ethFlowContextAtom'
import { ActivityStatus } from 'hooks/useRecentActivity'

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

function getApproveHash(state: string): string | null {
  if (state === 'pending') return ApprovePendingTxHashMock
  if (state === 'successful') return ApproveSuccessfulTxHashMock
  return null
}

function getWrapHash(state: string): string | null {
  if (state === 'pending') return WrapPendingTxHashMock
  if (state === 'successful') return WrapSuccessfulTxHashMock
  return null
}

const txStatusMap: { [key: string]: ActivityStatus } = {
  pending: ActivityStatus.PENDING,
  successful: ActivityStatus.CONFIRMED,
  error: ActivityStatus.EXPIRED,
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
  const balanceChecks = {
    isLowBalance: useValue('isLowBalance', { defaultValue: false })[0],
    txsRemaining: useValue('txsRemaining', { defaultValue: '' })[0],
  }

  const [approveState] = useSelect('approveState', {
    options: ['none', 'pending', 'successful', 'error'],
    defaultValue: 'none',
  })

  const [wrapState] = useSelect('wrapState', {
    options: ['none', 'pending', 'successful', 'error'],
    defaultValue: 'none',
  })

  const approveAction: EthFlowActionContext = {
    isNeeded: false,
    error: approveState === 'error' ? new Error('Approve error') : null,
    txStatus: txStatusMap[approveState] || null,
    txHash: getApproveHash(approveState),
  }

  const wrapAction: EthFlowActionContext = {
    isNeeded: false,
    error: wrapState === 'error' ? new Error('Wrap error') : null,
    txStatus: txStatusMap[wrapState] || null,
    txHash: getWrapHash(wrapState),
  }

  const modalProps = getEthFlowModalContentProps({
    state,
    isExpertMode,
    approveAction,
    wrapAction,
    balanceChecks,
  })

  return (
    <>
      {opened ? (
        <GpModal isOpen onDismiss={onDismiss}>
          <Wrapper>
            <EthFlowModalContent {...modalProps} />
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
