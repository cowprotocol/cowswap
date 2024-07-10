import React, { useEffect, useState } from 'react'

import { TruncatedText } from '@cowprotocol/ui/pure/TruncatedText'

import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons'
import { safeTokenName } from '@gnosis.pm/dex-js'
import { DateDisplay } from 'components/common/DateDisplay'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import Spinner from 'components/common/Spinner'
import { TokenDisplay } from 'components/common/TokenDisplay'
import TradeOrderType from 'components/common/TradeOrderType'
import Icon from 'components/Icon'
import { HelpTooltip } from 'components/Tooltip'
import { TextWithTooltip } from 'explorer/components/common/TextWithTooltip'
import { useNetworkId } from 'state/network'
import styled from 'styled-components/macro'
import { FormatAmountPrecision, formattedAmount } from 'utils'

import { Order } from 'api/operator'
import { getLimitPrice } from 'utils/getLimitPrice'

import { OrderSurplusDisplayStyledByRow } from './OrderSurplusTooltipStyledByRow'

import { SimpleTable, SimpleTableProps } from '../../common/SimpleTable'
import { StatusLabel } from '../StatusLabel'

const tooltip = {
  orderID: 'A unique identifier ID for this order.',
}

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  font-size: 1.5rem;
  padding: 3.2rem;
  min-height: 25rem;
`

export type Props = SimpleTableProps & {
  orders: Order[] | undefined
  messageWhenEmpty?: string | React.ReactNode
}

interface RowProps {
  order: Order
  isPriceInverted: boolean
}

const RowOrder: React.FC<RowProps> = ({ order, isPriceInverted }) => {
  const { creationDate, buyToken, buyAmount, sellToken, sellAmount, kind, partiallyFilled, uid, filledPercentage } =
    order
  const [_isPriceInverted, setIsPriceInverted] = useState(isPriceInverted)
  const network = useNetworkId()
  const buyTokenSymbol = buyToken ? safeTokenName(buyToken) : ''
  const sellTokenSymbol = sellToken ? safeTokenName(sellToken) : ''
  const sellFormattedAmount = formattedAmount(sellToken, sellAmount.plus(order.feeAmount))
  const buyFormattedAmount = formattedAmount(buyToken, buyAmount)
  const limitPriceSettled = getLimitPrice(order, _isPriceInverted)

  useEffect(() => {
    setIsPriceInverted(isPriceInverted)
  }, [isPriceInverted])

  const renderSpinnerWhenNoValue = (textValue: string): React.ReactNode | void => {
    if (textValue === '-') return <Spinner spin size="1x" />
  }

  return (
    <tr key={uid}>
      <td>
        <RowWithCopyButton
          className="span-copybtn-wrap"
          textToCopy={uid}
          contentsToDisplay={
            <LinkWithPrefixNetwork to={`/orders/${order.uid}`} rel="noopener noreferrer" target="_self">
              <TruncatedText text={uid} />
            </LinkWithPrefixNetwork>
          }
        />
      </td>
      <td>
        <span className="header-value">
          <TradeOrderType kind={kind} />
        </span>
      </td>
      <td>
        {renderSpinnerWhenNoValue(sellFormattedAmount) || (
          <TextWithTooltip textInTooltip={`${sellFormattedAmount} ${sellTokenSymbol}`}>
            {formattedAmount(sellToken, sellAmount.plus(order.feeAmount), FormatAmountPrecision.highPrecision)}{' '}
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

const OrdersUserDetailsTable: React.FC<Props> = (props) => {
  const { orders, messageWhenEmpty } = props
  const [isPriceInverted, setIsPriceInverted] = useState(false)

  const invertLimitPrice = (): void => {
    setIsPriceInverted((previousValue) => !previousValue)
  }

  if (!orders?.length) {
    return <Wrapper>{messageWhenEmpty || 'No orders.'}</Wrapper>
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
          <th>Sell amount</th>
          <th>Buy amount</th>
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
      body={
        <>
          {orders.map((item) => (
            <RowOrder key={item.uid} order={item} isPriceInverted={isPriceInverted} />
          ))}
        </>
      }
    />
  )
}

export default OrdersUserDetailsTable
