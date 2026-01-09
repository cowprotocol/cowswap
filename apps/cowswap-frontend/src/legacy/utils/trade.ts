import { RADIX_DECIMAL } from '@cowprotocol/common-const'
import {
  formatSymbol,
  formatTokenAmount,
  getCurrencyAddress,
  isAddress,
  isSellOrder,
  shortenAddress,
} from '@cowprotocol/common-utils'
import {
  OrderClass,
  OrderKind,
  OrderSigningUtils,
  SigningScheme,
  SupportedChainId as ChainId,
  UnsignedOrder,
} from '@cowprotocol/cow-sdk'
import type { Signer } from '@ethersproject/abstract-signer'
import type { JsonRpcSigner } from '@ethersproject/providers'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'
import { orderBookApi } from 'cowSdk'

import { ChangeOrderStatusParams, Order, OrderStatus } from 'legacy/state/orders/actions'

import { AppDataInfo } from 'modules/appData'

import { getIsOrderBookTypedError } from 'api/cowProtocol'
import OperatorError, { ApiErrorObject } from 'api/cowProtocol/errors/OperatorError'

export type PostOrderParams = {
  account: string
  chainId: ChainId
  signer: JsonRpcSigner
  kind: OrderKind
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  bridgeOutputAmount?: CurrencyAmount<Currency>
  sellAmountBeforeFee: CurrencyAmount<Currency>
  feeAmount: CurrencyAmount<Currency> | undefined
  sellToken: Token
  buyToken: Token
  validTo: number
  recipient: string
  recipientAddressOrName?: string | null
  allowsOffchainSigning: boolean
  appData: AppDataInfo
  class: OrderClass
  partiallyFillable: boolean
  quoteId?: number
  isSafeWallet: boolean
}

export type UnsignedOrderAdditionalParams = Omit<PostOrderParams, 'signer' | 'validTo'> & {
  orderId: string
  signature: string
  signingScheme: SigningScheme
  isOnChain?: boolean
  orderCreationHash?: string
}

export function getOrderSubmitSummary(
  params: Pick<
    PostOrderParams,
    'kind' | 'account' | 'inputAmount' | 'outputAmount' | 'recipient' | 'recipientAddressOrName' | 'feeAmount'
  >,
): string {
  const { kind, account, inputAmount, outputAmount, recipient, recipientAddressOrName, feeAmount } = params

  const sellToken = inputAmount.currency
  const buyToken = outputAmount.currency

  const [inputQuantifier, outputQuantifier] = isSellOrder(kind) ? ['', t`at least `] : [t`at most `, '']
  const inputSymbol = formatSymbol(sellToken.symbol)
  const outputSymbol = formatSymbol(buyToken.symbol)
  // this already contains the fee in the fee amount when fee=0
  const inputAmountValue = formatTokenAmount(feeAmount ? inputAmount.add(feeAmount) : inputAmount)
  const outputAmountValue = formatTokenAmount(outputAmount)

  const base =
    t`Swap` +
    ` ${inputQuantifier} ${inputAmountValue} ${inputSymbol} ` +
    t`for` +
    ` ${outputQuantifier} ${outputAmountValue} ${outputSymbol}`

  if (recipient === account) {
    return base
  } else {
    const toAddress =
      recipientAddressOrName && isAddress(recipientAddressOrName)
        ? shortenAddress(recipientAddressOrName)
        : recipientAddressOrName

    return `${base} ` + t`to` + ` ${toAddress}`
  }
}

export type SignOrderParams = {
  quoteId: number | undefined
  order: UnsignedOrder
}

export function getSignOrderParams(params: PostOrderParams): SignOrderParams {
  const {
    kind,
    inputAmount,
    sellAmountBeforeFee,
    outputAmount,
    sellToken,
    buyToken,
    validTo,
    recipient,
    partiallyFillable,
    appData,
    quoteId,
  } = params
  const sellTokenAddress = sellToken.address
  const stringifiedJSON = JSON.stringify(sellToken, undefined, 2)

  if (!sellTokenAddress) {
    throw new Error(t`Order params invalid sellToken address for token: ${stringifiedJSON}`)
  }

  const isSellTrade = isSellOrder(kind)

  // fee adjusted input amount
  const sellAmount = (isSellTrade ? sellAmountBeforeFee : inputAmount).quotient.toString(RADIX_DECIMAL)
  // slippage adjusted output amount
  const buyAmount = outputAmount.quotient.toString(RADIX_DECIMAL)

  const receiver = recipient

  return {
    quoteId,
    order: {
      sellToken: sellTokenAddress,
      buyToken: getCurrencyAddress(buyToken),
      sellAmount,
      buyAmount,
      validTo,
      appData: appData.appDataKeccak256,
      feeAmount: '0',
      kind,
      receiver,
      partiallyFillable,
    },
  }
}

export type MapUnsignedOrderToOrderParams = {
  unsignedOrder: UnsignedOrder
  additionalParams: UnsignedOrderAdditionalParams
}

export function mapUnsignedOrderToOrder({ unsignedOrder, additionalParams }: MapUnsignedOrderToOrderParams): Order {
  const {
    orderId,
    account,
    sellToken,
    buyToken,
    allowsOffchainSigning,
    isOnChain,
    signature,
    signingScheme,
    sellAmountBeforeFee,
    orderCreationHash,
    quoteId,
    appData: { fullAppData },
    bridgeOutputAmount,
  } = additionalParams
  const status = _getOrderStatus(allowsOffchainSigning, isOnChain)

  return {
    ...unsignedOrder,

    // Basic order params
    id: orderId,
    owner: account,
    inputToken: sellToken,
    outputToken: buyToken,
    quoteId,
    class: additionalParams.class,
    fullAppData,
    bridgeOutputAmount,

    // Status
    status,
    creationTime: new Date().toISOString(),

    // EthFlow
    orderCreationHash,

    // Signature
    signature,
    signingScheme,

    // Additional API info
    apiAdditionalInfo: undefined,

    // sell amount BEFORE fee - necessary for later calculations (unfilled orders)
    sellAmountBeforeFee: sellAmountBeforeFee.quotient.toString(),
  }
}

function _getOrderStatus(allowsOffchainSigning: boolean, isOnChain: boolean | undefined): OrderStatus {
  if (isOnChain) {
    return OrderStatus.CREATING
  } else if (!allowsOffchainSigning) {
    return OrderStatus.PRESIGNATURE_PENDING
  } else {
    return OrderStatus.PENDING
  }
}

type OrderCancellationParams = {
  orderId: string
  account: string
  chainId: ChainId
  signer: Signer
  cancelPendingOrder: (params: ChangeOrderStatusParams) => void
}

export async function sendOrderCancellation(params: OrderCancellationParams): Promise<void> {
  const { orderId, chainId, signer, cancelPendingOrder } = params

  const { signature, signingScheme } = await OrderSigningUtils.signOrderCancellation(orderId, chainId, signer)

  if (!signature) throw new Error(t`Signature is undefined!`)

  await wrapErrorInOperatorError(async () => {
    await orderBookApi.sendSignedOrderCancellations(
      {
        orderUids: [orderId],
        signature,
        signingScheme,
      },
      { chainId },
    )

    cancelPendingOrder({ chainId, id: orderId })
  })
}

export async function wrapErrorInOperatorError<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    // In case it's an orderbook error, wrap it in an OperatorError
    if (getIsOrderBookTypedError(e)) {
      throw new OperatorError(e.body as ApiErrorObject)
    }
    throw e
  }
}
