import React from 'react'
import styled from 'styled-components/macro'
import { ExplorerLink } from 'components/ExplorerLink'
import { Step1 } from './steps/Step1'
import { Progress1 } from './steps/Progress1'
import { Step2 } from './steps/Step2'
import { Progress2 } from './steps/Progress2'
import { Step3 } from './steps/Step3'
import { StatusIconState } from './StatusIcon'

export enum SmartOrderStatus {
  CREATING = 'CREATING',
  CREATION_MINED = 'CREATED',
  INDEXED = 'INDEXED',
  FILLED = 'FILLED',
}

export interface EthFlowStepperProps {
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

const Wrapper = styled.div`
  padding: 15px;
  background-color: #ecf1f8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  line-height: 1.5;
`

export interface ProgressProps {
  status: StatusIconState
  value: number
}
export const Progress = styled.progress<ProgressProps>`
  height: 5px;
  min-width: 100px;

  // TODO: We might want to style differently the error status (see props!)
  /* ::-moz-progress-bar,
  ::-webkit-progress-value,
  ::-webkit-progress-bar {
    background-color: red;
  } */
`

export const ExplorerLinkStyled = styled(ExplorerLink)`
  margin-top: 3px;
  display: block;
`

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
