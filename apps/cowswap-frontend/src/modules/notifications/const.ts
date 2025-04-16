import { CmsClient } from '@cowprotocol/cms'

// TODO: use getCmsClient() instead
export const notificationsCmsClient = CmsClient({
  url: 'http://localhost:1337/api',
})
