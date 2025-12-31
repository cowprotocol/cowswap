import { ReactNode, useMemo } from 'react'

import { UI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import Checkmark from 'assets/cow-swap/checkmark.svg'
import Exclamation from 'assets/cow-swap/exclamation.svg'
import Finish from 'assets/cow-swap/finish.svg'
import Refund from 'assets/cow-swap/refund.svg'
import styled from 'styled-components/macro'

import { SmartOrderStatus } from '../constants'
import { EthFlowStepperProps } from '../index'
import { ExplorerLinkStyled, Step, StepProps } from '../Step'

const RefundMessage = styled.span`
  color: inherit;
  font-weight: 500;
`

const ExpiredMessage = styled.span`
  color: var(${UI.COLOR_WARNING});
`

// eslint-disable-next-line complexity,max-lines-per-function
export function Step3({
  nativeTokenSymbol,
  tokenLabel,
  order,
  creation,
  refund,
  cancellation,
}: EthFlowStepperProps): ReactNode {
  const { state, isExpired, rejectedReason } = order
  const { failed: creationFailed, cancelled: creationCancelled, replaced: creationReplaced } = creation
  const { hash: refundHash, failed: refundFailed } = refund
  const { hash: cancellationHash, failed: cancellationFailed } = cancellation

  const isIndexing = state === SmartOrderStatus.CREATION_MINED
  const isIndexed = state === SmartOrderStatus.INDEXED
  const isCreating = state === SmartOrderStatus.CREATING
  const isFilled = state === SmartOrderStatus.FILLED
  const expiredBeforeCreate = isExpired && (isCreating || isIndexing) && !isFilled
  const isRefunded = refundFailed === false || cancellationFailed === false
  const orderIsNotCreated = !!(creationFailed || creationCancelled || creationReplaced) && !isFilled

  const isRefunding = !!refundHash && refundFailed === undefined
  const isCanceling = !!cancellationHash && cancellationFailed === undefined
  const isOrderRejected = !!rejectedReason

  // Get the label, state and icon
  const {
    label,
    state: stepState,
    icon,
  } = useMemo<StepProps>(() => {
    if (orderIsNotCreated) {
      return {
        label: t`Receive ${tokenLabel}`,
        state: 'not-started',
        icon: Exclamation,
      }
    }
    if (expiredBeforeCreate) {
      return {
        label: t`Receive ${tokenLabel}`,
        state: 'pending',
        icon: Finish,
      }
    }
    if (isIndexing) {
      return {
        label: t`Receive ${tokenLabel}`,
        state: 'not-started',
        icon: Finish,
      }
    }
    if (isFilled) {
      return {
        label: t`Received ${tokenLabel}`,
        state: 'success',
        icon: Checkmark,
      }
    }
    if (isRefunded) {
      return {
        label: t`${nativeTokenSymbol} Refunded`,
        state: 'success',
        icon: Refund,
      }
    }
    if (isIndexed) {
      return {
        label: t`Receive ${tokenLabel}`,
        state: 'pending',
        icon: Finish,
      }
    }

    return {
      label: t`Receive ${tokenLabel}`,
      state: 'not-started',
      icon: Finish,
    }
  }, [
    expiredBeforeCreate,
    isIndexing,
    isFilled,
    isRefunded,
    orderIsNotCreated,
    isIndexed,
    tokenLabel,
    nativeTokenSymbol,
  ])

  const wontReceiveToken = !isFilled && (isExpired || isOrderRejected || isRefunding || isCanceling || isRefunded)
  const isSuccess = stepState === 'success'

  let refundLink: ReactNode | undefined

  if (cancellationHash && refundFailed !== false && !isFilled) {
    refundLink = (
      <ExplorerLinkStyled
        type="transaction"
        label={isCanceling ? t`Initiating ${nativeTokenSymbol} Refund...` : t`View transaction`}
        id={cancellationHash}
      />
    )
  } else if ((refundHash && !(expiredBeforeCreate || cancellationHash)) || (refundHash && isRefunded)) {
    refundLink = (
      <ExplorerLinkStyled
        type="transaction"
        label={isRefunding ? t`Receiving ${nativeTokenSymbol} Refund...` : t`View transaction`}
        id={refundHash}
      />
    )
  }

  const crossOut = !isSuccess && wontReceiveToken
  return (
    <Step state={stepState} icon={icon} label={label} crossOut={crossOut}>
      <>
        {!orderIsNotCreated && isExpired && !(isSuccess || isOrderRejected) && (
          <ExpiredMessage>
            <Trans>Order has expired</Trans>
          </ExpiredMessage>
        )}
        {!orderIsNotCreated &&
          !isRefunded &&
          wontReceiveToken &&
          !(refundHash || cancellationHash) &&
          cancellationFailed === undefined && (
            <RefundMessage>
              <Trans>Initiating {nativeTokenSymbol} Refund...</Trans>
            </RefundMessage>
          )}
        {orderIsNotCreated && (
          <RefundMessage>
            <Trans>{nativeTokenSymbol} Refunded</Trans>
          </RefundMessage>
        )}
        {refundLink}
      </>
    </Step>
  )
}
