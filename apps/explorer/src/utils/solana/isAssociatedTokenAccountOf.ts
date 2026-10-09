import { AddressKey } from '@cowprotocol/cow-sdk'

import { address, getAddressEncoder, getProgramDerivedAddress } from '@solana/kit'

const ASSOCIATED_TOKEN_PROGRAM = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
const TOKEN_PROGRAMS = ['TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb']

const addressEncoder = getAddressEncoder()

/**
 * Whether `tokenAccount` is the account `(owner, mint)` derives to. Answers who an order pays out to
 * while its token account is still unallocated, which no amount of reading the chain can.
 *
 * Only a fallback: derivation says who the account *was* created for, and an existing account's
 * ownership may since have been transferred elsewhere. Prefer the owner read off the account.
 *
 * Both token programs are tried — the order book does not say which one a mint belongs to, and each
 * derives a different address for the same pair.
 */
export async function isAssociatedTokenAccountOf(
  tokenAccount: AddressKey,
  owner: AddressKey,
  mint: AddressKey,
): Promise<boolean> {
  try {
    const seedOwner = addressEncoder.encode(address(owner))
    const seedMint = addressEncoder.encode(address(mint))
    const expected = address(tokenAccount)

    const derived = await Promise.all(
      TOKEN_PROGRAMS.map(async (tokenProgram) => {
        const [derivedAddress] = await getProgramDerivedAddress({
          programAddress: address(ASSOCIATED_TOKEN_PROGRAM),
          seeds: [seedOwner, addressEncoder.encode(address(tokenProgram)), seedMint],
        })

        return derivedAddress
      }),
    )

    return derived.includes(expected)
  } catch {
    // Not a pubkey — an EVM address, or a mint the book reports as native SOL. Derivation also needs
    // SubtleCrypto, which a page served outside a secure context does not get.
    return false
  }
}
