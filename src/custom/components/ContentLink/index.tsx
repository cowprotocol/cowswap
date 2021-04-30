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

  const scrollWithOffset = (el: HTMLElement) => {
    const yCoordinate = el.getBoundingClientRect().top + window.pageYOffset
    const yOffset = -24
    window.scrollTo({ top: yCoordinate + yOffset, behavior: 'smooth' })
  }

  return isExternalLink ? (
    <a target="_blank" href={href} rel="noopener noreferrer">
      {props.children}
    </a>
  ) : (
    <HashLink smooth={smooth} to={href} scroll={el => scrollWithOffset(el)}>
      {children}
    </HashLink>
  )
}
