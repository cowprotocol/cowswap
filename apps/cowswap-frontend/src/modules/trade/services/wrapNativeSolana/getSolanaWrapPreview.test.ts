/**
 * Program-address derivation needs a working ed25519 curve check, and `PublicKey.isOnCurve` misreports
 * every point as on-curve under jsdom — which makes `findProgramAddressSync` exhaust all 255 bumps.
 * @jest-environment node
 */
import { NATIVE_CURRENCIES, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import { Connection, PublicKey } from '@solana/web3.js'

import { getSolanaWrapPreview } from './getSolanaWrapPreview'

const OWNER = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')
const SOL = NATIVE_CURRENCIES[SupportedChainId.SOLANA]
const WSOL = WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SOLANA]

function createConnection({
  accountExists = true,
  rentExemptLamports = 9_000,
}: {
  accountExists?: boolean
  rentExemptLamports?: number
}): Connection {
  return {
    getAccountInfo: jest.fn().mockResolvedValue(accountExists ? {} : null),
    getMinimumBalanceForRentExemption: jest.fn().mockResolvedValue(rentExemptLamports),
  } as unknown as Connection
}

describe('getSolanaWrapPreview', () => {
  it('spends exactly the typed amount and receives it 1:1 when the account already exists', async () => {
    const connection = createConnection({ accountExists: true })

    const preview = await getSolanaWrapPreview(connection, OWNER, 500n)

    expect(preview.sendAmount).toEqual(CurrencyAmount.fromRawAmount(SOL, 500n))
    expect(preview.receiveAmount).toEqual(CurrencyAmount.fromRawAmount(WSOL, 500n))
    expect(preview.transferLamports).toBe(500n)
  })

  it('deducts the rent-exempt deposit from the received WSOL when the account does not exist yet, spending exactly the typed amount', async () => {
    const connection = createConnection({ accountExists: false, rentExemptLamports: 9_000 })

    const preview = await getSolanaWrapPreview(connection, OWNER, 10_000n)

    expect(preview.sendAmount).toEqual(CurrencyAmount.fromRawAmount(SOL, 10_000n))
    expect(preview.receiveAmount).toEqual(CurrencyAmount.fromRawAmount(WSOL, 1_000n))
    expect(preview.transferLamports).toBe(1_000n)
  })

  it('rejects an amount too small to cover a new account rent-exempt deposit', async () => {
    const connection = createConnection({ accountExists: false, rentExemptLamports: 9_000 })

    await expect(getSolanaWrapPreview(connection, OWNER, 500n)).rejects.toThrow(
      'Wrap amount is too small to cover the new account rent-exempt deposit',
    )
  })
})
