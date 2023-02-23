import { WrappingPreviewProps } from '@cow/modules/swap/pure/EthFlow/WrappingPreview'

import { nativeOnChain, WRAPPED_NATIVE_CURRENCY as WETH } from 'constants/tokens'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { EthFlowModalContentProps } from '@cow/modules/swap/pure/EthFlow/EthFlowModalContent'
import { EthFlowState } from '@cow/modules/swap/services/ethFlow/types'
import { defaultEthFlowContext, EthFlowActionContext } from '@cow/modules/swap/state/EthFlow/ethFlowContextAtom'
import { BalanceChecks } from '@cow/modules/swap/pure/EthFlow/EthFlowModalContent/EthFlowModalTopContent'
import { EthFlowActions } from '@cow/modules/swap/containers/EthFlow/hooks/useEthFlowActions'

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
    console.log('ETH FLOW: APPROVE')
    return Promise.resolve(undefined)
  },
  expertModeFlow(): Promise<void> {
    console.log('ETH FLOW: EXPERT MODE FLOW')
    return Promise.resolve(undefined)
  },
  swap(): void {
    console.log('ETH FLOW: SWAP')
    return
  },
  directSwap(): void {
    console.log('ETH FLOW: DIRECT SWAP')
    return
  },
  wrap(): Promise<void> {
    console.log('ETH FLOW: WRAP')
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
