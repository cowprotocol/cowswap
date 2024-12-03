import { SupportedChainId, SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { BackButton } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { DisplayLink } from 'legacy/components/TransactionConfirmationModal/DisplayLink'
import { ActivityStatus } from 'legacy/hooks/useRecentActivity'
import type { Order } from 'legacy/state/orders/actions'

import { ActivityDerivedState } from 'modules/account/containers/Transaction'
import { GnosisSafeTxDetails } from 'modules/account/containers/Transaction/ActivityDetails'
import { Category, cowAnalytics } from 'modules/analytics'
import { EthFlowStepper } from 'modules/swap/containers/EthFlowStepper'
import { WatchAssetInWallet } from 'modules/wallet/containers/WatchAssetInWallet'

import * as styledEl from './styled'

import { CancelButton } from '../CancelButton'
import { OrderProgressBarV2, OrderProgressBarV2Props } from '../OrderProgressBarV2'

const activityStatusLabels: Partial<Record<ActivityStatus, string>> = {
  [ActivityStatus.CONFIRMED]: 'Confirmed',
  [ActivityStatus.EXPIRED]: 'Expired',
  [ActivityStatus.CANCELLED]: 'Cancelled',
  [ActivityStatus.CANCELLING]: 'Cancelling',
  [ActivityStatus.FAILED]: 'Failed',
}

function getTitleStatus(activityDerivedState: ActivityDerivedState | null): string {
  if (!activityDerivedState) {
    return ''
  }

  const prefix = activityDerivedState.isOrder ? 'Order' : 'Transaction'
  const postfix = activityStatusLabels[activityDerivedState.status] || 'Submitted'

  return `${prefix} ${postfix}`
}

export interface TransactionSubmittedContentProps {
  onDismiss(): void

  hash: string | undefined
  chainId: ChainId
  activityDerivedState: ActivityDerivedState | null
  currencyToAdd?: Nullish<Currency>
  orderProgressBarV2Props: OrderProgressBarV2Props
  navigateToNewOrderCallback?: (chainId: SupportedChainId, order?: Order, callback?: Command) => () => void
}

export function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash,
  currencyToAdd,
  activityDerivedState,
  orderProgressBarV2Props,
  navigateToNewOrderCallback,
}: TransactionSubmittedContentProps) {
  const { order, isOrder, isCreating, isPending } = activityDerivedState || {}
  const { isProgressBarSetup, showCancellationModal, stepName } = orderProgressBarV2Props
  const showCancellationButton = isOrder && (isCreating || isPending) && showCancellationModal

  if (!chainId) {
    return null
  }

  const isPresignaturePending = activityDerivedState?.isPresignaturePending
  const showSafeSigningInfo = isPresignaturePending && activityDerivedState && !!activityDerivedState.gnosisSafeInfo
  const showProgressBar = !showSafeSigningInfo && !isPresignaturePending && activityDerivedState && isProgressBarSetup
  const cancellationFailed = stepName === 'cancellationFailed'
  const isFinished =
    activityDerivedState?.status === ActivityStatus.CONFIRMED ||
    activityDerivedState?.status === ActivityStatus.EXPIRED ||
    cancellationFailed

  return (
    <styledEl.Wrapper>
      <styledEl.Section>
        <styledEl.Header>
          <BackButton
            onClick={() => {
              onDismiss()
              trackBackClick()
            }}
          />
          <styledEl.ActionsWrapper>
            {showCancellationButton && (
              <CancelButton
                onClick={() => {
                  showCancellationModal()
                  trackCancelClick()
                }}
              >
                Cancel
              </CancelButton>
            )}
            <DisplayLink id={hash} chainId={chainId} onClick={trackDisplayLinkClick} />
          </styledEl.ActionsWrapper>
        </styledEl.Header>
        <>
          {!isProgressBarSetup && <styledEl.Title>{getTitleStatus(activityDerivedState)}</styledEl.Title>}
          {showSafeSigningInfo && <GnosisSafeTxDetails chainId={chainId} activityDerivedState={activityDerivedState} />}
          {!isFinished && <EthFlowStepper order={order} showProgressBar={!!showProgressBar} />}
          {activityDerivedState && showProgressBar && isProgressBarSetup && (
            <OrderProgressBarV2
              {...orderProgressBarV2Props}
              order={order}
              navigateToNewOrder={navigateToNewOrderCallback?.(chainId, order, onDismiss)}
            />
          )}
          <styledEl.ButtonGroup>
            <WatchAssetInWallet shortLabel currency={currencyToAdd} onClick={trackWatchAssetClick} />

            {activityDerivedState?.status === ActivityStatus.PENDING && !isProgressBarSetup && (
              <styledEl.ButtonCustom
                onClick={() => {
                  onDismiss()
                  trackCloseClick()
                }}
              >
                Close
              </styledEl.ButtonCustom>
            )}

            {isFinished && (
              <styledEl.ButtonSecondary
                onClick={() => {
                  onDismiss()
                  trackCloseClick()
                }}
              >
                Close
              </styledEl.ButtonSecondary>
            )}
          </styledEl.ButtonGroup>
        </>
      </styledEl.Section>
    </styledEl.Wrapper>
  )
}

const trackCancelClick = () => {
  cowAnalytics.sendEvent({
    category: Category.PROGRESS_BAR,
    action: 'Click Cancel Order',
  })
}

const trackCloseClick = () => {
  cowAnalytics.sendEvent({
    category: Category.PROGRESS_BAR,
    action: 'Click Close',
  })
}

const trackBackClick = () => {
  cowAnalytics.sendEvent({
    category: Category.PROGRESS_BAR,
    action: 'Click Back Arrow Button',
  })
}

const trackDisplayLinkClick = () => {
  cowAnalytics.sendEvent({
    category: Category.PROGRESS_BAR,
    action: 'Click Transaction Link',
  })
}

const trackWatchAssetClick = () => {
  cowAnalytics.sendEvent({
    category: Category.PROGRESS_BAR,
    action: 'Click Watch Asset',
  })
}
