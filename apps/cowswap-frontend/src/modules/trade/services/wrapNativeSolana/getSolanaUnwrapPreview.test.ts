/**
 * Program-address derivation needs a working ed25519 curve check, and `PublicKey.isOnCurve` misreports
 * every point as on-curve under jsdom — which makes `findProgramAddressSync` exhaust all 255 bumps.
 * @jest-environment node
 */
import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import { Connection, PublicKey } from '@solana/web3.js'

import { getSolanaUnwrapPreview } from './getSolanaUnwrapPreview'

const OWNER = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')
const SOL = NATIVE_CURRENCIES[SupportedChainId.SOLANA]

function createConnection({
  wsolBalance,
  rentExemptLamports = 9_000,
  accountExists = true,
}: {
  wsolBalance?: string
  rentExemptLamports?: number
  accountExists?: boolean
}): Connection {
  return {
    // `readWsolBalance` checks existence first: a closed/never-created account has no lamports at all,
    // as opposed to a token account balance of zero.
    getAccountInfo: jest.fn().mockResolvedValue(accountExists ? {} : null),
    getTokenAccountBalance: jest.fn().mockResolvedValue({ value: { amount: wsolBalance } }),
    getMinimumBalanceForRentExemption: jest.fn().mockResolvedValue(rentExemptLamports),
  } as unknown as Connection
}

describe('getSolanaUnwrapPreview', () => {
  it('adds the rent-exempt reserve when unwrapping the entire WSOL balance', async () => {
    const connection = createConnection({ wsolBalance: '1000', rentExemptLamports: 9_000 })

    const preview = await getSolanaUnwrapPreview(connection, OWNER, 1_000n)

    expect(preview.wsolBalance).toBe(1_000n)
    expect(preview.receiveAmount).toEqual(CurrencyAmount.fromRawAmount(SOL, 10_000n))
  })

  it('does not add the rent-exempt reserve when a remainder stays wrapped', async () => {
    const connection = createConnection({ wsolBalance: '1000', rentExemptLamports: 9_000 })

    const preview = await getSolanaUnwrapPreview(connection, OWNER, 400n)

    expect(preview.receiveAmount).toEqual(CurrencyAmount.fromRawAmount(SOL, 400n))
  })

  it('treats a missing associated token account as a zero balance, without reading its balance', async () => {
    const connection = createConnection({ accountExists: false, rentExemptLamports: 0 })

    const preview = await getSolanaUnwrapPreview(connection, OWNER, 0n)

    expect(preview.wsolBalance).toBe(0n)
    expect(preview.receiveAmount).toEqual(CurrencyAmount.fromRawAmount(SOL, 0n))
    expect(connection.getTokenAccountBalance).not.toHaveBeenCalled()
  })
})
