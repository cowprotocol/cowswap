export type CmsEntity<T> = {
  id: number
  attributes?: T | null
}

export type CmsEnvironmentAttributes = {
  name?: string | null
}

export type CmsMediaAttributes = {
  url?: string | null
}

export type CmsNetworkAttributes = {
  chainId?: number | null
  name?: string | null
  label?: string | null
  chainName?: string | null
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

export type CmsSolverNetworkAttributes = {
  active?: boolean | null
  address?: string | null
  network?: { data?: CmsEntity<CmsNetworkAttributes> | null } | null
  environment?: { data?: CmsEntity<CmsEnvironmentAttributes> | null } | null
}

export type CmsSolversResponse = {
  data?: CmsEntity<CmsSolverAttributes>[] | null
}

export type CmsSolverWithRequiredFields = CmsSolverAttributes & {
  solverId: string
  displayName: string
}

export type SolverDeployment = {
  chainId: number
  chainName: string
  environment?: string
  address?: string
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

export type SolverNetworkInfo = {
  chainId: number
  chainName: string
  environments: string[]
}

export type SolversInfo = SolverInfo[]
