import styled from 'styled-components/macro'

import { useCallback } from 'react'
import { EthFlowModalBottomContent } from './EthFlowModalBottomContent'

import { ConfirmationModalContent } from 'components/TransactionConfirmationModal'
import { BalanceChecks, EthFlowModalTopContent } from './EthFlowModalTopContent'
import { ethFlowConfigs } from './configs'
import { EthFlowState } from '../../typings'
import { WrappingPreviewProps } from '../WrappingPreview'
import { EthFlowContext } from '../../state/ethFlowContextAtom'
import { EthFlowActions } from '../../containers/EthFlowModal/hooks/useEthFlowActions'

const EthFlowModalLayout = styled(ConfirmationModalContent)`
  padding: 22px;
`

export interface EthFlowModalContentProps {
  state: EthFlowState
  isExpertMode: boolean
  ethFlowContext: EthFlowContext
  ethFlowActions: EthFlowActions
  balanceChecks: BalanceChecks
  wrappingPreview: WrappingPreviewProps
  onDismiss: () => void
}

export function EthFlowModalContent(props: EthFlowModalContentProps) {
  const { ethFlowActions, state, isExpertMode, balanceChecks, onDismiss, wrappingPreview, ethFlowContext } = props

  const nativeSymbol = wrappingPreview.native.symbol || ''
  const wrappedSymbol = wrappingPreview.wrapped.symbol || ''
  const { title, descriptions, buttonText } = ethFlowConfigs[state]({ isExpertMode, nativeSymbol, wrappedSymbol })

  const TopModalContent = useCallback(
    () => (
      <EthFlowModalTopContent
        descriptions={descriptions}
        state={state}
        balanceChecks={balanceChecks}
        nativeSymbol={nativeSymbol}
      />
    ),
    [state, balanceChecks, descriptions, nativeSymbol]
  )

  const BottomModalContent = useCallback(() => {
    const props = {
      buttonText,
      isExpertMode,
      state,
      ethFlowActions,
      ethFlowContext,
      wrappingPreview,
    }

    return <EthFlowModalBottomContent {...props} />
  }, [isExpertMode, state, ethFlowActions, buttonText, wrappingPreview, ethFlowContext])

  return (
    <EthFlowModalLayout
      title={title}
      titleSize={20}
      onDismiss={onDismiss}
      topContent={TopModalContent}
      bottomContent={BottomModalContent}
    />
  )
}
