import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ProgrammaticOrderApi } from '@cowprotocol/sdk-composable'

const PROGRAMMATIC_ORDERS_API_URL =
  process.env.REACT_APP_PROGRAMMATIC_ORDERS_API_URL || 'https://programmatic-orders.cow.fi/'

const PAGE_SIZE = 10

let programmaticOrderApi: ProgrammaticOrderApi | undefined

export async function fetchDeployedCowShedAddresses(owner: string, chainId: SupportedChainId): Promise<string[]> {
  const addresses: string[] = []

  const page = await getProgrammaticOrderApi().getDeployedCowSheds({ owner, chainId }, { limit: PAGE_SIZE, offset: 0 })

  for (const shed of page.items) {
    addresses.push(shed.address)
  }

  return addresses
}

function getProgrammaticOrderApi(): ProgrammaticOrderApi {
  programmaticOrderApi ??= new ProgrammaticOrderApi({ apiUrl: PROGRAMMATIC_ORDERS_API_URL })

  return programmaticOrderApi
}
