import { ChainId, CurrencyAmount, Token } from '@uniswap/sdk'
import { isAddress, shortenAddress } from '@src/utils'
import { AddPendingOrderParams, OrderStatus, OrderKind } from 'state/orders/actions'

import { SigningScheme, signOrder, UnsignedOrder } from 'utils/signatures'
import { postSignedOrder } from 'utils/operator'
import { ethers, BigNumberish, Signer } from 'ethers'
import { APP_ID, RADIX_DECIMAL, SHORTEST_PRECISION } from 'constants/index'
import { EcdsaSignature } from '@gnosis.pm/gp-v2-contracts'

const SIGNING_SCHEME = SigningScheme.EIP712

export interface PostOrderParams {
  account: string
  chainId: ChainId
  signer: Signer
  kind: OrderKind
  inputAmount: CurrencyAmount
  adjustedInputAmount: CurrencyAmount
  outputAmount: CurrencyAmount
  adjustedOutputAmount: CurrencyAmount
  feeAmount: BigNumberish
  sellToken: Token
  buyToken: Token
  validTo: number
  recipient: string
  recipientAddressOrName: string | null
  addPendingOrder: (order: AddPendingOrderParams) => void
}

function _getSummary(params: PostOrderParams): string {
  const { kind, inputAmount, adjustedOutputAmount, account, recipient, recipientAddressOrName } = params

  const [inputQuantifier, outputQuantifier] = [kind === 'buy' ? 'at most' : '', kind === 'sell' ? 'at least' : '']
  const inputSymbol = inputAmount.currency.symbol
  const outputSymbol = adjustedOutputAmount.currency.symbol
  const inputAmountValue = inputAmount.toSignificant(SHORTEST_PRECISION)
  const outputAmountValue = adjustedOutputAmount.toSignificant(SHORTEST_PRECISION)

  const base = `Swap ${inputQuantifier} ${inputAmountValue} ${inputSymbol} for ${outputQuantifier} ${outputAmountValue} ${outputSymbol}`

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
  const {
    kind,
    addPendingOrder,
    chainId,
    // fee adjusted input
    adjustedInputAmount,
    // slippage output
    adjustedOutputAmount,
    sellToken,
    buyToken,
    feeAmount,
    validTo,
    account,
    signer,
    recipient
  } = params

  // fee adjusted input amount
  const sellAmount = adjustedInputAmount.raw.toString(RADIX_DECIMAL)
  // slippage adjusted output amount
  const buyAmount = adjustedOutputAmount.raw.toString(RADIX_DECIMAL)

  // Prepare order
  const summary = _getSummary(params)
  const appData = '0x' + APP_ID.toString(16).padStart(64, '0')
  const receiver = recipient === account ? ethers.constants.AddressZero : recipient

  const unsignedOrder: UnsignedOrder = {
    sellToken: sellToken.address,
    buyToken: buyToken.address,
    sellAmount,
    buyAmount,
    validTo,
    appData,
    feeAmount,
    kind,
    receiver,
    partiallyFillable: false // Always fill or kill
  }

  const signature = (await signOrder({
    chainId,
    signer,
    order: unsignedOrder,
    signingScheme: SIGNING_SCHEME
  })) as EcdsaSignature // Only ECDSA signing supported for now

  const signatureData = signature.data.toString()
  const creationTime = new Date().toISOString()

  // Call API
  const orderId = await postSignedOrder({
    chainId,
    order: {
      ...unsignedOrder,
      signature: signatureData,
      receiver,
      signingScheme: SIGNING_SCHEME
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
      signature: signatureData,
      status: OrderStatus.PENDING,
      summary,
      inputToken: sellToken,
      outputToken: buyToken
    }
  })

  return orderId
}
