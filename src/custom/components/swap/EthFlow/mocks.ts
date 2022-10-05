import { WrappingPreviewProps } from './pure/WrappingPreview'

import { nativeOnChain, WRAPPED_NATIVE_CURRENCY as WETH } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { EthFlowModalContentProps } from './pure/EthFlowModalContent'
import { EthFlowState } from './typings'
import { defaultEthFlowContext, EthFlowActionContext } from './state/ethFlowContextAtom'
import { BalanceChecks } from './pure/EthFlowModalContent/EthFlowModalTopContent'
import { EthFlowActions } from './containers/EthFlowModal/hooks/useEthFlowActions'

const native = nativeOnChain(SupportedChainId.GOERLI)
const wrapped = WETH[SupportedChainId.GOERLI]
const nativeInput = CurrencyAmount.fromRawAmount(native, 5.987654 * 10 ** 18)
const nativeBalance = CurrencyAmount.fromRawAmount(native, 15.12123 * 10 ** 18)
const wrappedBalance = CurrencyAmount.fromRawAmount(wrapped, 15.12123 * 10 ** 18)

const balanceChecks = { isLowBalance: false, txsRemaining: null }

export const wrappingPreviewProps: WrappingPreviewProps = {
  native,
  nativeBalance,
  wrapped,
  wrappedBalance,
  amount: nativeInput,
}

const ethFlowActionsMock: EthFlowActions = {
  approve(): Promise<void> {
    return Promise.resolve(undefined)
  },
  expertModeFlow(): Promise<void> {
    return Promise.resolve(undefined)
  },
  swap(): void {
    return
  },
  wrap(): Promise<void> {
    return Promise.resolve(undefined)
  },
}

export interface EthParamsCaseParams {
  state?: EthFlowState
  isExpertMode?: boolean
  approveAction?: EthFlowActionContext
  wrapAction?: EthFlowActionContext
  balanceChecks?: BalanceChecks
}

export function getEthFlowModalContentProps(params: EthParamsCaseParams = {}): EthFlowModalContentProps {
  return {
    state: params.state || EthFlowState.WrapNeeded,
    isExpertMode: params.isExpertMode || false,
    ethFlowContext: {
      approve: { ...defaultEthFlowContext.approve, ...params.approveAction },
      wrap: { ...defaultEthFlowContext.wrap, ...params.wrapAction },
    },
    ethFlowActions: ethFlowActionsMock,
    balanceChecks: params.balanceChecks || balanceChecks,
    wrappingPreview: wrappingPreviewProps,
    onDismiss: async () => console.log('On dismiss'),
  }
}
