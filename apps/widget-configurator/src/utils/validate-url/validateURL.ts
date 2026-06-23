import { parseENSAddress, uriToHttp } from '@cowprotocol/common-utils'

export const validateURL = (url: string): boolean => {
  return uriToHttp(url).length > 0 || Boolean(parseENSAddress(url))
}
