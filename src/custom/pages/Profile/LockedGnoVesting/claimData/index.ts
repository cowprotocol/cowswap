import mainnetAddresses from './mainnetAddresses.json'
import rinkebyAddresses from './rinkebyAddresses.json'
import gnosisChainAddresses from './gnosischainAddresses.json'

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

export const fetchClaim = async (address: string, chainId: number): Promise<Claim> => {
  let json
  switch (chainId) {
    case 1:
      json = await import('./mainnet.json')
      break
    case 4:
      json = await import('./rinkeby.json')
      break
    case 100:
      json = await import('./gnosischain.json')
  }
  if (!json) throw new Error(`Could not fetch claim data for chain #${chainId}`)
  return json.claims[address.toLowerCase() as keyof typeof json.claims]
}
