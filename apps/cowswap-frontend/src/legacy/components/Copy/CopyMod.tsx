import React from 'react'

import { useCopyClipboard } from '@cowprotocol/common-hooks'
import { UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import { CheckCircle, Copy } from 'react-feather'
import styled from 'styled-components/macro'

import { TransactionStatusText } from 'legacy/components/Copy/index'
import { LinkStyledButton } from 'legacy/theme'

// MOD imports
export const CopyIcon = styled(LinkStyledButton)`
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

/* const TransactionStatusText = styled.span`
  margin-left: 0.25rem;
  font-size: 0.825rem;
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
` */

export default function CopyHelper(props: { toCopy: string; children?: React.ReactNode; clickableLink?: boolean }) {
  const { toCopy, children, clickableLink } = props
  const [isCopied, setCopied] = useCopyClipboard()

  return (
    <>
      {clickableLink && <LinkStyledButton onClick={() => setCopied(toCopy)}>{toCopy}</LinkStyledButton>}
      <CopyIcon isCopied={isCopied} onClick={() => setCopied(toCopy)}>
        {isCopied ? (
          <TransactionStatusText
            isCopied={isCopied} // mod
          >
            <CheckCircle size={'16'} />
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
