import { ExplorerLink } from '@src/custom/components/ExplorerLink'
import React from 'react'
import { Icon, Send, Flag, X, Plus, Check, AlertTriangle } from 'react-feather'
import styled from 'styled-components/macro'

// export enum EthFlowStepperStatus {
//   ETH_SENDING = 'ETH_SENDING',
//   ETH_SENT = 'ETH_SENT',
//   ORDER_FILLED = 'ORDER_FILLED',

//   ORDER_CANCELLED = 'ORDER_CANCELLED',
//   ETH_REFUNDING = 'ETH_REFUNDING',
//   ETH_REFUNDED = 'ETH_REFUNDED',
// }

export enum SmartOrderStatus {
  CREATING = 'CREATING',
  CREATION_MINED = 'CREATED',
  INDEXED = 'INDEXED',
  FILLED = 'FILLED',
}

type StepStatus = 'success' | 'pending' | 'not-started' | 'error'

interface StepIcon {
  bgColor: string
  color: string
  borderColor: string
}

const STATUS_COLORS: Record<StepStatus, StepIcon> = {
  success: {
    bgColor: '#D5E5E3',
    borderColor: '£D5E5E3',
    color: '#017B28',
  },
  pending: {
    bgColor: '#F8F9FD',
    borderColor: 'F8F9FD',
    color: '#0D5ED9',
  },
  'not-started': {
    bgColor: 'none',
    borderColor: '#D6DDE9',
    color: '#D6DDE9',
  },
  error: {
    bgColor: '#f25757',
    borderColor: '#f25757',
    color: 'white',
  },
}

const Wrapper = styled.div`
  padding: 15px;
  background-color: #ecf1f8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  line-height: 1.5;

  p {
    margin: 0;
  }

  .success {
    color: #017b28;
  }
  .pending {
    color: #0d5ed9;
  }
  .not-started {
    color: gray;
  }

  .error {
    color: #f25757;
  }

  .crossOut {
    text-decoration: line-through;
    color: gray;
  }

  .refund {
    color: #0d5ed9;
  }
`

const StepWrapper = styled.div`
  height: 100%;
  padding: 10px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 6rem;
`

const Circle = styled.div<StepIcon>`
  border-radius: 50%;
  width: 40px;
  height: 40px;
  background-color: ${(props) => props.bgColor};
  border: solid 2px ${(props) => props.borderColor};
  color: ${(props) => props.color};
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 5px;
`

function Status({ status, icon: CustomIcon }: { status: StepStatus; icon: Icon }) {
  const stepIcon = STATUS_COLORS[status]

  return (
    <Circle {...stepIcon}>
      <CustomIcon size="20" />
    </Circle>
  )
}

export interface StepProps {
  status: StepStatus
  details: React.ReactNode
  icon: Icon
}

function Step(props: StepProps) {
  const { details, status, icon } = props
  return (
    <StepWrapper>
      <Status icon={icon} status={status} />
      {details}
    </StepWrapper>
  )
}

const Progress = styled.progress`
  height: 5px;
  min-width: 100px;
`

export interface EthFlowStepperProps {
  // status: EthFlowStepperStatus
  nativeTokenSymbol: string
  tokenLabel: string

  order: {
    createOrderTx: string
    orderId: string
    state: SmartOrderStatus
    isExpired: boolean
    rejectedReason?: string
  }

  refund: {
    refundTx?: string
    isRefunded: boolean
  }

  cancelation: {
    cancelationTx?: string
    isCanceled: boolean
  }
}

function Step1({ nativeTokenSymbol, order }: EthFlowStepperProps) {
  const { state, isExpired, createOrderTx } = order
  const isCreating = state === SmartOrderStatus.CREATING

  let message: string, stepStatus: StepStatus, icon: Icon
  if (isCreating) {
    message = 'Sending ' + nativeTokenSymbol
    if (isExpired) {
      stepStatus = 'error'
      icon = AlertTriangle
    } else {
      stepStatus = 'pending'
      icon = Send
    }
  } else {
    message = 'Sent ' + nativeTokenSymbol
    stepStatus = 'success'
    icon = Check
  }

  const details = (
    <>
      <p className={isExpired && isCreating ? 'error' : stepStatus}>{message}</p>
      <CreateOrderTx tx={createOrderTx} />
    </>
  )
  return <Step status={stepStatus} details={details} icon={icon} />
}

function Progress1({ order }: EthFlowStepperProps) {
  const { state, isExpired } = order
  const isCreating = state === SmartOrderStatus.CREATING

  let progress: number
  if (isCreating && !isExpired) {
    progress = 50
  } else {
    progress = 100
  }

  return <Progress value={progress} max={100} />
}

