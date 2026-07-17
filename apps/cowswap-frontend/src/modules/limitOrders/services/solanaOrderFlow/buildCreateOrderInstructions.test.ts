/**
 * @jest-environment node
 *
 * web3.js/spl-token address derivation is unreliable under jsdom; the Solana balance tests in
 * libs/balances-and-allowances use the node environment for the same reason.
 */
import { OrderKind } from '@cowprotocol/cow-sdk'

import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { SystemProgram } from '@solana/web3.js'

import { buildCreateOrderInstructions } from './buildCreateOrderInstructions'
import { SOLANA_SETTLEMENT_PROGRAM_ID } from './const'

// Reconstructs the order of mainnet tx
// 4hy8scaTfLNyJiAPbF47k4YWyWmE2CFfvLj6zkTUibpknEcNfjWWDyCT185qDbRYYLMtdDzGkVtuNXJEE2oXE6JG
// (buy 10 USDC paying with WSOL, fill-or-kill)
const PARAMS = {
  account: '54o2XBzBTkP7tmQSLu3Um9oDvLdNVrbMyQxqiYVKALLN',
  sellToken: { address: 'So11111111111111111111111111111111111111112', isToken2022: false }, // WSOL
  buyToken: { address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', isToken2022: false }, // USDC
  sellAmount: 0n,
  buyAmount: 10_000_000n,
  validTo: 1783575524,
  kind: OrderKind.BUY,
  partiallyFillable: false,
}

describe('buildCreateOrderInstructions', () => {
  it('derives the same accounts and instructions as the mainnet example tx', () => {
    const { instructions, orderPda, sellTokenAccount, buyTokenAccount } = buildCreateOrderInstructions(PARAMS)

    // ATAs of the owner, as seen on-chain
    expect(sellTokenAccount.toBase58()).toBe('cEDc7aAMaCqBX546QWCVxnvfMLUUV3JETQ6qnpeLUaY')
    expect(buyTokenAccount.toBase58()).toBe('E9xwK5SDXSJLW1A4WRyVT1FzVpt8gREGMVibVW9A8xX5')
    expect(orderPda.toBase58()).toBe('AmtUsUoFuGtRpxeQnQEFR83xyeqTrPH8Z4y9twso26Lv')

    expect(instructions).toHaveLength(3)
    const [createBuyAta, approve, createOrder] = instructions

    // buy ATA idempotent creation: account 1 is the ATA being created
    expect(createBuyAta.keys[1].pubkey.equals(buyTokenAccount)).toBe(true)

    // approve: keys are [source token account, delegate, owner]; delegate is the settlement state PDA
    expect(approve.programId.equals(TOKEN_PROGRAM_ID)).toBe(true)
    expect(approve.keys[0].pubkey.equals(sellTokenAccount)).toBe(true)
    expect(approve.keys[1].pubkey.toBase58()).toBe('3PYmNPBdoFBGqtAeopGMS5YvnQnfxh8J9sNS3jjzKhb8')

    // createOrder data: [discriminator=2, ...150 intent bytes]
    expect(createOrder.programId.equals(SOLANA_SETTLEMENT_PROGRAM_ID)).toBe(true)
    expect(createOrder.data).toHaveLength(151)
    expect(createOrder.data[0]).toBe(2)

    // createOrder accounts: owner (signer, ro), created_by = owner (signer, writable),
    // order PDA (writable), system program (ro)
    expect(createOrder.keys).toHaveLength(4)
    expect(createOrder.keys[0].pubkey.toBase58()).toBe(PARAMS.account)
    expect(createOrder.keys[0].isSigner).toBe(true)
    expect(createOrder.keys[0].isWritable).toBe(false)
    expect(createOrder.keys[1].pubkey.toBase58()).toBe(PARAMS.account)
    expect(createOrder.keys[1].isSigner).toBe(true)
    expect(createOrder.keys[1].isWritable).toBe(true)
    expect(createOrder.keys[2].pubkey.equals(orderPda)).toBe(true)
    expect(createOrder.keys[2].isSigner).toBe(false)
    expect(createOrder.keys[2].isWritable).toBe(true)
    expect(createOrder.keys[3].pubkey.equals(SystemProgram.programId)).toBe(true)
    expect(createOrder.keys[3].isSigner).toBe(false)
    expect(createOrder.keys[3].isWritable).toBe(false)
  })
})
