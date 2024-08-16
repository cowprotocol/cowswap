import GameIcon from '@cowprotocol/assets/cow-swap/game.gif'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { BackButton } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { Text } from 'rebass'
import { Nullish } from 'types'

import { DisplayLink } from 'legacy/components/TransactionConfirmationModal/DisplayLink'
import { ActivityStatus } from 'legacy/hooks/useRecentActivity'

import { ActivityDerivedState } from 'modules/account/containers/Transaction'
import { GnosisSafeTxDetails } from 'modules/account/containers/Transaction/ActivityDetails'
import { NavigateToNewOrderCallback } from 'modules/swap/containers/ConfirmSwapModalSetup'
import { EthFlowStepper } from 'modules/swap/containers/EthFlowStepper'
import { WatchAssetInWallet } from 'modules/wallet/containers/WatchAssetInWallet'

import { Routes } from 'common/constants/routes'

import * as styledEl from './styled'

// import { SurplusModal } from './SurplusModal'
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
  orderProgressBarV2Props?: OrderProgressBarV2Props | null
  showCancellationModal: Command | null
  navigateToNewOrderCallback?: NavigateToNewOrderCallback
}

export function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash,
  currencyToAdd,
  activityDerivedState,
  orderProgressBarV2Props,
  showCancellationModal,
  navigateToNewOrderCallback,
}: TransactionSubmittedContentProps) {
  const { order, isOrder, isCreating, isPending } = activityDerivedState || {}
  const showCancellationButton = isOrder && (isCreating || isPending) && showCancellationModal

  if (!chainId) {
    return null
  }

  const isInjectedWidgetMode = isInjectedWidget()

  const isPresignaturePending = activityDerivedState?.isPresignaturePending
  const showSafeSigningInfo = isPresignaturePending && activityDerivedState && !!activityDerivedState.gnosisSafeInfo
  const showProgressBar =
    !showSafeSigningInfo && !isPresignaturePending && activityDerivedState && orderProgressBarV2Props

  return (
    <styledEl.Wrapper>
      <styledEl.Section>
        <styledEl.Header>
          <BackButton onClick={onDismiss} />
          <styledEl.ActionsWrapper>
            {showCancellationButton && <CancelButton onClick={showCancellationModal}>Cancel</CancelButton>}
            <DisplayLink id={hash} chainId={chainId} />
          </styledEl.ActionsWrapper>
        </styledEl.Header>
        <>
          {!orderProgressBarV2Props && (
            <>
              <Text fontWeight={600} fontSize={28}>
                {getTitleStatus(activityDerivedState)}
              </Text>
            </>
          )}
          {showSafeSigningInfo && <GnosisSafeTxDetails chainId={chainId} activityDerivedState={activityDerivedState} />}
          <EthFlowStepper order={order} extend={!!orderProgressBarV2Props} />
          {activityDerivedState && showProgressBar && orderProgressBarV2Props && (
            <OrderProgressBarV2
              {...orderProgressBarV2Props}
              order={order}
              navigateToNewOrder={navigateToNewOrderCallback?.(chainId, order, onDismiss)}
            />
          )}
          <styledEl.ButtonGroup>
            <WatchAssetInWallet shortLabel currency={currencyToAdd} />

            {!isInjectedWidgetMode && !orderProgressBarV2Props && (
              <a href={`#${Routes.PLAY_COWRUNNER}`} target="_blank" rel="noreferrer noopener">
                <styledEl.ButtonCustom cowGame>
                  <styledEl.StyledIcon src={GameIcon} alt="Play CowGame" />
                  Play the CoW Runner Game!
                </styledEl.ButtonCustom>
              </a>
            )}

            {(activityDerivedState?.status === (ActivityStatus.CONFIRMED || ActivityStatus.EXPIRED) ||
              (activityDerivedState?.status === ActivityStatus.PENDING && !orderProgressBarV2Props)) && (
              <styledEl.ButtonCustom onClick={onDismiss}>Close</styledEl.ButtonCustom>
            )}
          </styledEl.ButtonGroup>
        </>
      </styledEl.Section>
    </styledEl.Wrapper>
  )
}
