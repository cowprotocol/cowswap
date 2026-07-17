import { useAtomValue } from 'jotai'

import { getIsToken2022 } from '@cowprotocol/common-const'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useAppKitProvider } from '@reown/appkit/react'
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'

import { SolanaOrderFlowContext } from 'modules/limitOrders/services/solanaOrderFlow'
import { limitOrdersSettingsAtom } from 'modules/limitOrders/state/limitOrdersSettingsAtom'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { useLimitOrdersDerivedState } from './useLimitOrdersDerivedState'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

export function useSolanaOrderFlowContext(): SolanaOrderFlowContext | null {
  const { chainId, account } = useWalletInfo()
  const { connection } = useAppKitConnection()
  const { walletProvider } = useAppKitProvider<SolanaProvider>('solana')
  const { customDeadlineTimestamp, deadlineMilliseconds, partialFillsEnabled } = useAtomValue(limitOrdersSettingsAtom)
  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount, orderKind } =
    useLimitOrdersDerivedState()

  return useSafeMemo(() => {
    if (!isSolanaChain(chainId) || !account || !connection || !walletProvider) return null
    if (!inputCurrency || !outputCurrency || !inputCurrencyAmount || !outputCurrencyAmount) return null

    return {
      account,
      connection,
      walletProvider,
      sellToken: {
        address: getCurrencyAddress(inputCurrency),
        isToken2022: getIsToken2022(inputCurrency as { tags?: string[] }),
      },
      buyToken: {
        address: getCurrencyAddress(outputCurrency),
        isToken2022: getIsToken2022(outputCurrency as { tags?: string[] }),
      },
      sellAmount: BigInt(inputCurrencyAmount.quotient.toString()),
      buyAmount: BigInt(outputCurrencyAmount.quotient.toString()),
      kind: orderKind,
      partiallyFillable: partialFillsEnabled,
      customDeadlineTimestamp,
      deadlineMilliseconds,
    }
  }, [
    chainId,
    account,
    connection,
    walletProvider,
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount,
    outputCurrencyAmount,
    orderKind,
    partialFillsEnabled,
    customDeadlineTimestamp,
    deadlineMilliseconds,
  ])
}
