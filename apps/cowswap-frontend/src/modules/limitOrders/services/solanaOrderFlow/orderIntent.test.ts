/**
 * @jest-environment node
 *
 * web3.js's ed25519 PDA-derivation math (findProgramAddressSync) is unreliable under jsdom;
 * the Solana balance tests in libs/balances-and-allowances use the node environment for the
 * same reason.
 */
import { OrderKind } from '@cowprotocol/cow-sdk'

import { PublicKey } from '@solana/web3.js'

import { computeOrderUid, encodeOrderIntent, findOrderPda, findStatePda, SolanaOrderIntent } from './orderIntent'

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Mirrors `sample_intent(OrderKind::Buy, true)` from cowprotocol/solana-programs
// interface/src/data/intent.rs (tests `encoding_regression` and `uid_digest_regression`)
const RUST_SAMPLE_INTENT: SolanaOrderIntent = {
  owner: new PublicKey(new Uint8Array(32).fill(0x11)),
  buyTokenAccount: new PublicKey(new Uint8Array(32).fill(0x22)),
  sellTokenAccount: new PublicKey(new Uint8Array(32).fill(0x33)),
  sellAmount: 0x0123456789abcdefn,
  buyAmount: 0xfedcba9876543210n,
  validTo: 0xdeadbeef,
  kind: OrderKind.BUY,
  partiallyFillable: true,
  appData: new Uint8Array(32).fill(0x44),
}

const RUST_SAMPLE_ENCODING =
  '11'.repeat(32) + // owner
  '22'.repeat(32) + // buy_token_account
  '33'.repeat(32) + // sell_token_account
  'efcdab8967452301' + // sell_amount LE
  '1032547698badcfe' + // buy_amount LE
  'efbeadde' + // valid_to LE
  '01' + // kind: buy
  '01' + // partially_fillable: true
  '44'.repeat(32) // app_data

const RUST_SAMPLE_UID = '7ce7c6a74671090771fa33851387444064aca759ce55b80708723076722f5e00'

// Decoded from the raw CreateOrder instruction of mainnet tx
// 4hy8scaTfLNyJiAPbF47k4YWyWmE2CFfvLj6zkTUibpknEcNfjWWDyCT185qDbRYYLMtdDzGkVtuNXJEE2oXE6JG
const MAINNET_INTENT: SolanaOrderIntent = {
  owner: new PublicKey('54o2XBzBTkP7tmQSLu3Um9oDvLdNVrbMyQxqiYVKALLN'),
  buyTokenAccount: new PublicKey('E9xwK5SDXSJLW1A4WRyVT1FzVpt8gREGMVibVW9A8xX5'),
  sellTokenAccount: new PublicKey('cEDc7aAMaCqBX546QWCVxnvfMLUUV3JETQ6qnpeLUaY'),
  sellAmount: 0n,
  buyAmount: 10_000_000n,
  validTo: 1783575524,
  kind: OrderKind.BUY,
  partiallyFillable: false,
  appData: new Uint8Array(32),
}
const MAINNET_UID = 'f41a85a660c71b6fac30d024d29df733b8b101f931e30fbf8c37f5a0f2d42b2f'

describe('encodeOrderIntent', () => {
  it('produces 150 bytes', () => {
    expect(encodeOrderIntent(RUST_SAMPLE_INTENT)).toHaveLength(150)
  })

  it('matches the Rust encoding_regression vector', () => {
    expect(toHex(encodeOrderIntent(RUST_SAMPLE_INTENT))).toBe(RUST_SAMPLE_ENCODING)
  })

  it('encodes a sell fill-or-kill order with zero flag bytes', () => {
    const encoded = encodeOrderIntent({ ...RUST_SAMPLE_INTENT, kind: OrderKind.SELL, partiallyFillable: false })
    expect(encoded[116]).toBe(0)
    expect(encoded[117]).toBe(0)
  })
})

describe('computeOrderUid', () => {
  it('matches the Rust uid_digest_regression vector', () => {
    expect(toHex(computeOrderUid(encodeOrderIntent(RUST_SAMPLE_INTENT)))).toBe(RUST_SAMPLE_UID)
  })

  it('matches the mainnet example order UID', () => {
    expect(toHex(computeOrderUid(encodeOrderIntent(MAINNET_INTENT)))).toBe(MAINNET_UID)
  })
})

describe('PDA derivation', () => {
  it('derives the settlement state PDA seen as the approve delegate on mainnet', () => {
    expect(findStatePda().toBase58()).toBe('3PYmNPBdoFBGqtAeopGMS5YvnQnfxh8J9sNS3jjzKhb8')
  })

  it('derives the order PDA of the mainnet example order', () => {
    const uid = computeOrderUid(encodeOrderIntent(MAINNET_INTENT))
    expect(findOrderPda(uid).toBase58()).toBe('AmtUsUoFuGtRpxeQnQEFR83xyeqTrPH8Z4y9twso26Lv')
  })
})
