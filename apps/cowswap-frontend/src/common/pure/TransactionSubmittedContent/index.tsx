import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { BackButton } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { DisplayLink } from 'legacy/components/TransactionConfirmationModal/DisplayLink'
import { ActivityStatus } from 'legacy/hooks/useRecentActivity'
import type { Order } from 'legacy/state/orders/actions'

import { ActivityDerivedState } from 'modules/account/containers/Transaction'
import { GnosisSafeTxDetails } from 'modules/account/containers/Transaction/ActivityDetails'
import { EthFlowStepper } from 'modules/ethFlow'
import { WatchAssetInWallet } from 'modules/wallet/containers/WatchAssetInWallet'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import * as styledEl from './styled'

import { CancelButton } from '../CancelButton'
import { OrderProgressBar } from '../OrderProgressBar'
import { OrderProgressBarProps } from '../OrderProgressBar/types'

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
  chainId: SupportedChainId
  activityDerivedState: ActivityDerivedState | null
  currencyToAdd?: Nullish<Currency>
  orderProgressBarProps: OrderProgressBarProps
  navigateToNewOrderCallback?: (chainId: SupportedChainId, order?: Order, callback?: Command) => () => void
}

export function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash,
  currencyToAdd,
  activityDerivedState,
  orderProgressBarProps,
  navigateToNewOrderCallback,
}: TransactionSubmittedContentProps) {
  const { order, isOrder, isCreating, isPending } = activityDerivedState || {}
  const { isProgressBarSetup, showCancellationModal, stepName } = orderProgressBarProps
  const showCancellationButton = isOrder && (isCreating || isPending) && showCancellationModal

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
            onClick={onDismiss}
            data-click-event={toCowSwapGtmEvent({
              category: CowSwapAnalyticsCategory.PROGRESS_BAR,
              action: 'Click Back Arrow Button',
            })}
          />
          <styledEl.ActionsWrapper>
            {showCancellationButton && (
              <CancelButton
                onClick={showCancellationModal}
                data-click-event={toCowSwapGtmEvent({
                  category: CowSwapAnalyticsCategory.PROGRESS_BAR,
                  action: 'Click Cancel Order',
                })}
              >
                Cancel
              </CancelButton>
            )}
            <DisplayLink
              id={hash}
              chainId={chainId}
              data-click-event={toCowSwapGtmEvent({
                category: CowSwapAnalyticsCategory.PROGRESS_BAR,
                action: 'Click Transaction Link',
              })}
            />
          </styledEl.ActionsWrapper>
        </styledEl.Header>
        <>
          {!isProgressBarSetup && <styledEl.Title>{getTitleStatus(activityDerivedState)}</styledEl.Title>}
          {showSafeSigningInfo && <GnosisSafeTxDetails chainId={chainId} activityDerivedState={activityDerivedState} />}
          {!isFinished && <EthFlowStepper order={order} showProgressBar={!!showProgressBar} />}
          {activityDerivedState && showProgressBar && isProgressBarSetup && (
            <OrderProgressBar
              {...orderProgressBarProps}
              order={order}
              navigateToNewOrder={navigateToNewOrderCallback?.(chainId, order, onDismiss)}
            />
          )}
          <styledEl.ButtonGroup>
            <WatchAssetInWallet
              shortLabel
              currency={currencyToAdd}
              data-click-event={toCowSwapGtmEvent({
                category: CowSwapAnalyticsCategory.PROGRESS_BAR,
                action: 'Click Watch Asset',
              })}
            />

            {activityDerivedState?.status === ActivityStatus.PENDING && !isProgressBarSetup && (
              <styledEl.ButtonCustom
                onClick={onDismiss}
                data-click-event={toCowSwapGtmEvent({
                  category: CowSwapAnalyticsCategory.PROGRESS_BAR,
                  action: 'Click Close',
                })}
              >
                Close
              </styledEl.ButtonCustom>
            )}

            {isFinished && (
              <styledEl.ButtonSecondary
                onClick={onDismiss}
                data-click-event={toCowSwapGtmEvent({
                  category: CowSwapAnalyticsCategory.PROGRESS_BAR,
                  action: 'Click Close',
                })}
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
