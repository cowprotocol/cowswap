import { type MouseEvent, type ReactNode } from 'react'

import { useCopyClipboard } from '@cowprotocol/common-hooks'
import { UI, LinkStyledButton } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { CheckCircle, Copy } from 'react-feather'
import styled, { DefaultTheme, StyledComponentProps } from 'styled-components/macro'

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
  children?: ReactNode
  clickableLink?: boolean
  copyIconWidth?: string
  hideCopiedLabel?: boolean
  onCopy?: () => void
}

export default function CopyHelper(props: CopyHelperProps): ReactNode {
  const { toCopy, children, clickableLink, copyIconWidth, hideCopiedLabel = false, onCopy, ...rest } = props
  const [isCopied, setCopied] = useCopyClipboard()

  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation()
    setCopied(toCopy)
    onCopy?.()
  }

  return (
    <>
      {clickableLink && (
        <LinkStyledButton
          onClick={() => {
            setCopied(toCopy)
            onCopy?.()
          }}
        >
          {toCopy}
        </LinkStyledButton>
      )}
      <CopyIcon isCopied={isCopied} onClick={handleClick} copyIconWidth={copyIconWidth} {...rest}>
        {isCopied ? (
          <TransactionStatusText
            isCopied={isCopied} // mod
          >
            <CheckCircleIconWrapper size={'16'} />
            {!hideCopiedLabel ? (
              <TransactionStatusText
                isCopied={isCopied} // mod
              >
                <Trans>Copied</Trans>
              </TransactionStatusText>
            ) : null}
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
