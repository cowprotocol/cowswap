import { useMemo } from 'react'
import type { ReactNode } from 'react'

import { getAddressKey, type AddressKey, type SupportedChainId } from '@cowprotocol/cow-sdk'
import type { TwapOrder } from '@cowprotocol/sdk-composable'
import { TruncatedText } from '@cowprotocol/ui'

import BigNumber from 'bignumber.js'
import { DateDisplay } from 'components/common/DateDisplay'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { LoadingWrapper } from 'components/common/LoadingWrapper'
import { ProgressBar } from 'components/common/ProgressBar'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { SimpleTable } from 'components/common/SimpleTable'
import { TokenDisplay } from 'components/common/TokenDisplay'
import { Notification } from 'components/Notification'
import { StatusLabel } from 'components/orders/StatusLabel'
import { HelpTooltip } from 'components/Tooltip'
import TablePagination from 'explorer/components/common/TablePagination'
import { TextWithTooltip } from 'explorer/components/common/TextWithTooltip'
import { useTable } from 'explorer/components/OrdersTableWidget/useTable'
import { ORDERS_PAGE_SIZE } from 'explorer/const'
import { useMultipleErc20 } from 'hooks/useErc20'
import { FormatAmountPrecision, formattedAmount, safeTokenName } from 'utils'

import * as styledEl from './TwapHistory.styled'

import { getTwapProgress } from '../getTwapProgress'
import { useTwapOrders } from '../hooks/useTwapOrders'
import { TwapPaginationContext } from '../TwapPaginationContext'

import type { TokenErc20 } from '@gnosis.pm/dex-js'

interface TwapHistoryProps {
  children: (content: ReactNode, pagination: ReactNode) => ReactNode
  owner: AddressKey
  chainId: SupportedChainId | null | undefined
}

export function TwapHistory({ owner, chainId, children }: TwapHistoryProps): ReactNode {
  const { state, setPageSize, handleNextPage, handlePreviousPage } = useTable({
    initialState: { pageOffset: 0, pageSize: ORDERS_PAGE_SIZE },
  })
  const { data, error, isLoading } = useTwapOrders({
    owner,
    chainId,
    limit: state.pageSize,
    offset: state.pageOffset,
    enabled: true,
  })
  const orders = data?.items
  const tableState = {
    ...state,
    hasNextPage: data ? state.pageOffset + state.pageSize < data.totalCount : false,
    totalResults: data?.totalCount,
  }
  const pagination = (
    <TwapPaginationContext.Provider
      value={{ data: orders, isLoading, tableState, setPageSize, handleNextPage, handlePreviousPage }}
    >
      <TablePagination context={TwapPaginationContext} />
    </TwapPaginationContext.Provider>
  )

  if (!orders && !error) return children(<LoadingWrapper message="Loading TWAP orders" />, null)

  return children(
    <>
      {error && <Notification type="error" message="Failed to fetch TWAP orders" />}
      <TwapHistoryTable orders={orders} chainId={chainId ?? undefined} />
    </>,
    pagination,
  )
}

function TwapHistoryAmount({
  amount,
  token,
  chainId,
}: {
  amount: bigint
  token?: TokenErc20 | null
  chainId: SupportedChainId
}): ReactNode {
  if (!token) return amount.toString()

  const value = new BigNumber(amount.toString())
  const fullAmount = formattedAmount(token, value)

  return (
    <TextWithTooltip textInTooltip={`${fullAmount} ${safeTokenName(token)}`}>
      {formattedAmount(token, value, FormatAmountPrecision.highPrecision)}{' '}
      <TokenDisplay showAbbreviated erc20={token} network={chainId} />
    </TextWithTooltip>
  )
}

function TwapHistoryTable({
  orders,
  chainId,
}: {
  orders: TwapOrder[] | undefined
  chainId: SupportedChainId | undefined
}): ReactNode {
  const tokenAddresses = useMemo(
    () => orders?.flatMap(({ schedule }) => [schedule.sellToken, schedule.buyToken]) ?? [],
    [orders],
  )
  const { value: tokens } = useMultipleErc20({ addresses: tokenAddresses, networkId: chainId })

  if (!orders?.length) return <styledEl.EmptyState>No TWAP orders.</styledEl.EmptyState>

  return (
    <SimpleTable
      header={
        <tr>
          <th>
            <span>
              TWAP ID <HelpTooltip tooltip="A unique identifier for this TWAP on the selected network." />
            </span>
          </th>
          <th>Sell amount</th>
          <th>Minimum buy</th>
          <th>Progress</th>
          <th>Created</th>
          <th>Status</th>
        </tr>
      }
      body={orders.map((order) => {
        const sellToken = tokens[getAddressKey(order.schedule.sellToken)]
        const buyToken = tokens[getAddressKey(order.schedule.buyToken)]
        const intendedSellAmount = order.schedule.partSellAmount * BigInt(order.schedule.numberOfParts)
        const intendedBuyAmount = order.schedule.minPartLimit * BigInt(order.schedule.numberOfParts)
        const progress = getTwapProgress(order.executedAmounts.executedSellAmount, intendedSellAmount)

        return (
          <tr key={order.eventId}>
            <td>
              <styledEl.EventLink>
                <RowWithCopyButton
                  textToCopy={order.eventId}
                  contentsToDisplay={
                    <LinkWithPrefixNetwork to={`/twap/${order.eventId}`}>
                      <TruncatedText>{order.eventId}</TruncatedText>
                    </LinkWithPrefixNetwork>
                  }
                />
              </styledEl.EventLink>
            </td>
            <td>
              <TwapHistoryAmount amount={intendedSellAmount} token={sellToken} chainId={order.chainId} />
            </td>
            <td>
              <TwapHistoryAmount amount={intendedBuyAmount} token={buyToken} chainId={order.chainId} />
            </td>
            <td>
              <ProgressBar percentage={String(progress)} />
            </td>
            <td>
              <DateDisplay date={new Date(order.createdAt * 1000)} showIcon />
            </td>
            <td>
              <StatusLabel status={order.status} />
            </td>
          </tr>
        )
      })}
    />
  )
}
