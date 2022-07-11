import { SupportedChainId } from 'constants/chains'
import mainnetIndex from './mainnet.json'
import rinkebyIndex from './rinkeby.json'
import gnosisChainIndex from './gnosisChain.json'

interface Claim {
  index: number
  amount: string
  proof: string[]
}

const indexFiles = {
  [SupportedChainId.MAINNET]: mainnetIndex,
  [SupportedChainId.RINKEBY]: rinkebyIndex,
  [SupportedChainId.GNOSIS_CHAIN]: gnosisChainIndex,
}

const chainNames = {
  [SupportedChainId.MAINNET]: 'mainnet',
  [SupportedChainId.RINKEBY]: 'rinkeby',
  [SupportedChainId.GNOSIS_CHAIN]: 'gnosisChain',
}

const DISTRO_REPO_BRANCH_NAME = 'main'

export const fetchClaim = async (address: string, chainId: SupportedChainId): Promise<Claim | null> => {
  const lowerCaseAddress = address.toLowerCase()

  const indexFile = indexFiles[chainId]
  const chainName = chainNames[chainId]
  const chunkIndex = lookupChunkIndex(indexFile, lowerCaseAddress)
  if (chunkIndex === -1) return null // address is lower than the lowest address in the index, which means it's ineligible

  const chunk = await fetchChunk(`${chainName}/chunk_${chunkIndex}.json`)
  return chunk[lowerCaseAddress] || null
}

// The merkle proof data has been sorted by address in ascending order and then chunked up.
// see: https://github.com/gnosis/locked-gno-cow-merkle-distro/blob/main/chunkClaimData.js
// Our index json gives the first address of each chunk.
// This function returns the chunk index for the given address, or -1 if the address is lower than the lowest address in the index.
const lookupChunkIndex = (
  chunkIndexJson: typeof mainnetIndex | typeof rinkebyIndex | typeof gnosisChainIndex,
  address: string
) => {
  let nextChunkIndex = chunkIndexJson.findIndex((a) => address < a)
  if (nextChunkIndex === -1) nextChunkIndex = chunkIndexJson.length
  return nextChunkIndex - 1
}

const chunkCache = new Map<string, Promise<Record<string, Claim>>>()
const fetchChunk = (path: string) => {
  const promise =
    chunkCache.get(path) ??
    (fetch(
      `https://raw.githubusercontent.com/gnosis/locked-gno-cow-merkle-distro/${DISTRO_REPO_BRANCH_NAME}/${path}`
    ).then((res) => res.json()) as Promise<Record<string, Claim>>)
  chunkCache.set(path, promise)
  return promise
}
