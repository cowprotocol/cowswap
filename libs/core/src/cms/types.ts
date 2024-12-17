import { components } from '@cowprotocol/cms'
import { CowEnv, SupportedChainId } from '@cowprotocol/cow-sdk'

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
  env: CowEnv
  active: boolean
}

export type CmsAnnouncements = components['schemas']['AnnouncementListResponseDataItem'][]

export type Announcement = {
  text: string
  isCritical: boolean
  chainIds: SupportedChainId[]
  envs: CowEnv[]
}

export type Announcements = Announcement[]
