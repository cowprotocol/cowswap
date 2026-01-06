/**
 * BlockingView Slot - Full-screen modals that take over the widget
 *
 * All blocking views receive their data via props.
 */
import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { ListState } from '@cowprotocol/tokens'

import { ImportListModal } from '../../../../pure/ImportListModal'
import { ImportTokenModal } from '../../../../pure/ImportTokenModal'
import { LpTokenPage } from '../../../LpTokenPage'
import { ManageListsAndTokens } from '../../../ManageListsAndTokens'

export interface BlockingViewProps {
  standalone?: boolean
  tokenToImport?: TokenWithLogo
  listToImport?: ListState
  isManageWidgetOpen?: boolean
  selectedPoolAddress?: string
  allTokenLists?: ListState[]
  userAddedTokens?: TokenWithLogo[]
  onDismiss: () => void
  onBackFromImport?: () => void
  onImportTokens?: (tokens: TokenWithLogo[]) => void
  onImportList?: (list: ListState) => void
  onCloseManageWidget?: () => void
  onClosePoolPage?: () => void
  onSelectToken?: (token: TokenWithLogo) => void
}

// eslint-disable-next-line complexity
export function BlockingView({
  standalone = false,
  tokenToImport,
  listToImport,
  isManageWidgetOpen,
  selectedPoolAddress,
  allTokenLists = [],
  userAddedTokens = [],
  onDismiss,
  onBackFromImport,
  onImportTokens,
  onImportList,
  onCloseManageWidget,
  onClosePoolPage,
  onSelectToken,
}: BlockingViewProps): ReactNode {
  const handleBack = onBackFromImport ?? onDismiss

  if (tokenToImport && !standalone && onImportTokens) {
    return (
      <ImportTokenModal tokens={[tokenToImport]} onDismiss={onDismiss} onBack={handleBack} onImport={onImportTokens} />
    )
  }

  if (listToImport && !standalone && onImportList) {
    return <ImportListModal list={listToImport} onDismiss={onDismiss} onBack={handleBack} onImport={onImportList} />
  }

  if (isManageWidgetOpen && !standalone && onCloseManageWidget) {
    return (
      <ManageListsAndTokens
        lists={allTokenLists}
        customTokens={userAddedTokens}
        onDismiss={onDismiss}
        onBack={onCloseManageWidget}
      />
    )
  }

  if (selectedPoolAddress && onSelectToken && onClosePoolPage) {
    return (
      <LpTokenPage
        poolAddress={selectedPoolAddress}
        onDismiss={onDismiss}
        onBack={onClosePoolPage}
        onSelectToken={onSelectToken}
      />
    )
  }

  return null
}
