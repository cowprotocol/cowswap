import { DAI_PERMIT_SELECTOR, EIP_2612_PERMIT_SELECTOR } from '@1inch/permit-signed-approvals-utils'

import { BuildDaiLikePermitCallDataParams, BuildEip2612PermitCallDataParams } from '../types'

export async function buildEip2612PermitCallData({
  eip2612Utils,
  callDataParams,
}: BuildEip2612PermitCallDataParams): Promise<string> {
  const [permitParams, chainId, tokenName, ...rest] = callDataParams

  const callData = await eip2612Utils.buildPermitCallData(permitParams, chainId, tokenName, ...rest)
  // For some reason, the method above removes the permit selector prefix
  // https://github.com/1inch/permit-signed-approvals-utils/blob/master/src/eip-2612-permit.utils.ts#L92
  // Adding it back
  return callData.replace('0x', EIP_2612_PERMIT_SELECTOR)
}

export async function buildDaiLikePermitCallData({
  eip2612Utils,
  callDataParams,
}: BuildDaiLikePermitCallDataParams): Promise<string> {
  const callData = await eip2612Utils.buildDaiLikePermitCallData(...callDataParams)

  // Same as above, but for dai like
  // https://github.com/1inch/permit-signed-approvals-utils/blob/master/src/eip-2612-permit.utils.ts#L140
  return callData.replace('0x', DAI_PERMIT_SELECTOR)
}
