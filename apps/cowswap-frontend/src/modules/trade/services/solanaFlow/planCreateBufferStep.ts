import { getIsNativeToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { buildCreateBufferInstruction, findBufferPda, type SolanaQuote } from '@cowprotocol/sdk-trading-solana'

import { t } from '@lingui/core/macro'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

import { SolanaFlowStep } from './types'

export interface PlanCreateBufferStepParams {
  /**
   * Always the owner, never the sponsor: a mint can be crafted so its buffer is unrecoverable, and
   * subsidising that rent would be an attack on the protocol.
   */
  payer: PublicKey
  quote: Pick<SolanaQuote, 'intent' | 'buyTokenProgramId' | 'programId'>
  buySymbol: string
}

/**
 * Settlement pays an order's buy side out of the buy mint's buffer, and a missing one is created by
 * whichever solver gets there first. Creating it here instead means the order is settleable the moment
 * it lands. Idempotent on-chain, so an existing buffer costs compute rather than an RPC check.
 *
 * Returns `null` for a native-SOL buy: those are paid as lamports straight from the settlement state
 * PDA, so no buffer exists — and the sentinel is not a mint to open a token account for.
 */
export function planCreateBufferStep({ payer, quote, buySymbol }: PlanCreateBufferStepParams): SolanaFlowStep | null {
  const { intent, buyTokenProgramId, programId } = quote

  if (getIsNativeToken(SupportedChainId.SOLANA, intent.buyMint.toBase58())) {
    return null
  }

  const [bufferPda] = findBufferPda(programId, intent.buyMint)

  return {
    instructions: [
      buildCreateBufferInstruction({
        programId,
        payer,
        tokenProgram: buyTokenProgramId ?? TOKEN_PROGRAM_ID,
        buffers: [{ bufferPda, mint: intent.buyMint }],
      }),
    ],
    summary: t`Create ${buySymbol} buffer`,
  }
}
