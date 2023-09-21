import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { Web3Provider } from '@ethersproject/providers'

import { Eip2612PermitUtils } from '@1inch/permit-signed-approvals-utils'

import { PermitProviderConnector } from 'modules/wallet/utils/PermitProviderConnector'

import { PERMIT_SIGNER } from '../const'

const PERMIT_UTILS_CACHE: Record<number, Eip2612PermitUtils> = {}

export function getPermitUtilsInstance(
  chainId: SupportedChainId,
  provider: Web3Provider,
  account?: string | undefined
): Eip2612PermitUtils {
  const cached = PERMIT_UTILS_CACHE[chainId]

  // Only cache if there's no account to prevent stale signers
  if (!account && cached) {
    return cached
  }

  const web3ProviderConnector = new PermitProviderConnector(provider, account ? undefined : PERMIT_SIGNER)
  const eip2612PermitUtils = new Eip2612PermitUtils(web3ProviderConnector)

  if (!account) {
    PERMIT_UTILS_CACHE[chainId] = eip2612PermitUtils
  }

  return eip2612PermitUtils
}
