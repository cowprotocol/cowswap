import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useCurrencyAmountBalance } from '@cowprotocol/balances-and-allowances'
import { currencyAmountToTokenAmount } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useSingleActivityDescriptor } from 'legacy/hooks/useRecentActivity'
import { WrapUnwrapCallback } from 'legacy/hooks/useWrapCallback'
import { useIsExpertMode } from 'legacy/state/user/hooks'

import { getDerivedEthFlowState } from 'modules/swap/containers/EthFlow/utils/getDerivedEthFlowState'
import { EthFlowModalContent } from 'modules/swap/pure/EthFlow/EthFlowModalContent'
import { WrappingPreviewProps } from 'modules/swap/pure/EthFlow/WrappingPreview'
import { HandleSwapCallback } from 'modules/swap/pure/SwapButtons'
import { ethFlowContextAtom } from 'modules/swap/state/EthFlow/ethFlowContextAtom'
import { useWrappedToken } from 'modules/trade/hooks/useWrappedToken'

import { useTradeApproveCallback } from 'common/containers/TradeApprove'
import { useApproveState } from 'common/hooks/useApproveState'
import { CowModal } from 'common/pure/Modal'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { useEthFlowActions } from './hooks/useEthFlowActions'
import useRemainingNativeTxsAndCosts from './hooks/useRemainingNativeTxsAndCosts'
import { useSetupEthFlow } from './hooks/useSetupEthFlow'

export interface EthFlowProps {
  nativeInput?: CurrencyAmount<Currency>
  hasEnoughWrappedBalanceForSwap: boolean
  wrapCallback: WrapUnwrapCallback | null
  directSwapCallback: HandleSwapCallback
  onDismiss: () => void
}

function EthFlow({
  nativeInput,
  onDismiss,
  wrapCallback,
  directSwapCallback,
  hasEnoughWrappedBalanceForSwap,
}: EthFlowProps) {
  const { chainId } = useWalletInfo()
  const isExpertMode = useIsExpertMode()
  const native = useNativeCurrency()
  const wrapped = useWrappedToken()
  const approvalState = useApproveState(nativeInput || null)

  const ethFlowContext = useAtomValue(ethFlowContextAtom)
  const approveCallback = useTradeApproveCallback(
    (nativeInput && currencyAmountToTokenAmount(nativeInput)) || undefined
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

  const state = useMemo(() => getDerivedEthFlowState(ethFlowContext, isExpertMode), [isExpertMode, ethFlowContext])

  const wrappingPreview: WrappingPreviewProps = {
    native,
    nativeBalance,
    wrapped,
    wrappedBalance,
    amount: nativeInput,
  }

  useSetupEthFlow({
    state,
    ethFlowActions,
    isExpertMode,
    hasEnoughWrappedBalanceForSwap,
    approvalState,
    approveActivity,
    wrapActivity,
  })

  console.debug('ETH FLOW MODAL RENDER', ethFlowContext, state)

  return (
    <EthFlowModalContent
      state={state}
      isExpertMode={isExpertMode}
      ethFlowContext={ethFlowContext}
      ethFlowActions={ethFlowActions}
      balanceChecks={balanceChecks}
      wrappingPreview={wrappingPreview}
      onDismiss={onDismiss}
    />
  )
}

export function EthFlowModal(props: EthFlowProps) {
  return (
    <CowModal isOpen onDismiss={props.onDismiss}>
      <EthFlow {...props} />
    </CowModal>
  )
}
