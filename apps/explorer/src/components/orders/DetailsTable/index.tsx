import React from 'react'

import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { Media } from '@cowprotocol/ui'
import { TruncatedText } from '@cowprotocol/ui/pure/TruncatedText'

import { faFill, faGroupArrowsRotate, faHistory, faProjectDiagram } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { clickOnOrderDetails } from 'analytics'
import DecodeAppData from 'components/AppData/DecodeAppData'
import { DateDisplay } from 'components/common/DateDisplay'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { SimpleTable } from 'components/common/SimpleTable'
import Spinner from 'components/common/Spinner'
import { AmountsDisplay } from 'components/orders/AmountsDisplay'
import { FilledProgress } from 'components/orders/FilledProgress'
import { GasFeeDisplay } from 'components/orders/GasFeeDisplay'
import { OrderPriceDisplay } from 'components/orders/OrderPriceDisplay'
import { OrderSurplusDisplay } from 'components/orders/OrderSurplusDisplay'
import { StatusLabel } from 'components/orders/StatusLabel'
import { HelpTooltip } from 'components/Tooltip'
import { TAB_QUERY_PARAM_KEY } from 'explorer/const'
import { Link } from 'react-router-dom'
import styled from 'styled-components/macro'
import { capitalize } from 'utils'

import { Order } from 'api/operator'
import { getUiOrderType } from 'utils/getUiOrderType'

