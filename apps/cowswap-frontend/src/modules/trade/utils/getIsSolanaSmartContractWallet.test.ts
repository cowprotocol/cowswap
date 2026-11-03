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
})
