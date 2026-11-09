/**
 * @jest-environment node
 */
import { Keypair, PublicKey } from '@solana/web3.js'

import { getIsSolanaSmartContractWallet } from './getIsSolanaSmartContractWallet'

const SQUADS_PROGRAM_ID = new PublicKey('SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf')

// A Squads vault, derived the way the program does: ["multisig", <multisig>, "vault", <index>].
const VAULT = PublicKey.findProgramAddressSync(
  [Buffer.from('multisig'), Keypair.generate().publicKey.toBuffer(), Buffer.from('vault'), Buffer.from([0])],
  SQUADS_PROGRAM_ID,
)[0]

describe('getIsSolanaSmartContractWallet', () => {
  it('is false for an ordinary keypair owner', () => {
    expect(getIsSolanaSmartContractWallet(Keypair.generate().publicKey)).toBe(false)
  })

  it('is true for a program-derived address such as a multisig vault', () => {
    expect(getIsSolanaSmartContractWallet(VAULT)).toBe(true)
  })

  it('accepts the base58 form as well as a PublicKey', () => {
    const keypair = Keypair.generate().publicKey

    expect(getIsSolanaSmartContractWallet(keypair.toBase58())).toBe(false)
    expect(getIsSolanaSmartContractWallet(VAULT.toBase58())).toBe(true)
  })

  /**
   * `useWalletInfo` sourced the chain id and the account separately, so restoring a Solana session left an
   * EVM account paired with a Solana chain id for a render or two. `isOnCurve` threw `Non-base58 character`
   * on it from inside render, and the error boundary turned the app into "Something went wrong".
   */
  it.each([
    ['an EVM address', '0x9FA3c00a92Ec5f96B1Ad2527ab41B3932EFEDa58'],
    ['a non-base58 string', 'ergerger2'],
    ['too few bytes to be a key', 'ff'],
    ['an empty string', ''],
  ])('is false rather than throwing for %s', (_label, owner) => {
    expect(getIsSolanaSmartContractWallet(owner)).toBe(false)
  })
})
