import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import ms from 'ms.macro'
import useSWR, { SWRConfiguration } from 'swr'

import { Order } from 'legacy/state/orders/actions'

import { usePermitInfo } from 'modules/permit'
import { TradeType } from 'modules/trade'

import { isPending } from 'common/hooks/useCategorizeRecentActivity'
import { getOrderPermitIfExists } from 'common/utils/doesOrderHavePermit'

import { checkPermitNonceAndAmount } from '../utils/checkPermitNonceAndAmount'

const SWR_CONFIG: SWRConfiguration = {
  refreshInterval: ms`30s`,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  errorRetryInterval: 0,
}

export function useDoesOrderHaveValidPermit(order?: Order, tradeType?: TradeType): boolean | undefined {
  const { chainId, account } = useWalletInfo()
  const provider = useWalletProvider()
  const permit = order ? getOrderPermitIfExists(order) : null
  const tokenPermitInfo = usePermitInfo(order?.inputToken, tradeType)

  const isPendingOrder = order ? isPending(order) : false
  const checkPermit = account && provider && permit && isPendingOrder && tradeType

  const { data: isValid } = useSWR(
    checkPermit ? [account, chainId, order?.id, tradeType, permit] : null,
    async ([account, chainId]) => {
      if (!permit || !order || !account || !provider || !chainId || !tokenPermitInfo) {
        return undefined
      }

      try {
        return await checkPermitNonceAndAmount(account, chainId, provider, order, permit, tokenPermitInfo)
      } catch (error) {
        console.error('Error validating permit:', error)
        return undefined
      }
    },
    SWR_CONFIG,
  )

  return isValid
}

