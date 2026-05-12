import { AccountType } from '@cowprotocol/types'
import { useAccountType, useIsSmartContractWallet, useWalletInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'
import useSWR, { SWRConfiguration } from 'swr'
import { usePublicClient, useWalletClient } from 'wagmi'

import { usePermitInfo } from 'modules/permit'
import { TradeType } from 'modules/trade'

import { isPending } from 'common/hooks/useCategorizeRecentActivity'
import { GenericOrder } from 'common/types'
import { getOrderPermitIfExists } from 'common/utils/doesOrderHavePermit'
import { isPermitDecodedCalldataValid } from 'utils/orderUtils/isPermitValidForOrder'

import { checkPermitNonceAndAmount } from '../utils/checkPermitNonceAndAmount'

import type { Hex } from 'viem'

const SWR_CONFIG: SWRConfiguration = {
  refreshInterval: ms`30s`,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  errorRetryInterval: 0,
}

export function useDoesOrderHaveValidPermit(order?: GenericOrder, tradeType?: TradeType): boolean | undefined {
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { chainId, account } = useWalletInfo()
  const permit = order ? getOrderPermitIfExists(order) : null
  const tokenPermitInfo = usePermitInfo(order?.inputToken, tradeType)

  // Smart wallets (contract accounts + EIP-7702 EOAs) typically sign permits via
  // EIP-1271, which is not ECDSA-recoverable. Skipping the recovery check avoids a
  // false "invalid permit" verdict that would mark the order as unfillable.
  const isSmartContractWallet = useIsSmartContractWallet()
  const accountType = useAccountType()
  const skipSignatureRecovery = isEip1271SigningAccount(isSmartContractWallet, accountType)

  const isPendingOrder = order ? isPending(order) : false
  const checkPermit = isPermitValid(permit, chainId, account) && account && publicClient && isPendingOrder && tradeType

  const { data: isValid } = useSWR(
    checkPermit ? [account, chainId, order?.id, tradeType, permit, skipSignatureRecovery] : null,
    async ([account, chainId]) => {
      if (!permit || !order || !account || !publicClient || !chainId || !tokenPermitInfo) {
        return undefined
      }

      try {
        return await checkPermitNonceAndAmount(
          account,
          chainId,
          publicClient,
          order,
          permit,
          tokenPermitInfo,
          walletClient,
          skipSignatureRecovery,
        )
      } catch (error) {
        console.error('Error validating permit:', error)
        return undefined
      }
    },
    SWR_CONFIG,
  )

  return isValid
}

function isPermitValid(permit: Hex | null, chainId: number, account: string | undefined): boolean {
  return permit && account ? isPermitDecodedCalldataValid(permit, chainId, account).isValid : false
}

function isEip1271SigningAccount(
  isSmartContractWallet: boolean | undefined,
  accountType: AccountType | undefined,
): boolean {
  if (isSmartContractWallet) return true
  return accountType === AccountType.EIP7702EOA
}
