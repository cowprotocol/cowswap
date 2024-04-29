import React, { HTMLProps } from 'react'

import { externalLinkAnalytics, outboundLink } from '@cowprotocol/analytics'
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
export const LinkIcon = styled(LinkIconFeather)`
  height: 16px;
  width: 18px;
  margin: 0 10px 0 0;
  stroke: currentColor;
`

export function handleClickExternalLink(event: React.MouseEvent<HTMLAnchorElement>) {
  const { target, href } = event.currentTarget

  const anonymizedHref = anonymizeLink(href)

  // don't prevent default, don't redirect if it's a new tab
  if (target === '_blank' || event.ctrlKey || event.metaKey) {
    outboundLink({ label: anonymizedHref }, () => {
      console.debug('Fired outbound link event', anonymizedHref)
    })
  } else {
    event.preventDefault()
    // send a ReactGA event and then trigger a location change
    outboundLink({ label: anonymizedHref }, () => {
      window.location.href = anonymizedHref
    })
  }
}

/**
 * Outbound link that handles firing google analytics events
 */
export function ExternalLink({
  target = '_blank',
  href,
  rel = 'noopener noreferrer',
  onClickOptional,
  ...rest
}: Omit<HTMLProps<HTMLAnchorElement>, 'as' | 'ref' | 'onClick'> & {
  href: string
  onClickOptional?: React.MouseEventHandler<HTMLAnchorElement>
}) {
  return (
    <StyledLink
      target={target}
      rel={rel}
      href={href}
      onClick={(event) => {
        if (onClickOptional) onClickOptional(event)
        handleClickExternalLink(event)
        externalLinkAnalytics(href)
      }}
      {...rest}
    />
  )
}

export function ExternalLinkIcon({
  target = '_blank',
  href,
  rel = 'noopener noreferrer',
  ...rest
}: Omit<HTMLProps<HTMLAnchorElement>, 'as' | 'ref' | 'onClick'> & { href: string }) {
  return (
    <LinkIconWrapper target={target} rel={rel} href={href} onClick={handleClickExternalLink} {...rest}>
      <LinkIcon />
    </LinkIconWrapper>
  )
}
