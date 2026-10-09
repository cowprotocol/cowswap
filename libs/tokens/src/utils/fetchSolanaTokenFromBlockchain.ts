import { TOKEN_2022_TAG } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenInfo } from '@cowprotocol/types'

import { ExtensionType, getExtensionData, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, unpackMint } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'

const METAPLEX_PROGRAM_ID = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'

// Mint accounts only hold decimals; name/symbol live either in the Token-2022 metadata extension or in a
// Metaplex metadata account. Both use the same layout: update authority (32) | mint (32) | name | symbol,
// where each string is a borsh u32 length + utf8 bytes. Metaplex adds a 1-byte key in front and pads with \0.
const TOKEN_2022_METADATA_NAME_OFFSET = 64
const METAPLEX_METADATA_NAME_OFFSET = 65

export async function fetchSolanaTokenFromBlockchain(
  mintAddress: string,
  chainId: SupportedChainId,
  connection: Pick<Connection, 'getMultipleAccountsInfo'>,
): Promise<TokenInfo> {
  const mint = new PublicKey(mintAddress)
  const metaplexProgramId = new PublicKey(METAPLEX_PROGRAM_ID)
  const [metaplexAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), metaplexProgramId.toBuffer(), mint.toBuffer()],
    metaplexProgramId,
  )

  const [mintInfo, metaplexInfo] = await connection.getMultipleAccountsInfo([mint, metaplexAccount])

  const isToken2022 = !!mintInfo?.owner.equals(TOKEN_2022_PROGRAM_ID)
  // Throws unless the account is a mint owned by the expected token program
  const { decimals, tlvData } = unpackMint(mint, mintInfo, isToken2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID)

  const metadataExtension = isToken2022 ? getExtensionData(ExtensionType.TokenMetadata, tlvData) : null
  const metadata = metadataExtension
    ? readNameAndSymbol(metadataExtension, TOKEN_2022_METADATA_NAME_OFFSET)
    : metaplexInfo && readNameAndSymbol(metaplexInfo.data, METAPLEX_METADATA_NAME_OFFSET)

  if (!metadata) {
    throw new Error(`No token metadata found for mint ${mintAddress}`)
  }

  return {
    chainId,
    address: mintAddress,
    name: metadata.name,
    symbol: metadata.symbol,
    decimals,
    tags: isToken2022 ? [TOKEN_2022_TAG] : [],
  }
}

function readNameAndSymbol(data: Uint8Array, offset: number): { name: string; symbol: string } | null {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
  const decoder = new TextDecoder()

  const readString = (): string => {
    const length = view.getUint32(offset, true)
    const value = decoder.decode(data.subarray(offset + 4, offset + 4 + length))
    offset += 4 + length

    return value.replace(/\0+$/, '').trim()
  }

  const name = readString()
  const symbol = readString()

  return name && symbol ? { name, symbol } : null
}
