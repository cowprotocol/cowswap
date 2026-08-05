import { useCallback } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useErrorModal } from 'legacy/hooks/useErrorMessageAndModal'

import { useSolanaApproveCallback } from 'modules/trade'

interface UseSolanaTokenApproveParams {
  token: TokenWithLogo
  openApproveModal: (tokenSymbol?: string) => void
  closeApproveModal: Command
  toggleWalletModal: Command
}

export function useSolanaTokenApprove({
  token,
  openApproveModal,
  closeApproveModal,
  toggleWalletModal,
}: UseSolanaTokenApproveParams): () => Promise<void> {
  const { account } = useWalletInfo()
  const { handleSetError, handleCloseError } = useErrorModal()
  const solanaApprove = useSolanaApproveCallback(token)

  return useCallback(async () => {
    handleCloseError()

    if (!account) {
      toggleWalletModal()
      return
    }

    try {
      openApproveModal(token.symbol)
      await solanaApprove?.()
    } catch (error) {
      console.error(`[TokensTableRow]: Issue approving Solana delegation.`, error)
      handleSetError(error instanceof Error ? error.message : String(error))
    } finally {
      closeApproveModal()
    }
  }, [
    account,
    solanaApprove,
    handleCloseError,
    handleSetError,
    toggleWalletModal,
    token.symbol,
    openApproveModal,
    closeApproveModal,
  ])
}
