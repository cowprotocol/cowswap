import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { useTryFindIntermediateToken } from 'modules/bridge'

export interface AddIntermediateModalHandlers {
  onDismiss: () => void
  onBack: () => void
  onImport: (token: TokenWithLogo) => void
}

export function useWidgetModals(): {
  showNativeWrapModal: boolean
  openNativeWrapModal: () => void
  dismissNativeWrapModal: () => void
  showAddIntermediateTokenModal: boolean
  setShowAddIntermediateTokenModal: Dispatch<SetStateAction<boolean>>
  addIntermediateModalHandlers: AddIntermediateModalHandlers
} {
  const [showNativeWrapModal, setShowNativeWrapModal] = useState(false)
  const [showAddIntermediateTokenModal, setShowAddIntermediateTokenModal] = useState(false)

  const openNativeWrapModal = useCallback(() => setShowNativeWrapModal(true), [])
  const dismissNativeWrapModal = useCallback(() => setShowNativeWrapModal(false), [])

  const addIntermediateModalHandlers = useMemo<AddIntermediateModalHandlers>(
    () => ({
      onDismiss: () => setShowAddIntermediateTokenModal(false),
      onBack: () => setShowAddIntermediateTokenModal(false),
      onImport: (_token) => setShowAddIntermediateTokenModal(false),
    }),
    [setShowAddIntermediateTokenModal],
  )

  return {
    showNativeWrapModal,
    openNativeWrapModal,
    dismissNativeWrapModal,
    showAddIntermediateTokenModal,
    setShowAddIntermediateTokenModal,
    addIntermediateModalHandlers,
  }
}

export function useIntermediateTokenModalVisibility({
  showAddIntermediateTokenModal,
  setShowAddIntermediateTokenModal,
  toBeImported,
  intermediateBuyToken,
}: {
  showAddIntermediateTokenModal: boolean
  setShowAddIntermediateTokenModal: Dispatch<SetStateAction<boolean>>
  toBeImported: ReturnType<typeof useTryFindIntermediateToken>['toBeImported']
  intermediateBuyToken: ReturnType<typeof useTryFindIntermediateToken>['intermediateBuyToken']
}): boolean {
  const hasIntermediateTokenToImport = Boolean(toBeImported || intermediateBuyToken)

  useEffect(() => {
    if (showAddIntermediateTokenModal && !hasIntermediateTokenToImport) {
      setShowAddIntermediateTokenModal(false)
    }
  }, [showAddIntermediateTokenModal, hasIntermediateTokenToImport, setShowAddIntermediateTokenModal])

  return showAddIntermediateTokenModal && hasIntermediateTokenToImport
}
