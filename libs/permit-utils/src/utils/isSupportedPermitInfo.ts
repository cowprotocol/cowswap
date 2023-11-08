import { PermitInfo } from '../types'

export function isSupportedPermitInfo(p: PermitInfo | undefined): boolean {
  return !!p && p.type !== 'unsupported'
}
