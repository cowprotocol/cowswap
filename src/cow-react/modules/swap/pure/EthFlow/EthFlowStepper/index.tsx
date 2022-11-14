import { ExplorerLink } from '@src/custom/components/ExplorerLink'
import React from 'react'
import { Icon, Send, Flag, X, Plus, Check } from 'react-feather'
import styled from 'styled-components/macro'

export enum EthFlowStepperStatus {
  ETH_SENDING = 'ETH_SENDING',
  ETH_SENT = 'ETH_SENT',
  ORDER_FILLED = 'ORDER_FILLED',

  ORDER_CANCELLED = 'ORDER_CANCELLED',
  ETH_REFUNDING = 'ETH_REFUNDING',
  ETH_REFUNDED = 'ETH_REFUNDED',
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

const Divider = styled.progress`
  height: 5px;
  min-width: 100px;
`

export interface EthFlowStepperProps {
  status: EthFlowStepperStatus
  nativeTokenSymbol: string
  tokenLabel: string

  sendEtherTx: string
  refundTx?: string
  cancelationTx?: string

  order?: {
    orderId: string
    isExpired: boolean
    rejectedReason?: string
  }
}

function Step1({ status, sendEtherTx, nativeTokenSymbol }: EthFlowStepperProps) {
  let message: string, stepStatus: StepStatus, icon: Icon
  if (status === EthFlowStepperStatus.ETH_SENDING) {
    message = 'Sending ' + nativeTokenSymbol
    stepStatus = 'pending'
    icon = Send
  } else {
    message = 'Sending ' + nativeTokenSymbol
    stepStatus = 'success'
    icon = Check
  }

  const details = (
    <>
      <p>{message}</p>
      <CreateOrderTx tx={sendEtherTx} />
    </>
  )
  return <Step status={stepStatus} details={details} icon={icon} />
}

function Divider1({ status }: EthFlowStepperProps) {
  let progress: number
  if (status === EthFlowStepperStatus.ETH_SENDING) {
    progress = 50
  } else {
    progress = 100
  }

  return <Divider value={progress} max={100} />
}

function Step2({ status, order }: EthFlowStepperProps) {
  const rejectedReason = order?.rejectedReason
  let message: string, stepStatus: StepStatus, icon: Icon
  if (status === EthFlowStepperStatus.ETH_SENDING) {
    message = 'Create Order'
    stepStatus = 'not-started'
    icon = Plus
  } else if (status === EthFlowStepperStatus.ETH_SENT && order === undefined) {
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

  const className = rejectedReason ? 'error' : undefined
  const details = (
    <>
      <p className={className}>{message}</p>
      {rejectedReason && <p className={className}>{rejectedReason}</p>}
      <OrderLink orderId={order?.orderId} />
    </>
  )
  return <Step status={stepStatus} details={details} icon={icon} />
}

function Divider2({ status, order, refundTx, cancelationTx }: EthFlowStepperProps) {
  const isTerminalState =
    status === EthFlowStepperStatus.ETH_REFUNDED ||
    status === EthFlowStepperStatus.ORDER_CANCELLED ||
    status === EthFlowStepperStatus.ORDER_FILLED
  const isEthSent = status === EthFlowStepperStatus.ETH_SENT

  let progress: number
  if (isTerminalState) {
    progress = 100
  } else if (refundTx || cancelationTx) {
    progress = 66
  } else if (status === EthFlowStepperStatus.ETH_SENDING || (isEthSent && !order)) {
    progress = 0
  } else if (isEthSent) {
    if (refundTx || cancelationTx) {
      progress = 66
    } else {
      progress = 33
    }
  } else {
    progress = 90
  }
  return <Divider value={progress} max={100} />
}

function Step3({ status, nativeTokenSymbol, tokenLabel, order, refundTx, cancelationTx }: EthFlowStepperProps) {
  const isEthSent = status === EthFlowStepperStatus.ETH_SENT
  const isRefunding = status === EthFlowStepperStatus.ETH_REFUNDING
  const isOrderExpired = order?.isExpired ?? false
  const isOrderRejected = !!order?.rejectedReason
  const isCancelling = cancelationTx !== undefined
  const isCancelled = status === EthFlowStepperStatus.ORDER_CANCELLED
  const isRefunded = status === EthFlowStepperStatus.ETH_REFUNDED

  let message: string, stepStatus: StepStatus, icon: Icon
  if (isEthSent && order) {
    message = 'Receive ' + tokenLabel
    stepStatus = 'pending'
    icon = Flag
  } else if (status === EthFlowStepperStatus.ORDER_FILLED) {
    message = 'Received ' + tokenLabel
    stepStatus = 'success'
    icon = Check
  } else if (isCancelled || isRefunded) {
    message = nativeTokenSymbol + ' Refunded'
    stepStatus = 'success'
    icon = Check
  } else {
    message = 'Receive ' + tokenLabel
    stepStatus = 'not-started'
    icon = Flag
  }

  const wontReceiveToken = isOrderExpired || isOrderRejected || isRefunding || isCancelling || isCancelled || isRefunded
  console.log({ isOrderExpired, isOrderRejected, isRefunding, isCancelling, isCancelled, isRefunded })
  const details = (
    <>
      <p className={wontReceiveToken ? 'crossOut' : undefined}>{message}</p>
      {isOrderExpired && !(isOrderRejected || isCancelled) && <p>Order is Expired</p>}
      <RefundEthTx tx={refundTx} isPending={isEthSent} wontReceiveToken={wontReceiveToken} />
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

export function OrderLink({ orderId }: { orderId?: string }) {
  if (!orderId) {
    return null
  }

  return <ExplorerLinkStyled type="transaction" label="View details" id={orderId} />
}

export function RefundEthTx({
  isPending,
  tx,
  wontReceiveToken,
}: {
  isPending: boolean
  tx?: string
  wontReceiveToken: boolean
}) {
  if (!tx) {
    return wontReceiveToken ? <p className="refund">Initiating ETH Refund...</p> : null
  }

  return (
    <ExplorerLinkStyled
      type="transaction"
      label={isPending ? 'Receiving ETH Refund...' : 'ETH refunded successfully'}
      id={tx}
    />
  )
}

export function EthFlowStepper(props: EthFlowStepperProps) {
  return (
    <Wrapper>
      <Step1 {...props} />
      <Divider1 {...props} />
      <Step2 {...props} />
      <Divider2 {...props} />
      <Step3 {...props} />
    </Wrapper>
  )
}
