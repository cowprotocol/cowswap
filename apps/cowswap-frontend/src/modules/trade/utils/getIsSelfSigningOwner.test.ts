/**
 * @jest-environment node
 */
import { Keypair, PublicKey } from '@solana/web3.js'

import { getIsSelfSigningOwner } from './getIsSelfSigningOwner'

const SQUADS_PROGRAM_ID = new PublicKey('SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf')

// A Squads vault, derived the way the program does: ["multisig", <multisig>, "vault", <index>].
const VAULT = PublicKey.findProgramAddressSync(
  [Buffer.from('multisig'), Keypair.generate().publicKey.toBuffer(), Buffer.from('vault'), Buffer.from([0])],
  SQUADS_PROGRAM_ID,
)[0]

describe('getIsSelfSigningOwner', () => {
  it('is true for an ordinary keypair owner', () => {
    expect(getIsSelfSigningOwner(Keypair.generate().publicKey)).toBe(true)
  })

  it('is false for a program-derived address such as a multisig vault', () => {
    expect(getIsSelfSigningOwner(VAULT)).toBe(false)
  })

  it('accepts the base58 form as well as a PublicKey', () => {
    const keypair = Keypair.generate().publicKey

    expect(getIsSelfSigningOwner(keypair.toBase58())).toBe(true)
    expect(getIsSelfSigningOwner(VAULT.toBase58())).toBe(false)
  })
})
