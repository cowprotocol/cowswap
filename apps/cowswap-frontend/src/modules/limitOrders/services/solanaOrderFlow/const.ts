import { PublicKey } from '@solana/web3.js'

// CoW Protocol settlement program on Solana mainnet
// https://github.com/cowprotocol/solana-programs
export const SOLANA_SETTLEMENT_PROGRAM_ID = new PublicKey('moosEjJg5mbGRPRU7Vg4AaHZLvbbgknevWR9J1bNgME')

// PDA seed scheme: every PDA starts with SETTLEMENT_SEED; order PDAs append the order UID and ORDER_SEED
export const SETTLEMENT_SEED = new TextEncoder().encode('settlement')
export const ORDER_SEED = new TextEncoder().encode('order')

export const CREATE_ORDER_DISCRIMINATOR = 2
export const ORDER_INTENT_SIZE = 150

// Opaque 32 bytes; the settlement program does not interpret them. Zeroed for the prototype.
export const SOLANA_APP_DATA = new Uint8Array(32)

export const SOLSCAN_TX_URL = 'https://solscan.io/tx/'
