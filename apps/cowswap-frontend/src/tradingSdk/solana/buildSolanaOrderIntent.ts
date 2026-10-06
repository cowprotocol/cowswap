import { hexToBytes, isHex } from 'viem'

import { WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { encodeOrderIntent, hashOrderIntent, SolanaOrderIntent, toOrderId } from '@cowprotocol/sdk-trading-solana'

import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

import { BaseOrder } from 'legacy/state/orders/actions'

const APP_DATA_BYTES = 32
const TOKEN_PROGRAMS = [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID]
const WSOL_MINT = new PublicKey(WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SOLANA].address)

export type SolanaIntentOrder = Pick<
  BaseOrder,
  | 'id'
  | 'owner'
  | 'receiver'
  | 'sellToken'
  | 'buyToken'
  | 'sellAmount'
  | 'buyAmount'
  | 'validTo'
  | 'kind'
  | 'partiallyFillable'
  | 'appData'
>

/**
 * Rebuilds the intent the order was created with, so `CancelOrder` can create the order PDA already
 * cancelled when the creation transaction hasn't landed yet (without it, cancelling reverts).
 * The token programs of both ATAs aren't stored with the order, so every combination is tried and only
 * the one hashing to the order id is kept. Returns undefined when none does.
 */
export async function buildSolanaOrderIntent(order: SolanaIntentOrder): Promise<SolanaOrderIntent | undefined> {
  const { appData } = order

  if (!isHex(appData) || hexToBytes(appData).length !== APP_DATA_BYTES) return undefined

  const owner = new PublicKey(order.owner)
  const receiver = order.receiver ? new PublicKey(order.receiver) : owner
  const sellMint = getIsNativeToken(SupportedChainId.SOLANA, order.sellToken)
    ? WSOL_MINT
    : new PublicKey(order.sellToken)
  const buyMint = new PublicKey(order.buyToken)
  const isNativeBuy = getIsNativeToken(SupportedChainId.SOLANA, order.buyToken)

  const baseIntent = {
    owner,
    sellMint,
    buyMint,
    sellAmount: BigInt(order.sellAmount),
    buyAmount: BigInt(order.buyAmount),
    validTo: order.validTo,
    kind: order.kind,
    partiallyFillable: order.partiallyFillable,
    createdOnChain: true,
    appData: hexToBytes(appData),
  }

  for (const sellTokenProgram of TOKEN_PROGRAMS) {
    for (const buyTokenProgram of isNativeBuy ? [TOKEN_PROGRAM_ID] : TOKEN_PROGRAMS) {
      const intent: SolanaOrderIntent = {
        ...baseIntent,
        sellTokenAccount: getAssociatedTokenAddressSync(sellMint, owner, false, sellTokenProgram),
        buyTokenAccount: isNativeBuy
          ? receiver
          : getAssociatedTokenAddressSync(buyMint, receiver, false, buyTokenProgram),
      }

      const uid = await hashOrderIntent(encodeOrderIntent(intent))

      if (toOrderId(uid) === order.id) return intent
    }
  }

  return undefined
}
