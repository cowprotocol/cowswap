import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { CmsSolversInfo, SolversInfo } from '../types'

export function mapCmsSolversInfoToSolversInfo(cmsSolversInfo: CmsSolversInfo): SolversInfo {
  return cmsSolversInfo.reduce((acc, info) => {
    if (info?.attributes) {
      const { solverId, displayName, image, networks } = info.attributes

      const chainIds = networks?.data?.reduce(
        (acc, network) => (network?.attributes?.chainId ? [...acc, network?.attributes?.chainId] : acc),
        [] as SupportedChainId[]
      )

      // Ignore any that doesn't have a chainId set
      if (!chainIds) {
        return acc
      }

      acc.push({ solverId, displayName, image: image?.data?.attributes?.url, chainIds })
    }

    return acc
  }, [] as SolversInfo)
}
