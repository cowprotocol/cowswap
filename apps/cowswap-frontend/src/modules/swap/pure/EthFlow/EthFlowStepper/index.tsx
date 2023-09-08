import React from 'react'

import { transparentize } from 'polished'
import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

import { StatusIconState } from './StatusIcon'
import { Progress1 } from './steps/Progress1'
import { Progress2 } from './steps/Progress2'
import { Step1 } from './steps/Step1'
import { Step2 } from './steps/Step2'
import { Step3 } from './steps/Step3'

export enum SmartOrderStatus {
  CREATING = 'CREATING',
  CREATION_MINED = 'CREATED',
  INDEXED = 'INDEXED',
  FILLED = 'FILLED',
}

type TxState = {
  /**
   * undefined: there's no tx to track
   * string: tx was created and can be tracked
   */
  hash?: string
  /**
   * undefined: not started/mining
   * true: transaction failed
   * false: transaction succeeded
   */
  failed?: boolean
}

export interface EthFlowStepperProps {
  nativeTokenSymbol: string
  tokenLabel: string

  order: {
    orderId: string
    state: SmartOrderStatus
    /**
     * To track if the order is past the expiration date
     */
    isExpired: boolean
    /**
     * To track if the order has been created on the backend
     */
    isCreated: boolean
    rejectedReason?: string
  }

  /**
   * To track smart order tx creation
   */
  creation: TxState

  /**
   * To track refund tx
   */
  refund: TxState

  /**
   * To track cancellation tx
   */
  cancellation: TxState
}

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: flex-start;
  width: 100%;
  padding: 22px;
  border-radius: 0 0 12px 12px;
  background: var(${UI.COLOR_GREY});
  font-size: 15px;
  line-height: 1;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
    flex-flow: column wrap;
    justify-content: flex-start;
    align-items: center;
    padding: 42px 22px;
  `}
`

export interface ProgressProps {
  status: StatusIconState
  value: number
}
export const Progress = styled.div<ProgressProps>`
  --height: 2px;
  height: var(--height);
  position: relative;
  display: flex;
  background: ${({ theme }) => transparentize(0.9, theme.text1)};
  margin: 28px 0 0;
  border-radius: var(--height);

  ${({ theme }) => theme.mediaWidth.upToSmall`
    --height: 50px;
    --width: 3px;
    border-radius: var(--width);
    margin: 24px auto;
    height: var(--height);
    width: var(--width);
  `}

  &::after {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    height: inherit;
    transition: width 0.3s ease-in-out, background 0.2s ease-in-out;
    width: ${({ value }) => (value ? `${value}%` : '0%')};
    background: ${({ status, theme }) =>
      status === 'error' ? `var(${UI.COLOR_DANGER})` : status === 'success' ? `var(${UI.COLOR_SUCCESS})` : theme.text3};
    border-radius: var(--height);

    ${({ theme }) => theme.mediaWidth.upToSmall<ProgressProps>`
      --width: 3px;
      width: var(--width);
      border-radius: var(--width);
      height: ${({ value }) => (value ? `${value}%` : '0%')};
    `}
  }
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
