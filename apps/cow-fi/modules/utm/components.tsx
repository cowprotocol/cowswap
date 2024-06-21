import { AnchorHTMLAttributes, useMemo, ComponentType } from 'react'
import Link, { LinkProps } from 'next/link'
import { UtmParams, useUtm } from 'modules/utm'
import { addUtmToUrl, hasUtmCodes } from 'modules/utm/utils'

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

export function LinkWithUtmComponent(p: LinkWithUtmProps): JSX.Element {
  const { href, as, children, defaultUtm: providedUtm = defaultUtm, ...props } = p
  const utm = useUtm()

  const mergedUtm = { ...defaultUtm, ...providedUtm, ...utm }

  const newHref = useMemo(() => {
    if (mergedUtm && typeof href === 'string') {
      return addUtmToUrl(href, mergedUtm)
    }
    return href
  }, [mergedUtm, href])

  return (
    <Link href={newHref} as={as} target="_blank" rel="noopener nofollow" {...props}>
      {children}
    </Link>
  )
}

function getUtm(...utms: (UtmParams | undefined)[]): UtmParams | null {
  for (const utm of utms) {
    if (hasUtmCodes(utm)) {
      return utm || null
    }
  }

  return null
}

export function withUtmLink<T extends JSX.IntrinsicAttributes>(Component: ComponentType<T>) {
  return (props: T & LinkWithUtmProps) => {
    return (
      <LinkWithUtmComponent {...props}>
        <Component {...(props as T)} />
      </LinkWithUtmComponent>
    )
  }
}
