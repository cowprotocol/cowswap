import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { BackButton } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { DisplayLink } from 'legacy/components/TransactionConfirmationModal/DisplayLink'
import type { Order } from 'legacy/state/orders/actions'

import { GnosisSafeTxDetails } from 'modules/account'
import { EthFlowStepper } from 'modules/ethFlow'
import { WatchAssetInWallet } from 'modules/wallet'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import { CancelButton } from 'common/pure/CancelButton'
import { ActivityDerivedState, ActivityStatus } from 'common/types/activity'

import * as styledEl from './styled'

import { OrderProgressBarProps } from '../../types'
import { OrderProgressBar } from '../OrderProgressBar'

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

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
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
