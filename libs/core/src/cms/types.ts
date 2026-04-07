import { components } from '@cowprotocol/cms'
import { CowEnv, SupportedChainId } from '@cowprotocol/cow-sdk'

export type Announcement = {
  text: string
  isCritical: boolean
  chainIds: SupportedChainId[]
  envs: CowEnv[]
}

export type Announcements = Announcement[]

export type CmsAnnouncements = components['schemas']['AnnouncementListResponseDataItem'][]

export type CmsSolversInfo = components['schemas']['SolverListResponseDataItem'][]

export type NotificationLocation = 'default' | 'speechBubble'

export type RestrictedTokenList = {
  name: string
  tokenListUrl: string
  restrictedCountries: string[]
}

export type RestrictedTokenLists = RestrictedTokenList[]

export type SolverInfo = {
  solverId: string
  displayName: string
  solverNetworks: SolverNetwork[]
  description?: string
  image?: string
}

export type SolverNetwork = {
  chainId: SupportedChainId
  env: CowEnv
}

export type SolversInfo = SolverInfo[]

export const NOTIFICATION_LOCATION_DEFAULT: NotificationLocation = 'default'

export interface NotificationModel {
  id: number
  account: string
  title: string
  description: string
  createdAt: string
  url: string | null
  thumbnail: string | null
  location?: NotificationLocation | null
}
