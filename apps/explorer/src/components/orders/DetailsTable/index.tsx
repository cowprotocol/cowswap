import React from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { Icon, UI } from '@cowprotocol/ui'
import { TruncatedText } from '@cowprotocol/ui/pure/TruncatedText'

import { faFill, faGroupArrowsRotate, faHistory, faProjectDiagram } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import DecodeAppData from 'components/AppData/DecodeAppData'
import { DateDisplay } from 'components/common/DateDisplay'
import { DetailRow } from 'components/common/DetailRow'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { SimpleTable } from 'components/common/SimpleTable'
import { AmountsDisplay } from 'components/orders/AmountsDisplay'
import { FilledProgress } from 'components/orders/FilledProgress'
import { GasFeeDisplay } from 'components/orders/GasFeeDisplay'
import { OrderPriceDisplay } from 'components/orders/OrderPriceDisplay'
import { OrderSurplusDisplay } from 'components/orders/OrderSurplusDisplay'
import { StatusLabel } from 'components/orders/StatusLabel'
import { TAB_QUERY_PARAM_KEY } from 'explorer/const'
import { Link } from 'react-router'
import { capitalize } from 'utils'

import { Order, OrderStatus } from 'api/operator'
import { ExplorerCategory } from 'common/analytics/types'
import { getUiOrderType } from 'utils/getUiOrderType'

import { Wrapper, LinkButton, WarningRow } from './styled'

import { AddressLink } from '../../common/AddressLink'
import { OrderHooksDetails } from '../OrderHooksDetails'
import { UnsignedOrderWarning } from '../UnsignedOrderWarning'

const tooltip = {
  orderID: 'A unique identifier ID for this order.',
  from: 'The account address which signed the order.',
  to: 'The account address which will/did receive the bought amount.',
  hash: 'The onchain settlement transaction for this order. Can be viewed on Etherscan.',
  appData:
    'The AppData hash for this order. It can denote encoded metadata with info on the app, environment and more, although not all interfaces follow the same pattern. Show more will try to decode that information.',
  status: 'The order status is either Open, Filled, Expired or Canceled.',
  hooks: 'Hooks are interactions before/after order execution.',
  submission:
    'The date and time at which the order was submitted. The timezone is based on the browser locale settings.',
  expiration:
    'The date and time at which an order will expire and effectively be cancelled. Depending on the type of order, it may have partial fills upon expiration.',
  execution:
    'The date and time at which the order has been executed. The timezone is based on the browser locale settings.',
  type: (
    <div>
      CoW Protocol supports three type of orders – market, limit and liquidity:
      <ul>
        <li>
          <strong>Market order</strong>: Buy or sell at the current market&apos;s best available price
        </li>
        <li>
          <strong>Limit order</strong>: Buy or sell at an arbitrary price specified by the user
        </li>
        <li>
          <strong>Liquidity order</strong>: A special order type that market makers use to provide liquidity
        </li>
      </ul>
      In addition, orders can either allow or not allow partial execution:
      <ul>
        <li>
          <strong>Fill or kill</strong>: Either the order is fully filled, or not filled at all. Currently all market
          orders and limit orders are fill or kill.
        </li>
        <li>
          <strong>Partial execution</strong>: The order can be executed partially, as long as the limit price is
          respected. (This could be relevant if a price were to become available for some but not all of an order.)
        </li>
      </ul>
    </div>
  ),
  amount: 'The total sell and buy amount for this order. Sell amount includes the fee.',
  priceLimit:
    'The limit price is the price at which this order shall be (partially) filled, in combination with the specified slippage. The fee is already deducted from the sell amount.',
  priceExecution:
    'The actual price at which this order has been matched and executed, after deducting fees from the amount sold.',
  surplus:
    'The (averaged) surplus for this order. This is the positive difference between the initial limit price and the actual (average) execution price.',
  filled:
    'Indicates what percentage amount this order has been filled and the amount sold/bought. Amount sold includes the fee.',
  fees: 'The amount of fees paid for this order. This will show a progressive number for orders with partial fills. Might take a few minutes to show the final value.',
}

