import { ExternalLink } from '@cowprotocol/ui'

import { HashLink } from 'react-router-hash-link'

import { scrollToElement } from 'common/utils/scrollToElement'

export interface LinkRendererProps {
  href: string
  children: React.ReactNode
  smooth?: boolean
  className?: string
  scroll?: ((element: HTMLElement) => void) | undefined
}

export function Link(props: LinkRendererProps) {
  const { children, href = '#', smooth, scroll, className } = props
  const isExternalLink = /^(https?:)?\/\//.test(href)
  return isExternalLink ? (
    <ExternalLink href={href} className={className}>
      {children}
    </ExternalLink>
  ) : (
    <HashLink smooth={smooth} to={href} scroll={scroll} className={className}>
      {children}
    </HashLink>
  )
}

export function LinkScrollable(props: LinkRendererProps): JSX.Element {
  const { children, smooth = true, ...otherProps } = props

  return (
    <Link smooth={smooth} {...otherProps} scroll={scrollToElement}>
      {children}
    </Link>
  )
}
