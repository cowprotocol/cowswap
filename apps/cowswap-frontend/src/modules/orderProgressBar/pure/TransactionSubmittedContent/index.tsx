import { ReactNode } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { BackButton } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { i18n, MessageDescriptor } from '@lingui/core'
import { msg, t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Nullish } from 'types'

import { DisplayLink } from 'legacy/components/TransactionConfirmationModal/DisplayLink'
import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { GnosisSafeTxDetails } from 'modules/account'
import { EthFlowStepper } from 'modules/ethFlow'
import { WatchAssetInWallet } from 'modules/wallet'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import { CancelButton } from 'common/pure/CancelButton'
import { ActivityDerivedState, ActivityStatus } from 'common/types/activity'
import { getIsBridgeOrder } from 'common/utils/getIsBridgeOrder'

import * as styledEl from './styled'

import { OrderProgressBarProps } from '../../types'
import { OrderProgressBar } from '../OrderProgressBar'

const activityStatusLabels: Partial<Record<ActivityStatus, MessageDescriptor>> = {
  [ActivityStatus.CONFIRMED]: msg`Confirmed`,
  [ActivityStatus.EXPIRED]: msg`Expired`,
  [ActivityStatus.CANCELLED]: msg`Cancelled`,
  [ActivityStatus.CANCELLING]: msg`Cancelling`,
  [ActivityStatus.FAILED]: msg`Failed`,
}

function getTitleStatus(activityDerivedState: ActivityDerivedState | null): string {
  if (!activityDerivedState) {
    return ''
  }

  const prefix = activityDerivedState.isOrder ? t`Order` : t`Transaction`
  const postfix = i18n._(activityStatusLabels[activityDerivedState.status] as MessageDescriptor) || t`Submitted`

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
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, complexity
export function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash,
  currencyToAdd,
  activityDerivedState,
  orderProgressBarProps,
  navigateToNewOrderCallback,
}: TransactionSubmittedContentProps): ReactNode {
  const { order, isOrder, isCreating, isPending } = activityDerivedState || {}
  const { isProgressBarSetup, showCancellationModal, stepName } = orderProgressBarProps
  const showCancellationButton = isOrder && (isCreating || isPending) && showCancellationModal

  const isBridgeOrder = !!order && getIsBridgeOrder(order)
  const isSwapFilled = order?.status === OrderStatus.FULFILLED
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
                <Trans>Cancel</Trans>
              </CancelButton>
            )}
            <DisplayLink
              id={hash}
              chainId={chainId}
              leadToBridgeTab={isBridgeOrder && isSwapFilled}
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
                <Trans>Close</Trans>
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
                <Trans>Close</Trans>
              </styledEl.ButtonSecondary>
            )}
          </styledEl.ButtonGroup>
        </>
      </styledEl.Section>
    </styledEl.Wrapper>
  )
}
