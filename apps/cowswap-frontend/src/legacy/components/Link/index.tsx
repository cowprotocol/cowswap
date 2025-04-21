import { ExternalLink } from '@cowprotocol/ui'

import { Link as ReactRouterLink } from 'react-router'

import { scrollToElement } from 'common/utils/scrollToElement'

export interface LinkRendererProps {
  href: string
  children: React.ReactNode
  smooth?: boolean
  className?: string
  scroll?: ((element: HTMLElement) => void) | undefined
}

export function Link(props: LinkRendererProps) {
  const { children, href = '#', className } = props
  const isExternalLink = /^(https?:)?\/\//.test(href)
  return isExternalLink ? (
    <ExternalLink href={href} className={className}>
      {children}
    </ExternalLink>
  ) : (
    <ReactRouterLink to={href} className={className}>
      {children}
    </ReactRouterLink>
  )
}

export function LinkScrollable(props: Readonly<LinkRendererProps>): React.ReactNode {
  const { children, smooth = true, ...otherProps } = props

  return (
    <Link smooth={smooth} {...otherProps} scroll={scrollToElement}>
      {children}
    </Link>
  )
}
