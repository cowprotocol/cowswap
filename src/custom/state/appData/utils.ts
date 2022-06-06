import { AppDataKeyParams } from 'state/appData/types'

export function buildAppDataRecordKey({ chainId, orderId }: AppDataKeyParams): string {
  return `${chainId}-${orderId}`
}

export function parseAppDataRecordKey(key: string): AppDataKeyParams {
  const [chainId, orderId] = key.split('-')

  return { chainId, orderId } as unknown as AppDataKeyParams
}
