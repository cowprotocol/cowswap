import { ReactNode, useCallback, useEffect } from 'react'

import { isSolanaChain, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useIsDarkMode } from 'legacy/state/user/hooks'

import { useOnSelectNetwork } from 'common/hooks/useOnSelectNetwork'
import { CowModal } from 'common/pure/Modal'

import { useSolanaAlphaAcknowledgement } from '../../hooks/useSolanaAlphaAcknowledgement'
import { useSolanaAlphaRiskModal } from '../../hooks/useSolanaAlphaRiskModal'
import { SolanaAlphaRiskModal } from '../../pure/SolanaAlphaRiskModal'

export function SolanaAlphaRiskModalContainer(): ReactNode {
  const { chainId } = useWalletInfo()
  const isDarkMode = useIsDarkMode()
  const { isAcknowledgementRequired, acknowledge } = useSolanaAlphaAcknowledgement()
  const { isOpen: isRiskModalOpen, closeModal } = useSolanaAlphaRiskModal()
  const onSelectNetwork = useOnSelectNetwork()

  const isSolana = isSolanaChain(chainId)

  useEffect(() => {
    if (!isSolana) closeModal()
  }, [isSolana, closeModal])

  const onAcknowledge = useCallback(() => {
    acknowledge()
    closeModal()
  }, [acknowledge, closeModal])

  const onGoBack = useCallback(() => {
    void onSelectNetwork(SupportedChainId.MAINNET, true)
  }, [onSelectNetwork])

  const onDismiss = useCallback(() => {
    if (!isAcknowledgementRequired) closeModal()
  }, [isAcknowledgementRequired, closeModal])

  const isOpen = isSolana && (isAcknowledgementRequired || isRiskModalOpen)

  return (
    <CowModal isOpen={isOpen} onDismiss={onDismiss} maxWidth={470}>
      <SolanaAlphaRiskModal
        isDarkMode={isDarkMode}
        requiresAcknowledgement={isAcknowledgementRequired}
        onAcknowledge={onAcknowledge}
        onGoBack={onGoBack}
        onClose={closeModal}
      />
    </CowModal>
  )
}
