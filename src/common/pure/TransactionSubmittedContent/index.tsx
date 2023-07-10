import React from 'react'

import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { Currency } from '@uniswap/sdk-core'

import { Link } from 'react-router-dom'
import { Text } from 'rebass'
import { Nullish } from 'types'

import GameIcon from 'legacy/assets/cow-swap/game.gif'
import { OrderProgressBar } from 'legacy/components/OrderProgressBar'
import { DisplayLink } from 'legacy/components/TransactionConfirmationModal/DisplayLink'
import { getActivityState } from 'legacy/hooks/useActivityDerivedState'
import { ActivityStatus } from 'legacy/hooks/useRecentActivity'

import { ActivityDerivedState } from 'modules/account/containers/Transaction'
import { EthFlowStepper } from 'modules/swap/containers/EthFlowStepper'
import AddToMetamask from 'modules/wallet/web3-react/containers/AddToMetamask'

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
}

export function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash,
  currencyToAdd,
  activityDerivedState,
}: TransactionSubmittedContentProps) {
  const activityState = activityDerivedState && getActivityState(activityDerivedState)
  const showProgressBar = activityState === 'open' || activityState === 'filled'
  const { order } = activityDerivedState || {}
  const showSurplus = activityState === 'filled'

  if (!chainId) {
    return null
  }

  return (
    <styledEl.Wrapper>
      <styledEl.Section>
        <styledEl.Header>
          <styledEl.CloseIconWrapper onClick={onDismiss} />
        </styledEl.Header>
        {showSurplus ? (
          <SurplusModal order={order} />
        ) : (
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

              <styledEl.ButtonCustom>
                <Link to={Routes.PLAY_COWRUNNER} onClick={onDismiss}>
                  <styledEl.StyledIcon src={GameIcon} alt="Play CowGame" />
                  Play the CoW Runner Game!
                </Link>
              </styledEl.ButtonCustom>
            </styledEl.ButtonGroup>
          </>
        )}
      </styledEl.Section>
    </styledEl.Wrapper>
  )
}
