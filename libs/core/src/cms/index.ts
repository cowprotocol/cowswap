import { CmsClient } from '@cowprotocol/cms'

export const CMS_BASE_URL =
  process.env.REACT_APP_CMS_BASE_URL || process.env.NEXT_PUBLIC_CMS_BASE_URL || 'https://cms.cow.fi/api'

let cmsClient: ReturnType<typeof CmsClient> | undefined

export function getCmsClient() {
  if (!cmsClient) {
    cmsClient = CmsClient({
      url: CMS_BASE_URL,
    })
  }
  return cmsClient
}
