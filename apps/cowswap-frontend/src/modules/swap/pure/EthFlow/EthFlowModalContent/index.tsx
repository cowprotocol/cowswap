import { useCallback } from 'react'

import styled from 'styled-components/macro'

import { LegacyConfirmationModalContent } from '../../../../../legacy/components/TransactionConfirmationModal/LegacyConfirmationModalContent'

import { EthFlowActions } from '../../../containers/EthFlow/hooks/useEthFlowActions'
import { ethFlowConfigs } from './configs'
import { EthFlowModalBottomContent } from './EthFlowModalBottomContent'
import {
  BalanceChecks,
  EthFlowModalTopContent,
} from './EthFlowModalTopContent'
import { WrappingPreviewProps } from '../WrappingPreview'
import { EthFlowState } from '../../../services/ethFlow/types'
import { EthFlowContext } from '../../../state/EthFlow/ethFlowContextAtom'

export interface EthFlowModalContentProps {
  state: EthFlowState
  isExpertMode: boolean
  ethFlowContext: EthFlowContext
  ethFlowActions: EthFlowActions
  balanceChecks: BalanceChecks
  wrappingPreview: WrappingPreviewProps
  onDismiss: () => void
}

const EthFlowModalLayout = styled(LegacyConfirmationModalContent)`
  padding: 22px;
`

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
