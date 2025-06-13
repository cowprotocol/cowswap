import React, { MouseEvent } from 'react'

import { useCopyClipboard } from '@cowprotocol/common-hooks'
import { UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import { CheckCircle, Copy } from 'react-feather'
import styled, { DefaultTheme, StyledComponentProps } from 'styled-components/macro'
import { LinkStyledButton } from 'theme'

import { TransactionStatusText } from 'legacy/components/Copy/index'

// MOD imports
export const CopyIcon = styled(LinkStyledButton)<{ copyIconWidth?: string }>`
  --iconSize: var(${UI.ICON_SIZE_NORMAL});
  color: inherit;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 0.825rem;
  border-radius: 50%;
  background-color: transparent;
  width: ${({ copyIconWidth }) => copyIconWidth || 'auto'};
  min-width: var(--iconSize);
  min-height: var(--iconSize);
  align-self: flex-end;
  :hover,
  :active,
  :focus {
    text-decoration: none;
    color: inherit;
  }
`

const CheckCircleIconWrapper = styled(CheckCircle)`
  margin: 0 4px 0 0;
`

interface CopyHelperProps
  extends StyledComponentProps<
    typeof CopyIcon,
    DefaultTheme,
    {
      disabled?: boolean
      bg?: boolean
      isCopied?: boolean
      color?: string
    },
    never
  > {
  toCopy: string
  children?: React.ReactNode
  clickableLink?: boolean
  copyIconWidth?: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function CopyHelper(props: CopyHelperProps) {
  const { toCopy, children, clickableLink, copyIconWidth, ...rest } = props
  const [isCopied, setCopied] = useCopyClipboard()

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setCopied(toCopy)
  }

  return (
    <>
      {clickableLink && <LinkStyledButton onClick={() => setCopied(toCopy)}>{toCopy}</LinkStyledButton>}
      <CopyIcon isCopied={isCopied} onClick={handleClick} copyIconWidth={copyIconWidth} {...rest}>
        {isCopied ? (
          <TransactionStatusText
            isCopied={isCopied} // mod
          >
            <CheckCircleIconWrapper size={'16'} />
            <TransactionStatusText
              isCopied={isCopied} // mod
            >
              <Trans>Copied</Trans>
            </TransactionStatusText>
          </TransactionStatusText>
        ) : (
          <TransactionStatusText>
            <Copy size={'16'} />
          </TransactionStatusText>
        )}
        {isCopied ? '' : children}
      </CopyIcon>
    </>
  )
}
