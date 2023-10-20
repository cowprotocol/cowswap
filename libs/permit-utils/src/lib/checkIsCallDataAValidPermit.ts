import { DAI_PERMIT_SELECTOR, Eip2612PermitUtils, EIP_2612_PERMIT_SELECTOR } from '@1inch/permit-signed-approvals-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { SupportedPermitInfo } from '../types'
import { fixTokenName } from '../utils/fixTokenName'

export async function checkIsCallDataAValidPermit(
  owner: string,
  chainId: SupportedChainId,
  eip2162Utils: Eip2612PermitUtils,
  tokenAddress: string,
  tokenName: string,
  callData: string,
  { version }: SupportedPermitInfo
): Promise<boolean | undefined> {
  const params = { chainId, tokenName: fixTokenName(tokenName), tokenAddress, callData, version }

  let recoverPermitOwnerPromise: Promise<string> | undefined = undefined

  // If pre-hook doesn't start with either selector, it's not a permit
  if (callData.startsWith(EIP_2612_PERMIT_SELECTOR)) {
    recoverPermitOwnerPromise = eip2162Utils.recoverPermitOwnerFromCallData({
      ...params,
      // I don't know why this was removed, ok?
      // We added it back on buildPermitCallData.ts
      // But it looks like this is needed 🤷
      // Check the test for this method https://github.com/1inch/permit-signed-approvals-utils/blob/master/src/eip-2612-permit.test.ts#L85-L106
      callData: callData.replace(EIP_2612_PERMIT_SELECTOR, '0x'),
    })
  } else if (callData.startsWith(DAI_PERMIT_SELECTOR)) {
    recoverPermitOwnerPromise = eip2162Utils.recoverDaiLikePermitOwnerFromCallData({
      ...params,
      callData: callData.replace(DAI_PERMIT_SELECTOR, '0x'),
    })
  }

  if (!recoverPermitOwnerPromise) {
    // The callData doesn't match any known permit type
    return undefined
  }

  try {
    const recoveredOwner = await recoverPermitOwnerPromise

    // Permit is valid when recovered owner matches order owner
    return recoveredOwner.toLowerCase() === owner.toLowerCase()
  } catch (e) {
    console.debug(
      `[checkHasValidPendingPermit] Failed to check permit validity for owner ${owner} with callData ${callData}`,
      e
    )
    return false
  }
}
