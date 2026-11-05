/**
 * @jest-environment node
 */
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID, TokenOwnerOffCurveError } from '@solana/spl-token'
import { Keypair, PublicKey } from '@solana/web3.js'

import { deriveSolanaAta } from './deriveSolanaAta'

const MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')

const [OFF_CURVE_OWNER] = PublicKey.findProgramAddressSync([Buffer.from('vault')], TOKEN_2022_PROGRAM_ID)

describe('deriveSolanaAta', () => {
  it('derives for an off-curve owner, which a multisig vault always is', () => {
    expect(PublicKey.isOnCurve(OFF_CURVE_OWNER.toBytes())).toBe(false)
    expect(() => getAssociatedTokenAddressSync(MINT, OFF_CURVE_OWNER)).toThrow(TokenOwnerOffCurveError)

    expect(deriveSolanaAta(MINT, OFF_CURVE_OWNER).toBase58()).toBe(
      getAssociatedTokenAddressSync(MINT, OFF_CURVE_OWNER, true).toBase58(),
    )
  })

  it('matches the default derivation for an ordinary keypair owner', () => {
    const owner = Keypair.generate().publicKey

    expect(deriveSolanaAta(MINT, owner).toBase58()).toBe(getAssociatedTokenAddressSync(MINT, owner).toBase58())
  })

  it('passes the token program through', () => {
    expect(deriveSolanaAta(MINT, OFF_CURVE_OWNER, TOKEN_2022_PROGRAM_ID).toBase58()).toBe(
      getAssociatedTokenAddressSync(MINT, OFF_CURVE_OWNER, true, TOKEN_2022_PROGRAM_ID).toBase58(),
    )
  })
})
