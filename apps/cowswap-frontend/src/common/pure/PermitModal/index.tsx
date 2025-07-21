import { useMemo } from 'react'

import { TokenAmount, TokenSymbol } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import ICON_ARROW from 'assets/icon/arrow.svg'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'
import { Nullish } from 'types'

import { IconSpinner } from '../IconSpinner'
import { NewModal, NewModalContentBottom, NewModalContentTop, NewModalProps } from '../NewModal'
import { Stepper, StepProps } from '../Stepper'

export type PermitModalProps = NewModalProps & {
  inputAmount: Nullish<CurrencyAmount<Currency>>
  outputAmount: Nullish<CurrencyAmount<Currency>>
  step: 'approve' | 'submit'
  orderType: string
  icon?: React.ReactNode
}

/**
 * You probably want to use containers/PermitModal instead
 * This is the pure component for cosmos
 */
// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function PermitModal(props: PermitModalProps) {
  const { inputAmount, outputAmount, step, icon: inputIcon, orderType, ...rest } = props

  const steps: StepProps[] = useMemo(
    () => [
      {
        stepState: step === 'approve' ? 'loading' : 'finished',
        stepNumber: 1,
        label: 'Approve' + (step === 'approve' ? '' : 'd'),
      },
      { stepState: step === 'submit' ? 'loading' : 'active', stepNumber: 2, label: 'Submit' },
    ],
    [step]
  )
  const icon = useMemo(
    () =>
      step === 'approve' ? (
        <IconSpinner currency={inputAmount?.currency} size={84} />
      ) : (
        <IconSpinner size={84}>{inputIcon}</IconSpinner>
      ),
    [inputAmount?.currency, inputIcon, step]
  )

  const title = useMemo(
    () =>
      step === 'approve' ? (
        <>
          Approve spending <TokenSymbol token={inputAmount?.currency} /> <br />
          on CoW Swap
        </>
      ) : (
        `Confirm ${orderType}`
      ),
    [inputAmount?.currency, orderType, step]
  )

  const body = useMemo(
    () =>
      step === 'approve' ? null : (
        <p>
          <TokenAmount amount={inputAmount} tokenSymbol={inputAmount?.currency} /> <ArrowRight src={ICON_ARROW} />{' '}
          <TokenAmount amount={outputAmount} tokenSymbol={outputAmount?.currency} />
        </p>
      ),
    [inputAmount, outputAmount, step]
  )

  return (
    <NewModal {...rest}>
      <NewModalContentTop gap={24} paddingTop={90}>
        {icon}
        <span>
          <h3>{title}</h3>
          {body}
        </span>
      </NewModalContentTop>

      <NewModalContentBottom gap={24}>
        <SignDescription>Sign (gas-free!) in your wallet...</SignDescription>
        <Stepper maxWidth={'75%'} steps={steps} />
      </NewModalContentBottom>
    </NewModal>
  )
}

const SignDescription = styled.p`
  margin-top: 50px !important;
`

const ArrowRight = styled(SVG)`
  --size: 12px;
  width: var(--size);
  height: var(--size);
  margin: auto;

  > path {
    fill: currentColor;
  }
`
