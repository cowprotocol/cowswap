import { CurrencyAmount, Currency, Token } from '@uniswap/sdk-core'
import { isAddress, shortenAddress } from 'utils'
import { OrderStatus, OrderKind, ChangeOrderStatusParams, Order } from 'state/orders/actions'
import { AddUnserialisedPendingOrderParams } from 'state/orders/hooks'

import { signOrder, signOrderCancellation, UnsignedOrder } from 'utils/signatures'
import { sendSignedOrderCancellation, sendOrder as sendOrderApi, OrderID } from 'api/gnosisProtocol'
import { Signer } from '@ethersproject/abstract-signer'
import { RADIX_DECIMAL, AMOUNT_PRECISION } from 'constants/index'
import { SupportedChainId as ChainId } from 'constants/chains'
import { formatSmart } from 'utils/format'
import { SigningScheme } from '@cowprotocol/contracts'
import { getTrades, getProfileData } from 'api/gnosisProtocol/api'

export interface PostOrderParams {
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
  quoteId?: number
}

function _getSummary(params: PostOrderParams): string {
  const { kind, account, inputAmount, outputAmount, recipient, recipientAddressOrName, feeAmount } = params

  const [inputQuantifier, outputQuantifier] = [
    kind === OrderKind.BUY ? 'at most ' : '',
    kind === OrderKind.SELL ? 'at least ' : '',
  ]
  const inputSymbol = inputAmount.currency.symbol
  const outputSymbol = outputAmount.currency.symbol
  const inputAmountValue = formatSmart(feeAmount ? inputAmount.add(feeAmount) : inputAmount, AMOUNT_PRECISION)
  const outputAmountValue = formatSmart(outputAmount, AMOUNT_PRECISION)

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

export async function signAndPostOrder(params: PostOrderParams): Promise<AddUnserialisedPendingOrderParams> {
  const {
    kind,
    chainId,
    inputAmount,
    outputAmount,
    sellToken,
    buyToken,
    feeAmount,
    validTo,
    account,
    signer,
    recipient,
    allowsOffchainSigning,
    appDataHash,
    sellAmountBeforeFee,
    quoteId,
  } = params

  // fee adjusted input amount
  const sellAmount = inputAmount.quotient.toString(RADIX_DECIMAL)
  // slippage adjusted output amount
  const buyAmount = outputAmount.quotient.toString(RADIX_DECIMAL)

  // Prepare order
  const summary = _getSummary(params)
  const receiver = recipient
  const creationTime = new Date().toISOString()

  const unsignedOrder: UnsignedOrder = {
    sellToken: sellToken.address,
    buyToken: buyToken.address,
    sellAmount,
    buyAmount,
    validTo,
    appData: appDataHash,
    feeAmount: feeAmount?.quotient.toString() || '0',
    kind,
    receiver,
    partiallyFillable: false, // Always fill or kill
  }

  let signingScheme: SigningScheme
  let signature: string | undefined
  if (allowsOffchainSigning) {
    const signedOrderInfo = await signOrder(unsignedOrder, chainId, signer)
    signingScheme = signedOrderInfo.signingScheme
    signature = signedOrderInfo.signature
  } else {
    signingScheme = SigningScheme.PRESIGN
    signature = account
  }

  // Call API
  const orderId = await sendOrderApi({
    chainId,
    order: {
      ...unsignedOrder,
      receiver,
      signingScheme,
      // Include the signature
      signature,
      quoteId,
    },
    owner: account,
  })

  const pendingOrderParams: Order = {
    ...unsignedOrder,

    // Basic order params
    id: orderId,
    owner: account,
    summary,
    inputToken: sellToken,
    outputToken: buyToken,

    // Status
    status: allowsOffchainSigning ? OrderStatus.PENDING : OrderStatus.PRESIGNATURE_PENDING,
    creationTime,

    // Signature
    signature,

    // Additional API info
    apiAdditionalInfo: undefined,

    // sell amount BEFORE fee - necessary for later calculations (unfilled orders)
    sellAmountBeforeFee: sellAmountBeforeFee.quotient.toString(),
  }

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
  const { orderId, account, chainId, signer, cancelPendingOrder } = params

  const { signature, signingScheme } = await signOrderCancellation(orderId, chainId, signer)

  await sendSignedOrderCancellation({
    chainId,
    owner: account,
    cancellation: { orderUid: orderId, signature, signingScheme },
  })

  cancelPendingOrder({ chainId, id: orderId })
}

export async function hasTrades(chainId: ChainId, address: string): Promise<boolean> {
  const [trades, profileData] = await Promise.all([
    getTrades({ chainId, owner: address, limit: 1 }),
    getProfileData(chainId, address),
  ])

  return trades.length > 0 || (profileData?.totalTrades ?? 0) > 0
}
