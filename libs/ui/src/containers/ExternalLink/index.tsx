import React, { HTMLProps, PropsWithChildren } from 'react'

import { Category, toGtmEvent } from '@cowprotocol/analytics'
import { anonymizeLink } from '@cowprotocol/common-utils'

import { ExternalLink as LinkIconFeather } from 'react-feather'
import styled from 'styled-components/macro'

import { UI } from '../../enum'

export const StyledLink = styled.a`
  text-decoration: none;
  cursor: pointer;
  color: var(${UI.COLOR_TEXT});
  font-weight: 500;

  :hover {
    text-decoration: underline;
  }

  :focus {
    outline: none;
    text-decoration: none;
  }

  :active {
    text-decoration: none;
  }
`

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LinkIcon = styled(LinkIconFeather as any)`
  height: 16px;
  width: 18px;
  margin: 0 10px 0 0;
  stroke: currentColor;
`

export type ExternalLinkProps = Omit<HTMLProps<HTMLAnchorElement>, 'as' | 'ref' | 'onClick'> & {
  href: string
  onClickOptional?: React.MouseEventHandler<HTMLAnchorElement>
} & PropsWithChildren

/**
 * Outbound link that handles firing google analytics events
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ExternalLink({
  children,
  target = '_blank',
  href,
  rel = 'noopener noreferrer',
  onClickOptional,
  ...rest
}: ExternalLinkProps) {
  const anonymizedHref = anonymizeLink(href)
  const isNewTab = target === '_blank'

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClickOptional) onClickOptional(event)

    // don't prevent default, don't redirect if it's a new tab
    if (!isNewTab && !event.ctrlKey && !event.metaKey) {
      event.preventDefault()
      window.location.href = anonymizedHref
    }
  }

  return (
    <StyledLink
      target={target}
      rel={rel}
      href={href}
      onClick={handleClick}
      data-click-event={toGtmEvent({
        category: Category.EXTERNAL_LINK,
        action: 'Click external link',
        label: anonymizedHref,
      })}
      {...rest}
    >
      {children}
    </StyledLink>
  )
}
