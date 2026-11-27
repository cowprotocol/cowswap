import { getAddressKey } from '@cowprotocol/cow-sdk'

import type { RwaToken } from '../model/types'

export function getTokenKey({ chainId, address }: Pick<RwaToken, 'chainId' | 'address'>): string {
  return `${chainId}:${getAddressKey(address)}`
}
