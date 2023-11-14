import { PermitInfo } from '../types'

export function isSupportedPermitInfo(p: PermitInfo | undefined): p is PermitInfo {
  return !!p && p.type !== 'unsupported'
}
