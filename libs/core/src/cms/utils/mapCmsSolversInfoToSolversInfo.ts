import { CmsSolversInfo, SolverNetwork, SolversInfo } from '../types'

export function mapCmsSolversInfoToSolversInfo(cmsSolversInfo: CmsSolversInfo): SolversInfo {
  return cmsSolversInfo.reduce<SolversInfo>((acc, info) => {
    if (info?.attributes) {
      const { solverId, displayName, image, solver_networks, description } = info.attributes

      // TODO: Reduce function complexity by extracting logic
      // eslint-disable-next-line complexity
      const solverNetworks = solver_networks?.data?.reduce<SolverNetwork[]>((acc, entry) => {
        if (entry.attributes) {
          const { active, network, environment } = entry.attributes
          const chainId = network?.data?.attributes?.chainId
          const cmsEnv = environment?.data?.attributes?.name

          // Ignore the ones that are not active
          if (chainId && cmsEnv && active) {
            // Map to CowEnv
            const env = cmsEnv === 'barn' ? 'staging' : 'prod'
            acc.push({
              chainId,
              env,
              active,
            })
          }
        }

        return acc
      }, [])

      // Ignore any that doesn't have a chainId set
      if (!solverNetworks) {
        return acc
      }

      acc.push({ solverId, displayName, description, image: image?.data?.attributes?.url, solverNetworks })
    }

    return acc
  }, [])
}
