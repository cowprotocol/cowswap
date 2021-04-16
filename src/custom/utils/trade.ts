import { ChainId, CurrencyAmount, Token } from '@uniswap/sdk'
import { isAddress, shortenAddress } from '@src/utils'
import { AddPendingOrderParams, OrderStatus, OrderKind } from 'state/orders/actions'

import { SigningScheme, signOrder, SignOrderParams, UnsignedOrder } from 'utils/signatures'
import { postSignedOrder } from 'utils/operator'
import { Signer } from 'ethers'
import { APP_ID, RADIX_DECIMAL, SHORTEST_PRECISION } from 'constants/index'
import { EcdsaSignature, Signature } from '@gnosis.pm/gp-v2-contracts'

const DEFAULT_SIGNING_SCHEME = SigningScheme.EIP712
const METAMASK_SIGNATURE_ERROR_CODE = -32603

export interface PostOrderParams {
  account: string
  chainId: ChainId
  signer: Signer
  kind: OrderKind
  inputAmount: CurrencyAmount
  outputAmount: CurrencyAmount
  feeAmount: CurrencyAmount | undefined
  sellToken: Token
  buyToken: Token
  validTo: number
  recipient: string
  recipientAddressOrName: string | null
  addPendingOrder: (order: AddPendingOrderParams) => void
}

function _getSummary(params: PostOrderParams): string {
  const { kind, account, inputAmount, outputAmount, recipient, recipientAddressOrName, feeAmount } = params

  const [inputQuantifier, outputQuantifier] = [kind === 'buy' ? 'at most' : '', kind === 'sell' ? 'at least' : '']
  const inputSymbol = inputAmount.currency.symbol
  const outputSymbol = outputAmount.currency.symbol
  const inputAmountValue = (feeAmount ? inputAmount.add(feeAmount) : inputAmount).toSignificant(SHORTEST_PRECISION)
  const outputAmountValue = outputAmount.toSignificant(SHORTEST_PRECISION)

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
    inputAmount,
    outputAmount,
    sellToken,
    buyToken,
    feeAmount,
    validTo,
    account,
    signer,
    recipient
  } = params

  // fee adjusted input amount
  const sellAmount = inputAmount.raw.toString(RADIX_DECIMAL)
  // slippage adjusted output amount
  const buyAmount = outputAmount.raw.toString(RADIX_DECIMAL)

  // Prepare order
  const summary = _getSummary(params)
  const appData = '0x' + APP_ID.toString(16).padStart(64, '0')
  const receiver = recipient

  const unsignedOrder: UnsignedOrder = {
    sellToken: sellToken.address,
    buyToken: buyToken.address,
    sellAmount,
    buyAmount,
    validTo,
    appData,
    feeAmount: feeAmount?.raw.toString() || '0',
    kind,
    receiver,
    partiallyFillable: false // Always fill or kill
  }

  let signature: Signature | null = null
  let signingScheme = DEFAULT_SIGNING_SCHEME

  const signatureParams: SignOrderParams = {
    chainId,
    signer,
    order: unsignedOrder,
    signingScheme
  }

  try {
    signature = (await signOrder(signatureParams)) as EcdsaSignature // Only ECDSA signing supported for now
  } catch (e) {
    if (e.code === METAMASK_SIGNATURE_ERROR_CODE) {
      // We tried to sign order the nice way.
      // That works fine for regular MM addresses. Does not work for Hardware wallets, though.
      // See https://github.com/MetaMask/metamask-extension/issues/10240#issuecomment-810552020
      // So, when that specific error occurs, we know this is a problem with MM + HW.
      // Then, we fallback to ETHSIGN.
      signingScheme = SigningScheme.ETHSIGN
      signature = (await signOrder({ ...signatureParams, signingScheme })) as EcdsaSignature // Only ECDSA signing supported for now
    } else {
      // Some other error signing. Let it bubble up.
      console.error(e)
      throw e
    }
  }

  const signatureData = signature.data.toString()
  const creationTime = new Date().toISOString()

  // Call API
  const orderId = await postSignedOrder({
    chainId,
    order: {
      ...unsignedOrder,
      signature: signatureData,
      receiver,
      signingScheme
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
