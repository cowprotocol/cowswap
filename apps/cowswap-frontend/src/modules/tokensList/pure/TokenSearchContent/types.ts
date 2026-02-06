import { TokenWithLogo } from '@cowprotocol/common-const'
import { TokenSearchResponse } from '@cowprotocol/tokens'

import { SelectTokenContext } from '../../types'

export interface TokenSearchContentProps {
  searchInput: string
  searchResults: TokenSearchResponse
  selectTokenContext: SelectTokenContext
  importToken: (tokenToImport: TokenWithLogo) => void
  areTokensFromBridge?: boolean
  bridgeSupportedTokensMap?: Record<string, boolean> | null
}

export type TokenImportSection = 'blockchain' | 'inactive' | 'external'

export type TokenSearchRow =
  | { type: 'banner' }
  | { type: 'token'; token: TokenWithLogo; disabled?: boolean; disabledReason?: string }
  | { type: 'section-title'; text: string; tooltip?: string }
  | {
      type: 'import-token'
      token: TokenWithLogo
      shadowed?: boolean
      section: TokenImportSection
      isFirstInSection: boolean
      isLastInSection: boolean
      wrapperId?: string
      hideImport?: boolean
      disabledReason?: string
    }

export interface UseSearchRowsParams {
  isLoading: boolean
  matchedTokens: TokenWithLogo[]
  activeList: TokenWithLogo[]
  blockchainResult?: TokenWithLogo[]
  inactiveListsResult?: TokenWithLogo[]
  externalApiResult?: TokenWithLogo[]
  bridgeSupportedTokensMap?: Record<string, boolean> | null
  areTokensFromBridge?: boolean
}

export interface AppendImportSectionParams {
  tokens?: TokenWithLogo[]
  section: TokenImportSection
  limit: number
  sectionTitle?: string
  tooltip?: string
  shadowed?: boolean
  wrapperId?: string
  bridgeSupportedTokensMap?: Record<string, boolean> | null
  areTokensFromBridge?: boolean
}

export interface TokenSearchRowRendererProps {
  row: TokenSearchRow
  selectTokenContext: SelectTokenContext
  importToken(token: TokenWithLogo): void
}
