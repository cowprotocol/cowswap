import { ReactNode, useCallback } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useIsDarkMode } from 'legacy/state/user/hooks'

import { useOnSelectNetwork } from 'common/hooks/useOnSelectNetwork'

import { useSolanaAlphaAcknowledgement } from '../../hooks/useSolanaAlphaAcknowledgement'
import { useSolanaAlphaRiskModal } from '../../hooks/useSolanaAlphaRiskModal'
import { SolanaAlphaRiskModal } from '../../pure/SolanaAlphaRiskModal'

export function SolanaAlphaRiskModalContainer(): ReactNode {
  const isDarkMode = useIsDarkMode()
  const { isAcknowledgementRequired, acknowledge } = useSolanaAlphaAcknowledgement()
  const { closeModal } = useSolanaAlphaRiskModal()
  const onSelectNetwork = useOnSelectNetwork()

  const onAcknowledge = useCallback(() => {
    acknowledge()
    closeModal()
  }, [acknowledge, closeModal])

  const onGoBack = useCallback(() => {
    void onSelectNetwork(SupportedChainId.MAINNET, true)
  }, [onSelectNetwork])

  return (
    <SolanaAlphaRiskModal
      isDarkMode={isDarkMode}
      requiresAcknowledgement={isAcknowledgementRequired}
      onAcknowledge={onAcknowledge}
      onGoBack={onGoBack}
      onClose={closeModal}
    />
  )
}
