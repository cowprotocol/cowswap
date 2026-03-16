import {
  ALL_SUPPORTED_CHAINS_MAP,
  ChainInfo,
  EvmChainInfo,
  isEvmChainInfo,
  SupportedChainId,
} from '@cowprotocol/cow-sdk'

export function createChainInfoForTests(baseChainId: SupportedChainId, overrides?: Partial<ChainInfo>): ChainInfo {
  const base = ALL_SUPPORTED_CHAINS_MAP[baseChainId]

  if (!base) {
    throw new Error(`Missing base chain definition for ${baseChainId}`)
  }

  return buildChainInfo(base, overrides)
}

function buildChainInfo(base: ChainInfo, overrides: Partial<ChainInfo> | undefined): ChainInfo {
  const chainId = resolveChainId(base, overrides)

  const common = {
    ...base,
    ...overrides,
    id: chainId,
    logo: resolveLogo(base, overrides),
    docs: resolveDocs(base, overrides),
    website: resolveWebsite(base, overrides),
    blockExplorer: resolveBlockExplorer(base, overrides),
    nativeCurrency: resolveNativeCurrency(base, overrides, chainId),
  }

  if (!isEvmChainInfo(base)) {
    return common
  }

  return {
    ...common,
    contracts: resolveContracts(base, overrides),
    bridges: resolveBridges(base, overrides),
    rpcUrls: resolveRpcUrls(base, overrides),
  }
}

function resolveChainId(base: ChainInfo, overrides: Partial<ChainInfo> | undefined): ChainInfo['id'] {
  return overrides?.id ?? base.id
}

function resolveContracts(base: EvmChainInfo, overrides: Partial<EvmChainInfo> | undefined): EvmChainInfo['contracts'] {
  const merged = overrides?.contracts

  return merged ? { ...base.contracts, ...merged } : { ...base.contracts }
}

function resolveBridges(base: ChainInfo, overrides: Partial<ChainInfo> | undefined): ChainInfo['bridges'] {
  const bridges = overrides?.bridges ?? base.bridges

  return bridges?.map(cloneBridge)
}

function resolveRpcUrls(base: EvmChainInfo, overrides: Partial<EvmChainInfo> | undefined): EvmChainInfo['rpcUrls'] {
  return cloneRpcUrls(overrides?.rpcUrls ?? base.rpcUrls)
}

function resolveLogo(base: ChainInfo, overrides: Partial<ChainInfo> | undefined): ChainInfo['logo'] {
  return cloneThemedImage(overrides?.logo ?? base.logo)
}

function resolveDocs(base: ChainInfo, overrides: Partial<ChainInfo> | undefined): ChainInfo['docs'] {
  return cloneWebUrl(overrides?.docs ?? base.docs)
}

function resolveWebsite(base: ChainInfo, overrides: Partial<ChainInfo> | undefined): ChainInfo['website'] {
  return cloneWebUrl(overrides?.website ?? base.website)
}

function resolveBlockExplorer(base: ChainInfo, overrides: Partial<ChainInfo> | undefined): ChainInfo['blockExplorer'] {
  return cloneWebUrl(overrides?.blockExplorer ?? base.blockExplorer)
}

function resolveNativeCurrency(
  base: ChainInfo,
  overrides: Partial<ChainInfo> | undefined,
  chainId: ChainInfo['id'],
): ChainInfo['nativeCurrency'] {
  return {
    ...base.nativeCurrency,
    ...(overrides?.nativeCurrency ?? {}),
    chainId,
  }
}

function cloneBridge(
  bridge: NonNullable<EvmChainInfo['bridges']>[number],
): NonNullable<EvmChainInfo['bridges']>[number] {
  return { ...bridge }
}

function cloneRpcUrls(rpcUrls: EvmChainInfo['rpcUrls']): EvmChainInfo['rpcUrls'] {
  return Object.entries(rpcUrls).reduce(
    (acc, [key, value]) => {
      acc[key] = {
        http: [...value.http],
        ...(value.webSocket ? { webSocket: [...value.webSocket] } : {}),
      }

      return acc
    },
    {} as EvmChainInfo['rpcUrls'],
  )
}

function cloneThemedImage(image: ChainInfo['logo']): ChainInfo['logo'] {
  return { ...image }
}

function cloneWebUrl<T extends ChainInfo['docs'] | ChainInfo['website'] | ChainInfo['blockExplorer']>(webUrl: T): T {
  return { ...webUrl }
}
