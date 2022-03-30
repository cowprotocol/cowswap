import mainnetIndex from './mainnet/index.json'
import mainnetAddresses from './mainnet/addresses.json'
import rinkebyIndex from './rinkeby/index.json'
import rinkebyAddresses from './rinkeby/addresses.json'
import gnosisChainIndex from './gnosisChain/index.json'
import gnosisChainAddresses from './gnosisChain/addresses.json'

export const hasAllocation = (address: string, chainId: number) => {
  const addressHead = address.substring(2, 8).toLowerCase()
  switch (chainId) {
    case 1:
      return mainnetAddresses.includes(addressHead)
    case 4:
      return rinkebyAddresses.includes(addressHead)
    case 100:
      return gnosisChainAddresses.includes(addressHead)
  }
  return false
}

interface Claim {
  index: number
  amount: string
  proof: string[]
}

// The merkle proof data has been chunked up using the following function:
// const chunk = (claims) => {
//   const addresses = Object.keys(claims).sort()
//   return addresses.reduce((chunks, address, index) => {
//     const chunkIndex = Math.floor(index / 64)
//     if (!chunks[chunkIndex]) chunks[chunkIndex] = {}
//     chunks[chunkIndex][address] = claims[address]
//     return chunks
//   }, [])
// }

const indexFiles = { 1: mainnetIndex, 4: rinkebyIndex, 100: gnosisChainIndex }
const folderNames = { 1: 'mainnet', 4: 'rinkeby', 100: 'gnosisChain' }
export const fetchClaim = async (address: string, chainId: number): Promise<Claim> => {
  const lowerCaseAddress = address.toLowerCase()
  if (chainId !== 1 && chainId !== 4 && chainId !== 100) throw new Error('Invalid chainId')

  const indexFile = indexFiles[chainId]
  const folderName = folderNames[chainId]
  const chunkIndex = lookupChunkIndex(indexFile, lowerCaseAddress)
  let json
  try {
    json = await import(`./${folderName}/chunk_${chunkIndex}.json`)
  } catch (e) {
    console.error(e)
  }
  if (!json) {
    throw new Error(`Could not fetch claim data chunk ${chunkIndex} for chain #${chainId} and address ${address}`)
  }
  return json[lowerCaseAddress]
}

const lookupChunkIndex = (
  chunkIndexJson: typeof mainnetIndex | typeof rinkebyIndex | typeof gnosisChainIndex,
  address: string
) => {
  let nextChunkIndex = chunkIndexJson.findIndex((a) => address < a)
  if (nextChunkIndex === -1) nextChunkIndex = chunkIndexJson.length
  return nextChunkIndex - 1
}
