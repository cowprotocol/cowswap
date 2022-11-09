import { useMemo } from 'react'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useCurrencyBalances } from 'state/connection/hooks'
import { useIsExpertMode } from 'state/user/hooks'
import { useWeb3React } from '@web3-react/core'
import useRemainingNativeTxsAndCosts from './hooks/useRemainingNativeTxsAndCosts'
import { WrapUnwrapCallback } from 'hooks/useWrapCallback'
import { useDetectNativeToken } from '@cow/modules/swap/hooks/useDetectNativeToken'
import { GpModal } from 'components/Modal'
import { EthFlowModalContent } from '@cow/modules/swap/pure/EthFlow/EthFlowModalContent'
import { getDerivedEthFlowState } from '@cow/modules/swap/containers/EthFlow/utils/getDerivedEthFlowState'
import { ethFlowContextAtom } from '@cow/modules/swap/state/EthFlow/ethFlowContextAtom'
import { useAtomValue } from 'jotai/utils'
import { WrappingPreviewProps } from '@cow/modules/swap/pure/EthFlow/WrappingPreview'
import { useSingleActivityDescriptor } from 'hooks/useRecentActivity'
import { useEthFlowActions } from './hooks/useEthFlowActions'
import { useSetupEthFlow } from './hooks/useSetupEthFlow'
import { useTradeApproveCallback, useTradeApproveState } from '@cow/common/containers/TradeApprove'
import { HandleSwapCallback } from '@cow/modules/swap/pure/SwapButtons'

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
  const { account, chainId } = useWeb3React()
  const isExpertMode = useIsExpertMode()
  const { native, wrappedToken: wrapped } = useDetectNativeToken()
  const approvalState = useTradeApproveState(nativeInput || null)

  const ethFlowContext = useAtomValue(ethFlowContextAtom)
  const approveCallback = useTradeApproveCallback(nativeInput?.wrapped)
  const ethFlowActions = useEthFlowActions({
    wrap: wrapCallback,
    approve: approveCallback,
    dismiss: onDismiss,
    directSwap: directSwapCallback,
  })

  const approveActivity = useSingleActivityDescriptor({ chainId, id: ethFlowContext.approve.txHash || undefined })
  const wrapActivity = useSingleActivityDescriptor({ chainId, id: ethFlowContext.wrap.txHash || undefined })
  const [nativeBalance, wrappedBalance] = useCurrencyBalances(account, [native, wrapped])
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
    <GpModal isOpen onDismiss={props.onDismiss}>
      <EthFlow {...props} />
    </GpModal>
  )
}
