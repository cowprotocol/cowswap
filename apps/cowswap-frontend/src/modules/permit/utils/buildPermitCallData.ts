import { DAI_PERMIT_SELECTOR, EIP_2612_PERMIT_SELECTOR } from '@1inch/permit-signed-approvals-utils'

import { BuildDaiLikePermitCallDataParams, BuildEip2162PermitCallDataParams } from '../types'

export async function buildEip2162PermitCallData({
  eip2162Utils,
  callDataParams,
}: BuildEip2162PermitCallDataParams): Promise<string> {
  // TODO: this is ugly and I'm not happy with it either
  // It'll probably go away when the tokens overhaul is implemented
  // For now, this is a problem for favourite tokens cached locally with the hardcoded name for USDC token
  // Using the wrong name breaks the signature.
  const [permitParams, chainId, _tokenName, ...rest] = callDataParams
  const tokenName = _tokenName === 'USD//C' ? 'USD Coin' : _tokenName

  const callData = await eip2162Utils.buildPermitCallData(permitParams, chainId, tokenName, ...rest)
  // For some reason, the method above removes the permit selector prefix
  // https://github.com/1inch/permit-signed-approvals-utils/blob/master/src/eip-2612-permit.utils.ts#L92
  // Adding it back
  return callData.replace('0x', EIP_2612_PERMIT_SELECTOR)
}

export async function buildDaiLikePermitCallData({
  eip2162Utils,
  callDataParams,
}: BuildDaiLikePermitCallDataParams): Promise<string> {
  const callData = await eip2162Utils.buildDaiLikePermitCallData(...callDataParams)

  // Same as above, but for dai like
  // https://github.com/1inch/permit-signed-approvals-utils/blob/master/src/eip-2612-permit.utils.ts#L140
  return callData.replace('0x', DAI_PERMIT_SELECTOR)
}
