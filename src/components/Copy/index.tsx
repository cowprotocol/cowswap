import styled from 'styled-components/macro'
import { CopyIcon } from './CopyMod'

export const TransactionStatusText = styled.span<{ isCopied?: boolean }>`
  color: ${({ theme, isCopied }) => (isCopied ? theme.green1 : theme.text3)};
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;

  ${CopyIcon} {
    color: ${({ theme, isCopied }) => (isCopied ? theme.green1 : theme.text3)};
  }
`

export * from './CopyMod'
export { default } from './CopyMod'
