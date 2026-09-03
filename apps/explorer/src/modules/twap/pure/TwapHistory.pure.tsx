import { useMemo } from 'react'
import type { ReactNode } from 'react'

import { getAddressKey, type AddressKey, type SupportedChainId } from '@cowprotocol/cow-sdk'
import type { TwapOrder } from '@cowprotocol/sdk-composable'
import { TruncatedText } from '@cowprotocol/ui'

import { DateDisplay } from 'components/common/DateDisplay'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { LoadingWrapper } from 'components/common/LoadingWrapper'
import { SimpleTable } from 'components/common/SimpleTable'
import { Notification } from 'components/Notification'
import TablePagination from 'explorer/components/common/TablePagination'
import { useTable } from 'explorer/components/OrdersTableWidget/useTable'
import { useMultipleErc20 } from 'hooks/useErc20'

import * as styledEl from './TwapHistory.styled'
import { TwapStatus } from './TwapStatus.pure'
import { TwapTokenPair } from './TwapTokenPair.pure'

import { useCurrentUnixTime } from '../hooks/useCurrentUnixTime'
import { useTwapOrders } from '../hooks/useTwapOrders'
import { TWAP_PAGE_SIZE } from '../twap.constants'
import { TwapPaginationContext } from '../TwapPaginationContext'

interface TwapHistoryProps {
  owner: AddressKey
  chainId: SupportedChainId
}

export function TwapHistory({ owner, chainId }: TwapHistoryProps): ReactNode {
  const now = useCurrentUnixTime()
  const { state, setPageSize, handleNextPage, handlePreviousPage } = useTable({
    initialState: { pageOffset: 0, pageSize: TWAP_PAGE_SIZE },
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

  if (isLoading && !orders) return <LoadingWrapper message="Loading TWAP orders" />

  return (
    <>
      {error && <Notification type="error" message="Failed to fetch TWAP orders" />}
      {pagination}
      <TwapHistoryTable orders={orders} chainId={chainId} now={now} />
      {pagination}
    </>
  )
}

function TwapHistoryTable({
  orders,
  chainId,
  now,
}: {
  orders: TwapOrder[] | undefined
  chainId: SupportedChainId
  now: number
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
          <th>TWAP event</th>
          <th>Pair</th>
          <th>Created</th>
          <th>Status</th>
        </tr>
      }
      body={orders.map((order) => {
        const sellToken = tokens[getAddressKey(order.schedule.sellToken)]
        const buyToken = tokens[getAddressKey(order.schedule.buyToken)]

        return (
          <tr key={order.eventId}>
            <td>
              <styledEl.EventLink>
                <LinkWithPrefixNetwork to={`/twap/${order.eventId}`}>
                  <TruncatedText>{order.eventId}</TruncatedText>
                </LinkWithPrefixNetwork>
              </styledEl.EventLink>
            </td>
            <td>
              <TwapTokenPair
                sellTokenAddress={order.schedule.sellToken}
                buyTokenAddress={order.schedule.buyToken}
                sellToken={sellToken}
                buyToken={buyToken}
                chainId={chainId}
              />
            </td>
            <td>
              <DateDisplay date={new Date(order.createdAt * 1000)} showIcon />
            </td>
            <td>
              <TwapStatus order={order} now={now} />
            </td>
          </tr>
        )
      })}
    />
  )
}
