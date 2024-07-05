import { CmsClient } from '@cowprotocol/cms'
import { isLocal } from '@cowprotocol/common-utils'

export const CMS_BASE_URL =
  process.env.REACT_APP_CMS_BASE_URL || (isLocal ? 'https://cms.barn.cow.fi/api' : 'https://cms.cow.fi/api')

export const cmsClient = CmsClient({
  url: CMS_BASE_URL,
})

export function toCmsAbsoluteUrl(url: string) {
  return url.startsWith('http') ? url : `${CMS_BASE_URL}${url}`
}
