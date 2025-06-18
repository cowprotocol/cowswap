import { useState } from 'react'

import { useSelect, useValue } from 'react-cosmos/client'
import styled from 'styled-components/macro'

import { CowModal } from 'common/pure/Modal'
import { ActivityStatus } from 'common/types/activity'

import { getEthFlowModalContentProps } from '../../services/ethFlow/mocks'
import {
  ApproveErrorTxHashMock,
  ApprovePendingTxHashMock,
  ApproveSuccessfulTxHashMock,
  mockEthFlowPendingTxs,
  WrapErrorTxHashMock,
  WrapPendingTxHashMock,
  WrapSuccessfulTxHashMock,
} from '../../services/ethFlow/transactionsMocks'
import { EthFlowState } from '../../services/ethFlow/types'
import { EthFlowActionContext } from '../../state/ethFlowContextAtom'

import { EthFlowModalContent } from './index'

const ALL_STATES = Object.values(EthFlowState)

const STATE_DESCRIPTIONS = ALL_STATES.map((state) => state)

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
  if (state === 'error') return ApproveErrorTxHashMock
  return null
}

function getWrapHash(state: string): string | null {
  if (state === 'pending') return WrapPendingTxHashMock
  if (state === 'successful') return WrapSuccessfulTxHashMock
  if (state === 'error') return WrapErrorTxHashMock
  return null
}

const txStatusMap: { [key: string]: ActivityStatus } = {
  pending: ActivityStatus.PENDING,
  successful: ActivityStatus.CONFIRMED,
  error: ActivityStatus.EXPIRED,
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
function Custom() {
  const [opened, setOpened] = useState(true)
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const openModal = () => setOpened(true)
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const onDismiss = () => setOpened(false)

  const [stateDescription] = useSelect('state', {
    options: STATE_DESCRIPTIONS,
    defaultValue: EthFlowState.WrapNeeded,
  })
  const state = getStateFromDescription(stateDescription)
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
    txStatus: txStatusMap[approveState] || null,
    txHash: getApproveHash(approveState),
  }

  const wrapAction: EthFlowActionContext = {
    isNeeded: false,
    txStatus: txStatusMap[wrapState] || null,
    txHash: getWrapHash(wrapState),
  }

  const modalProps = getEthFlowModalContentProps({
    state,
    approveAction,
    wrapAction,
    balanceChecks,
  })

  return (
    <>
      {opened ? (
        <CowModal isOpen onDismiss={onDismiss}>
          <Wrapper>
            <EthFlowModalContent {...modalProps} />
          </Wrapper>
        </CowModal>
      ) : (
        <button onClick={openModal}>Open ETH Flow</button>
      )}
    </>
  )
}

mockEthFlowPendingTxs()

const Fixture = <Custom />

export default Fixture
