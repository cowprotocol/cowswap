import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ProgrammaticOrderApi } from '@cowprotocol/sdk-composable'
import type { QueryPage, TwapPartOrder } from '@cowprotocol/sdk-composable'

export const EOA_TWAP_PARTS_PAGE_SIZE = 10

const programmaticOrderApi = new ProgrammaticOrderApi()

export function fetchEoaTwapPartOrders(
  eventId: string,
  chainId: SupportedChainId,
  page: number,
): Promise<QueryPage<TwapPartOrder>> {
  return programmaticOrderApi.getTwapPartOrders(
    { eventId, chainId },
    {
      direction: 'asc',
      offset: (page - 1) * EOA_TWAP_PARTS_PAGE_SIZE,
      limit: EOA_TWAP_PARTS_PAGE_SIZE,
    },
  )
}
