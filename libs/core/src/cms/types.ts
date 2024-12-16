import { components } from '@cowprotocol/cms'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export type CmsSolversInfo = components['schemas']['SolverListResponseDataItem'][]

export type SolversInfo = SolverInfo[]

export type SolverInfo = {
  solverId: string
  displayName: string
  solverNetworks: SolverNetwork[]
  description?: string
  image?: string
}

export type SolverNetwork = {
  chainId: SupportedChainId
  env: string
  active: boolean
}

export type CmsAnnouncements = components['schemas']['AnnouncementListResponseDataItem'][]

export type Announcement = {
  text: string
  isCritical: boolean
  chainIds: SupportedChainId[]
  envs: string[] // prod and/or barn // TODO: are there types for this already?
}

export type Announcements = Announcement[]
