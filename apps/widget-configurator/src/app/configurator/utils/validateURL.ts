import { parseENSAddress, uriToHttp } from '@cowprotocol/common-utils'

export const validateURL = (url: string): boolean => {
  const value = url.trim()

  if (parseENSAddress(value)) return true

  const protocol = value.split(':')[0]?.toLowerCase()
  if (protocol !== 'http' && protocol !== 'https') return false

  return uriToHttp(value).length > 0
}
