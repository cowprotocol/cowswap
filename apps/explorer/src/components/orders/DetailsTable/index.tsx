import React from 'react'

import { Command } from '@cowprotocol/types'

import { faFill, faProjectDiagram } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { sendEvent } from 'components/analytics'
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
import styled from 'styled-components/macro'
import { media } from 'theme/styles/media'
import { capitalize } from 'utils'

import { Order } from 'api/operator'
import { getUiOrderType } from 'utils/getUiOrderType'

import { TAB_QUERY_PARAM_KEY } from '../../../explorer/const'

const Table = styled(SimpleTable)`
  > tbody > tr {
    grid-template-columns: 27rem auto;
    grid-template-rows: max-content;
    padding: 1.4rem 0 1.4rem 1.1rem;

    ${media.mediumDown} {
      grid-template-columns: 17rem auto;
      padding: 1.4rem 0;
    }

    > td {
      justify-content: flex-start;

      &:first-of-type {
        text-transform: capitalize;
        ${media.mediumUp} {
          font-weight: ${({ theme }): string => theme.fontLighter};
        }

        /* Question mark */
        > svg {
          margin: 0 1rem 0 0;
        }

        /* Column after text on first column */
        ::after {
          content: ':';
        }
      }

      &:last-of-type {
        color: ${({ theme }): string => theme.textPrimary1};
      }
    }
  }
`

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
  ${media.mobile} {
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

  ${media.mobile} {
    margin: 1rem 0 0 0;
  }

  ${media.mediumDown} {
    min-width: 18rem;
  }

  :hover {
    opacity: 0.8;
    color: ${({ theme }): string => theme.white};
    text-decoration: none;
  }

  svg {
    margin-right: 0.5rem;
  }
`

export type Props = {
  order: Order
  showFillsButton: boolean | undefined
  areTradesLoading: boolean
  viewFills: Command
  isPriceInverted: boolean
  invertPrice: Command
}

export function DetailsTable(props: Props): JSX.Element | null {
  const { order, areTradesLoading, showFillsButton, viewFills, isPriceInverted, invertPrice } = props
  const {
    uid,
    shortId,
    owner,
    receiver,
    txHash,
    kind,
    partiallyFillable,
    creationDate,
    expirationDate,
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

  const onCopy = (label: string): void =>
    sendEvent({
      category: 'Order details',
      action: 'Copy',
      label,
    })

  return (
    <Table
      body={
        <>
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.orderID} /> Order Id
            </td>
            <td>
              <RowWithCopyButton textToCopy={uid} contentsToDisplay={shortId} onCopy={(): void => onCopy('orderId')} />
            </td>
          </tr>
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.from} /> From
            </td>
            <td>
              <RowWithCopyButton
                textToCopy={owner}
                onCopy={(): void => onCopy('ownerAddress')}
                contentsToDisplay={<LinkWithPrefixNetwork to={`/address/${owner}`}>{owner}</LinkWithPrefixNetwork>}
              />
            </td>
          </tr>
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.to} /> To
            </td>
            <td>
              <RowWithCopyButton
                textToCopy={receiver}
                onCopy={(): void => onCopy('receiverAddress')}
                contentsToDisplay={
                  <LinkWithPrefixNetwork to={`/address/${receiver}`}>{receiver}</LinkWithPrefixNetwork>
                }
              />
            </td>
          </tr>
          {(!partiallyFillable || txHash) && (
            <tr>
              <td>
                <HelpTooltip tooltip={tooltip.hash} /> Transaction hash
              </td>
              <td>
                {areTradesLoading ? (
                  <Spinner />
                ) : txHash ? (
                  <Wrapper>
                    <RowWithCopyButton
                      textToCopy={txHash}
                      onCopy={(): void => onCopy('settlementTx')}
                      contentsToDisplay={<LinkWithPrefixNetwork to={`/tx/${txHash}`}>{txHash}</LinkWithPrefixNetwork>}
                    />
                    <LinkButton to={`/tx/${txHash}/?${TAB_QUERY_PARAM_KEY}=graph`}>
                      <FontAwesomeIcon icon={faProjectDiagram} />
                      View batch graph
                    </LinkButton>
                  </Wrapper>
                ) : (
                  '-'
                )}
              </td>
            </tr>
          )}
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.status} /> Status
            </td>
            <td>
              <StatusLabel status={status} partiallyFilled={partiallyFilled} partialTagPosition="right" />
            </td>
          </tr>
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.submission} /> Submission Time
            </td>
            <td>
              <DateDisplay date={creationDate} showIcon={true} />
            </td>
          </tr>
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.expiration} /> Expiration Time
            </td>
            <td>
              <DateDisplay date={expirationDate} showIcon={true} />
            </td>
          </tr>
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.type} /> Type
            </td>
            <td>
              {capitalize(kind)} {getUiOrderType(order).toLowerCase()} order{' '}
              {partiallyFillable ? '(Partially fillable)' : '(Fill or Kill)'}
            </td>
          </tr>
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.amount} />
              Amount
            </td>
            <td>
              <AmountsDisplay order={order} />
            </td>
          </tr>
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.priceLimit} /> Limit Price
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
                <HelpTooltip tooltip={tooltip.priceExecution} /> Execution price
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
                <HelpTooltip tooltip={tooltip.filled} /> Filled
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
                <HelpTooltip tooltip={tooltip.surplus} /> Order surplus
              </td>
              <td>{!surplusAmount.isZero() ? <OrderSurplusDisplay order={order} /> : '-'}</td>
            </tr>
          </>
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.fees} /> Fees
            </td>
            <td>
              <GasFeeDisplay order={order} />
            </td>
          </tr>
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.appData} /> AppData
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
