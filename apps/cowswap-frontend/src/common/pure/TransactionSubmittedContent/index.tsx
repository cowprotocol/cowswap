import React from 'react'

import GameIcon from '@cowprotocol/assets/cow-swap/game.gif'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { BackButton } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { Text } from 'rebass'
import { Nullish } from 'types'

import { OrderProgressBar } from 'legacy/components/OrderProgressBar'
import { DisplayLink } from 'legacy/components/TransactionConfirmationModal/DisplayLink'
import { getActivityState } from 'legacy/hooks/useActivityDerivedState'
import { ActivityStatus } from 'legacy/hooks/useRecentActivity'

import { ActivityDerivedState } from 'modules/account/containers/Transaction'
import { EthFlowStepper } from 'modules/swap/containers/EthFlowStepper'
import { AddToMetamask } from 'modules/wallet/containers/AddToMetamask'

import { Routes } from 'common/constants/routes'

import * as styledEl from './styled'
import { SurplusModal } from './SurplusModal'

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
}

export function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash,
  currencyToAdd,
  activityDerivedState,
  showSurplus,
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
            <Text fontWeight={600} fontSize={28}>
              {getTitleStatus(activityDerivedState)}
            </Text>
            <DisplayLink id={hash} chainId={chainId} />
            <EthFlowStepper order={order} />
            {/*TODO: refactor OrderProgressBar to make it pure*/}
            {activityDerivedState && showProgressBar && (
              <OrderProgressBar hash={hash} activityDerivedState={activityDerivedState} chainId={chainId} />
            )}
            <styledEl.ButtonGroup>
              {/*TODO: refactor AddToMetamask to make it pure*/}
              <AddToMetamask shortLabel currency={currencyToAdd} />

              {!isInjectedWidgetMode && (
                <a href={`#${Routes.PLAY_COWRUNNER}`} target="_blank" rel="noreferrer noopener">
                  <styledEl.ButtonCustom cowGame>
                    <styledEl.StyledIcon src={GameIcon} alt="Play CowGame" />
                    Play the CoW Runner Game!
                  </styledEl.ButtonCustom>
                </a>
              )}

              {activityDerivedState?.status === ActivityStatus.PENDING && (
                <styledEl.ButtonCustom onClick={onDismiss}>Close</styledEl.ButtonCustom>
              )}
            </styledEl.ButtonGroup>
          </>
        )}
      </styledEl.Section>
    </styledEl.Wrapper>
  )
}
