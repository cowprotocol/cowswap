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
export const fetchClaim = async (address: string, chainId: number): Promise<Claim> => {
  const lowerCaseAddress = address.toLowerCase()
  let json
  try {
    switch (chainId) {
      case 1:
        json = await import(`./mainnet/chunk_${lookupChunkIndex(mainnetIndex, lowerCaseAddress)}.json`)
        break
      case 4:
        json = await import(`./rinkeby/chunk_${lookupChunkIndex(rinkebyIndex, lowerCaseAddress)}.json`)
        break
      case 100:
        json = await import(`./gnosisChain/chunk_${lookupChunkIndex(gnosisChainIndex, lowerCaseAddress)}.json`)
    }
  } catch (e) {
    console.error(e)
  }
  if (!json) throw new Error(`Could not fetch claim data for chain #${chainId} and address ${address}`)
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
