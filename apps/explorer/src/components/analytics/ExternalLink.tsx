import React, { HTMLProps } from 'react'

import { anonymizeLink } from 'utils/anonymizeLink'
import { cowAnalytics } from 'analytics'
import { CowAnalytics } from '@cowprotocol/analytics'

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
}): React.ReactNode {
  return (
    <a
      target={target}
      rel={rel}
      href={href}
      onClick={(event): void => {
        if (onClickOptional) onClickOptional(event)
        handleClickExternalLink(cowAnalytics, event)
      }}
      {...rest}
    />
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
