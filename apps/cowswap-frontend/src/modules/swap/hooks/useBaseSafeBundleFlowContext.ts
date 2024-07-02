import { useMemo } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { useSafeAppsSdk } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { TradeType } from '@uniswap/sdk-core'

import { getFlowContext, useBaseFlowContextSetup } from 'modules/swap/hooks/useFlowContext'
import { BaseSafeFlowContext } from 'modules/swap/services/types'

import { useGP2SettlementContract } from 'common/hooks/useContract'
import { useTradeSpenderAddress } from 'common/hooks/useTradeSpenderAddress'

export function useBaseSafeBundleFlowContext(): BaseSafeFlowContext | null {
  const baseProps = useBaseFlowContextSetup()
  const sellToken = baseProps.trade ? getWrappedToken(baseProps.trade.inputAmount.currency) : undefined
  const settlementContract = useGP2SettlementContract()
  const spender = useTradeSpenderAddress()

  const safeAppsSdk = useSafeAppsSdk()
  const provider = useWalletProvider()

  return useMemo(() => {
    if (!baseProps.trade || !settlementContract || !spender || !safeAppsSdk || !provider) return null

    const baseContext = getFlowContext({
      baseProps,
      sellToken,
      kind: baseProps.trade.tradeType === TradeType.EXACT_INPUT ? OrderKind.SELL : OrderKind.BUY,
    })

    if (!baseContext) return null

    return {
      ...baseContext,
      settlementContract,
      spender,
      safeAppsSdk,
      provider,
    }
  }, [baseProps, settlementContract, spender, safeAppsSdk, provider, sellToken])
}
