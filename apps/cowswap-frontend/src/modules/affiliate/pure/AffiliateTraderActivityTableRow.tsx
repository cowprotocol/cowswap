import { ReactNode } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { formatDateWithTimezone, formatShortDate, getExplorerOrderLink } from '@cowprotocol/common-utils'
import { TokenLogo, useTokensByAddressMapForChain } from '@cowprotocol/tokens'
import {
  Badge,
  BadgeTypes,
  ContextMenuExternalLink,
  ContextMenuTooltip,
  InfoTooltip,
  NetworkLogo,
  UI,
} from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { MoreVertical } from 'react-feather'
import styled from 'styled-components/macro'

import { getTokenFromMapping } from 'utils/orderUtils/getTokenFromMapping'

import { TraderActivityEligibilityReason, TraderActivityRowResponse } from '../api/bffAffiliateApi.types'
import { formatTokenAmountDecimal, formatUsdCompact, toValidDate } from '../lib/affiliateProgramUtils'

export interface AffiliateTraderActivityTableRowProps {
  row: TraderActivityRowResponse
}

export function AffiliateTraderActivityTableRow({ row }: AffiliateTraderActivityTableRowProps): ReactNode {
  const {
    buy_token: buyTokenAddress,
    chain_id: chainId,
    creation_date: creationDate,
    executed_buy_amount: executedBuyAmount,
    executed_sell_amount: executedSellAmount,
    eligible_volume_usd: eligibleVolumeUsd,
    eligibility_reason: eligibilityReason,
    is_eligible: isEligible,
    order_uid: uid,
    sell_token: sellTokenAddress,
  } = row
  const orderLink = getExplorerOrderLink(chainId, uid)

  const tokensByAddress = useTokensByAddressMapForChain(chainId)
  const sellToken = getTokenFromMapping(sellTokenAddress, chainId, tokensByAddress)
  const buyToken = getTokenFromMapping(buyTokenAddress, chainId, tokensByAddress)

  return (
    <tr>
      <td>
        <span title={formatDateWithTimezone(toValidDate(creationDate))}>{formatShortDate(creationDate)}</span>
      </td>
      <td>
        <NetworkCell>
          <NetworkLogo chainId={chainId} size={16} />
          <span>{CHAIN_INFO[chainId].label}</span>
        </NetworkCell>
      </td>
      <td>
        <TradeCell>
          <TokenPair>
            <TokenIconSlot>
              {sellToken ? <TokenLogo token={sellToken} size={24} hideNetworkBadge /> : <PlaceholderTokenIcon />}
            </TokenIconSlot>
            <TokenIconSlot $shift={-8}>
              {buyToken ? <TokenLogo token={buyToken} size={24} hideNetworkBadge /> : <PlaceholderTokenIcon />}
            </TokenIconSlot>
          </TokenPair>
          <TradeSummary>
            <TradeLine>
              {sellToken ? `${formatTokenAmountDecimal(executedSellAmount)} ${sellToken.symbol}` : null}
            </TradeLine>
            <TradeLine>
              {buyToken ? `${formatTokenAmountDecimal(executedBuyAmount)} ${buyToken.symbol}` : null}
            </TradeLine>
          </TradeSummary>
        </TradeCell>
      </td>
      <td>
        <span>{formatUsdCompact(eligibleVolumeUsd)}</span>
      </td>
      <td>
        <EligibilityCell>
          <Badge type={isEligible ? BadgeTypes.SUCCESS : BadgeTypes.ALERT}>
            {isEligible ? <Trans>Yes</Trans> : <Trans>No</Trans>}
          </Badge>
          {!isEligible && <InfoTooltip content={<EligibilityReasonMessage reason={eligibilityReason} />} size={14} />}
        </EligibilityCell>
      </td>
      <td>
        <ActionsCell>
          <ContextMenuTooltip
            disableHoverBackground
            content={<ContextMenuExternalLink href={orderLink} label={t`View on explorer`} />}
          >
            <MoreVertical size={16} />
          </ContextMenuTooltip>
        </ActionsCell>
      </td>
    </tr>
  )
}

function EligibilityReasonMessage({ reason }: { reason: TraderActivityEligibilityReason }): ReactNode {
  switch (reason) {
    case 'eligible':
      return <Trans>Eligible trade</Trans>
    case 'code_mismatch_after_binding':
      return <Trans>This trade used a different referral code than the trader&apos;s bound code.</Trans>
    case 'code_not_found':
      return <Trans>This referral code was not found in the affiliate program configuration.</Trans>
    case 'integrator_ignored':
      return <Trans>Trades coming from integrator flow are excluded from affiliate rewards.</Trans>
    case 'low_fee_excluded':
      return <Trans>This trade fee was too low to qualify for affiliate rewards.</Trans>
    case 'ref_after_first_trade':
      return <Trans>The referral code was applied after the trader&apos;s first qualifying trade.</Trans>
    case 'volume_cap_reached':
      return <Trans>The trader already reached the rewardable volume cap for this referral code.</Trans>
  }
}

const TradeCell = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 220px;
`

const TokenPair = styled.div`
  display: inline-flex;
  align-items: center;
  min-width: 34px;
`

const TokenIconSlot = styled.span<{ $shift?: number }>`
  display: inline-flex;
  width: 26px;
  height: 26px;
  min-width: 26px;
  min-height: 26px;
  border-radius: 50%;
  border: 2px solid var(${UI.COLOR_PAPER});
  overflow: hidden;
  background: var(${UI.COLOR_PAPER_DARKER});
  margin-left: ${({ $shift = 0 }) => `${$shift}px`};
`

const PlaceholderTokenIcon = styled.span`
  display: inline-flex;
  width: 100%;
  height: 100%;
  background: var(${UI.COLOR_TEXT_OPACITY_25});
`

const TradeSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

const TradeLine = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  line-height: 1.2;
`

const NetworkCell = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`

const EligibilityCell = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`

const ActionsCell = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
`
