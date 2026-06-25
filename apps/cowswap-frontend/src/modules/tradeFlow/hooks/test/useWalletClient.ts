'use client'
// Almost identical implementation to `useConnectorClient` (except for return type)
// Should update both in tandem

import { useEffect, useRef } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { type GetWalletClientData, type GetWalletClientOptions } from '@wagmi/core/query'
import { useChainId, useConfig, useConnection } from 'wagmi'
import { useQuery, UseQueryReturnType } from 'wagmi/query'

import { getWalletClientQueryOptions } from './getWalletClient'
import { printJson } from './printJson'

import type { Config, GetWalletClientErrorType, ResolvedRegister } from '@wagmi/core'
import type { Compute, ConfigParameter } from '@wagmi/core/internal'

export type UseWalletClientParameters<
  config extends Config = Config,
  chainId extends config['chains'][number]['id'] = config['chains'][number]['id'],
  selectData = GetWalletClientData<config, chainId>,
> = Compute<GetWalletClientOptions<config, chainId, selectData> & ConfigParameter<config>>

export type UseWalletClientReturnType<
  config extends Config = Config,
  chainId extends config['chains'][number]['id'] = config['chains'][number]['id'],
  selectData = GetWalletClientData<config, chainId>,
> = UseQueryReturnType<selectData, GetWalletClientErrorType>

/** https://wagmi.sh/react/api/hooks/useWalletClient */
export function useWalletClient<
  config extends Config = ResolvedRegister['config'],
  chainId extends config['chains'][number]['id'] = config['chains'][number]['id'],
  selectData = GetWalletClientData<config, chainId>,
>(
  parameters: UseWalletClientParameters<config, chainId, selectData> = {},
): UseWalletClientReturnType<config, chainId, selectData> {
  const config = useConfig(parameters)
  const chainId = useChainId({ config })
  const { address, connector } = useConnection({ config })
  const options = getWalletClientQueryOptions(config, {
    ...parameters,
    chainId: parameters.chainId ?? chainId,
    connector: parameters.connector ?? connector,
    query: parameters.query as never,
  })

  const addressRef = useRef(address)
  const queryClient = useQueryClient()
  // biome-ignore lint/correctness/useExhaustiveDependencies: `queryKey` not required
  useEffect(() => {
    const previousAddress = addressRef.current
    if (!address && previousAddress) {
      console.log('AAAAAAA removeQueries', previousAddress)
      printJson({ key: 'removeQueries', data: { previousAddress } })
      // remove when account is disconnected
      queryClient.removeQueries({ queryKey: options.queryKey })
      addressRef.current = undefined
    } else if (address !== previousAddress) {
      console.log('AAAAAAAA invalidateQueries', options.queryKey)
      printJson({ key: 'invalidateQueries', data: { queryKey: options.queryKey } })
      // invalidate when address changes
      queryClient.invalidateQueries({ queryKey: options.queryKey })
      addressRef.current = address
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, queryClient])

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = useQuery(options) as any

  printJson({ key: 'hasClient', data: { res: !!result.data } })

  return result
}
