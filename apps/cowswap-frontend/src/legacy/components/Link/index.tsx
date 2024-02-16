import { ExternalLink } from '@cowprotocol/ui'

import HashLink from 'legacy/components/HashLink'

import { scrollToElement } from 'common/utils/scrollToElement'

export interface LinkRendererProps {
  href: string
  children: React.ReactNode
  smooth?: boolean
  scroll?: ((element: HTMLElement) => void) | undefined
}

export function Link(props: LinkRendererProps) {
  const { children, href = '#', smooth, scroll } = props
  const isExternalLink = /^(https?:)?\/\//.test(href)
  return isExternalLink ? (
    <ExternalLink href={href}>{children}</ExternalLink>
  ) : (
    <HashLink smooth={smooth} to={href} scroll={scroll}>
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
