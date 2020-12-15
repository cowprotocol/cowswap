import { ChainId, Trade, TradeType } from '@uniswap/sdk'
import { isAddress, shortenAddress } from '@src/utils'
import { AddPendingOrderParams, OrderStatus, OrderKind } from 'state/orders/actions'

import { signOrder, UnsignedOrder } from 'utils/signatures'
import { getFeeQuote as getFeeInformation, postSignedOrder } from 'utils/operator'
import { getFeeAmount } from 'utils/fee'
import { Signer } from 'ethers'
import { APP_ID } from 'constants/index'

export interface PostOrderParams {
  account: string
  chainId: ChainId
  signer: Signer
  trade: Trade
  validTo: number
  recipient: string
  recipientAddressOrName: string | null
  addPendingOrder: (order: AddPendingOrderParams) => void
}

function _getSummary(params: PostOrderParams): string {
  const { trade, account, recipient, recipientAddressOrName } = params

  const inputSymbol = trade.inputAmount.currency.symbol
  const outputSymbol = trade.outputAmount.currency.symbol
  const inputAmount = trade.inputAmount.toSignificant(3)
  const outputAmount = trade.outputAmount.toSignificant(3)

  const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`

  if (recipient === account) {
    return base
  } else {
    const toAddress =
      recipientAddressOrName && isAddress(recipientAddressOrName)
        ? shortenAddress(recipientAddressOrName)
        : recipientAddressOrName

    return `${base} to ${toAddress}`
  }
}

export async function postOrder(params: PostOrderParams): Promise<string> {
  const { addPendingOrder, chainId, trade, validTo, account, signer } = params
  const { inputAmount, outputAmount } = trade

  const path = trade.route.path
  const sellToken = path[0]
  const buyToken = path[path.length - 1]
  const sellAmount = inputAmount.raw.toString(10)
  const buyAmount = outputAmount.raw.toString(10)

  // TODO: This might disappear, and just take the state from the state after the fees PRs are merged
  //  we assume, the solvers will try to satisfy the price, and this fee is just a minimal fee.
  // Get Fee
  const { feeRatio, minimalFee } = await getFeeInformation(chainId, sellToken.address)
  const feeAmount = getFeeAmount({
    sellAmount: sellAmount,
    feeRatio,
    minimalFee
  })

  // Prepare order
  const summary = _getSummary(params)
  const unsignedOrder: UnsignedOrder = {
    sellToken: sellToken.address,
    buyToken: buyToken.address,
    sellAmount,
    buyAmount,
    validTo,
    appData: APP_ID, // TODO: Add appData by env var
    feeAmount,
    kind: trade.tradeType === TradeType.EXACT_INPUT ? OrderKind.SELL : OrderKind.BUY,
    partiallyFillable: false // Always fill or kill
  }

  const signature = await signOrder({
    chainId,
    signer,
    order: unsignedOrder
  })
  const creationTime = new Date().toISOString()

  // Call API
  const orderId = await postSignedOrder({
    chainId,
    order: {
      ...unsignedOrder,
      signature
    }
  })

  // Update the state
  addPendingOrder({
    chainId,
    id: orderId,
    order: {
      ...unsignedOrder,
      id: orderId,
      owner: account,
      creationTime,
      signature,
      status: OrderStatus.PENDING,
      summary
    }
  })

  console.log('[useSwapCallback] TODO: Add summary also to new pendingOrder', summary)

  return orderId
}
