import { Command } from '@cowprotocol/types'

import { NewModal, NewModalContentBottom, NewModalContentTop } from 'common/pure/NewModal'

import { ethFlowConfigs } from './configs'
import { EthFlowModalBottomContent } from './EthFlowModalBottomContent'
import { BalanceChecks, EthFlowModalTopContent } from './EthFlowModalTopContent'

import { EthFlowActions } from '../../containers/EthFlow/hooks/useEthFlowActions'
import { EthFlowState } from '../../services/ethFlow/types'
import { EthFlowContext } from '../../state/ethFlowContextAtom'
import { WrappingPreviewProps } from '../WrappingPreview'

export interface EthFlowModalContentProps {
  state: EthFlowState
  ethFlowContext: EthFlowContext
  ethFlowActions: EthFlowActions
  balanceChecks: BalanceChecks
  wrappingPreview: WrappingPreviewProps
  onDismiss: Command
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
