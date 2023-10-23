import { RADIX_DECIMAL, NATIVE_CURRENCY_BUY_ADDRESS } from '@cowprotocol/common-const'
import { isAddress, shortenAddress, formatTokenAmount, formatSymbol, getIsNativeToken } from '@cowprotocol/common-utils'
import {
  EcdsaSigningScheme,
  OrderClass,
  OrderKind,
  OrderSigningUtils,
  SigningScheme,
  SupportedChainId as ChainId,
  UnsignedOrder,
} from '@cowprotocol/cow-sdk'
import { Signer } from '@ethersproject/abstract-signer'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { orderBookApi } from 'cowSdk'

import { ChangeOrderStatusParams, Order, OrderStatus } from 'legacy/state/orders/actions'
import { AddUnserialisedPendingOrderParams } from 'legacy/state/orders/hooks'

import { AppDataInfo } from 'modules/appData'

import { getTrades } from 'api/gnosisProtocol'
import { getProfileData } from 'api/gnosisProtocol/api'

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
  appData: AppDataInfo
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

export function getOrderSubmitSummary(
  params: Pick<
    PostOrderParams,
    'kind' | 'account' | 'inputAmount' | 'outputAmount' | 'recipient' | 'recipientAddressOrName' | 'feeAmount'
  >
): string {
  const { kind, account, inputAmount, outputAmount, recipient, recipientAddressOrName, feeAmount } = params

  const sellToken = inputAmount.currency
  const buyToken = outputAmount.currency

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

export type SignOrderParams = {
  summary: string
  quoteId: number | undefined
  order: UnsignedOrder
}

export function getSignOrderParams(params: PostOrderParams): SignOrderParams {
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
    appData,
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
  const summary = getOrderSubmitSummary(params)
  const receiver = recipient

  return {
    summary,
    quoteId,
    order: {
      sellToken: sellTokenAddress,
      buyToken: getIsNativeToken(buyToken) ? NATIVE_CURRENCY_BUY_ADDRESS : buyToken.address,
      sellAmount,
      buyAmount,
      validTo,
      appData: appData.appDataKeccak256,
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
    appData: { fullAppData },
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
    fullAppData,

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
  const { chainId, account, signer, allowsOffchainSigning, appData } = params

  // Prepare order
  const { summary, quoteId, order: unsignedOrder } = getSignOrderParams(params)
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
      appData: appData.fullAppData, // We sign the keccak256 hash, but we send the API the full appData string
      appDataHash: appData.appDataKeccak256,
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
  orderId: string
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
