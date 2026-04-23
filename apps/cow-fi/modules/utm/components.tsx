import React, { AnchorHTMLAttributes, ComponentType, useMemo } from 'react'

import { UtmParams } from '@cowprotocol/common-utils'

import Link, { LinkProps } from 'next/link'

import { addUtmToUrl } from './utils'

export const defaultUtm: UtmParams = {
  utmSource: 'cow.fi',
  utmMedium: 'web',
  utmContent: 'link',
}

export interface LinkWithUtmProps
  extends Pick<AnchorHTMLAttributes<HTMLElement>, 'rel' | 'target'>,
    React.PropsWithChildren<LinkProps> {
  defaultUtm?: UtmParams
}

export function LinkWithUtmComponent(p: LinkWithUtmProps): React.ReactNode {
  const { href, as, children, defaultUtm: providedUtm, ...props } = p

  const newHref = useMemo(() => {
    if (providedUtm && typeof href === 'string') {
      return addUtmToUrl(href, providedUtm)
    }
    return href
  }, [providedUtm, href])

  return (
    <Link href={newHref} as={as} target="_blank" rel="noopener nofollow" {...props}>
      {children}
    </Link>
  )
}

export function withUtmLink<T extends React.JSX.IntrinsicAttributes>(
  Component: ComponentType<T>,
): React.ComponentType<T & LinkWithUtmProps> {
  const WrappedComponent = (props: T & LinkWithUtmProps): React.ReactNode => {
    return (
      <LinkWithUtmComponent {...props}>
        <Component {...(props as T)} />
      </LinkWithUtmComponent>
    )
  }

  WrappedComponent.displayName = `withUtmLink(${Component.displayName || Component.name || 'Component'})`

  return WrappedComponent
}
