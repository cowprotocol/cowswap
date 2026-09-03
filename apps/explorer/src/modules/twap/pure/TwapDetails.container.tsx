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
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { LoadingWrapper } from 'components/common/LoadingWrapper'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { SimpleTable } from 'components/common/SimpleTable'
import { TokenDisplay } from 'components/common/TokenDisplay'
import { Notification } from 'components/Notification'
import { StatusLabel } from 'components/orders/StatusLabel'
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
  const mappedStatus: Record<TwapPartOrderStatus, OrderStatus> = {
    open: OrderStatus.Open,
    fulfilled: OrderStatus.Filled,
    expired: OrderStatus.Expired,
    cancelled: OrderStatus.Cancelled,
    unfilled: OrderStatus.Expired,
  }

  return <StatusLabel status={mappedStatus[status]} customText={status === 'unfilled' ? 'UNFILLED' : undefined} />
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
        <RowWithCopyButton
          textToCopy={order.eventId}
          contentsToDisplay={<TruncatedText>{order.eventId}</TruncatedText>}
        />
      </FlexContainerVar>

      <styledEl.DetailsCard>
        <styledEl.DetailsGrid>
          <dt>Status</dt>
          <dd>
            <TwapStatus order={order} now={now} />
          </dd>
          <dt>Pair</dt>
          <dd>
            <TwapTokenPair
              sellTokenAddress={schedule.sellToken}
              buyTokenAddress={schedule.buyToken}
              sellToken={sellToken}
              buyToken={buyToken}
              chainId={chainId}
            />
          </dd>
          <dt>Created</dt>
          <dd>
            <DateDisplay date={new Date(order.createdAt * 1000)} showIcon />
          </dd>
          <dt>Schedule</dt>
          <dd>
            <DateDisplay date={new Date(schedule.effectiveStartTime * 1000)} /> to{' '}
            <DateDisplay date={new Date(endTime * 1000)} />
          </dd>
          <dt>Parts</dt>
          <dd>
            {schedule.numberOfParts} parts, every {formatSeconds(schedule.timeBetweenParts)}
          </dd>
          <dt>Part validity</dt>
          <dd>{schedule.durationOfPart === 0 ? 'Full interval' : formatSeconds(schedule.durationOfPart)}</dd>
          <dt>Intended sell</dt>
          <dd>{formatTokenAmount(intendedSellAmount, sellToken, chainId)}</dd>
          <dt>Minimum intended buy</dt>
          <dd>{formatTokenAmount(intendedBuyAmount, buyToken, chainId)}</dd>
          <dt>Executed sell</dt>
          <dd>{formatTokenAmount(executedAmounts.executedSellAmount, sellToken, chainId)}</dd>
          <dt>Executed buy</dt>
          <dd>{formatTokenAmount(executedAmounts.executedBuyAmount, buyToken, chainId)}</dd>
          <dt>Execution fee</dt>
          <dd>{formatTokenAmount(executedAmounts.executedFeeAmount, sellToken, chainId)}</dd>
          <dt>Progress</dt>
          <dd>{progress}%</dd>
          <dt>Owner</dt>
          <dd>{addressLink(order.resolvedOwner, chainId)}</dd>
          <dt>Proxy or Safe</dt>
          <dd>
            {areAddressesEqual(order.owner, order.resolvedOwner) ? 'Not applicable' : addressLink(order.owner, chainId)}
          </dd>
          <dt>Receiver</dt>
          <dd>{addressLink(schedule.receiver, chainId)}</dd>
          <dt>Event ID</dt>
          <dd>
            <RowWithCopyButton textToCopy={order.eventId} contentsToDisplay={order.eventId} />
          </dd>
          <dt>Order hash</dt>
          <dd>
            <RowWithCopyButton textToCopy={order.hash} contentsToDisplay={order.hash} />
          </dd>
          <dt>Creation transaction</dt>
          <dd>
            <BlockExplorerLink
              type="transaction"
              identifier={order.creationTxHash}
              networkId={chainId}
              label={`${abbreviateString(order.creationTxHash, 6, 4)}↗`}
            />
          </dd>
          <dt>App data</dt>
          <dd>
            <RowWithCopyButton textToCopy={schedule.appData} contentsToDisplay={schedule.appData} />
          </dd>
        </styledEl.DetailsGrid>
      </styledEl.DetailsCard>

      <styledEl.SectionTitle>Part orders</styledEl.SectionTitle>
      <TwapParts eventId={order.eventId} chainId={chainId} sellToken={sellToken} buyToken={buyToken} />
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
              <TruncatedText>{part.orderUid}</TruncatedText>
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