const tooltip = {
  orderID: 'A unique identifier ID for this order.',
  from: 'The account address which signed the order.',
  to: 'The account address which will/did receive the bought amount.',
  hash: 'The onchain settlement transaction for this order. Can be viewed on Etherscan.',
  appData:
    'The AppData hash for this order. It can denote encoded metadata with info on the app, environment and more, although not all interfaces follow the same pattern. Show more will try to decode that information.',
  status: 'The order status is either Open, Filled, Expired or Canceled.',
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

export const Wrapper = styled.div`
  display: flex;
  flex-direction: row;

  ${Media.upToSmall()} {
    flex-direction: column;
  }
`

export const LinkButton = styled(LinkWithPrefixNetwork)`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-weight: ${({ theme }): string => theme.fontBold};
  font-size: 1.3rem;
  color: ${({ theme }): string => theme.orange1};
  border: 1px solid ${({ theme }): string => theme.orange1};
  background-color: ${({ theme }): string => theme.orangeOpacity};
  border-radius: 0.4rem;
  padding: 0.8rem 1.5rem;
  margin: 0 0 0 2rem;
  transition-duration: 0.2s;
  transition-timing-function: ease-in-out;

  ${Media.upToSmall()} {
    margin: 1.6rem 0 0 0;
  }

  &:hover {
    opacity: 0.8;
    color: ${({ theme }): string => theme.white};
    text-decoration: none;
  }

  svg {
    margin-right: 0.5rem;
  }
`

export type Props = {
  chainId: SupportedChainId
  order: Order
  showFillsButton: boolean | undefined
  areTradesLoading: boolean
  viewFills: Command
  isPriceInverted: boolean
  invertPrice: Command
}

export function DetailsTable(props: Props): React.ReactNode | null {
  const { chainId, order, areTradesLoading, showFillsButton, viewFills, isPriceInverted, invertPrice } = props
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

  const onCopy = (label: string): void => clickOnOrderDetails('Copy', label)

  return (
    <SimpleTable
      columnViewMobile
      body={
        <>
          <tr>
            <td>
              <span>
                <HelpTooltip tooltip={tooltip.orderID} /> Order Id
              </span>
            </td>
            <td>
              <RowWithCopyButton
                textToCopy={uid}
                contentsToDisplay={<TruncatedText text={uid} />}
                onCopy={(): void => onCopy('orderId')}
              />
            </td>
          </tr>
          <tr>
            <td>
              <span>
                <HelpTooltip tooltip={tooltip.from} /> From
              </span>
            </td>
            <td>
              <Wrapper>
                <RowWithCopyButton
                  textToCopy={owner}
                  onCopy={(): void => onCopy('ownerAddress')}
                  contentsToDisplay={
                    <Link to={getExplorerLink(chainId, owner, ExplorerDataType.ADDRESS)} target="_blank">
                      {owner}↗
                    </Link>
                  }
                />
                <LinkButton to={`/address/${owner}`}>
                  <FontAwesomeIcon icon={faHistory} />
                  Order History
                </LinkButton>
              </Wrapper>
            </td>
          </tr>
          <tr>
            <td>
              <span>
                <HelpTooltip tooltip={tooltip.to} /> To
              </span>
            </td>
            <td>
              <Wrapper>
                <RowWithCopyButton
                  textToCopy={receiver}
                  onCopy={(): void => onCopy('receiverAddress')}
                  contentsToDisplay={
                    <Link to={getExplorerLink(chainId, receiver, ExplorerDataType.ADDRESS)} target="_blank">
                      {receiver}↗
                    </Link>
                  }
                />
                <LinkButton to={`/address/${receiver}`}>
                  <FontAwesomeIcon icon={faHistory} />
                  Order History
                </LinkButton>
              </Wrapper>
            </td>
          </tr>
          {(!partiallyFillable || txHash) && (
            <tr>
              <td>
                <span>
                  <HelpTooltip tooltip={tooltip.hash} /> Transaction hash
                </span>
              </td>
              <td>
                {areTradesLoading ? (
                  <Spinner />
                ) : txHash ? (
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
                ) : (
                  '-'
                )}
              </td>
            </tr>
          )}
          <tr>
            <td>
              <span>
                <HelpTooltip tooltip={tooltip.status} /> Status
              </span>
            </td>
            <td>
              <StatusLabel status={status} partiallyFilled={partiallyFilled} partialTagPosition="right" />
            </td>
          </tr>
          <tr>
            <td>
              <span>
                <HelpTooltip tooltip={tooltip.submission} /> Submission Time
              </span>
            </td>
            <td>
              <DateDisplay date={creationDate} showIcon={true} />
            </td>
          </tr>
          {executionDate && !showFillsButton && (
            <tr>
              <td>
                <span>
                  <HelpTooltip tooltip={tooltip.execution} /> Execution Time
                </span>
              </td>
              <td>
                <DateDisplay date={executionDate} showIcon={true} />
              </td>
            </tr>
          )}
          <tr>
            <td>
              <span>
                <HelpTooltip tooltip={tooltip.expiration} /> Expiration Time
              </span>
            </td>
            <td>
              <DateDisplay date={expirationDate} showIcon={true} />
            </td>
          </tr>
          <tr>
            <td>
              <span>
                <HelpTooltip tooltip={tooltip.type} /> Type
              </span>
            </td>
            <td>
              {capitalize(kind)} {getUiOrderType(order).toLowerCase()} order{' '}
              {partiallyFillable ? '(Partially fillable)' : '(Fill or Kill)'}
            </td>
          </tr>
          <tr>
            <td>
              <span>
                <HelpTooltip tooltip={tooltip.amount} /> Amount
              </span>
            </td>
            <td>
              <AmountsDisplay order={order} />
            </td>
          </tr>
          <tr>
            <td>
              <span>
                <HelpTooltip tooltip={tooltip.priceLimit} /> Limit Price
              </span>
            </td>
            <td>
              <OrderPriceDisplay
                buyAmount={buyAmount}
                buyToken={buyToken}
                sellAmount={sellAmount}
                sellToken={sellToken}
                showInvertButton
                isPriceInverted={isPriceInverted}
                invertPrice={invertPrice}
              />
            </td>
          </tr>
          <>
            <tr>
              <td>
                <span>
                  <HelpTooltip tooltip={tooltip.priceExecution} /> Execution price
                </span>
              </td>
              <td>
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
              </td>
            </tr>
            <tr>
              <td>
                <span>
                  <HelpTooltip tooltip={tooltip.filled} /> Filled
                </span>
              </td>
              <td>
                <Wrapper>
                  <FilledProgress order={order} />
                  {showFillsButton && (
                    <LinkButton onClickOptional={viewFills} to={`/orders/${uid}/?${TAB_QUERY_PARAM_KEY}=fills`}>
                      <FontAwesomeIcon icon={faFill} />
                      View fills
                    </LinkButton>
                  )}
                </Wrapper>
              </td>
            </tr>
            <tr>
              <td>
                <span>
                  <HelpTooltip tooltip={tooltip.surplus} /> Order surplus
                </span>
              </td>
              <td>{!surplusAmount.isZero() ? <OrderSurplusDisplay order={order} /> : '-'}</td>
            </tr>
          </>
          <tr>
            <td>
              <span>
                <HelpTooltip tooltip={tooltip.fees} /> Costs &amp; Fees
              </span>
            </td>
            <td>
              <GasFeeDisplay order={order} />
            </td>
          </tr>
          <tr>
            <td>
              <span>
                <HelpTooltip tooltip={tooltip.appData} /> AppData
              </span>
            </td>
            <td>
              <DecodeAppData appData={appData} fullAppData={fullAppData ?? undefined} />
            </td>
          </tr>
        </>
      }
    />
  )
}
