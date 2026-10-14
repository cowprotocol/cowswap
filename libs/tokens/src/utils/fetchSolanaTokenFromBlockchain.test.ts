/**
 * @jest-environment node
 */
import { TOKEN_2022_TAG } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { AccountInfo, PublicKey } from '@solana/web3.js'

import { fetchSolanaTokenFromBlockchain } from './fetchSolanaTokenFromBlockchain'

const METAPLEX_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

// Mainnet account snapshots. PAID is a Token-2022 mint carrying its metadata in the mint's TLV extension.
const PAID_MINT = '98kfF7rmsg1QDUEoCqNE7g7M1FdrTt92TEp2CLzypump'
const PAID_MINT_DATA =
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAbdLf0nU6AwAGAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARIAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHjZ7UgLc4lfZtqqO3XEfXUagIrIUIpvxK34JqRe9tQvEwCYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeNntSAtziV9m2qo7dcR9dRqAishQim/ErfgmpF721C8EAAAAUGFpZAQAAABQQUlEQAAAAGh0dHBzOi8vbWV0YS51eGVudG8uaW8vZGF0YS9jNDg0OTlkZS0yMDk1LTQwMGMtYTAwYy00OWVjOGZiNTVkNDMAAAAA'

// BONK is a classic SPL mint whose metadata lives in a Metaplex account (truncated to the first 120 bytes).
const BONK_MINT = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'
const BONK_MINT_DATA =
  'AAAAAHlZUWfaSAxa4TRFAdIRt3NjQOP73wDs3mO2TciKzC8cfmA0tvPgHXoFAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=='
const BONK_METAPLEX_DATA =
  'BHlZUWfaSAxa4TRFAdIRt3NjQOP73wDs3mO2TciKzC8cvAfFbmCtPT8Xc4LqxlSPuh/TLP2QygKz58+hhf3Oc5ggAAAAQm9uawAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKAAAAQm9uawAAAAAAAMgAAABo'

function account(owner: PublicKey, base64: string): AccountInfo<Buffer> {
  return { owner, data: Buffer.from(base64, 'base64'), executable: false, lamports: 1 }
}

function connectionReturning(
  mintInfo: AccountInfo<Buffer> | null,
  metaplexInfo: AccountInfo<Buffer> | null,
): { getMultipleAccountsInfo: jest.Mock } {
  return { getMultipleAccountsInfo: jest.fn().mockResolvedValue([mintInfo, metaplexInfo]) }
}

describe('fetchSolanaTokenFromBlockchain', () => {
  it('reads a Token-2022 mint from its metadata extension and tags it', async () => {
    const connection = connectionReturning(account(TOKEN_2022_PROGRAM_ID, PAID_MINT_DATA), null)

    const token = await fetchSolanaTokenFromBlockchain(PAID_MINT, SupportedChainId.SOLANA, connection)

    expect(token).toEqual({
      chainId: SupportedChainId.SOLANA,
      address: PAID_MINT,
      name: 'Paid',
      symbol: 'PAID',
      decimals: 6,
      tags: [TOKEN_2022_TAG],
    })
  })

  it('reads a classic SPL mint from its Metaplex metadata account', async () => {
    const connection = connectionReturning(
      account(TOKEN_PROGRAM_ID, BONK_MINT_DATA),
      account(METAPLEX_PROGRAM_ID, BONK_METAPLEX_DATA),
    )

    const token = await fetchSolanaTokenFromBlockchain(BONK_MINT, SupportedChainId.SOLANA, connection)

    expect(token).toEqual({
      chainId: SupportedChainId.SOLANA,
      address: BONK_MINT,
      name: 'Bonk',
      symbol: 'Bonk',
      decimals: 5,
      tags: [],
    })
  })

  it('rejects an account that is not a mint', async () => {
    const connection = connectionReturning(account(METAPLEX_PROGRAM_ID, BONK_MINT_DATA), null)

    await expect(fetchSolanaTokenFromBlockchain(BONK_MINT, SupportedChainId.SOLANA, connection)).rejects.toThrow()
  })

  it('rejects a mint without metadata', async () => {
    const connection = connectionReturning(account(TOKEN_PROGRAM_ID, BONK_MINT_DATA), null)

    await expect(fetchSolanaTokenFromBlockchain(BONK_MINT, SupportedChainId.SOLANA, connection)).rejects.toThrow()
  })
})
