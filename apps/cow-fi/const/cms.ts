export const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_BASE_URL || 'https://cms.cow.fi/api'

const CMS_BASE_URL_ROOT = CMS_BASE_URL.replace('/api', '') // TODO: fix this, base url should not have /api

export function toCmsAbsoluteUrl(url: string) {
  return url.startsWith('http') ? url : `${CMS_BASE_URL_ROOT}${url}`
}
