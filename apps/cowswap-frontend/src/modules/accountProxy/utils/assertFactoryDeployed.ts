import type { Config } from 'wagmi'
import { getBytecode } from 'wagmi/actions'

/**
 * Throws if the given cow-shed / account-proxy factory has no bytecode on the current chain.
 */
export async function assertFactoryDeployed(
  config: Config,
  factoryAddress: string,
  networkLabel: string,
): Promise<void> {
  const isFactoryDeployed = await hasBytecode(config, factoryAddress)

  if (!isFactoryDeployed) {
    throw new Error(`Account Proxy factory ${factoryAddress} is not deployed on network ${networkLabel}.`)
  }
}

/**
 * Returns whether the given cow-shed / account-proxy factory has bytecode on the current chain.
 */
export async function hasBytecode(config: Config, address: string): Promise<boolean> {
  const code = await getBytecode(config, { address: address as `0x${string}` })
  return !!code && code !== '0x'
}

// TODO: Should we add another function that combines assertFactoryDeployed with getIsProxySetupValid here?
