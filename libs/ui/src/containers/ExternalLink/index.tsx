import React, { HTMLProps, PropsWithChildren } from 'react'

import { CowAnalytics, useCowAnalytics } from '@cowprotocol/analytics'
import { anonymizeLink } from '@cowprotocol/common-utils'

import { ExternalLink as LinkIconFeather } from 'react-feather'
import styled from 'styled-components/macro'

import { externalLinkAnalytics } from '../../analytics/events'
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
const LinkIconWrapper = styled.a`
  text-decoration: none;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  display: flex;

  :hover {
    text-decoration: none;
    opacity: 0.7;
  }

  :focus {
    outline: none;
    text-decoration: none;
  }

  :active {
    text-decoration: none;
  }
`
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
export function ExternalLink({
  children,
  target = '_blank',
  href,
  rel = 'noopener noreferrer',
  onClickOptional,
  ...rest
}: ExternalLinkProps) {
  const cowAnalytics = useCowAnalytics()
  return (
    <StyledLink
      target={target}
      rel={rel}
      href={href}
      onClick={(event) => {
        if (onClickOptional) onClickOptional(event)
        handleClickExternalLink(cowAnalytics, event)
        externalLinkAnalytics(cowAnalytics, href)
      }}
      {...rest}
    >
      {children}
    </StyledLink>
  )
}

function handleClickExternalLink(cowAnalytics: CowAnalytics, event: React.MouseEvent<HTMLAnchorElement>): void {
  const { target, href } = event.currentTarget

  const anonymizedHref = anonymizeLink(href)

  const isNewTab = target === '_blank' || event.ctrlKey || event.metaKey

  // don't prevent default, don't redirect if it's a new tab
  if (!isNewTab) {
    event.preventDefault()
  }

  cowAnalytics.outboundLink({
    label: anonymizedHref,
    hitCallback: () => {
      if (isNewTab) {
        console.debug('Fired outbound link event', anonymizedHref)
      } else {
        // send a ReactGA event and then trigger a location change
        window.location.href = anonymizedHref
      }
    },
  })
}

export function ExternalLinkIcon({
  target = '_blank',
  href,
  rel = 'noopener noreferrer',
  ...rest
}: Omit<HTMLProps<HTMLAnchorElement>, 'as' | 'ref' | 'onClick'> & { href: string }) {
  const cowAnalytics = useCowAnalytics()

  return (
    <LinkIconWrapper
      target={target}
      rel={rel}
      href={href}
      onClick={(e) => handleClickExternalLink(cowAnalytics, e)}
      {...rest}
    >
      <LinkIcon />
    </LinkIconWrapper>
  )
}
