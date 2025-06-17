import { CmsClient } from '@cowprotocol/cms'

export const CMS_BASE_URL = 'https://cms.cow.fi/api'

let cmsClient: ReturnType<typeof CmsClient> | undefined

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getCmsClient() {
  if (!cmsClient) {
    cmsClient = CmsClient({
      url: CMS_BASE_URL,
    })
  }
  return cmsClient
}
