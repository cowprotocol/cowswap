import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'

import useSWR, { SWRResponse } from 'swr'

import { useENSRegistrarContract } from './useENSRegistrarContract'

export function useENSResolver(node: string | undefined): SWRResponse<string> {
  const registrarContract = useENSRegistrarContract()

  return useSWR(
    node && registrarContract ? ['useENSResolver', node, registrarContract] : null,
    async ([_, _node, contract]) => contract.callStatic.resolver(_node),
    SWR_NO_REFRESH_OPTIONS
  )
}
