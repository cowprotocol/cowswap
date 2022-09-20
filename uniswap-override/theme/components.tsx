import React, { HTMLProps } from 'react'
import { StyledLink, handleClickExternalLink } from './baseTheme'
import { externalLinkAnalytics } from 'utils/analytics'

export * from '@src/theme/components'

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
