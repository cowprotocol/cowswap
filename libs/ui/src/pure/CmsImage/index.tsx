import { CMS_BASE_URL } from '@cowprotocol/core'

import Image, { ImageProps } from 'next/image'

const CMS_BASE_URL_ROOT = CMS_BASE_URL.replace('/api', '') // TODO: fix this, base url should not have /api

function toCmsAbsoluteUrl(url: string) {
  return url.startsWith('http') ? url : `${CMS_BASE_URL_ROOT}${url}`
}

type CmsImageProps = Omit<ImageProps, 'src'> & {
  src: string
}

export function CmsImage({ src, className, alt, width, height, ...props }: CmsImageProps) {
  if (!src) return null

  return (
    <Image src={toCmsAbsoluteUrl(src)} className={className} alt={alt || ''} width={width} height={height} {...props} />
  )
}
