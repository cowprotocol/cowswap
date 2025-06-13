import React, { useState } from 'react'

import { Command } from '@cowprotocol/types'
import { TruncatedText } from '@cowprotocol/ui/pure/TruncatedText'

import { faExchangeAlt, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { safeTokenName } from '@gnosis.pm/dex-js'
import { DateDisplay } from 'components/common/DateDisplay'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { TokenDisplay } from 'components/common/TokenDisplay'
import TradeOrderType from 'components/common/TradeOrderType'
import Icon from 'components/Icon'
import { OrderSurplusDisplayStyledByRow } from 'components/orders/OrdersUserDetailsTable/OrderSurplusTooltipStyledByRow'
import { StatusLabel } from 'components/orders/StatusLabel'
import { HelpTooltip } from 'components/Tooltip'
import { TextWithTooltip } from 'explorer/components/common/TextWithTooltip'
import { useNetworkId } from 'state/network'
import { FormatAmountPrecision, formattedAmount } from 'utils'

import { Order } from 'api/operator'
import { getLimitPrice } from 'utils/getLimitPrice'

import { SimpleTable, SimpleTableProps } from '../../common/SimpleTable'

const tooltip = {
  orderID: 'A unique identifier ID for this order.',
}

export type Props = SimpleTableProps & {
  orders: Order[] | undefined
}

interface RowProps {
  order: Order
  isPriceInverted: boolean
  invertLimitPrice: Command
}

// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, complexity
const RowTransaction: React.FC<RowProps> = ({ order, isPriceInverted }) => {
  const {
    buyToken,
    buyAmount,
    creationDate,
    partiallyFilled = false,
    filledPercentage,
    sellToken,
    sellAmount,
    kind,
    txHash,
    uid,
  } = order
  const network = useNetworkId()
  const buyTokenSymbol = buyToken ? safeTokenName(buyToken) : ''
  const sellTokenSymbol = sellToken ? safeTokenName(sellToken) : ''
  const sellFormattedAmount = formattedAmount(sellToken, sellAmount)
  const buyFormattedAmount = formattedAmount(buyToken, buyAmount)
  const renderSpinnerWhenNoValue = (textValue: string): React.ReactNode | void => {
    if (textValue === '-') return <FontAwesomeIcon icon={faSpinner} spin size="1x" />
  }
  const limitPriceSettled = getLimitPrice(order, isPriceInverted)

  return (
    <tr key={txHash}>
      <td>
        <RowWithCopyButton
          className="span-copybtn-wrap"
          textToCopy={uid}
          contentsToDisplay={
            <LinkWithPrefixNetwork to={`/orders/${order.uid}`} rel="noopener noreferrer" target="_self">
              <TruncatedText>{uid}</TruncatedText>
            </LinkWithPrefixNetwork>
          }
        />
      </td>
      <td>
        <span className="header-value">
          <TradeOrderType kind={kind || 'sell'} />
        </span>
      </td>
      <td>
        {renderSpinnerWhenNoValue(sellFormattedAmount) || (
          <TextWithTooltip textInTooltip={`${sellFormattedAmount} ${sellTokenSymbol}`}>
            {formattedAmount(sellToken, sellAmount, FormatAmountPrecision.highPrecision)}{' '}
            {sellToken && network && <TokenDisplay showAbbreviated erc20={sellToken} network={network} />}
          </TextWithTooltip>
        )}
      </td>
      <td>
        {renderSpinnerWhenNoValue(buyFormattedAmount) || (
          <TextWithTooltip textInTooltip={`${buyFormattedAmount} ${buyTokenSymbol}`}>
            {formattedAmount(buyToken, buyAmount, FormatAmountPrecision.highPrecision)}{' '}
            {buyToken && network && <TokenDisplay showAbbreviated erc20={buyToken} network={network} />}
          </TextWithTooltip>
        )}
      </td>
      <td>{renderSpinnerWhenNoValue(limitPriceSettled) || limitPriceSettled}</td>
      <td>
        <OrderSurplusDisplayStyledByRow order={order} />
      </td>
      <td>
        <DateDisplay date={creationDate} showIcon={true} />
      </td>
      <td>
        <StatusLabel status={order.status} partiallyFilled={partiallyFilled} filledPercentage={filledPercentage} />
      </td>
    </tr>
  )
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
const TransactionTable: React.FC<Props> = (props) => {
  const { orders } = props
  const [isPriceInverted, setIsPriceInverted] = useState(false)

  const invertLimitPrice = (): void => {
    setIsPriceInverted((previousValue) => !previousValue)
  }

  const orderItems = (items: Order[] | undefined): React.ReactNode => {
    let tableContent

    if (!items || items.length === 0) {
      tableContent = (
        <tr className="row-empty">
          <td className="row-td-empty" colSpan={8}>
            Can&apos;t load details <br /> Please try again
          </td>
        </tr>
      )
    } else {
      tableContent = (
        <>
          {items.map((item, i) => (
            <RowTransaction
              key={`${item.uid}-${i}`}
              invertLimitPrice={invertLimitPrice}
              order={item}
              isPriceInverted={isPriceInverted}
            />
          ))}
        </>
      )
    }
    return tableContent
  }

  return (
    <SimpleTable
      header={
        <tr>
          <th>
            <span>
              Order ID <HelpTooltip tooltip={tooltip.orderID} />
            </span>
          </th>
          <th>Type</th>
          <th>Sell Amount</th>
          <th>Buy Amount</th>
          <th>
            <span>
              Limit price <Icon icon={faExchangeAlt} onClick={invertLimitPrice} />
            </span>
          </th>
          <th>Surplus</th>
          <th>Created</th>
          <th>Status</th>
        </tr>
      }
      body={orderItems(orders)}
    />
  )
}

export default TransactionTable
