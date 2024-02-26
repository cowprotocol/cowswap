import { Command } from '@cowprotocol/types'

import { EthFlowActions } from 'modules/swap/containers/EthFlow/hooks/useEthFlowActions'
import { ethFlowConfigs } from 'modules/swap/pure/EthFlow/EthFlowModalContent/configs'
import { EthFlowModalBottomContent } from 'modules/swap/pure/EthFlow/EthFlowModalContent/EthFlowModalBottomContent'
import {
  BalanceChecks,
  EthFlowModalTopContent,
} from 'modules/swap/pure/EthFlow/EthFlowModalContent/EthFlowModalTopContent'
import { WrappingPreviewProps } from 'modules/swap/pure/EthFlow/WrappingPreview'
import { EthFlowState } from 'modules/swap/services/ethFlow/types'
import { EthFlowContext } from 'modules/swap/state/EthFlow/ethFlowContextAtom'

import { NewModal, NewModalContentBottom, NewModalContentTop } from 'common/pure/NewModal'

export interface EthFlowModalContentProps {
  state: EthFlowState
  ethFlowContext: EthFlowContext
  ethFlowActions: EthFlowActions
  balanceChecks: BalanceChecks
  wrappingPreview: WrappingPreviewProps
  onDismiss: Command
}
export function EthFlowModalContent(props: EthFlowModalContentProps) {
  const { ethFlowActions, state, balanceChecks, onDismiss, wrappingPreview, ethFlowContext } = props

  const nativeSymbol = wrappingPreview.native.symbol || ''
  const wrappedSymbol = wrappingPreview.wrapped.symbol || ''
  const { title, descriptions, buttonText } = ethFlowConfigs[state]({ nativeSymbol, wrappedSymbol })

  return (
    <NewModal title={title} onDismiss={onDismiss}>
      <NewModalContentTop gap={4}>
        <EthFlowModalTopContent
          descriptions={descriptions}
          state={state}
          balanceChecks={balanceChecks}
          nativeSymbol={nativeSymbol}
        />
      </NewModalContentTop>

      <NewModalContentBottom>
        <EthFlowModalBottomContent
          buttonText={buttonText}
          state={state}
          ethFlowActions={ethFlowActions}
          ethFlowContext={ethFlowContext}
          wrappingPreview={wrappingPreview}
        />
      </NewModalContentBottom>
    </NewModal>
  )
}
