import { CmsClient } from '@cowprotocol/cms'

export const cmsClient = CmsClient({
  url: process.env.REACT_APP_CMS_BASE_URL || 'https://cms.cow.fi/api',
})
