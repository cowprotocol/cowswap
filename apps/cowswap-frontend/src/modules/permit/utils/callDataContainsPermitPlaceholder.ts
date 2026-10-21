import { isPermitHookPlaceholder } from '@cowprotocol/permit-utils'

// Addresses of the static keys formerly used to sign placeholder permits; they can still be found in cached appData
const LEGACY_PERMIT_SIGNERS = ['da5f16f4ab0410096a4403e7223988649fac38cf', '4ed18e9489d82784f98118d5a6ab3ad4340802fb']

export function callDataContainsPermitPlaceholder(callData: string | undefined): boolean {
  if (!callData) {
    return false
  }

  const lowerCaseCallData = callData.toLowerCase()

  return (
    isPermitHookPlaceholder(lowerCaseCallData) ||
    LEGACY_PERMIT_SIGNERS.some((address) => lowerCaseCallData.includes(address))
  )
}
