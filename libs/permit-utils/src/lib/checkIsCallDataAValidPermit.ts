import { DAI_PERMIT_SELECTOR, Eip2612PermitUtils, EIP_2612_PERMIT_SELECTOR } from '@1inch/permit-signed-approvals-utils'

import { PermitInfo } from '../types'

export async function checkIsCallDataAValidPermit(
  owner: string,
  chainId: number,
  eip2612Utils: Eip2612PermitUtils,
  tokenAddress: string,
  _tokenName: string | undefined,
  callData: string,
  { version, type, name }: PermitInfo
): Promise<boolean | undefined> {
  // TODO: take name only from PermitInfo
  const tokenName = name || _tokenName

  if (type === 'unsupported') {
    return false
  }

  if (!tokenName) {
    throw new Error(`No token name for ${tokenAddress}`)
  }

  const params = { chainId, tokenName, tokenAddress, callData, version }

  let recoverPermitOwnerPromise: Promise<string> | undefined = undefined

  // If pre-hook doesn't start with either selector, it's not a permit
  if (callData.startsWith(EIP_2612_PERMIT_SELECTOR)) {
    recoverPermitOwnerPromise = eip2612Utils.recoverPermitOwnerFromCallData({
      ...params,
      // I don't know why this was removed, ok?
      // We added it back on buildPermitCallData.ts
      // But it looks like this is needed 🤷
      // Check the test for this method https://github.com/1inch/permit-signed-approvals-utils/blob/master/src/eip-2612-permit.test.ts#L85-L106
      callData: callData.replace(EIP_2612_PERMIT_SELECTOR, '0x'),
    })
  } else if (callData.startsWith(DAI_PERMIT_SELECTOR)) {
    recoverPermitOwnerPromise = eip2612Utils.recoverDaiLikePermitOwnerFromCallData({
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
