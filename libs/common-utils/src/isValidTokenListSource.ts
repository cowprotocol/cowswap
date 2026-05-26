import { parseENSAddress } from './parseENSAddress'
import { uriToHttp } from './uriToHttp'

export function isValidTokenListSource(source: string): boolean {
  return uriToHttp(source).length > 0 || Boolean(parseENSAddress(source))
}
