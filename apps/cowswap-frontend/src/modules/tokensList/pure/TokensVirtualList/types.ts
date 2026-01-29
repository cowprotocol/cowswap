import { TokenWithLogo } from '@cowprotocol/common-const'

export type TokensVirtualRow =
  | { type: 'favorite-section'; tokens: TokenWithLogo[]; hideTooltip?: boolean }
  | { type: 'title'; label: string; actionLabel?: string; onAction?: () => void }
  | { type: 'token'; token: TokenWithLogo }
