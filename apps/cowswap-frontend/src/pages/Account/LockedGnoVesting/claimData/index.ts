import { SupportedChainId } from '@cowprotocol/cow-sdk'

import gnosisChainIndex from './gnosisChain.json'
import mainnetIndex from './mainnet.json'

interface Claim {
  index: number
  amount: string
  proof: string[]
}

const indexFiles: Record<SupportedChainId, string[]> = {
  [SupportedChainId.MAINNET]: mainnetIndex,
  [SupportedChainId.GNOSIS_CHAIN]: gnosisChainIndex,
  [SupportedChainId.ARBITRUM_ONE]: [],
  [SupportedChainId.BASE]: [],
  [SupportedChainId.SEPOLIA]: [],
  [SupportedChainId.AVALANCHE]: [],
  [SupportedChainId.POLYGON]: [],
}

const chainNames: Record<SupportedChainId, string | null> = {
  [SupportedChainId.MAINNET]: 'mainnet',
  [SupportedChainId.GNOSIS_CHAIN]: 'gnosisChain',
  [SupportedChainId.ARBITRUM_ONE]: null,
  [SupportedChainId.BASE]: null,
  [SupportedChainId.SEPOLIA]: null,
  [SupportedChainId.AVALANCHE]: null,
  [SupportedChainId.POLYGON]: null,
}

const DISTRO_REPO_BRANCH_NAME = 'main'

export const fetchClaim = async (address: string, chainId: SupportedChainId): Promise<Claim | null> => {
  const chainName = chainNames[chainId]
  if (!chainName) return null // no claim for this chain

  const lowerCaseAddress = address.toLowerCase()
  const indexFile = indexFiles[chainId]
  const chunkIndex = lookupChunkIndex(indexFile, lowerCaseAddress)
  if (chunkIndex === -1) return null // address is lower than the lowest address in the index, which means it's ineligible

  const chunk = await fetchChunk(`${chainName}/chunk_${chunkIndex}.json`)
  return chunk[lowerCaseAddress] || null
}

// The merkle proof data has been sorted by address in ascending order and then chunked up.
// see: https://github.com/gnosis/locked-gno-cow-merkle-distro/blob/main/chunkClaimData.js
// Our index json gives the first address of each chunk.
// This function returns the chunk index for the given address, or -1 if the address is lower than the lowest address in the index.
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const lookupChunkIndex = (chunkIndexJson: typeof mainnetIndex | typeof gnosisChainIndex, address: string) => {
  let nextChunkIndex = chunkIndexJson.findIndex((a) => address < a)
  if (nextChunkIndex === -1) nextChunkIndex = chunkIndexJson.length
  return nextChunkIndex - 1
}

const chunkCache = new Map<string, Promise<Record<string, Claim>>>()
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const fetchChunk = (path: string) => {
  const promise =
    chunkCache.get(path) ??
    (fetch(
      `https://raw.githubusercontent.com/gnosis/locked-gno-cow-merkle-distro/${DISTRO_REPO_BRANCH_NAME}/${path}`,
    ).then((res) => res.json()) as Promise<Record<string, Claim>>)
  chunkCache.set(path, promise)
  return promise
}
