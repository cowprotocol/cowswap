import React, { useEffect, useState } from 'react'

import { Media, Color } from '@cowprotocol/ui'

import { faCopy } from '@fortawesome/free-regular-svg-icons'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CopyToClipboard from 'react-copy-to-clipboard'
import styled, { css, FlattenSimpleInterpolation } from 'styled-components/macro'

import { DISPLAY_TEXT_COPIED_CHECK } from '../../../explorer/const'

// Why is `copied` not a boolean?
//   Because it's passed down to parent component (`FontAwesomeIcon`) and
// since it's not consumed in the component, it's passed down to the HTML.
//   Which does not like to receive boolean values, with an error like:
// "Warning: Received `false` for a non-boolean attribute `copied`"
//   Effectively though, it's treated as a boolean, thus the value doesn't matter
const Icon = styled(FontAwesomeIcon)<{ copied?: string; height?: number }>`
  color: ${({ copied }): string => (copied ? Color.explorer_green1 : Color.explorer_grey)};
  transition: color 0.1s ease-in;
  cursor: ${({ copied }): string => (copied ? 'reset' : 'pointer')};
  vertical-align: baseline;
  margin: 0 0 0 0.3rem;
  width: 1.6rem !important;

  ${({ height }): FlattenSimpleInterpolation | undefined | number =>
    height &&
    css`
      height: ${height}rem;
    `}

  &:hover {
    color: ${({ copied }): string => (copied ? Color.explorer_green1 : Color.neutral100)};
  }

  + span {
    color: ${(): string => Color.explorer_green1};
    font-weight: ${({ theme }): string => theme.fontMedium};
    font-size: 1.2rem;
    position: absolute;
    border: 1px solid ${(): string => Color.explorer_green1};
    background-color: ${(): string => Color.explorer_green2};
    padding: 0.5rem;
    border-radius: 0.4rem;
    margin-top: -3rem;
    margin-left: -3.3rem;

    ${Media.upToMedium()} {
      display: none;
    }
  }
`

export type Props = { text: string; onCopy?: (value: string) => void; heightIcon?: number }

/**
 * Simple CopyButton component.
 *
 * Takes in the `text` to be copied when button is clicked
 * Displays the copy icon with theme based color
 * When clicked, displays a green check for DISPLAY_TEXT_COPIED_CHECK seconds,
 * then is back to original copy icon
 */
export function CopyButton(props: Props): React.ReactNode {
  const { text, onCopy, heightIcon } = props

  const [copied, setCopied] = useState(false)
  const handleOnCopy = (): void => {
    setCopied(true)
    onCopy && onCopy(text)
  }

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null

    if (copied) {
      timeout = setTimeout(() => setCopied(false), DISPLAY_TEXT_COPIED_CHECK)
    }

    return (): void => {
      timeout && clearTimeout(timeout)
    }
  }, [copied])

  return (
    <CopyToClipboard text={text} onCopy={handleOnCopy}>
      <span>
        <Icon height={heightIcon} icon={copied ? faCheck : faCopy} copied={copied ? 'true' : undefined} />{' '}
        {copied && <span className="copy-text">Copied</span>}
      </span>
    </CopyToClipboard>
  )
}
