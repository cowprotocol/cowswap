export { DEFAULT_MIN_GAS_LIMIT, PERMIT_SIGNER } from './const'

export { checkIsCallDataAValidPermit } from './lib/checkIsCallDataAValidPermit'
export { generatePermitHook } from './lib/generatePermitHook'
export { getPermitUtilsInstance } from './lib/getPermitUtilsInstance'
export { getTokenPermitInfo } from './lib/getTokenPermitInfo'
export { isSupportedPermitInfo } from './utils/isSupportedPermitInfo'
export { PERMIT_TOKENS_BLACKLIST, TOKEN_PERMIT_BLACKLISTED_ERROR } from './const'

export type { GetTokenPermitIntoResult, PermitHookData, PermitHookParams, PermitInfo, PermitType } from './types'
