import { useMemo, type ReactNode } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { shortenAddress } from '@cowprotocol/common-utils'
import { areAddressesEqual, getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import type { TwapOrder, TwapPartOrder, TwapPartOrderStatus } from '@cowprotocol/sdk-composable'
import { NetworkLogo, TruncatedText } from '@cowprotocol/ui'

import BigNumber from 'bignumber.js'
import { BlockExplorerLink } from 'components/common/BlockExplorerLink'
import { DateDisplay } from 'components/common/DateDisplay'
import { DetailRow } from 'components/common/DetailRow'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { LoadingWrapper } from 'components/common/LoadingWrapper'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { SimpleTable } from 'components/common/SimpleTable'
import { TokenDisplay } from 'components/common/TokenDisplay'
import { Notification } from 'components/Notification'
import { StatusLabel, type StatusLabelProps } from 'components/orders/StatusLabel'
import TablePagination from 'explorer/components/common/TablePagination'
import { useTable } from 'explorer/components/OrdersTableWidget/useTable'
import { APP_TITLE } from 'explorer/const'
import { FlexContainerVar, StyledSearch, Wrapper } from 'explorer/pages/styled'
import { useMultipleErc20 } from 'hooks/useErc20'
import { Helmet } from 'react-helmet'
import { Navigate, useLocation, useParams } from 'react-router'
import { useNetworkId } from 'state/network'
import { abbreviateString, FormatAmountPrecision, formattedAmount, isTwapEventId, isTwapSupportedChain } from 'utils'

import { OrderStatus } from 'api/operator'

import * as styledEl from './TwapDetails.styled'
import { TwapStatus } from './TwapStatus.pure'
import { TwapTokenPair } from './TwapTokenPair.pure'

import { useCurrentUnixTime } from '../hooks/useCurrentUnixTime'
import { useTwapOrder } from '../hooks/useTwapOrder'
import { useTwapPartOrders } from '../hooks/useTwapPartOrders'
import { TWAP_PAGE_SIZE } from '../twap.constants'
import { TwapPaginationContext } from '../TwapPaginationContext'

import type { TokenErc20 } from '@gnosis.pm/dex-js'

const GLOBAL_SEARCH_STATE_KEY = 'twapGlobalSearch'

export function TwapDetailsPage(): ReactNode {
  const { eventId = '' } = useParams<{ eventId: string }>()
  const chainId = useNetworkId()
  const location = useLocation()
  const { isTwapEoaEnabled } = useFeatureFlags()
  const enabled = isTwapEoaEnabled === true && isTwapSupportedChain(chainId) && isTwapEventId(eventId)
  const searchAllChains = getGlobalSearchState(location.state)
  const { data, error, isLoading } = useTwapOrder({
    eventId,
    chainId: isTwapSupportedChain(chainId) ? chainId : SupportedChainId.MAINNET,
    enabled,
    searchAllChains,
  })

  if (!enabled) return <Navigate replace to="/404" />

  if (data && data.chainId !== chainId) {
    const prefix = CHAIN_INFO[data.chainId].urlAlias
    return <Navigate replace to={`${prefix ? `/${prefix}` : ''}/twap/${eventId}`} />
  }

  return (
    <Wrapper>
      <Helmet>
        <title>TWAP Details - {APP_TITLE}</title>
      </Helmet>
      <StyledSearch />
      {isLoading && !data ? <LoadingWrapper message="Loading TWAP order" /> : null}
      {error ? <Notification type="error" message="Failed to fetch the TWAP order" /> : null}
      {!isLoading && !error && !data ? <Navigate replace to={`/search/${eventId}`} /> : null}
      {data ? <TwapDetails order={data.order} chainId={data.chainId} /> : null}
    </Wrapper>
  )
}

function addressLink(address: string, chainId: SupportedChainId): ReactNode {
  const addressKey = getAddressKey(address)
  return (
    <BlockExplorerLink
      type="address"
      identifier={addressKey}
      networkId={chainId}
      label={`${shortenAddress(addressKey)}↗`}
    />
  )
}

function formatSeconds(seconds: number): string {
  if (seconds % 86_400 === 0) return `${seconds / 86_400}d`
  if (seconds % 3_600 === 0) return `${seconds / 3_600}h`
  if (seconds % 60 === 0) return `${seconds / 60}m`
  return `${seconds}s`
}

function formatTokenAmount(amount: bigint, token: TokenErc20 | null | undefined, chainId: SupportedChainId): ReactNode {
  if (!token) return amount.toString()

  return (
    <styledEl.TokenAmount>
      {formattedAmount(token, new BigNumber(amount.toString()), FormatAmountPrecision.highPrecision)}{' '}
      <TokenDisplay erc20={token} network={chainId} showAbbreviated />
    </styledEl.TokenAmount>
  )
}

function getGlobalSearchState(state: unknown): boolean {
  if (!state || typeof state !== 'object') return false
  return (state as Record<string, unknown>)[GLOBAL_SEARCH_STATE_KEY] === true
}

function getProgress(executedSellAmount: bigint, intendedSellAmount: bigint): number {
  if (intendedSellAmount === 0n) return 0
  const basisPoints = (executedSellAmount * 10_000n) / intendedSellAmount
  return Math.min(Number(basisPoints), 10_000) / 100
}

function PartStatus({ status }: { status: TwapPartOrderStatus }): ReactNode {
  const mappedStatus: Record<TwapPartOrderStatus, StatusLabelProps['status']> = {
    open: OrderStatus.Open,
    fulfilled: OrderStatus.Filled,
    expired: OrderStatus.Expired,
    cancelled: OrderStatus.Cancelled,
    unfilled: OrderStatus.Expired,
    unconfirmed: 'unconfirmed',
  }

  const labels: Partial<Record<TwapPartOrderStatus, string>> = {
    unfilled: 'UNFILLED',
    unconfirmed: 'SCHEDULED',
  }

  return <StatusLabel status={mappedStatus[status]} customText={labels[status]} />
}

function TwapDetails({ order, chainId }: { order: TwapOrder; chainId: SupportedChainId }): ReactNode {
  const now = useCurrentUnixTime()
  const { schedule, executedAmounts } = order
  const tokenAddresses = useMemo(() => [schedule.sellToken, schedule.buyToken], [schedule.buyToken, schedule.sellToken])
  const { value: tokens } = useMultipleErc20({ addresses: tokenAddresses, networkId: chainId })
  const sellToken = tokens[getAddressKey(schedule.sellToken)]
  const buyToken = tokens[getAddressKey(schedule.buyToken)]
  const intendedSellAmount = schedule.partSellAmount * BigInt(schedule.numberOfParts)
  const intendedBuyAmount = schedule.minPartLimit * BigInt(schedule.numberOfParts)
  const endTime = schedule.effectiveStartTime + schedule.timeBetweenParts * schedule.numberOfParts
  const progress = getProgress(executedAmounts.executedSellAmount, intendedSellAmount)

  return (
    <>
      <FlexContainerVar>
        <h1>TWAP details</h1>
        <NetworkLogo chainId={chainId} size={16} />
        <styledEl.TitleUid textToCopy={order.eventId} contentsToDisplay={abbreviateString(order.eventId, 12, 6)} />
      </FlexContainerVar>

      <styledEl.DetailsTabs
        tabItems={[
          {
            id: 1,
            tab: 'Overview',
            content: (
              <styledEl.DetailsTable
                columnViewMobile
                body={
                  <>
                    <DetailRow label="Status">
                      <TwapStatus order={order} now={now} />
                    </DetailRow>
                    <DetailRow label="Pair">
                      <TwapTokenPair
                        sellTokenAddress={schedule.sellToken}
                        buyTokenAddress={schedule.buyToken}
                        sellToken={sellToken}
                        buyToken={buyToken}
                        chainId={chainId}
                      />
                    </DetailRow>
                    <DetailRow label="Created">
                      <DateDisplay date={new Date(order.createdAt * 1000)} showIcon />
                    </DetailRow>
                    <DetailRow label="Schedule">
                      <span>
                        <DateDisplay date={new Date(schedule.effectiveStartTime * 1000)} /> to{' '}
                        <DateDisplay date={new Date(endTime * 1000)} />
                      </span>
                    </DetailRow>
                    <DetailRow label="Parts">
                      {schedule.numberOfParts} parts, every {formatSeconds(schedule.timeBetweenParts)}
                    </DetailRow>
                    <DetailRow label="Part validity">
                      {schedule.durationOfPart === 0 ? 'Full interval' : formatSeconds(schedule.durationOfPart)}
                    </DetailRow>
                    <DetailRow label="Intended sell">
                      {formatTokenAmount(intendedSellAmount, sellToken, chainId)}
                    </DetailRow>
                    <DetailRow label="Minimum intended buy">
                      {formatTokenAmount(intendedBuyAmount, buyToken, chainId)}
                    </DetailRow>
                    <DetailRow label="Executed sell">
                      {formatTokenAmount(executedAmounts.executedSellAmount, sellToken, chainId)}
                    </DetailRow>
                    <DetailRow label="Executed buy">
                      {formatTokenAmount(executedAmounts.executedBuyAmount, buyToken, chainId)}
                    </DetailRow>
                    <DetailRow label="Execution fee">
                      {formatTokenAmount(executedAmounts.executedFeeAmount, sellToken, chainId)}
                    </DetailRow>
                    <DetailRow label="Progress">{progress}%</DetailRow>
                    <TwapIdentityRows order={order} chainId={chainId} />
                  </>
                }
              />
            ),
          },
          {
            id: 2,
            tab: `Part orders (${order.partOrdersCount})`,
            content: <TwapParts eventId={order.eventId} chainId={chainId} sellToken={sellToken} buyToken={buyToken} />,
          },
        ]}
      />
    </>
  )
}

function TwapIdentityRows({ order, chainId }: { order: TwapOrder; chainId: SupportedChainId }): ReactNode {
  return (
    <>
      <DetailRow label="Owner">{addressLink(order.resolvedOwner, chainId)}</DetailRow>
      <DetailRow label="Proxy or Safe">
        {areAddressesEqual(order.owner, order.resolvedOwner) ? 'Not applicable' : addressLink(order.owner, chainId)}
      </DetailRow>
      <DetailRow label="Receiver">{addressLink(order.schedule.receiver, chainId)}</DetailRow>
      <DetailRow label="Event ID">
        <RowWithCopyButton textToCopy={order.eventId} contentsToDisplay={abbreviateString(order.eventId, 12, 6)} />
      </DetailRow>
      <DetailRow label="Order hash">
        <RowWithCopyButton textToCopy={order.hash} contentsToDisplay={order.hash} />
      </DetailRow>
      <DetailRow label="Creation transaction">
        {order.creationTxHash ? (
          <BlockExplorerLink
            type="transaction"
            identifier={order.creationTxHash}
            networkId={chainId}
            label={`${abbreviateString(order.creationTxHash, 6, 4)}↗`}
          />
        ) : (
          'Not available'
        )}
      </DetailRow>
      <DetailRow label="App data">
        <RowWithCopyButton textToCopy={order.schedule.appData} contentsToDisplay={order.schedule.appData} />
      </DetailRow>
    </>
  )
}

function TwapParts({
  eventId,
  chainId,
  sellToken,
  buyToken,
}: {
  eventId: string
  chainId: SupportedChainId
  sellToken?: TokenErc20 | null
  buyToken?: TokenErc20 | null
}): ReactNode {
  const { state, setPageSize, handleNextPage, handlePreviousPage } = useTable({
    initialState: { pageOffset: 0, pageSize: TWAP_PAGE_SIZE },
  })
  const { data, error, isLoading } = useTwapPartOrders({
    eventId,
    chainId,
    limit: state.pageSize,
    offset: state.pageOffset,
    enabled: true,
  })
  const parts = data?.items
  const tableState = {
    ...state,
    hasNextPage: data ? state.pageOffset + state.pageSize < data.totalCount : false,
    totalResults: data?.totalCount,
  }
  const pagination = (
    <TwapPaginationContext.Provider
      value={{ data: parts, isLoading, tableState, setPageSize, handleNextPage, handlePreviousPage }}
    >
      <TablePagination context={TwapPaginationContext} />
    </TwapPaginationContext.Provider>
  )

  if (isLoading && !parts) return <LoadingWrapper message="Loading part orders" />

  return (
    <>
      {error ? <Notification type="error" message="Failed to fetch TWAP part orders" /> : null}
      {pagination}
      <TwapPartsTable parts={parts} chainId={chainId} sellToken={sellToken} buyToken={buyToken} />
      {pagination}
    </>
  )
}

function TwapPartsTable({
  parts,
  chainId,
  sellToken,
  buyToken,
}: {
  parts: TwapPartOrder[] | undefined
  chainId: SupportedChainId
  sellToken?: TokenErc20 | null
  buyToken?: TokenErc20 | null
}): ReactNode {
  if (!parts?.length) return <styledEl.EmptyParts>No part orders.</styledEl.EmptyParts>

  return (
    <SimpleTable
      header={
        <tr>
          <th>Order UID</th>
          <th>Sell amount</th>
          <th>Buy amount</th>
          <th>Created</th>
          <th>Status</th>
        </tr>
      }
      body={parts.map((part) => (
        <tr key={part.orderUid}>
          <td>
            <LinkWithPrefixNetwork to={`/orders/${part.orderUid}`}>
              <TruncatedText>{abbreviateString(part.orderUid, 12, 6)}</TruncatedText>
            </LinkWithPrefixNetwork>
          </td>
          <td>{formatTokenAmount(part.sellAmount, sellToken, chainId)}</td>
          <td>{formatTokenAmount(part.buyAmount, buyToken, chainId)}</td>
          <td>
            <DateDisplay date={new Date(part.createdAt * 1000)} showIcon />
          </td>
          <td>
            <PartStatus status={part.status} />
          </td>
        </tr>
      ))}
    />
  )
}
