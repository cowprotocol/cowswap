import { OrderKind } from '@cowprotocol/cow-sdk'

import {
  createApproveInstruction,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js'

import { CREATE_ORDER_DISCRIMINATOR, SOLANA_APP_DATA, SOLANA_SETTLEMENT_PROGRAM_ID } from './const'
import { computeOrderUid, encodeOrderIntent, findOrderPda, findStatePda } from './orderIntent'

export interface BuildCreateOrderParams {
  /** base58 wallet address: order owner, rent payer and fee payer */
  account: string
  sellToken: SolanaTokenParams
  buyToken: SolanaTokenParams
  sellAmount: bigint
  buyAmount: bigint
  /** Unix timestamp (seconds) */
  validTo: number
  kind: OrderKind
  partiallyFillable: boolean
}

export interface CreateOrderInstructions {
  instructions: TransactionInstruction[]
  orderUid: Uint8Array
  orderPda: PublicKey
  sellTokenAccount: PublicKey
  buyTokenAccount: PublicKey
}

export interface SolanaTokenParams {
  /** base58 mint address */
  address: string
  /** Token-2022 mints live under a different token program (see TOKEN_2022_TAG in the token lists) */
  isToken2022: boolean
}

export function buildCreateOrderInstructions(params: BuildCreateOrderParams): CreateOrderInstructions {
  const owner = new PublicKey(params.account)
  const sellMint = new PublicKey(params.sellToken.address)
  const buyMint = new PublicKey(params.buyToken.address)
  const sellTokenProgram = params.sellToken.isToken2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID
  const buyTokenProgram = params.buyToken.isToken2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID

  const sellTokenAccount = getAssociatedTokenAddressSync(sellMint, owner, false, sellTokenProgram)
  const buyTokenAccount = getAssociatedTokenAddressSync(buyMint, owner, false, buyTokenProgram)

  // The buy-side token account must exist for the order to be settleable
  const createBuyAta = createAssociatedTokenAccountIdempotentInstruction(
    owner,
    buyTokenAccount,
    owner,
    buyMint,
    buyTokenProgram,
  )

  // The settlement state PDA pulls the sell funds via SPL delegation at execution time.
  // NOTE (accepted prototype limitation): SPL token accounts have a single delegate,
  // so a second order on the same sell token overwrites the previous delegated amount.
  const approve = createApproveInstruction(
    sellTokenAccount,
    findStatePda(),
    owner,
    params.sellAmount,
    [],
    sellTokenProgram,
  )

  const intentBytes = encodeOrderIntent({
    owner,
    buyTokenAccount,
    sellTokenAccount,
    sellAmount: params.sellAmount,
    buyAmount: params.buyAmount,
    validTo: params.validTo,
    kind: params.kind,
    partiallyFillable: params.partiallyFillable,
    appData: SOLANA_APP_DATA,
  })
  const orderUid = computeOrderUid(intentBytes)
  const orderPda = findOrderPda(orderUid)

  const data = Buffer.alloc(1 + intentBytes.length)
  data[0] = CREATE_ORDER_DISCRIMINATOR
  data.set(intentBytes, 1)

  const createOrder = new TransactionInstruction({
    programId: SOLANA_SETTLEMENT_PROGRAM_ID,
    keys: [
      // owner: authenticates the order
      { pubkey: owner, isSigner: true, isWritable: false },
      // created_by: funds the order PDA's rent (same as owner here)
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: orderPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  })

  return {
    instructions: [createBuyAta, approve, createOrder],
    orderUid,
    orderPda,
    sellTokenAccount,
    buyTokenAccount,
  }
}
