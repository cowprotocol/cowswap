import styled from 'styled-components/macro'

import { useCallback } from 'react'
import { BottomContentParams, EthFlowModalBottomContent } from './EthFlowModalBottomContent'

import { ConfirmationModalContent } from 'components/TransactionConfirmationModal'
import { BalanceChecks, EthFlowModalTopContent } from './EthFlowModalTopContent'
import { ethFlowConfigs } from 'components/swap/EthFlow/pure/EthFlowModalContent/configs'
import { EthFlowState } from '../../typings'

const EthFlowModalLayout = styled(ConfirmationModalContent)`
  padding: 22px;
`

export type ModalTextContentProps = {
  wrappedSymbol: string
  nativeSymbol: string
  state: EthFlowState
  isExpertMode: boolean
  wrapSubmitted: boolean
  approveSubmitted: boolean
}

export interface EthFlowModalContentProps {
  balanceChecks: BalanceChecks
  modalTextContent: ModalTextContentProps
  bottomContentParams: Omit<BottomContentParams, 'buttonText'>
  onDismiss: () => void
}

export function EthFlowModalContent(props: EthFlowModalContentProps) {
  const { modalTextContent, balanceChecks, bottomContentParams, onDismiss } = props
  const { nativeSymbol, state, isExpertMode, wrappedSymbol } = modalTextContent

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
    return <EthFlowModalBottomContent {...bottomContentParams} buttonText={buttonText} />
  }, [bottomContentParams, buttonText])

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
