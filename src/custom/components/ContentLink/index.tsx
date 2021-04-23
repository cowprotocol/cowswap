import React from 'react'
import HashLink from 'components/HashLink'

export interface Props {
  href: string
  children: React.ReactNode
  smooth?: boolean
}

export function ContentLink(props: Props): JSX.Element {
  const { href, children, smooth = true } = props
  const isExternalLink = /^(https?:)?\/\//.test(href)
  return isExternalLink ? (
    <a target="_blank" href={href} rel="noopener noreferrer">
      {props.children}
    </a>
  ) : (
    <HashLink smooth={smooth} to={href}>
      {children}
    </HashLink>
  )
}
