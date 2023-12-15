import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { CopyIcon } from './CopyMod'

export const TransactionStatusText = styled.span<{ isCopied?: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap};
  color: ${({ isCopied }) => (isCopied ? `var(${UI.COLOR_SUCCESS})` : 'inherit')};
  align-items: center;

  ${CopyIcon} {
    color: currentColor;
  }
`

export * from './CopyMod'
export { default } from './CopyMod'
