export type SolverNetworkInfo = {
  chainId: number
  chainName: string
  environments: string[]
}

export type SolverDeployment = {
  chainId: number
  chainName: string
  environment?: string
  address?: string
  payoutAddress?: string
  active: boolean
}

export type SolverInfo = {
  solverId: string
  displayName: string
  description?: string
  website?: string
  image?: string
  networks: SolverNetworkInfo[]
  deployments: SolverDeployment[]
}

export type SolversInfo = SolverInfo[]

export type CmsEntity<T> = {
  id: number
  attributes?: T | null
}

export type CmsMediaAttributes = {
  url?: string | null
}

export type CmsEnvironmentAttributes = {
  name?: string | null
}

export type CmsNetworkAttributes = {
  chainId?: number | null
}

export type CmsSolverNetworkAttributes = {
  active?: boolean | null
  address?: string | null
  payoutAddress?: string | null
  payout_address?: string | null
  network?: { data?: CmsEntity<CmsNetworkAttributes> | null } | null
  environment?: { data?: CmsEntity<CmsEnvironmentAttributes> | null } | null
}

export type CmsSolverAttributes = {
  solverId?: string | null
  displayName?: string | null
  description?: string | null
  website?: string | null
  active?: boolean | null
  image?: { data?: CmsEntity<CmsMediaAttributes> | null } | null
  solver_networks?: { data?: CmsEntity<CmsSolverNetworkAttributes>[] | null } | null
}

export type CmsSolversResponse = {
  data?: CmsEntity<CmsSolverAttributes>[] | null
}

export type CmsSolverWithRequiredFields = CmsSolverAttributes & {
  solverId: string
  displayName: string
}
