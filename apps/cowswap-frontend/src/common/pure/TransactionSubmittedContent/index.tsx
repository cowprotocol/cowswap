import GameIcon from '@cowprotocol/assets/cow-swap/game.gif'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { BackButton } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { Text } from 'rebass'
import { Nullish } from 'types'

import { DisplayLink } from 'legacy/components/TransactionConfirmationModal/DisplayLink'
import { getActivityState } from 'legacy/hooks/useActivityDerivedState'
import { ActivityStatus } from 'legacy/hooks/useRecentActivity'

import { ActivityDerivedState } from 'modules/account/containers/Transaction'
import { EthFlowStepper } from 'modules/swap/containers/EthFlowStepper'
import { WatchAssetInWallet } from 'modules/wallet/containers/WatchAssetInWallet'

import { Routes } from 'common/constants/routes'

import * as styledEl from './styled'
import { SurplusModal } from './SurplusModal'

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
  showSurplus?: boolean | null
  orderProgressBarV2Props?: OrderProgressBarV2Props | null
}

export function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash,
  currencyToAdd,
  activityDerivedState,
  showSurplus,
  orderProgressBarV2Props,
}: TransactionSubmittedContentProps) {
  const activityState = activityDerivedState && getActivityState(activityDerivedState)
  const showProgressBar = activityState === 'open' || activityState === 'filled'
  const { order } = activityDerivedState || {}

  if (!chainId) {
    return null
  }

  const isInjectedWidgetMode = isInjectedWidget()

  return (
    <styledEl.Wrapper>
      <styledEl.Section>
        <styledEl.Header>
          <BackButton onClick={onDismiss} />
        </styledEl.Header>
        {(showSurplus && <SurplusModal order={order} />) || (
          <>
            {/*<Text fontWeight={600} fontSize={28}>*/}
            {/*  {getTitleStatus(activityDerivedState)}*/}
            {/*</Text>*/}
            {/*<DisplayLink id={hash} chainId={chainId} />*/}
            <EthFlowStepper order={order} />
            {activityDerivedState && showProgressBar && orderProgressBarV2Props && (
              <OrderProgressBarV2 {...orderProgressBarV2Props} order={order} />
            )}
            <styledEl.ButtonGroup>
              <WatchAssetInWallet shortLabel currency={currencyToAdd} />

              {/*{activityDerivedState?.status === ActivityStatus.PENDING && (*/}
              {/*  <styledEl.ButtonCustom onClick={onDismiss}>Close</styledEl.ButtonCustom>*/}
              {/*)}*/}
            </styledEl.ButtonGroup>
          </>
        )}
      </styledEl.Section>
    </styledEl.Wrapper>
  )
}
