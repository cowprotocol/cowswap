import type { BuildCreateOrderParams } from './buildCreateOrderInstructions'
import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'
import type { Connection } from '@solana/web3.js'

// validTo is intentionally not part of the context: like the EVM flow, it is
// computed just before sending so the deadline is relative to the send time.
export interface SolanaOrderFlowContext extends Omit<BuildCreateOrderParams, 'validTo'> {
  connection: Connection
  walletProvider: SolanaProvider
  /** Limit-orders settings: fixed deadline (unix seconds) when the user picked a custom date */
  customDeadlineTimestamp: number | null
  /** Limit-orders settings: relative deadline duration */
  deadlineMilliseconds: number
}

export interface SolanaOrderFlowResult {
  signature: string
  /** hex-encoded 32-byte order UID */
  orderUid: string
  /** base58 order PDA address */
  orderPda: string
}
