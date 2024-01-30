export { PERMIT_SIGNER, DEFAULT_MIN_GAS_LIMIT } from './const'

export { checkIsCallDataAValidPermit } from './lib/checkIsCallDataAValidPermit'
export { generatePermitHook } from './lib/generatePermitHook'
export { getPermitUtilsInstance } from './lib/getPermitUtilsInstance'
export { getTokenPermitInfo } from './lib/getTokenPermitInfo'
export { isSupportedPermitInfo } from './utils/isSupportedPermitInfo'

export type { PermitHookData, PermitHookParams, PermitInfo, PermitType, GetTokenPermitIntoResult } from './types'
