import React from 'react'
import { ExternalLink } from 'theme/index'
import HashLink from 'components/HashLink'

export { ExternalLink } from 'theme/index'
const SCROLL_OFFSET = 24

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

  const scrollWithOffset = (el: HTMLElement) => {
    const yCoordinate = el.getBoundingClientRect().top + window.pageYOffset
    window.scrollTo({ top: yCoordinate - SCROLL_OFFSET, behavior: 'smooth' })
  }

  return (
    <Link smooth={smooth} {...otherProps} scroll={scrollWithOffset}>
      {children}
    </Link>
  )
}
