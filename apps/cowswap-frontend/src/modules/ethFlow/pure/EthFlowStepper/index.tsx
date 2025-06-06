import { Media, UI } from '@cowprotocol/ui'

import styled, { css } from 'styled-components/macro'

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
  cancelled?: boolean
  spedUp?: boolean
  replaced?: boolean
}

export interface EthFlowStepperProps {
  showProgressBar?: boolean
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

export const Wrapper = styled.div<{ showProgressBar?: boolean }>`
  display: grid;
  grid-template-columns: 0.8fr minmax(44px, 0.3fr) 0.8fr minmax(44px, 0.3fr) 0.8fr;
  grid-template-rows: max-content;
  align-items: flex-start;
  width: 100%;
  padding: 20px;
  border-radius: 12px;
  background: var(${UI.COLOR_PAPER_DARKER});
  font-size: 15px;
  line-height: 1;

  ${Media.upToSmall()} {
    display: flex;
    flex-flow: column wrap;
    justify-content: flex-start;
    align-items: center;
    padding: 42px 22px;
  }

  ${({ showProgressBar }) =>
    showProgressBar &&
    css`
      margin: 0 0 -40px;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      padding: 20px 20px 60px;

      ${Media.upToSmall()} {
        padding: 20px 20px 60px;
      }
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
  background: var(${UI.COLOR_PAPER});
  margin: 28px 0 0;
  border-radius: var(--height);

  ${Media.upToSmall()} {
    --height: 30px;
    --width: 3px;
    border-radius: var(--width);
    margin: 24px auto;
    height: var(--height);
    width: var(--width);
  }

  &::after {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    height: inherit;
    transition:
      width var(${UI.ANIMATION_DURATION}) ease-in-out,
      background var(${UI.ANIMATION_DURATION}) ease-in-out;
    width: ${({ value }) => (value ? `${value}%` : '0%')};
    background: ${({ status }) =>
      status === 'error'
        ? `var(${UI.COLOR_DANGER})`
        : status === 'success'
          ? `var(${UI.COLOR_SUCCESS})`
          : status === 'pending'
            ? `var(${UI.COLOR_PRIMARY})`
            : `var(${UI.COLOR_TEXT_OPACITY_25})`};
    border-radius: var(--height);

    ${Media.upToSmall()} {
      --width: 3px;
      width: var(--width);
      border-radius: var(--width);
      height: ${({ value }) => (value ? `${value}%` : '0%')};
    }
  }
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function EthFlowStepper(props: EthFlowStepperProps) {
  const { showProgressBar } = props

  return (
    <Wrapper showProgressBar={showProgressBar}>
      <Step1 {...props} />
      <Progress1 {...props} />
      <Step2 {...props} />
      <Progress2 {...props} />
      <Step3 {...props} />
    </Wrapper>
  )
}
