import { useMemo, useState, type ReactNode } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isTwapEventId } from '@cowprotocol/common-utils'
import { areAddressesEqual, getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import type { TwapOrder } from '@cowprotocol/sdk-composable'
import { NetworkLogo } from '@cowprotocol/ui'

import BigNumber from 'bignumber.js'
import { AddressLink } from 'components/common/AddressLink'
import { BlockExplorerLink } from 'components/common/BlockExplorerLink'
import { DateDisplay } from 'components/common/DateDisplay'
import { DetailRow } from 'components/common/DetailRow'
import { LoadingWrapper } from 'components/common/LoadingWrapper'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { TokenDisplay } from 'components/common/TokenDisplay'
import { Notification } from 'components/Notification'
import { AmountRow } from 'components/orders/AmountsDisplay/AmountRow'
import { Wrapper as AmountsWrapper } from 'components/orders/AmountsDisplay/styled'
import { AppDataItem } from 'components/orders/DetailsTable/items/AppDataItem'
import { FromItem } from 'components/orders/DetailsTable/items/FromItem'
import { SubmissionTimeItem } from 'components/orders/DetailsTable/items/SubmissionTimeItem'
import { ToItem } from 'components/orders/DetailsTable/items/ToItem'
import { FilledProgressSummary } from 'components/orders/FilledProgress/FilledProgressSummary'
import OrdersUserDetailsTable from 'components/orders/OrdersUserDetailsTable'
import { StatusLabel } from 'components/orders/StatusLabel'
import RedirectToSearch from 'components/RedirectToSearch'
import TablePagination from 'explorer/components/common/TablePagination'
import { useTable } from 'explorer/components/OrdersTableWidget/useTable'
import { APP_TITLE, ORDERS_PAGE_SIZE } from 'explorer/const'
import { FlexContainerVar, StyledSearch, Wrapper } from 'explorer/pages/styled'
import { useMultipleErc20 } from 'hooks/useErc20'
import { Helmet } from 'react-helmet'
import { Navigate, useLocation, useParams } from 'react-router'
import { useNetworkId } from 'state/network'
import { abbreviateString, FormatAmountPrecision, formattedAmount, safeTokenName } from 'utils'

import * as styledEl from './TwapDetails.styled'

import { getTwapProgress } from '../getTwapProgress'
import { useTwapOrder } from '../hooks/useTwapOrder'
import { useTwapPartOrders } from '../hooks/useTwapPartOrders'
import { toTwapPartTableRow } from '../toTwapPartTableRow'
import { TwapPaginationContext } from '../TwapPaginationContext'

import type { TokenErc20 } from '@gnosis.pm/dex-js'

const GLOBAL_SEARCH_STATE_KEY = 'twapGlobalSearch'

export function TwapDetailsPage(): ReactNode {
  const { eventId = '' } = useParams<{ eventId: string }>()
  const chainId = useNetworkId()
  const location = useLocation()
  const { isTwapEoaEnabled } = useFeatureFlags()
  const enabled = isTwapEoaEnabled && isTwapEventId(eventId)
  const searchAllChains = getGlobalSearchState(location.state)
  const { data, error, isLoading } = useTwapOrder({
    eventId,
    chainId,
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
      {data === undefined && !error ? <LoadingWrapper message="Loading TWAP order" /> : null}
      {error ? <Notification type="error" message="Failed to fetch the TWAP order" /> : null}
      {!isLoading && !error && data === null ? <RedirectToSearch from="twap" /> : null}
      {data ? <TwapDetails order={data.order} chainId={data.chainId} /> : null}
    </Wrapper>
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

// eslint-disable-next-line max-lines-per-function
function TwapDetails({ order, chainId }: { order: TwapOrder; chainId: SupportedChainId }): ReactNode {
  const { schedule, executedAmounts } = order
  const tokenAddresses = useMemo(() => [schedule.sellToken, schedule.buyToken], [schedule.buyToken, schedule.sellToken])
  const { value: tokens } = useMultipleErc20({ addresses: tokenAddresses, networkId: chainId })
  const sellToken = tokens[getAddressKey(schedule.sellToken)]
  const buyToken = tokens[getAddressKey(schedule.buyToken)]
  const intendedSellAmount = schedule.partSellAmount * BigInt(schedule.numberOfParts)
  const intendedBuyAmount = schedule.minPartLimit * BigInt(schedule.numberOfParts)
  const endTime = schedule.effectiveStartTime + schedule.timeBetweenParts * schedule.numberOfParts
  const progress = getTwapProgress(executedAmounts.executedSellAmount, intendedSellAmount)

  const renderAmounts = (sellAmount: bigint, buyAmount: bigint): ReactNode =>
    sellToken && buyToken ? (
      <AmountsWrapper>
        <AmountRow
          title="From"
          amount={new BigNumber(sellAmount.toString())}
          erc20={sellToken}
          network={chainId}
          isBridging={false}
        />
        <AmountRow
          title="To"
          titleSuffix="at least"
          amount={new BigNumber(buyAmount.toString())}
          erc20={buyToken}
          network={chainId}
          isBridging={false}
        />
      </AmountsWrapper>
    ) : (
      <span>
        From {formatTokenAmount(sellAmount, sellToken, chainId)} to at least{' '}
        {formatTokenAmount(buyAmount, buyToken, chainId)}
      </span>
    )

  return (
    <>
      <FlexContainerVar>
        <h1>TWAP details</h1>
        <NetworkLogo chainId={chainId} size={16} />
        <styledEl.TitleUid textToCopy={order.eventId} contentsToDisplay={abbreviateString(order.eventId, 12, 6)} />
      </FlexContainerVar>

      <TwapPartsTabs
        order={order}
        chainId={chainId}
        sellToken={sellToken}
        buyToken={buyToken}
        overview={
          <styledEl.DetailsTable
            columnViewMobile
            body={
              <>
                <TwapIdentityRows order={order} chainId={chainId} />
                <DetailRow
                  label="Status"
                  tooltipText="The current state of this TWAP, based on its schedule, cancellation state, and executed amounts."
                >
                  <StatusLabel status={order.status} />
                </DetailRow>
                <SubmissionTimeItem creationDate={new Date(order.createdAt * 1000)} showIcon />
                <DetailRow
                  label="Start Time"
                  tooltipText="The scheduled start of this TWAP. A zero start value uses the creation time. Times use your browser timezone."
                >
                  <DateDisplay date={new Date(schedule.effectiveStartTime * 1000)} showIcon />
                </DetailRow>
                <DetailRow
                  label="End Time"
                  tooltipText="The end of the final scheduled interval. This time does not guarantee that all parts execute. Times use your browser timezone."
                >
                  <DateDisplay date={new Date(endTime * 1000)} showIcon />
                </DetailRow>
                <DetailRow label="No. of parts" tooltipText="The total number of scheduled part orders in this TWAP.">
                  {schedule.numberOfParts}
                </DetailRow>
                <DetailRow
                  label="Part duration"
                  tooltipText="The time between the scheduled start of one part and the next."
                >
                  {formatSeconds(schedule.timeBetweenParts)}
                </DetailRow>
                {schedule.durationOfPart !== 0 && schedule.durationOfPart !== schedule.timeBetweenParts && (
                  <DetailRow
                    label="Execution window"
                    tooltipText="The time available to execute each part order after its scheduled start. This differs from the interval between parts."
                  >
                    {formatSeconds(schedule.durationOfPart)}
                  </DetailRow>
                )}
                <DetailRow
                  label="Amount"
                  tooltipText="Price protection sets the minimum buy amount required for each part to execute. These totals assume all scheduled parts execute. Price protection does not guarantee execution."
                >
                  {renderAmounts(intendedSellAmount, intendedBuyAmount)}
                </DetailRow>
                <DetailRow
                  label="Amount per part"
                  tooltipText="The planned sell amount and minimum buy amount for each part. Price protection requires each part to receive at least this buy amount."
                >
                  {renderAmounts(schedule.partSellAmount, schedule.minPartLimit)}
                </DetailRow>
                <DetailRow
                  label="Filled"
                  tooltipText="The percentage of the planned sell amount that has executed, followed by the total amounts sold and bought."
                >
                  <FilledProgressSummary
                    percentage={String(progress)}
                    lineBreak={false}
                    context={{
                      filledAmountWithFee: new BigNumber(executedAmounts.executedSellAmount.toString()),
                      swappedAmountWithFee: new BigNumber(executedAmounts.executedBuyAmount.toString()),
                      mainToken: sellToken,
                      swappedToken: buyToken,
                      mainSymbol: sellToken ? safeTokenName(sellToken) : schedule.sellToken,
                      swappedSymbol: buyToken ? safeTokenName(buyToken) : schedule.buyToken,
                      action: 'sold',
                      touched: executedAmounts.executedSellAmount > 0n,
                    }}
                  />
                </DetailRow>
                <DetailRow
                  label="Costs & Fees"
                  tooltipText="The total execution fees reported for the part orders, in the sell token. This value increases as more parts execute."
                >
                  {formatTokenAmount(executedAmounts.executedFeeAmount, sellToken, chainId)}
                </DetailRow>
                <AppDataItem appData={schedule.appData} />
              </>
            }
          />
        }
      />
    </>
  )
}

function TwapIdentityRows({ order, chainId }: { order: TwapOrder; chainId: SupportedChainId }): ReactNode {
  return (
    <>
      <DetailRow
        label="TWAP ID"
        tooltipText="The identifier for this TWAP creation event on the selected network. It identifies this specific TWAP instance."
      >
        <RowWithCopyButton textToCopy={order.eventId} contentsToDisplay={order.eventId} />
      </DetailRow>
      <FromItem
        chainId={chainId}
        owner={order.resolvedOwner}
        isSigning={false}
        isBridgingOrder={false}
        onCopy={() => undefined}
      />
      <ToItem
        chainId={chainId}
        receiver={order.schedule.receiver}
        isBridgingOrder={false}
        bridgeProviderType={undefined}
        onCopy={() => undefined}
      />
      {!areAddressesEqual(order.owner, order.resolvedOwner) && (
        <DetailRow
          label="Proxy"
          tooltipText="The CoW Shed smart contract that owns the part orders on behalf of the account in From. Safe orders omit this row."
        >
          <RowWithCopyButton
            textToCopy={order.owner}
            contentsToDisplay={<AddressLink address={order.owner} chainId={chainId} showIcon showNetworkName={false} />}
          />
        </DetailRow>
      )}
      <DetailRow
        label="Creation transaction"
        tooltipText="The onchain transaction that created this TWAP. This is not a settlement transaction for an individual part order."
      >
        <BlockExplorerLink
          type="transaction"
          identifier={order.txHash}
          networkId={chainId}
          label={`${order.txHash}↗`}
        />
      </DetailRow>
    </>
  )
}

function TwapPartsTabs({
  order,
  chainId,
  sellToken,
  buyToken,
  overview,
}: {
  order: TwapOrder
  chainId: SupportedChainId
  sellToken?: TokenErc20 | null
  buyToken?: TokenErc20 | null
  overview: ReactNode
}): ReactNode {
  const [selectedTab, setSelectedTab] = useState(1)
  const { state, setPageSize, handleNextPage, handlePreviousPage } = useTable({
    initialState: { pageOffset: 0, pageSize: ORDERS_PAGE_SIZE },
  })
  const { data, error, isLoading } = useTwapPartOrders({
    eventId: order.eventId,
    chainId,
    limit: state.pageSize,
    offset: state.pageOffset,
    enabled: selectedTab === 2,
  })
  const tableState = {
    ...state,
    hasNextPage: data ? state.pageOffset + state.pageSize < data.totalCount : false,
  }
  const rows = useMemo(
    () => data?.items.map((part) => toTwapPartTableRow(part, order.schedule, sellToken, buyToken)),
    [data, order.schedule, sellToken, buyToken],
  )
  const pagination = selectedTab === 2 ? <TablePagination context={TwapPaginationContext} /> : undefined

  return (
    <TwapPaginationContext.Provider
      value={{
        data: rows,
        isLoading,
        tableState,
        setPageSize,
        handleNextPage,
        handlePreviousPage,
      }}
    >
      <styledEl.DetailsTabs
        selectedTab={selectedTab}
        updateSelectedTab={setSelectedTab}
        extra={pagination}
        extraPosition="both"
        tabItems={[
          { id: 1, tab: 'Overview', content: overview },
          {
            id: 2,
            tab: `Part orders (${data?.totalCount ?? order.partOrdersCount})`,
            content: (
              <>
                {error ? <Notification type="error" message="Failed to fetch TWAP part orders" /> : null}
                {isLoading && !rows ? (
                  <LoadingWrapper message="Loading part orders" />
                ) : (
                  <OrdersUserDetailsTable
                    orders={rows}
                    dateColumnLabel="Scheduled start"
                    tableState={tableState}
                    handleNextPage={handleNextPage}
                    messageWhenEmpty="No part orders."
                  />
                )}
              </>
            ),
          },
        ]}
      />
    </TwapPaginationContext.Provider>
  )
}
