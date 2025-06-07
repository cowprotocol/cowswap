import React, { useCallback } from 'react'

import { useCopyClipboard } from '@cowprotocol/common-hooks'

import { Trans } from '@lingui/macro'
import { CheckCircle, Copy } from 'react-feather'
import styled from 'styled-components/macro'
import { LinkStyledButton } from 'theme'

const CopyIcon = styled(LinkStyledButton)`
  color: ${({ color, theme }) => color || theme.info};
  flex-shrink: 0;
  display: flex;
  text-decoration: none;
  :hover,
  :active,
  :focus {
    text-decoration: none;
    color: ${({ color, theme }) => color || theme.disabledText};
  }
`
const StyledText = styled.span`
  margin-left: 0.25rem;
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const Copied = ({ iconSize }: { iconSize?: number }) => (
  <StyledText>
    <CheckCircle size={iconSize ?? '16'} />
    <StyledText>
      <Trans>Copied</Trans>
    </StyledText>
  </StyledText>
)

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const Icon = ({ iconSize }: { iconSize?: number }) => (
  <StyledText>
    <Copy size={iconSize ?? '16'} />
  </StyledText>
)

interface BaseProps {
  toCopy: string
  color?: string
  iconSize?: number
  iconPosition?: 'left' | 'right'
}
export type CopyHelperProps = BaseProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CopyHelper({ color, toCopy, children, iconSize, iconPosition }: CopyHelperProps) {
  const [isCopied, setCopied] = useCopyClipboard()
  const copy = useCallback(() => {
    setCopied(toCopy)
  }, [toCopy, setCopied])

  return (
    <CopyIcon onClick={copy} color={color}>
      {iconPosition === 'left' ? isCopied ? <Copied iconSize={iconSize} /> : <Icon iconSize={iconSize} /> : null}
      {iconPosition === 'left' && <>&nbsp;</>}
      {isCopied ? '' : children}
      {iconPosition === 'right' && <>&nbsp;</>}
      {iconPosition === 'right' ? isCopied ? <Copied iconSize={iconSize} /> : <Icon iconSize={iconSize} /> : null}
    </CopyIcon>
  )
}
