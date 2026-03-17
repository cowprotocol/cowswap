import { ReactNode } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { formatDateWithTimezone, formatShortDate, getExplorerOrderLink } from '@cowprotocol/common-utils'
import { CurrencyAmount } from '@cowprotocol/currency'
import { TokenLogo, useTokensByAddressMapForChain } from '@cowprotocol/tokens'
import {
  Badge,
  BadgeTypes,
  ContextMenuExternalLink,
  ContextMenuTooltip,
  InfoTooltip,
  NetworkLogo,
  TokenAmount,
  UI,
} from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { MoreVertical } from 'react-feather'
import styled from 'styled-components/macro'

import { getTokenFromMapping } from 'utils/orderUtils/getTokenFromMapping'

import { OrderWithChainId } from '../api/fetchTraderActivity'
import { getIneligibilityReason, toValidDate } from '../lib/affiliateProgramUtils'

export interface AffiliateTraderActivityTableRowProps {
  order: OrderWithChainId
  savedCode: string
}

export function AffiliateTraderActivityTableRow({ order, savedCode }: AffiliateTraderActivityTableRowProps): ReactNode {
  const {
    buyToken: buyTokenAddress,
    chainId,
    creationDate,
    executedBuyAmount,
    executedFee,
    executedFeeToken,
    executedSellAmount,
    sellToken: sellTokenAddress,
    uid,
  } = order
  const ineligibleReason = getIneligibilityReason(order, savedCode)
  const orderLink = getExplorerOrderLink(chainId, uid)

  const tokensByAddress = useTokensByAddressMapForChain(chainId)
  const sellToken = getTokenFromMapping(sellTokenAddress, chainId, tokensByAddress)
  const buyToken = getTokenFromMapping(buyTokenAddress, chainId, tokensByAddress)
  const feeToken = getTokenFromMapping(executedFeeToken ?? '', chainId, tokensByAddress)

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
              {sellToken && (
                <TokenAmount
                  amount={CurrencyAmount.fromRawAmount(sellToken, executedSellAmount)}
                  tokenSymbol={sellToken}
                />
              )}
            </TradeLine>
            <TradeLine>
              {buyToken && (
                <TokenAmount
                  amount={CurrencyAmount.fromRawAmount(buyToken, executedBuyAmount)}
                  tokenSymbol={buyToken}
                />
              )}
            </TradeLine>
          </TradeSummary>
        </TradeCell>
      </td>
      <td>
        {feeToken && (
          <TokenAmount amount={CurrencyAmount.fromRawAmount(feeToken, executedFee || '0')} tokenSymbol={feeToken} />
        )}
      </td>
      <td>
        <EligibilityCell>
          <Badge type={ineligibleReason ? BadgeTypes.ALERT : BadgeTypes.SUCCESS}>
            {ineligibleReason ? <Trans>No</Trans> : <Trans>Yes</Trans>}
          </Badge>
          {ineligibleReason ? <InfoTooltip content={ineligibleReason} size={14} /> : null}
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
