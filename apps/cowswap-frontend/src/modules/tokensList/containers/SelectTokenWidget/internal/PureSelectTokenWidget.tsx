/**
 * PureSelectTokenWidget - A pure, composable token selector
 *
 * This component receives all data as props and has no internal data fetching.
 * Use this for maximum flexibility and testability.
 *
 * Usage:
 * <SelectTokenWidget onSelect={handleSelect} onDismiss={close}>
 *   <SelectTokenWidget.Header title="Select token" />
 *   <SelectTokenWidget.Search value={search} onChange={setSearch} />
 *   <SelectTokenWidget.FavoriteTokens tokens={favorites} />
 *   <SelectTokenWidget.RecentTokens tokens={recents} />
 *   <SelectTokenWidget.AllTokens tokens={allTokens} />
 * </SelectTokenWidget>
 */
import { ReactNode, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { createPortal } from 'react-dom'

import { AllTokens } from './slots/AllTokens'
import { BlockingView } from './slots/BlockingView'
import { ChainSelector, DesktopChainPanel } from './slots/ChainSelector'
import { FavoriteTokens } from './slots/FavoriteTokens'
import { Header } from './slots/Header'
import { NetworkPanel } from './slots/NetworkPanel'
import { RecentTokens } from './slots/RecentTokens'
import { Search } from './slots/Search'
import { TokenList } from './slots/TokenList'
import { CoreProvider, CoreStore } from './store/CoreStore'

import { WidgetCard, WidgetOverlay } from '../styled'

export interface PureSelectTokenWidgetProps {
  children: ReactNode
  onSelect: (token: TokenWithLogo) => void
  onDismiss: () => void
  isOpen?: boolean
}

export function PureSelectTokenWidget({
  children,
  onSelect,
  onDismiss,
  isOpen = true,
}: PureSelectTokenWidgetProps): ReactNode {
  const store = useMemo<CoreStore>(() => ({ onSelect, onDismiss }), [onSelect, onDismiss])

  if (!isOpen) return null

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>): void => {
    if (event.target === event.currentTarget) onDismiss()
  }

  const content = (
    <CoreProvider value={store}>
      <WidgetOverlay onClick={handleOverlayClick}>
        <WidgetCard $isCompactLayout={false} $hasChainPanel={false}>
          {children}
        </WidgetCard>
      </WidgetOverlay>
    </CoreProvider>
  )

  if (typeof document === 'undefined') return content

  return createPortal(content, document.body)
}

// Attach all slots as static properties
PureSelectTokenWidget.Header = Header
PureSelectTokenWidget.Search = Search
PureSelectTokenWidget.FavoriteTokens = FavoriteTokens
PureSelectTokenWidget.RecentTokens = RecentTokens
PureSelectTokenWidget.AllTokens = AllTokens
PureSelectTokenWidget.TokenList = TokenList
PureSelectTokenWidget.ChainSelector = ChainSelector
PureSelectTokenWidget.DesktopChainPanel = DesktopChainPanel
PureSelectTokenWidget.NetworkPanel = NetworkPanel
PureSelectTokenWidget.BlockingView = BlockingView
