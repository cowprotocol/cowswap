import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useCurrencyAmountBalance } from '@cowprotocol/balances-and-allowances'
import { currencyAmountToTokenAmount } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useSingleActivityDescriptor } from 'legacy/hooks/useRecentActivity'
import { WrapUnwrapCallback } from 'legacy/hooks/useWrapCallback'

import { useWrappedToken } from 'modules/trade'

import { useTradeApproveCallback } from 'common/containers/TradeApprove'
import { useApproveState } from 'common/hooks/useApproveState'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { useEthFlowActions } from './hooks/useEthFlowActions'
import useRemainingNativeTxsAndCosts from './hooks/useRemainingNativeTxsAndCosts'
import { useSetupEthFlow } from './hooks/useSetupEthFlow'
import { getDerivedEthFlowState } from './utils/getDerivedEthFlowState'

import { EthFlowModalContent } from '../../pure/EthFlowModalContent'
import { WrappingPreviewProps } from '../../pure/WrappingPreview'
import { ethFlowContextAtom } from '../../state/ethFlowContextAtom'

export interface EthFlowProps {
  nativeInput?: CurrencyAmount<Currency>
  hasEnoughWrappedBalanceForSwap: boolean
  wrapCallback: WrapUnwrapCallback | null
  directSwapCallback: Command
  onDismiss: Command
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function EthFlowModal({
  nativeInput,
  onDismiss,
  wrapCallback,
  directSwapCallback,
  hasEnoughWrappedBalanceForSwap,
}: EthFlowProps) {
  const { chainId } = useWalletInfo()
  const native = useNativeCurrency()
  const wrapped = useWrappedToken()
  const { state: approvalState } = useApproveState(nativeInput || null)

  const ethFlowContext = useAtomValue(ethFlowContextAtom)
  const approveCallback = useTradeApproveCallback(
    (nativeInput && currencyAmountToTokenAmount(nativeInput)) || undefined,
  )
  const ethFlowActions = useEthFlowActions({
    wrap: wrapCallback,
    approve: approveCallback,
    dismiss: onDismiss,
    directSwap: directSwapCallback,
  })

  const approveActivity = useSingleActivityDescriptor({ chainId, id: ethFlowContext.approve.txHash || undefined })
  const wrapActivity = useSingleActivityDescriptor({ chainId, id: ethFlowContext.wrap.txHash || undefined })

  const nativeBalance = useCurrencyAmountBalance(native)
  const wrappedBalance = useCurrencyAmountBalance(wrapped)

  // user safety checks to make sure any on-chain native currency operations are economically safe
  // shows user warning with remaining available TXs if a certain threshold is reached
  const { balanceChecks } = useRemainingNativeTxsAndCosts({
    native,
    nativeBalance,
    nativeInput,
  })

  const state = useMemo(() => getDerivedEthFlowState(ethFlowContext), [ethFlowContext])

  const wrappingPreview: WrappingPreviewProps = {
    native,
    nativeBalance,
    wrapped,
    wrappedBalance,
    amount: nativeInput,
  }

  useSetupEthFlow({
    hasEnoughWrappedBalanceForSwap,
    approvalState,
    approveActivity,
    wrapActivity,
    onDismiss,
  })

  return (
    <EthFlowModalContent
      state={state}
      ethFlowContext={ethFlowContext}
      ethFlowActions={ethFlowActions}
      balanceChecks={balanceChecks}
      wrappingPreview={wrappingPreview}
      onDismiss={onDismiss}
    />
  )
}
