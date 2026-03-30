import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { Routes } from 'common/constants/routes'

import { parameterizeRoute } from './parameterizeRoute'

export function getProxyAccountDetailsUrl(chainId: SupportedChainId, proxyAddress: string): string {
  return parameterizeRoute(Routes.ACCOUNT_PROXY, { chainId, proxyAddress })
}

export function getProxyAccountUrl(chainId: SupportedChainId, source?: string): string {
  return parameterizeRoute(Routes.ACCOUNT_PROXIES, { chainId }) + (source ? `?source=${source}` : '')
}
