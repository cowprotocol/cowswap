/* eslint-disable unused-imports/no-unused-vars */
import { QueryOptions } from '@tanstack/react-query'
import { Compute, ExactPartial, QueryParameter, ScopeKeyParameter } from '@wagmi/core/internal'
import { Config, Connector } from 'wagmi'
import {
  GetWalletClientParameters,
  type GetWalletClientErrorType,
  getWalletClient,
  GetWalletClientReturnType,
} from 'wagmi/actions'

import { printJson } from './printJson'

export type GetWalletClientOptions<
  config extends Config,
  chainId extends config['chains'][number]['id'],
  selectData = GetWalletClientData<config, chainId>,
> = Compute<ExactPartial<GetWalletClientParameters<config, chainId>> & ScopeKeyParameter> &
  QueryParameter<
    GetWalletClientQueryFnData<config, chainId>,
    GetWalletClientErrorType,
    selectData,
    GetWalletClientQueryKey<config, chainId>
  >

export function getWalletClientQueryOptions<
  config extends Config,
  chainId extends config['chains'][number]['id'],
  selectData = GetWalletClientData<config, chainId>,
>(
  config: config,
  options: GetWalletClientOptions<config, chainId, selectData> = {},
): GetWalletClientQueryOptions<config, chainId, selectData> {
  return {
    ...options.query,
    // @ts-ignore
    enabled: Boolean(options.connector?.getProvider && (options.query?.enabled ?? true)),
    gcTime: 0,
    queryFn: async (context) => {
      printJson({
        key: 'getWalletClient pre',
        data: { connector: !!options.connector, getProvider: !!options.connector?.getProvider },
      })
      if (!options.connector?.getProvider) throw new Error('connector is required')
      const [, { connectorUid: _, scopeKey: __, ...parameters }] = context.queryKey
      const connector = options.connector

      // Instrument each underlying connector RPC call so the LAST log printed
      // reveals which await hangs on MetaMask iOS injected.
      printJson({ key: 'step:getAccounts pre', data: {} })
      const accounts = await connector.getAccounts()
      printJson({ key: 'step:getAccounts', data: { count: accounts.length } })

      printJson({ key: 'step:getChainId pre', data: {} })
      const connectorChainId = await connector.getChainId()
      printJson({ key: 'step:getChainId', data: { connectorChainId } })

      printJson({ key: 'step:getProvider pre', data: {} })
      const provider = await connector.getProvider({ chainId: connectorChainId })
      printJson({ key: 'step:getProvider', data: { hasProvider: !!provider } })

      printJson({ key: 'step:getWalletClient pre', data: {} })
      const client = (await getWalletClient(config, {
        ...parameters,
        connector,
      })) as never
      printJson({ key: 'step:getWalletClient', data: { client: !!client } })

      return client
    },
    queryKey: getWalletClientQueryKey(options),
    staleTime: Number.POSITIVE_INFINITY,
  }
}

export type GetWalletClientQueryFnData<
  config extends Config,
  chainId extends config['chains'][number]['id'],
> = GetWalletClientReturnType<config, chainId>

export type GetWalletClientData<
  config extends Config,
  chainId extends config['chains'][number]['id'],
> = GetWalletClientQueryFnData<config, chainId>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getWalletClientQueryKey<config extends Config, chainId extends config['chains'][number]['id']>(
  options: Compute<ExactPartial<GetWalletClientParameters<config, chainId>> & ScopeKeyParameter> = {},
) {
  return ['walletClientShoom', filterQueryOptions(options)] as const
}

export type GetWalletClientQueryKey<config extends Config, chainId extends config['chains'][number]['id']> = ReturnType<
  typeof getWalletClientQueryKey<config, chainId>
>

export type GetWalletClientQueryOptions<
  config extends Config,
  chainId extends config['chains'][number]['id'],
  selectData = GetWalletClientData<config, chainId>,
> = QueryOptions<
  GetWalletClientQueryFnData<config, chainId>,
  GetWalletClientErrorType,
  selectData,
  GetWalletClientQueryKey<config, chainId>
>

export function filterQueryOptions<type extends Record<string, unknown> & { connector?: Connector | undefined }>(
  options: type,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  // destructuring is super fast
  // biome-ignore format: no formatting
  const {
    // import('@tanstack/query-core').QueryOptions
    // biome-ignore lint/correctness/noUnusedVariables: tossing
    _defaulted,
    behavior,
    gcTime,
    initialData,
    initialDataUpdatedAt,
    maxPages,
    meta,
    networkMode,
    queryFn,
    queryHash,
    queryKey,
    queryKeyHashFn,
    retry,
    retryDelay,
    structuralSharing,

    // import('@tanstack/query-core').InfiniteQueryObserverOptions
    // biome-ignore lint/correctness/noUnusedVariables: tossing
    getPreviousPageParam,
    getNextPageParam,
    initialPageParam,

    // import('@tanstack/react-query').UseQueryOptions
    // biome-ignore lint/correctness/noUnusedVariables: tossing
    _optimisticResults,
    enabled,
    notifyOnChangeProps,
    placeholderData,
    refetchInterval,
    refetchIntervalInBackground,
    refetchOnMount,
    refetchOnReconnect,
    refetchOnWindowFocus,
    retryOnMount,
    select,
    staleTime,
    suspense,
    throwOnError,

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // wagmi
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // biome-ignore lint/correctness/noUnusedVariables: tossing
    abi,
    config,
    connector,
    query,
    watch,
    ...rest
  } = options
  if (connector) return { connectorUid: connector?.uid, ...rest } as never
  return rest as never
}
