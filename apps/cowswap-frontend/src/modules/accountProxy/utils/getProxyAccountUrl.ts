import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { Routes } from 'common/constants/routes'

import { parameterizeRoute } from './parameterizeRoute'

export function getProxyAccountUrl(chainId: SupportedChainId, source?: string): string {
  return parameterizeRoute(Routes.ACCOUNT_PROXY, { chainId }) + (source ? `?source=${source}` : '')
}
