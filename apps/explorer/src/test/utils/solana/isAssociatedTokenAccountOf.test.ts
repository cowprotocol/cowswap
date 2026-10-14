/**
 * Derivation hashes through SubtleCrypto, which jsdom does not implement.
 * @jest-environment node
 */
import { isAssociatedTokenAccountOf } from '../../../utils/solana/isAssociatedTokenAccountOf'

const OWNER = '2c1E71jPXqgM8nJXiQpCEwGhXSVA8GTN4a1qTS1ibyLa'
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const USDC_ACCOUNT = 'HGTu6fBshWXJQe59C31RgyGcfhEusg1Y65Upcmd9zvCM'
const WSOL_MINT = 'So11111111111111111111111111111111111111112'
const WSOL_ACCOUNT = 'G5F2C2cdSnnx63Bf48xjJBxKfQqV2XKMwWo3JyuC4kWt'
/** Same owner and mint as `USDC_ACCOUNT`, derived through the Token-2022 program instead. */
const USDC_2022_ACCOUNT = 'GVgax4N3fu3XjMoyEdKf8senSxcfBCFpt67i1hLzQ5HU'

describe('isAssociatedTokenAccountOf', () => {
  it.each([
    ['USDC', USDC_ACCOUNT, USDC_MINT],
    ['wSOL', WSOL_ACCOUNT, WSOL_MINT],
    ['Token-2022 USDC', USDC_2022_ACCOUNT, USDC_MINT],
  ])('matches the owner own %s account', async (_symbol, tokenAccount, mint) => {
    expect(await isAssociatedTokenAccountOf(tokenAccount, OWNER, mint)).toBe(true)
  })

  it('does not match the account of another mint', async () => {
    expect(await isAssociatedTokenAccountOf(USDC_ACCOUNT, OWNER, WSOL_MINT)).toBe(false)
  })

  it('does not match the account of another owner', async () => {
    expect(await isAssociatedTokenAccountOf(USDC_ACCOUNT, WSOL_ACCOUNT, USDC_MINT)).toBe(false)
  })

  // Native SOL has no mint account, and the book reports it as the system program.
  it('returns false for a mint that is not a token mint', async () => {
    expect(await isAssociatedTokenAccountOf(USDC_ACCOUNT, OWNER, '11111111111111111111111111111111')).toBe(false)
  })

  it('returns false rather than throwing on an address that is not a pubkey', async () => {
    expect(
      await isAssociatedTokenAccountOf(USDC_ACCOUNT, '0x5b0abe214ab7875562adee331deff0fe1912fe42', USDC_MINT),
    ).toBe(false)
  })
})
