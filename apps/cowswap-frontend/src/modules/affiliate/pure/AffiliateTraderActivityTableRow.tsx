import { ReactNode } from 'react'

import {
  formatDateWithTimezone,
  formatShortDate,
  getExplorerOrderLink,
  shortenAddress,
  tryParseCurrencyAmount,
} from '@cowprotocol/common-utils'
import { Token } from '@cowprotocol/currency'
import { useTokensByAddressMapForChain } from '@cowprotocol/tokens'
import {
  Badge,
  BadgeTypes,
  ContextMenuExternalLink,
  ContextMenuTooltip,
  InfoTooltip,
  TokenAmount,
} from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { MoreVertical } from 'react-feather'
import styled from 'styled-components/macro'

import { CurrencyLogoPair } from 'common/pure/CurrencyLogoPair'
import { getTokenFromMapping } from 'utils/orderUtils/getTokenFromMapping'

import { TraderActivityEligibilityReason, TraderActivityRowResponse } from '../api/bffAffiliateApi.types'
import { formatUsdCompact, toValidDate } from '../lib/affiliateProgramUtils'

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
    sell_token_symbol: sellTokenSymbol,
    buy_token_symbol: buyTokenSymbol,
  } = row
  const orderLink = getExplorerOrderLink(chainId, uid)

  const tokensByAddress = useTokensByAddressMapForChain(chainId)
  const sellToken = getTokenFromMapping(sellTokenAddress, chainId, tokensByAddress)
  const buyToken = getTokenFromMapping(buyTokenAddress, chainId, tokensByAddress)
  const sellTokenLabel = sellToken?.symbol || sellTokenSymbol || shortenAddress(sellTokenAddress)
  const buyTokenLabel = buyToken?.symbol || buyTokenSymbol || shortenAddress(buyTokenAddress)
  const sellTokenLogo = sellToken || createDisplayToken(chainId, sellTokenAddress, sellTokenSymbol)
  const buyTokenLogo = buyToken || createDisplayToken(chainId, buyTokenAddress, buyTokenSymbol)
  const sellAmount = tryParseCurrencyAmount(executedSellAmount, sellTokenLogo)
  const buyAmount = tryParseCurrencyAmount(executedBuyAmount, buyTokenLogo)

  return (
    <tr>
      <td>
        <TradeCell>
          <CurrencyLogoPair sellToken={sellTokenLogo} buyToken={buyTokenLogo} />
          <TradeSummary>
            <TradeLine>
              {sellAmount ? (
                <TokenAmount amount={sellAmount} tokenSymbol={sellTokenLogo} opacitySymbol />
              ) : (
                <>
                  - <TradeTokenSymbol>{sellTokenLabel}</TradeTokenSymbol>
                </>
              )}
            </TradeLine>
            <TradeLine>
              {buyAmount ? (
                <TokenAmount amount={buyAmount} tokenSymbol={buyTokenLogo} opacitySymbol />
              ) : (
                <>
                  - <TradeTokenSymbol>{buyTokenLabel}</TradeTokenSymbol>
                </>
              )}
            </TradeLine>
          </TradeSummary>
        </TradeCell>
      </td>
      <td>
        <span>{formatUsdCompact(eligibleVolumeUsd)}</span>
      </td>
      <td>
        <EligibilityCell>
          <EligibilityBadge type={isEligible ? BadgeTypes.SUCCESS : BadgeTypes.ALERT} $isEligible={isEligible}>
            {isEligible ? <Trans>Yes</Trans> : <Trans>No</Trans>}
          </EligibilityBadge>
          {!isEligible && <InfoTooltip content={<EligibilityReasonMessage reason={eligibilityReason} />} size={14} />}
        </EligibilityCell>
      </td>
      <td>
        <span title={formatDateWithTimezone(toValidDate(creationDate))}>{formatShortDate(creationDate)}</span>
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

function createDisplayToken(chainId: TraderActivityRowResponse['chain_id'], address: string, symbol?: string): Token {
  const label = symbol || shortenAddress(address)

  return new Token(chainId, address, 18, label, label)
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
    case 'time_cap_exceeded':
      return <Trans>The referral code expired before this trade was executed.</Trans>
    case 'volume_cap_reached':
      return <Trans>The trader already reached the rewardable volume cap for this referral code.</Trans>
  }
}

const TradeCell = styled.div`
  display: flex;
  flex-flow: row;
  align-items: center;
  gap: 6px;
  min-width: 220px;
  font-size: 12px;
  font-weight: 500;
`

const TradeSummary = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 2px;
  min-width: 0;
`

const TradeLine = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  line-height: 1.2;
`

const TradeTokenSymbol = styled.span`
  opacity: 0.7;
`

const EligibilityBadge = styled(Badge)<{ $isEligible: boolean }>`
  cursor: ${({ $isEligible }) => ($isEligible ? 'default' : 'pointer')};
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
