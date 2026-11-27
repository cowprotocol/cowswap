/**
 * Derivation hashes through SubtleCrypto, which jsdom does not implement.
 * @jest-environment node
 */
import { getTokenAccountOwner } from '../../../api/solanaOrderbook/getTokenAccountOwner'
import { resolveOwner } from '../../../hooks/solana/useSolanaTokenAccountOwner'

jest.mock('../../../api/solanaOrderbook/getTokenAccountOwner', () => ({
  getTokenAccountOwner: jest.fn(),
}))

const getTokenAccountOwnerMock = getTokenAccountOwner as jest.MockedFunction<typeof getTokenAccountOwner>

const OWNER = '2c1E71jPXqgM8nJXiQpCEwGhXSVA8GTN4a1qTS1ibyLa'
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
/** `ATA(OWNER, USDC_MINT)`. */
const OWN_ACCOUNT = 'HGTu6fBshWXJQe59C31RgyGcfhEusg1Y65Upcmd9zvCM'
const SOMEONE_ELSES_ACCOUNT = '3de7xiRK7hV6jnu5B1m9nLHdt7iPUunJoSxsZb1fSf35'
const NATIVE_SOL = '11111111111111111111111111111111'
/** A receiver other than the order owner, as the book reports one that placement named. */
const RECEIVER_WALLET = 'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC86PZ8okm21hy'

describe('resolveOwner', () => {
  beforeEach(() => {
    getTokenAccountOwnerMock.mockReset()
  })

  // A native SOL buy is credited as lamports, so the book names the wallet, not a token account.
  it('takes the receiver as the recipient when it is the order owner, without reading the chain', async () => {
    expect(await resolveOwner({ tokenAccount: OWNER, orderOwner: OWNER, buyMint: NATIVE_SOL })).toBe(OWNER)
    expect(getTokenAccountOwnerMock).not.toHaveBeenCalled()
  })

  it('prefers the owner read off the account', async () => {
    getTokenAccountOwnerMock.mockResolvedValueOnce(SOMEONE_ELSES_ACCOUNT)

    expect(await resolveOwner({ tokenAccount: OWN_ACCOUNT, orderOwner: OWNER, buyMint: USDC_MINT })).toBe(
      SOMEONE_ELSES_ACCOUNT,
    )
  })

  it('derives when the account is unallocated and is the order owner own', async () => {
    getTokenAccountOwnerMock.mockResolvedValueOnce(null)

    expect(await resolveOwner({ tokenAccount: OWN_ACCOUNT, orderOwner: OWNER, buyMint: USDC_MINT })).toBe(OWNER)
  })

  it('resolves nothing when an unallocated account is not the order owner own', async () => {
    getTokenAccountOwnerMock.mockResolvedValueOnce(null)

    expect(
      await resolveOwner({ tokenAccount: SOMEONE_ELSES_ACCOUNT, orderOwner: OWNER, buyMint: USDC_MINT }),
    ).toBeNull()
  })

  it('takes the receiver the book named for a native SOL buy, without reading the chain', async () => {
    expect(
      await resolveOwner({
        tokenAccount: RECEIVER_WALLET,
        orderOwner: OWNER,
        buyMint: NATIVE_SOL,
        receiverWallet: RECEIVER_WALLET,
      }),
    ).toBe(RECEIVER_WALLET)
    expect(getTokenAccountOwnerMock).not.toHaveBeenCalled()
  })

  // The case derivation cannot answer: the account belongs to nobody yet, and deriving only ever
  // finds the order owner's own.
  it('names the wallet the book reported when the account is unallocated', async () => {
    getTokenAccountOwnerMock.mockResolvedValueOnce(null)

    expect(
      await resolveOwner({
        tokenAccount: SOMEONE_ELSES_ACCOUNT,
        orderOwner: OWNER,
        buyMint: USDC_MINT,
        receiverWallet: RECEIVER_WALLET,
      }),
    ).toBe(RECEIVER_WALLET)
  })

  it('still prefers the owner read off the account over the wallet the book reported', async () => {
    getTokenAccountOwnerMock.mockResolvedValueOnce(OWNER)

    expect(
      await resolveOwner({
        tokenAccount: SOMEONE_ELSES_ACCOUNT,
        orderOwner: OWNER,
        buyMint: USDC_MINT,
        receiverWallet: RECEIVER_WALLET,
      }),
    ).toBe(OWNER)
  })

  // An account that exists may have been transferred away from the owner it was derived for, and a
  // failed read cannot rule that out — so it must not fall through to the derivation.
  it('rejects rather than deriving when the read fails', async () => {
    getTokenAccountOwnerMock.mockRejectedValueOnce(new Error('Solana RPC getAccountInfo responded 503'))

    await expect(resolveOwner({ tokenAccount: OWN_ACCOUNT, orderOwner: OWNER, buyMint: USDC_MINT })).rejects.toThrow(
      '503',
    )
  })
})
