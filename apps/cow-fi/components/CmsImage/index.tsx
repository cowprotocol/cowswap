import { CMS_BASE_URL } from '@cowprotocol/core'

import Image, { ImageProps } from 'next/image'

const CMS_BASE_URL_ROOT = CMS_BASE_URL.replace('/api', '') // TODO: fix this, base url should not have /api

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function toCmsAbsoluteUrl(url: string) {
  return url.startsWith('http') ? url : `${CMS_BASE_URL_ROOT}${url}`
}

type CmsImageProps = Omit<ImageProps, 'src'> & {
  src: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CmsImage({ src, className, alt, width, height, ...props }: CmsImageProps) {
  if (!src) return null

  return (
    <Image src={toCmsAbsoluteUrl(src)} className={className} alt={alt || ''} width={width} height={height} {...props} />
  )
}
