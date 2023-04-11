import styled from 'styled-components/macro'

import { formatOrderId, shortenOrderId } from 'utils'
import { OrderID } from '@cow/api/gnosisProtocol'
import { addPopup } from 'state/application/reducer'
import { OrderStatus, Order } from './actions'
import { CancellationSummary } from '@cow/modules/account/containers/Transaction/styled'
import { getSellAmountWithFee } from '@cow/modules/limitOrders/utils/getSellAmountWithFee'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { formatTokenAmount } from '@cow/utils/amountFormat'
import { getOrderSurplus } from '@cow/modules/limitOrders/utils/getOrderSurplus'
import { TokenAmount } from '@cow/common/pure/TokenAmount'
import { OrderKind } from '@cowprotocol/cow-sdk'

type OrderStatusExtended = OrderStatus | 'submitted' | 'presigned'

interface SetOrderSummaryParams {
  id: string
  status?: OrderStatusExtended
  summary?: string | JSX.Element
  descriptor?: string | null
}

// what is passed to addPopup action
export type PopupPayload = Parameters<typeof addPopup>[0]
export interface OrderIDWithPopup {
  id: OrderID
  popup: PopupPayload
}

export enum OrderTxTypes {
  METATXN = 'metatxn',
  TXN = 'txn',
}

enum OrderIdType {
  ID = 'id',
  HASH = 'hash',
}

interface BasePopupContent {
  success: boolean
  summary: string | JSX.Element
}

type IdOrHash<K extends OrderIdType, T extends OrderTxTypes> = {
  [identifier in K]: T extends OrderTxTypes.METATXN ? OrderTxTypes.METATXN : OrderTxTypes.TXN
}

type GPPopupContent<T extends OrderTxTypes> = {
  [type in T]: IdOrHash<T extends OrderTxTypes.METATXN ? OrderIdType.ID : OrderIdType.HASH, T> & BasePopupContent
}

type MetaPopupContent = GPPopupContent<OrderTxTypes.METATXN>
type TxnPopupContent = GPPopupContent<OrderTxTypes.TXN>

function setOrderSummary({ id, summary, status, descriptor }: SetOrderSummaryParams) {
  // If there isn't summary, return generalized summary
  if (!summary) {
    return `Order ${formatOrderId(id)} ${descriptor || status || ''}`
  }

  if (typeof summary === 'string') {
    // If descriptor is specifically null, just return summary
    if (descriptor === null) {
      return summary
    }

    // Otherwise return summary with descriptor or status
    return `${summary} ${descriptor || status || ''}`
  }

  return summary
}

const Wrapper = styled.div`
  & > p:first-child {
    margin-top: 0;
  }

  & > p:last-child {
    margin-bottom: 0;
  }
`

export function buildCancellationPopupSummary(id: string, summary: string | undefined): JSX.Element {
  return (
    <Wrapper>
      <p>Order successfully cancelled</p>
      <p>
        Order <strong>{shortenOrderId(id)}</strong>:
      </p>
      <CancellationSummary as="p">{summary}</CancellationSummary>
    </Wrapper>
  )
}

// Metatxn popup
export function setPopupData(
  type: OrderTxTypes.METATXN,
  { success, id, summary, status, descriptor }: SetOrderSummaryParams & { success?: boolean }
): { key?: string; content: MetaPopupContent }
// Txn popup
export function setPopupData(
  type: OrderTxTypes.TXN,
  { success, id, summary, status, descriptor }: SetOrderSummaryParams & { hash: string; success?: boolean }
): { key?: string; content: TxnPopupContent }
export function setPopupData(
  type: OrderTxTypes,
  { hash, success = true, id, summary, status, descriptor }: any
): { key?: string; content: TxnPopupContent | MetaPopupContent } {
  const key = id + '_' + status
  const baseContent = {
    success,
    summary: setOrderSummary({
      summary,
      id,
      status,
      descriptor,
    }),
  }

  let content: TxnPopupContent | MetaPopupContent
  if (type === OrderTxTypes.TXN) {
    content = {
      txn: {
        hash,
        ...baseContent,
      },
    }
  } else {
    content = {
      metatxn: {
        id,
        ...baseContent,
      },
    }
  }

  return { key, content }
}

const SummaryWrapper = styled.div`
  font-size: 1rem;

  > div {
    margin-bottom: 1rem;

    &:last-child {
      margin-bottom: 0.6rem;
    }
  }
`

const Strong = styled.strong`
  font-size: 0.9rem;
  white-space: nowrap;
`

const Percentage = styled.span`
  color: ${({ theme }) => theme.green1};
  margin-right: 5px;
`

export function getExecutedSummary(order: Order): JSX.Element | string {
  if (!order) {
    return ''
  }

  const inputT = order.inputToken
  const outputT = order.outputToken

  const inputToken = new Token(inputT.chainId, inputT.address, inputT.decimals, inputT.symbol, inputT.name)
  const outputToken = new Token(outputT.chainId, outputT.address, outputT.decimals, outputT.symbol, outputT.name)

  const inputSymbol = inputToken.symbol
  const outputSymbol = outputToken.symbol

  const inputAmountCurrency = getSellAmountWithFee({ ...order, inputToken })
  const outputAmountCyrrency = CurrencyAmount.fromRawAmount(outputToken, order.buyAmount)

  const inputAmount = formatTokenAmount(inputAmountCurrency)
  const outputAmount = formatTokenAmount(outputAmountCyrrency)

  const surplusToken = order.kind === OrderKind.SELL ? outputToken : inputToken

  const { amount, percentage } = getOrderSurplus(order)
  const parsedSurplus = CurrencyAmount.fromRawAmount(surplusToken, amount.toString())
  const formattedPercent = percentage?.multipliedBy(100)?.toFixed(2)

  return (
    <SummaryWrapper>
      <div>
        Traded{' '}
        <Strong>
          {inputAmount} {inputSymbol}
        </Strong>{' '}
        for a total of{' '}
        <Strong>
          {outputAmount} {outputSymbol}
        </Strong>
      </div>

      {!!amount && (
        <div>
          <span>Order surplus: </span>
          <Strong>
            <Percentage>+{formattedPercent}%</Percentage>
            <TokenAmount amount={parsedSurplus} tokenSymbol={surplusToken} />
          </Strong>
        </div>
      )}
    </SummaryWrapper>
  )
}
