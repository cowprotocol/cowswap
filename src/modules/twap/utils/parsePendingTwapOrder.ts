import { OrderClass, OrderKind } from '@cowprotocol/cow-sdk'

import BigNumber from 'bignumber.js'
import JSBI from 'jsbi'

import { OrderStatus } from 'legacy/state/orders/actions'

import { TokensByAddress } from 'modules/tokensList/state/tokensListAtom'

import { ParsedOrder, ParsedOrderExecutionData } from 'utils/orderUtils/parseOrder'

import { TWAPOrderItem } from '../types'

const pendingTwapExecutionData: ParsedOrderExecutionData = {
  executedBuyAmount: JSBI.BigInt(0),
  executedSellAmount: JSBI.BigInt(0),
  fullyFilled: false,
  partiallyFilled: false,
  filledAmount: new BigNumber(0),
  filledPercentage: new BigNumber(0),
  surplusAmount: new BigNumber(0),
  surplusPercentage: new BigNumber(0),
  executedFeeAmount: undefined,
  executedSurplusFee: null,
  filledPercentDisplayed: 0,
  executedPrice: null,
  activityId: undefined,
  activityTitle: '',
}

export function parsePendingTwapOrder(tokens: TokensByAddress, item: TWAPOrderItem): ParsedOrder {
  const { sellToken, buyToken, partSellAmount, minPartLimit, n, t } = item.order
  const numOfParts = BigInt(n)
  const sellAmount = BigInt(partSellAmount) * numOfParts
  const buyAmount = BigInt(minPartLimit) * numOfParts

  const parsedCreationTime = new Date(item.submissionDate)
  const expirationTime = new Date(parsedCreationTime.getTime() + t * n * 1000)

  return {
    id: item.hash,
    isCancelling: false,
    kind: OrderKind.SELL,
    class: OrderClass.LIMIT,
    status: OrderStatus.PENDING,
    inputToken: tokens[sellToken.toLowerCase()],
    outputToken: tokens[buyToken.toLowerCase()],
    sellAmount: sellAmount.toString(),
    buyAmount: buyAmount.toString(),
    feeAmount: '0',
    partiallyFillable: true,
    parsedCreationTime,
    expirationTime,
    executionData: pendingTwapExecutionData,
  }
}