function Step2({ order }: EthFlowStepperProps) {
  const { state, isExpired, orderId } = order
  let rejectedReason = order.rejectedReason
  const isCreating = state === SmartOrderStatus.CREATING
  const isIndexing = state === SmartOrderStatus.CREATION_MINED
  const isOrderCreated = !(isCreating || isIndexing)

  const expiredBeforeCreate = isExpired && (isCreating || isIndexing)

  let message: string, stepStatus: StepStatus, icon: Icon
  if (expiredBeforeCreate) {
    message = 'Order Creation Failed'
    rejectedReason = 'Expired before creation'
    stepStatus = 'error'
    icon = X
  } else if (isCreating) {
    message = 'Create Order'
    stepStatus = 'not-started'
    icon = Plus
  } else if (isIndexing) {
    message = 'Creating Order'
    stepStatus = 'pending'
    icon = Plus
  } else if (rejectedReason) {
    message = 'Order Creation Failed'
    stepStatus = 'error'
    icon = X
  } else {
    message = 'Order Created'
    stepStatus = 'success'
    icon = Check
  }

  const details = (
    <>
      <p className={stepStatus}>{message}</p>
      {rejectedReason && <p className={stepStatus}>{rejectedReason}</p>}
      {isOrderCreated && <ExplorerLinkStyled type="transaction" label="View details" id={orderId} />}
    </>
  )
  return <Step status={stepStatus} details={details} icon={icon} />
}

function Progress2({ order, refund, cancelation }: EthFlowStepperProps) {
  const { state } = order
  const { isRefunded, refundTx } = refund
  const { isCanceled, cancelationTx } = cancelation
  const isIndexing = state === SmartOrderStatus.CREATION_MINED
  const isFilled = state === SmartOrderStatus.FILLED
  const isCreating = state === SmartOrderStatus.CREATING

  const isTerminalState = isRefunded || isCanceled || isFilled
  let progress: number
  if (isTerminalState) {
    progress = 100
  } else if (refundTx || cancelationTx) {
    progress = 66
  } else if (isCreating || isIndexing) {
    progress = 0
  } else {
    if (refundTx || cancelationTx) {
      progress = 66
    } else {
      progress = 33
    }
  }
  return <Progress value={progress} max={100} />
}

function Step3({ nativeTokenSymbol, tokenLabel, order, refund, cancelation }: EthFlowStepperProps) {
  const { state, isExpired, rejectedReason } = order
  const { isRefunded, refundTx } = refund
  const { isCanceled, cancelationTx } = cancelation

  const isIndexing = state === SmartOrderStatus.CREATION_MINED
  const isCreating = state === SmartOrderStatus.CREATING
  const isFilled = state === SmartOrderStatus.FILLED

  const isRefunding = !!refundTx && !isRefunded
  const isCanceling = !!cancelationTx && isCanceled

  const expiredBeforeCreate = isExpired && (isCreating || isIndexing)

  let message: string, stepStatus: StepStatus, icon: Icon
  if (expiredBeforeCreate) {
    message = 'Receive ' + tokenLabel
    stepStatus = 'pending'
    icon = Flag
  } else if (isIndexing) {
    message = 'Receive ' + tokenLabel
    stepStatus = 'not-started'
    icon = Flag
  } else if (isFilled) {
    message = 'Received ' + tokenLabel
    stepStatus = 'success'
    icon = Check
  } else if (isCanceled || isRefunded) {
    message = nativeTokenSymbol + ' Refunded'
    stepStatus = 'success'
    icon = Check
  } else {
    message = 'Receive ' + tokenLabel
    stepStatus = 'not-started'
    icon = Flag
  }

  const isOrderRejected = !!rejectedReason
  const wontReceiveToken = isExpired || isOrderRejected || isRefunding || isCanceling || isCanceled || isRefunded
  console.log({
    isOrderExpired: isExpired,
    isOrderRejected,
    isRefunding,
    isCancelling: isCanceling,
    isCanceled,
    isRefunded,
  })
  const isSuccess = stepStatus === 'success'
  const details = (
    <>
      <p className={!isSuccess && wontReceiveToken ? 'crossOut' : stepStatus}>{message}</p>
      {isExpired && !isSuccess && <p>Order is Expired</p>}

      {wontReceiveToken && !refundTx && <p className="refund">Initiating ETH Refund...</p>}

      {refundTx && !expiredBeforeCreate && (
        <ExplorerLinkStyled
          type="transaction"
          label={isRefunding ? 'Receiving ETH Refund...' : 'ETH refunded successfully'}
          id={refundTx}
        />
      )}
    </>
  )
  return <Step status={stepStatus} details={details} icon={icon} />
}

const ExplorerLinkStyled = styled(ExplorerLink)`
  margin-top: 3px;
  display: block;
`

export function CreateOrderTx({ tx }: { tx?: string }) {
  if (!tx) {
    return null
  }

  return <ExplorerLinkStyled type="transaction" label="View Transaction" id={tx} />
}

export function EthFlowStepper(props: EthFlowStepperProps) {
  return (
    <Wrapper>
      <Step1 {...props} />
      <Progress1 {...props} />
      <Step2 {...props} />
      <Progress2 {...props} />
      <Step3 {...props} />
    </Wrapper>
  )
}
