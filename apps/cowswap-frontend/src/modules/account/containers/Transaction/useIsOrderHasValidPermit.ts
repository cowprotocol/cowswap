import { checkIsCallDataAValidPermit, getPermitUtilsInstance, PermitInfo } from '@cowprotocol/permit-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { JsonRpcProvider } from '@ethersproject/providers'

import ms from 'ms.macro'
import useSWR, { SWRConfiguration } from 'swr'

import { Order } from 'legacy/state/orders/actions'

import { getOrderPermitIfExists } from 'common/utils/doesOrderHavePermit'

const SWR_CONFIG: SWRConfiguration = {
  refreshInterval: ms`30s`,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  errorRetryInterval: 0,
}

export function useIsOrderHasValidPermit(order?: Order): boolean | undefined {
  const { chainId, account } = useWalletInfo()
  const provider = useWalletProvider()
  const permit = order ? getOrderPermitIfExists(order) : null

  const { data: isValid } = useSWR(
    account && provider && permit && order ? [account, chainId, order?.id] : null,
    async ([account, chainId]) => {
      if (!permit || !order || !account || !provider || !chainId) {
        return undefined
      }

      const sellToken = order.sellToken

      try {
        const isPermitValid = await checkBasicPermitValidity(account, chainId, provider, sellToken, permit)
        console.log('isPermitValid', isPermitValid)

        return isPermitValid
      } catch (error) {
        console.error('Error validating permit:', error)
        return undefined
      }
    },
    SWR_CONFIG,
  )

  return isValid
}

async function checkBasicPermitValidity(
  account: string,
  chainId: number,
  provider: JsonRpcProvider,
  sellTokenAddress: string,
  callData: string,
): Promise<boolean> {
  try {
    const eip2612Utils = getPermitUtilsInstance(chainId, provider, account)

    // Create a basic permit info for validation
    const basicPermitInfo: PermitInfo = {
      type: 'eip-2612',
      name: 'Token',
      version: '1',
    }

    const result = await checkIsCallDataAValidPermit(
      account,
      chainId,
      eip2612Utils,
      sellTokenAddress,
      'Token', // We don't have the actual token name
      callData,
      basicPermitInfo,
    )

    return result === true
  } catch {
    return false
  }
}
