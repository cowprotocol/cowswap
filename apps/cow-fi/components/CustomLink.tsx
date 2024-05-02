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

  if (utmContent) {
    return (
      <LinkWithUtm href={url} rel={rel} onClick={onClick} passHref defaultUtm={{ ...CONFIG.utm, utmContent }}>
        <span rel={rel} onClick={onClick}>
          {title}
        </span>
      </LinkWithUtm>
    )
  }

  return (
    <Link href={url} target={target} rel={rel} onClick={onClick} passHref>
      {title}
    </Link>
  )
}
