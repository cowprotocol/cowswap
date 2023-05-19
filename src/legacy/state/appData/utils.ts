import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { AppDataRecord } from 'state/appData/types'

export function buildDocFilterFn(chainId: SupportedChainId, orderId: string) {
  return (doc: AppDataRecord) => doc.chainId === chainId && doc.orderId === orderId
}

export function buildInverseDocFilterFn(chainId: SupportedChainId, orderId: string) {
  return (doc: AppDataRecord) => doc.chainId !== chainId && doc.orderId !== orderId
}
