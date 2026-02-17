import { useWalletInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'
import useSWR, { SWRConfiguration } from 'swr'
import { usePublicClient } from 'wagmi'

import { usePermitInfo } from 'modules/permit'
import { TradeType } from 'modules/trade'

import { isPending } from 'common/hooks/useCategorizeRecentActivity'
import { GenericOrder } from 'common/types'
import { getOrderPermitIfExists } from 'common/utils/doesOrderHavePermit'
import { isPermitDecodedCalldataValid } from 'utils/orderUtils/isPermitValidForOrder'

import { checkPermitNonceAndAmount } from '../utils/checkPermitNonceAndAmount'

const SWR_CONFIG: SWRConfiguration = {
  refreshInterval: ms`30s`,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  errorRetryInterval: 0,
}

export function useDoesOrderHaveValidPermit(order?: GenericOrder, tradeType?: TradeType): boolean | undefined {
  const publicClient = usePublicClient()
  const { chainId, account } = useWalletInfo()
  const permit = order ? getOrderPermitIfExists(order) : null
  const tokenPermitInfo = usePermitInfo(order?.inputToken, tradeType)

  const isPendingOrder = order ? isPending(order) : false
  const checkPermit = isPermitValid(permit, chainId, account) && account && publicClient && isPendingOrder && tradeType

  const { data: isValid } = useSWR(
    checkPermit ? [account, chainId, order?.id, tradeType, permit] : null,
    async ([account, chainId]) => {
      if (!permit || !order || !account || !publicClient || !chainId || !tokenPermitInfo) {
        return undefined
      }

      try {
        return await checkPermitNonceAndAmount(account, chainId, publicClient, order, permit, tokenPermitInfo)
      } catch (error) {
        console.error('Error validating permit:', error)
        return undefined
      }
    },
    SWR_CONFIG,
  )

  return isValid
}

function isPermitValid(permit: string | null, chainId: number, account: string | undefined): boolean {
  return permit && account ? isPermitDecodedCalldataValid(permit, chainId, account).isValid : false
}
