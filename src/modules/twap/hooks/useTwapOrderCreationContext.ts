import SafeAppsSDK from '@safe-global/safe-apps-sdk'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { Erc20 } from 'legacy/abis/types'
import { useTokenContract } from 'legacy/hooks/useContract'

import { useComposableCowContract } from 'modules/advancedOrders/hooks/useComposableCowContract'
import { useSafeAppsSdk } from 'modules/wallet/web3-react/hooks/useSafeAppsSdk'

import { ComposableCoW } from 'abis/types'
import { useNeedsApproval } from 'common/hooks/useNeedsApproval'
import { useTradeSpenderAddress } from 'common/hooks/useTradeSpenderAddress'

export interface TwapOrderCreationContext {
  safeAppsSdk: SafeAppsSDK
  composableCowContract: ComposableCoW
  needsApproval: boolean
  spender: string
  erc20Contract: Erc20
}

export function useTwapOrderCreationContext(
  inputAmount: Nullish<CurrencyAmount<Token>>
): TwapOrderCreationContext | null {
  const safeAppsSdk = useSafeAppsSdk()
  const composableCowContract = useComposableCowContract()
  const needsApproval = useNeedsApproval(inputAmount)
  const erc20Contract = useTokenContract(inputAmount?.currency.address)
  const spender = useTradeSpenderAddress()

  if (!composableCowContract || !erc20Contract || !safeAppsSdk || !spender) return null

  return { safeAppsSdk, composableCowContract, erc20Contract, needsApproval, spender }
}
