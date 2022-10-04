import styled from 'styled-components/macro'

import { useCallback, useMemo } from 'react'
import { BottomContentParams, EthFlowModalBottomContent } from './EthFlowModalBottomContent'

import { ConfirmationModalContent } from 'components/TransactionConfirmationModal'
import { BalanceChecks, EthFlowModalTopContent } from './EthFlowModalTopContent'
import { EthFlowState } from '../..'
import { EthFlowConfig, ethFlowConfigs } from 'components/swap/EthFlow/pure/EthFlowModalContent/configs'

const EthFlowModalLayout = styled(ConfirmationModalContent)`
  padding: 22px;
`

export type ModalTextContentProps = {
  wrappedSymbol: string
  nativeSymbol: string
  state: EthFlowState
  isExpertMode: boolean
  isNative: boolean
  wrapSubmitted: boolean
  approveSubmitted: boolean
}

// returns modal content: header and descriptions based on state
export function _getModalTextContent(params: ModalTextContentProps): EthFlowConfig {
  const { wrappedSymbol, nativeSymbol, state, isExpertMode } = params

  return ethFlowConfigs[state]({ isExpertMode, nativeSymbol, wrappedSymbol })
}

export interface EthFlowModalContentProps {
  balanceChecks: BalanceChecks
  modalTextContent: ModalTextContentProps
  bottomContentParams: BottomContentParams
  onDismiss: () => void
}

export function EthFlowModalContent(props: EthFlowModalContentProps) {
  const { modalTextContent, balanceChecks, bottomContentParams, onDismiss } = props
  const { nativeSymbol, state } = modalTextContent

  const { title, descriptions } = useMemo(() => _getModalTextContent(modalTextContent), [modalTextContent])

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
    return <EthFlowModalBottomContent {...bottomContentParams} />
  }, [bottomContentParams])

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
