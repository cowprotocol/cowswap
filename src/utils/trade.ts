import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { isAddress, shortenAddress } from 'utils/index'
import { ChangeOrderStatusParams, Order, OrderStatus } from 'state/orders/actions'
import { AddUnserialisedPendingOrderParams } from 'state/orders/hooks'

import { getTrades, OrderID } from '@cow/api/gnosisProtocol'
import { Signer } from '@ethersproject/abstract-signer'
import { RADIX_DECIMAL, NATIVE_CURRENCY_BUY_ADDRESS } from 'constants/index'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { formatSymbol } from '@cow/utils/format'
import {
  EcdsaSigningScheme,
  OrderClass,
  OrderKind,
  UnsignedOrder,
  SigningScheme,
  OrderSigningUtils,
} from '@cowprotocol/cow-sdk'
import { getProfileData } from '@cow/api/gnosisProtocol/api'
import { formatTokenAmount } from '@cow/utils/amountFormat'
import { orderBookApi } from '@cow/cowSdk'

export type PostOrderParams = {
  account: string
  chainId: ChainId
  signer: Signer
  kind: OrderKind
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  sellAmountBeforeFee: CurrencyAmount<Currency>
  feeAmount: CurrencyAmount<Currency> | undefined
  sellToken: Token
  buyToken: Token
  validTo: number
  recipient: string
  recipientAddressOrName: string | null
  allowsOffchainSigning: boolean
  appDataHash: string
  class: OrderClass
  partiallyFillable: boolean
  quoteId?: number
}

export type UnsignedOrderAdditionalParams = PostOrderParams & {
  orderId: string
  summary: string
  signature: string
  isOnChain?: boolean
  orderCreationHash?: string
}

function _getSummary(params: PostOrderParams): string {
  const {
    kind,
    account,
    inputAmount,
    outputAmount,
    recipient,
    recipientAddressOrName,
    feeAmount,
    sellToken,
    buyToken,
  } = params

  const [inputQuantifier, outputQuantifier] = [
    kind === OrderKind.BUY ? 'at most ' : '',
    kind === OrderKind.SELL ? 'at least ' : '',
  ]
  const inputSymbol = formatSymbol(sellToken.symbol)
  const outputSymbol = formatSymbol(buyToken.symbol)
  const inputAmountValue = formatTokenAmount(feeAmount ? inputAmount.add(feeAmount) : inputAmount)
  const outputAmountValue = formatTokenAmount(outputAmount)

  const base = `Swap ${inputQuantifier}${inputAmountValue} ${inputSymbol} for ${outputQuantifier}${outputAmountValue} ${outputSymbol}`

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

export function getOrderParams(params: PostOrderParams): {
  summary: string
  quoteId: number | undefined
  order: UnsignedOrder
} {
  const {
    kind,
    inputAmount,
    outputAmount,
    sellToken,
    buyToken,
    feeAmount,
    validTo,
    recipient,
    partiallyFillable,
    appDataHash,
    quoteId,
  } = params
  const sellTokenAddress = sellToken.address

  if (!sellTokenAddress) {
    throw new Error(`Order params invalid sellToken address for token: ${JSON.stringify(sellToken, undefined, 2)}`)
  }

  // fee adjusted input amount
  const sellAmount = inputAmount.quotient.toString(RADIX_DECIMAL)
  // slippage adjusted output amount
  const buyAmount = outputAmount.quotient.toString(RADIX_DECIMAL)

  // Prepare order
  const summary = _getSummary(params)
  const receiver = recipient

  return {
    summary,
    quoteId,
    order: {
      sellToken: sellTokenAddress,
      buyToken: buyToken.isNative ? NATIVE_CURRENCY_BUY_ADDRESS : buyToken.address,
      sellAmount,
      buyAmount,
      validTo,
      appData: appDataHash,
      feeAmount: feeAmount?.quotient.toString() || '0',
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
    summary,
    sellToken,
    buyToken,
    allowsOffchainSigning,
    isOnChain,
    signature,
    sellAmountBeforeFee,
    orderCreationHash,
    quoteId,
  } = additionalParams
  const status = _getOrderStatus(allowsOffchainSigning, isOnChain)

  return {
    ...unsignedOrder,

    // Basic order params
    id: orderId,
    owner: account,
    summary,
    inputToken: sellToken,
    outputToken: buyToken,
    quoteId,
    class: additionalParams.class,

    // Status
    status,
    creationTime: new Date().toISOString(),

    // EthFlow
    orderCreationHash,

    // Signature
    signature,

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

export async function signAndPostOrder(params: PostOrderParams): Promise<AddUnserialisedPendingOrderParams> {
  const { chainId, account, signer, allowsOffchainSigning } = params

  // Prepare order
  const { summary, quoteId, order: unsignedOrder } = getOrderParams(params)
  const receiver = unsignedOrder.receiver

  let signingScheme: SigningScheme
  let signature: string | undefined

  if (allowsOffchainSigning) {
    const signedOrderInfo = await OrderSigningUtils.signOrder(unsignedOrder, chainId, signer)
    signingScheme =
      signedOrderInfo.signingScheme === EcdsaSigningScheme.ETHSIGN ? SigningScheme.ETHSIGN : SigningScheme.EIP712
    signature = signedOrderInfo.signature
  } else {
    signingScheme = SigningScheme.PRESIGN
    signature = account
  }

  if (!signature) throw new Error('Signature is undefined!')

  // Call API
  const orderId = await orderBookApi.sendOrder(
    {
      ...unsignedOrder,
      from: account,
      receiver,
      signingScheme,
      // Include the signature
      signature,
      quoteId,
    },
    { chainId }
  )

  const pendingOrderParams: Order = mapUnsignedOrderToOrder({
    unsignedOrder,
    additionalParams: { ...params, orderId, summary, signature },
  })

  return {
    chainId,
    id: orderId,
    order: pendingOrderParams,
  }
}

type OrderCancellationParams = {
  orderId: OrderID
  account: string
  chainId: ChainId
  signer: Signer
  cancelPendingOrder: (params: ChangeOrderStatusParams) => void
}

export async function sendOrderCancellation(params: OrderCancellationParams): Promise<void> {
  const { orderId, chainId, signer, cancelPendingOrder } = params

  const { signature, signingScheme } = await OrderSigningUtils.signOrderCancellation(orderId, chainId, signer)

  if (!signature) throw new Error('Signature is undefined!')

  await orderBookApi.sendSignedOrderCancellations(
    {
      orderUids: [orderId],
      signature,
      signingScheme,
    },
    { chainId }
  )

  cancelPendingOrder({ chainId, id: orderId })
}

export async function hasTrades(chainId: ChainId, address: string): Promise<boolean> {
  const [trades, profileData] = await Promise.all([getTrades(chainId, address), getProfileData(chainId, address)])

  return trades.length > 0 || (profileData?.totalTrades ?? 0) > 0
}