export type RenderMode = 'FULL' | 'SUMMARY'

export type Props = {
  chainId: SupportedChainId
  order: Order
  showFillsButton: boolean | undefined
  areTradesLoading: boolean
  viewFills: Command
  isPriceInverted: boolean
  invertPrice: Command
  renderMode?: RenderMode
}

export function DetailsTable(props: Props): React.ReactNode | null {
  const {
    chainId,
    order,
    areTradesLoading,
    showFillsButton,
    viewFills,
    isPriceInverted,
    invertPrice,
    renderMode = 'FULL',
  } = props
  const cowAnalytics = useCowAnalytics()
  const {
    uid,
    owner,
    receiver,
    txHash,
    kind,
    partiallyFillable,
    creationDate,
    expirationDate,
    executionDate,
    buyAmount,
    sellAmount,
    executedBuyAmount,
    executedSellAmount,
    status,
    partiallyFilled,
    filledAmount,
    surplusAmount,
    buyToken,
    sellToken,
    appData,
    fullAppData,
  } = order

  if (!buyToken || !sellToken) {
    return null
  }

  const onCopy = (label: string): void => {
    cowAnalytics.sendEvent({
      category: ExplorerCategory.ORDER_DETAILS,
      action: 'Copy',
      label,
    })
  }
  const isSigning = status === OrderStatus.Signing
  const isSummaryMode = renderMode === 'SUMMARY'

  return (
    <SimpleTable
      columnViewMobile
      body={
        <>
          {isSigning && (
            <WarningRow>
              <td colSpan={2}>
                <UnsignedOrderWarning />
              </td>
            </WarningRow>
          )}
          <DetailRow label="Order Id" tooltipText={tooltip.orderID}>
            <RowWithCopyButton
              textToCopy={uid}
              contentsToDisplay={<TruncatedText>{uid}</TruncatedText>}
              onCopy={(): void => onCopy('orderId')}
            />
          </DetailRow>
          <DetailRow label="From" tooltipText={tooltip.from}>
            <Wrapper>
              {isSigning && (
                <>
                  <Icon image="ALERT" color={UI.COLOR_ALERT_TEXT} />
                  &nbsp;
                </>
              )}
              <RowWithCopyButton
                textToCopy={owner}
                onCopy={(): void => onCopy('ownerAddress')}
                contentsToDisplay={
                  <span>
                    <AddressLink address={owner} chainId={chainId} />
                  </span>
                }
              />
              <LinkButton to={`/address/${owner}`}>
                <FontAwesomeIcon icon={faHistory} />
                Order history
              </LinkButton>
            </Wrapper>
          </DetailRow>
          <DetailRow label="To" tooltipText={tooltip.to}>
            <Wrapper>
              <RowWithCopyButton
                textToCopy={receiver}
                onCopy={(): void => onCopy('receiverAddress')}
                contentsToDisplay={
                  <span>
                    <AddressLink address={receiver} chainId={chainId} />
                  </span>
                }
              />
              <LinkButton to={`/address/${receiver}`}>
                <FontAwesomeIcon icon={faHistory} />
                Order history
              </LinkButton>
            </Wrapper>
          </DetailRow>
          {(!partiallyFillable || txHash) && (
            <DetailRow label="Transaction hash" tooltipText={tooltip.hash} isLoading={areTradesLoading}>
              {txHash ? (
                <Wrapper>
                  <RowWithCopyButton
                    textToCopy={txHash}
                    onCopy={(): void => onCopy('settlementTx')}
                    contentsToDisplay={
                      <Link to={getExplorerLink(chainId, txHash, ExplorerDataType.TRANSACTION)} target="_blank">
                        {txHash}↗
                      </Link>
                    }
                  />
                  <Wrapper>
                    <LinkButton to={`/tx/${txHash}`}>
                      <FontAwesomeIcon icon={faGroupArrowsRotate} />
                      Batch
                    </LinkButton>
                    <LinkButton to={`/tx/${txHash}/?${TAB_QUERY_PARAM_KEY}=graph`}>
                      <FontAwesomeIcon icon={faProjectDiagram} />
                      Graph
                    </LinkButton>
                  </Wrapper>
                </Wrapper>
              ) : null}
            </DetailRow>
          )}
          <DetailRow label="Status" tooltipText={tooltip.status}>
            <StatusLabel status={status} partiallyFilled={partiallyFilled} partialTagPosition="right" />
          </DetailRow>
          <DetailRow label="Submission Time" tooltipText={tooltip.submission}>
            <DateDisplay date={creationDate} showIcon={true} />
          </DetailRow>
          {executionDate && !showFillsButton && (
            <DetailRow label="Execution Time" tooltipText={tooltip.execution}>
              <DateDisplay date={executionDate} showIcon={true} />
            </DetailRow>
          )}
          {!isSummaryMode && (
            <DetailRow label="Expiration Time" tooltipText={tooltip.expiration}>
              <DateDisplay date={expirationDate} showIcon={true} />
            </DetailRow>
          )}
          <DetailRow label="Type" tooltipText={tooltip.type}>
            <>
              {capitalize(kind)} {getUiOrderType(order).toLowerCase()} order{' '}
              {partiallyFillable ? '(Partially fillable)' : '(Fill or Kill)'}
            </>
          </DetailRow>
          <DetailRow label="Amount" tooltipText={tooltip.amount}>
            <AmountsDisplay order={order} />
          </DetailRow>
          {!isSummaryMode && (
            <DetailRow label="Limit Price" tooltipText={tooltip.priceLimit}>
              <OrderPriceDisplay
                buyAmount={buyAmount}
                buyToken={buyToken}
                sellAmount={sellAmount}
                sellToken={sellToken}
                showInvertButton
                isPriceInverted={isPriceInverted}
                invertPrice={invertPrice}
              />
            </DetailRow>
          )}
          {!isSummaryMode && (
            <>
              <DetailRow label="Execution price" tooltipText={tooltip.priceExecution}>
                {!filledAmount.isZero() ? (
                  <OrderPriceDisplay
                    buyAmount={executedBuyAmount}
                    buyToken={buyToken}
                    sellAmount={executedSellAmount}
                    sellToken={sellToken}
                    showInvertButton
                    isPriceInverted={isPriceInverted}
                    invertPrice={invertPrice}
                  />
                ) : (
                  '-'
                )}
              </DetailRow>
              <DetailRow label="Filled" tooltipText={tooltip.filled}>
                <Wrapper>
                  <FilledProgress order={order} />
                  {showFillsButton && (
                    <LinkButton onClickOptional={viewFills} to={`/orders/${uid}/?${TAB_QUERY_PARAM_KEY}=fills`}>
                      <FontAwesomeIcon icon={faFill} />
                      View fills
                    </LinkButton>
                  )}
                </Wrapper>
              </DetailRow>
              <DetailRow label="Order surplus" tooltipText={tooltip.surplus}>
                {!surplusAmount.isZero() ? <OrderSurplusDisplay order={order} /> : '-'}
              </DetailRow>
            </>
          )}
          <DetailRow label="Costs & Fees" tooltipText={tooltip.fees}>
            <GasFeeDisplay order={order} />
          </DetailRow>
          {!isSummaryMode && (
            <OrderHooksDetails appData={appData} fullAppData={fullAppData ?? undefined}>
              {(content) => (
                <DetailRow label="Hooks" tooltipText={tooltip.hooks}>
                  {content}
                </DetailRow>
              )}
            </OrderHooksDetails>
          )}
          {!isSummaryMode && (
            <DetailRow label="AppData" tooltipText={tooltip.appData}>
              <DecodeAppData appData={appData} fullAppData={fullAppData ?? undefined} />
            </DetailRow>
          )}
        </>
      }
    />
  )
}
