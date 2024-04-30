import { CONFIG } from '@/const/meta'
import { LinkWithUtm, UtmParams } from 'modules/utm'
import Link from 'next/link'

type CustomLinkType = 'internal' | 'external' | 'external_untrusted'

export interface CustomLinkProps {
  url: string
  label: string // TODO: label
  type?: CustomLinkType
  utmContent?: string
  onClick?: () => void
}

function getAnchorRel(type?: CustomLinkType): { target?: string; rel?: string } {
  switch (type) {
    case 'external_untrusted':
      return {
        target: '_blank',
        rel: 'noopener noreferrer nofollow',
      }

    case 'external':
      return {
        target: '_blank',
        rel: 'noopener',
      }
  }

  return {}
}

export function CustomLink(props: CustomLinkProps) {
  const { url, label: title, type = 'internal', onClick, utmContent } = props
  const { rel, target } = getAnchorRel(type)

  const [LinkComponent, defaultUtm] = utmContent ? [LinkWithUtm, { ...CONFIG.utm, utmContent }] : [Link, undefined]

  return (
    <LinkComponent href={url} passHref defaultUtm={defaultUtm}>
      <a target={target} rel={rel} onClick={onClick}>
        {title}
      </a>
    </LinkComponent>
  )
}
