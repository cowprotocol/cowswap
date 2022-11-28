import React from 'react'
import styled from 'styled-components/macro'
import { Step1 } from './steps/Step1'
import { Progress1 } from './steps/Progress1'
import { Step2 } from './steps/Step2'
import { Progress2 } from './steps/Progress2'
import { Step3 } from './steps/Step3'
import { StatusIconState } from './StatusIcon'
import { transparentize } from 'polished'

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
  display: grid;
  grid-template-columns: 1fr 190px 1fr 190px 1fr;
  align-items: flex-start;
  width: 100%;
  padding: 22px;
  border-radius: 0 0 12px 12px;
  background: ${({ theme }) => theme.grey1};
  font-size: 15px;
  line-height: 1;
`

export interface ProgressProps {
  status: StatusIconState
  value: number
}
export const Progress = styled.div<ProgressProps>`
  height: 2px;
  position: relative;
  display: flex;
  background: ${({ theme }) => transparentize(0.9, theme.text1)};
  margin: 28px 0 0;

  &::after {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    height: inherit;
    width: ${({ value }) => (value ? `${value}%` : '0%')};
    background: ${({ theme }) => theme.text3};
  }

  // TODO: We might want to style differently the error status (see props!)
  /* ::-moz-progress-bar,
  ::-webkit-progress-value,
  ::-webkit-progress-bar {
    background-color: red;
  } */
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
