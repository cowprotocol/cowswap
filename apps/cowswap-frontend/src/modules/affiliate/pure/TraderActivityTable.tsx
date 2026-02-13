import { ReactNode } from 'react'

import { formatShortDate, formatTokenAmount, getExplorerOrderLink, shortenAddress } from '@cowprotocol/common-utils'
import { TokenLogo, useTokensByAddressMapForChain } from '@cowprotocol/tokens'
import { ContextMenuExternalLink, ContextMenuTooltip, InfoTooltip, Media, NetworkLogo, UI } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { MoreVertical } from 'react-feather'
import styled from 'styled-components/macro'

import { Card } from 'pages/Account/styled'
import { getTokenFromMapping } from 'utils/orderUtils/getTokenFromMapping'

import { Badge, CardTitle } from './shared'

import { TraderActivityRow } from '../lib/affiliateProgramTypes'

const TableCard = styled(Card)`
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
`

const EmptyText = styled.p`
  margin: 0;
  font-size: 14px;
  color: var(${UI.COLOR_TEXT_OPACITY_60});
`

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th,
  td {
    padding: 10px 8px;
    text-align: left;
    white-space: nowrap;
    border-bottom: 1px solid var(${UI.COLOR_BORDER});
  }

  th {
    font-size: 12px;
    color: var(${UI.COLOR_TEXT_OPACITY_60});
    font-weight: 600;
  }

  td {
    color: var(${UI.COLOR_TEXT});
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  ${Media.upToSmall()} {
    min-width: 680px;
  }
`

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

  > b {
    font-weight: 600;
    color: var(${UI.COLOR_TEXT});
  }

  > small {
    color: var(${UI.COLOR_TEXT_OPACITY_60});
  }
`

const NetworkCell = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
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

function shortenValue(value: string | undefined): string {
  if (!value) return '-'

  return value.length > 12 ? `${value.slice(0, 6)}...${value.slice(-4)}` : value
}

function formatAmount(rawAmount: string, token: { decimals: number } | undefined): string {
  if (!rawAmount) return '-'

  if (!token) return shortenValue(rawAmount)

  try {
    return formatTokenAmount(CurrencyAmount.fromRawAmount(token as never, rawAmount))
  } catch {
    return shortenValue(rawAmount)
  }
}

interface TraderActivityTableRowProps {
  row: TraderActivityRow
}

interface TradeData {
  sellToken: ReturnType<typeof getTokenFromMapping> | undefined
  buyToken: ReturnType<typeof getTokenFromMapping> | undefined
  sellAmountLabel: string
  buyAmountLabel: string
  sellSymbol: string
  buySymbol: string
}

function getTradeData(
  row: TraderActivityRow,
  tokensByAddress: ReturnType<typeof useTokensByAddressMapForChain>,
): TradeData {
  const sellToken = getTokenFromMapping(row.sellToken, row.chainId, tokensByAddress) || undefined
  const buyToken = getTokenFromMapping(row.buyToken, row.chainId, tokensByAddress) || undefined

  return {
    sellToken,
    buyToken,
    sellAmountLabel: formatAmount(row.sellAmount, sellToken),
    buyAmountLabel: formatAmount(row.buyAmount, buyToken),
    sellSymbol: sellToken?.symbol || shortenAddress(row.sellToken),
    buySymbol: buyToken?.symbol || shortenAddress(row.buyToken),
  }
}

function getFeeLabel(
  row: TraderActivityRow,
  tokensByAddress: ReturnType<typeof useTokensByAddressMapForChain>,
): string {
  const feeTokenAddress = row.feeToken || row.sellToken
  const feeToken = getTokenFromMapping(feeTokenAddress, row.chainId, tokensByAddress) || undefined
  const feeAmountLabel = formatAmount(row.feeAmount || '', feeToken)
  const feeSymbol = feeToken?.symbol || (feeTokenAddress ? shortenAddress(feeTokenAddress) : '')

  return row.feeAmount ? `${feeAmountLabel} ${feeSymbol}` : '-'
}

function getEligibilityTooltip(row: TraderActivityRow): ReactNode {
  return row.ineligibleReason || <Trans>Not eligible</Trans>
}

interface TraderActivityRowContextMenuProps {
  row: TraderActivityRow
}

function TraderActivityRowContextMenu({ row }: TraderActivityRowContextMenuProps): ReactNode {
  const orderLink = getExplorerOrderLink(row.chainId, row.orderUid)

  return (
    <ContextMenuTooltip
      disableHoverBackground
      content={
        <>
          <ContextMenuExternalLink href={orderLink} label={t`View on explorer`} />
        </>
      }
    >
      <MoreVertical size={16} />
    </ContextMenuTooltip>
  )
}

function TraderActivityTableRow({ row }: TraderActivityTableRowProps): ReactNode {
  const tokensByAddress = useTokensByAddressMapForChain(row.chainId)
  const { sellToken, buyToken, sellAmountLabel, buyAmountLabel, sellSymbol, buySymbol } = getTradeData(
    row,
    tokensByAddress,
  )
  const feeLabel = getFeeLabel(row, tokensByAddress)
  const isIneligible = !row.isEligible

  return (
    <tr>
      <td>{formatShortDate(row.date) || '-'}</td>
      <td>
        <NetworkCell>
          <NetworkLogo chainId={row.chainId} size={16} />
          <span>{row.chainName}</span>
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
              <b>{sellAmountLabel}</b>
              <small>{sellSymbol}</small>
            </TradeLine>
            <TradeLine>
              <b>{buyAmountLabel}</b>
              <small>{buySymbol}</small>
            </TradeLine>
          </TradeSummary>
        </TradeCell>
      </td>
      <td>{feeLabel}</td>
      <td>
        <EligibilityCell>
          <Badge $tone={row.isEligible ? 'success' : 'error'}>
            {row.isEligible ? <Trans>Yes</Trans> : <Trans>No</Trans>}
          </Badge>
          {isIneligible ? <InfoTooltip content={getEligibilityTooltip(row)} size={14} /> : null}
        </EligibilityCell>
      </td>
      <td>
        <ActionsCell>
          <TraderActivityRowContextMenu row={row} />
        </ActionsCell>
      </td>
    </tr>
  )
}

interface TraderActivityTableProps {
  rows: TraderActivityRow[]
  showLoader?: boolean
}

export function TraderActivityTable({ rows, showLoader = false }: TraderActivityTableProps): ReactNode {
  return (
    <TableCard showLoader={showLoader}>
      <CardTitle>
        <Trans>Rewards activity</Trans>
      </CardTitle>
      {rows.length === 0 ? (
        <EmptyText>
          <Trans>Your rewards activity will show here.</Trans>
        </EmptyText>
      ) : (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <th>
                  <Trans>Date</Trans>
                </th>
                <th>
                  <Trans>Network</Trans>
                </th>
                <th>
                  <Trans>Trade</Trans>
                </th>
                <th>
                  <Trans>Fee</Trans>
                </th>
                <th>
                  <Trans>Eligible</Trans>
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <TraderActivityTableRow row={row} key={`${row.chainId}:${row.orderUid}:${row.date}`} />
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}
    </TableCard>
  )
}
