import { CMS_BASE_URL } from '@cowprotocol/core'

const CMS_BASE_URL_ROOT = CMS_BASE_URL.replace('/api', '') // TODO: fix this, base url should not have /api

function toCmsAbsoluteUrl(url: string) {
  return url.startsWith('http') ? url : `${CMS_BASE_URL_ROOT}${url}`
}

export function CmsImage({ src, className, alt, ...props }: JSX.IntrinsicElements['img']) {
  if (!src) return null

  return <img src={toCmsAbsoluteUrl(src)} className={className} alt={alt} {...props} />
}
