import { NATIVE_CURRENCIES, WRAPPED_NATIVE_CURRENCIES as WETH } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { EthFlowActions } from 'modules/swap/containers/EthFlow/hooks/useEthFlowActions'
import { EthFlowModalContentProps } from 'modules/swap/pure/EthFlow/EthFlowModalContent'
import { BalanceChecks } from 'modules/swap/pure/EthFlow/EthFlowModalContent/EthFlowModalTopContent'
import { WrappingPreviewProps } from 'modules/swap/pure/EthFlow/WrappingPreview'
import { EthFlowState } from 'modules/swap/services/ethFlow/types'
import { defaultEthFlowContext, EthFlowActionContext } from 'modules/swap/state/EthFlow/ethFlowContextAtom'

const native = NATIVE_CURRENCIES[SupportedChainId.SEPOLIA]
const wrapped = WETH[SupportedChainId.SEPOLIA]
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
  swap(): Promise<void> {
    console.log('ETH FLOW: SWAP')
    return Promise.resolve(undefined)
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
  approveAction?: EthFlowActionContext
  wrapAction?: EthFlowActionContext
  balanceChecks?: BalanceChecks
}

export function getEthFlowModalContentProps(params: EthParamsCaseParams = {}): EthFlowModalContentProps {
  return {
    state: params.state || EthFlowState.WrapNeeded,
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
