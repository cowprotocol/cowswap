import React, { HTMLProps } from 'react'
import { outboundLink } from 'components/analytics'
import { anonymizeLink } from 'utils/anonymizeLink'

export function handleClickExternalLink(event: React.MouseEvent<HTMLAnchorElement>): void {
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
}): JSX.Element {
  return (
    <a
      target={target}
      rel={rel}
      href={href}
      onClick={(event): void => {
        if (onClickOptional) onClickOptional(event)
        handleClickExternalLink(event)
      }}
      {...rest}
    />
  )
}
