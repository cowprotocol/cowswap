import { AnchorHTMLAttributes, useMemo } from 'react'
import Link, { LinkProps } from 'next/link'
import { UtmParams, useUtm } from 'modules/utm'
import { addUtmToUrl, hasUtmCodes } from 'modules/utm/utils'

interface LinkWithUtmProps
  extends Pick<AnchorHTMLAttributes<HTMLElement>, 'rel' | 'target'>,
    React.PropsWithChildren<LinkProps> {
  defaultUtm: UtmParams
}

export function LinkWithUtm(p: LinkWithUtmProps): JSX.Element {
  const { href, as, children, defaultUtm, ...props } = p
  const utm = useUtm()

  const newHref = useMemo(() => {
    const utmAux = getUtm(utm, defaultUtm)
    if (utmAux && typeof href === 'string') {
      return addUtmToUrl(href, utmAux)
    }
    return href
  }, [utm, defaultUtm, href])

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
