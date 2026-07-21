import type { Chain, WalletClient } from 'viem'
import { stringToHex } from 'viem'
import { type Config } from 'wagmi'
import { getBytecode } from 'wagmi/actions'

import { delay, isProdLike } from '@cowprotocol/common-utils'
import { ContractsSigningScheme } from '@cowprotocol/sdk-contracts-ts'
import type { CowShedHooks } from '@cowprotocol/sdk-cow-shed'

import { getRecoverFundsCalls } from './getRecoverFundsCalls'

const INFINITE_DEADLINE = 99999999999
const DEFAULT_GAS_LIMIT = 600_000n

export interface RecoverFundsFromProxyParams {
  config: Config
  cowShedHooks: CowShedHooks
  walletClient: WalletClient
  account: string
  proxyAddress: string
  factoryAddress: string
  selectedTokenAddress: string
  tokenBalanceAtoms: string
  isNativeToken: boolean
  delayBetweenSignaturesMs: number
  onBeforeTransactionSign?: () => void
}

export async function recoverFundsFromProxy({
  config,
  cowShedHooks,
  walletClient,
  account,
  proxyAddress,
  factoryAddress,
  selectedTokenAddress,
  tokenBalanceAtoms,
  isNativeToken,
  delayBetweenSignaturesMs,
  onBeforeTransactionSign,
}: RecoverFundsFromProxyParams): Promise<string> {
  if (!walletClient.chain || !walletClient.account) {
    throw new Error('Wallet client chain and account are required to recover funds')
  }

  if (!isProdLike) {
    await assertFactoryDeployed(config, walletClient.chain, factoryAddress)
  }

  const calls = getRecoverFundsCalls({
    isNativeToken,
    account,
    tokenBalance: tokenBalanceAtoms,
    selectedTokenAddress,
    proxyAddress,
  })

  // TODO: Prefer CowShedSdk.signCalls once it forwards a custom EIP-712 version (see apps/cowswap-frontend/src/modules/twap/services/twap/eoa/placeEoaTwapOrder.ts):
  const hex = stringToHex(Date.now().toString()).slice(2)
  const nonce = ('0x' + (hex + '0'.repeat(64)).slice(0, 64)) as `0x${string}`
  const validTo = INFINITE_DEADLINE

  const encodedSignature = await cowShedHooks.signCalls(
    calls,
    nonce,
    BigInt(validTo),
    ContractsSigningScheme.EIP712, // TODO: support other signing types
  )

  onBeforeTransactionSign?.()
  await delay(delayBetweenSignaturesMs)

  // Use the SDK's own encoder to build the calldata, matching how CowShedSdk.signCalls works internally:
  const callData = cowShedHooks.encodeExecuteHooksForFactory(calls, nonce, BigInt(validTo), account, encodedSignature)

  return walletClient.sendTransaction({
    to: factoryAddress as `0x${string}`,
    data: callData as `0x${string}`,
    account: walletClient.account,
    chain: walletClient.chain,
    gas: DEFAULT_GAS_LIMIT,
  })
}

async function assertFactoryDeployed(config: Config, chain: Chain, factoryAddress: string): Promise<void> {
  const code = await getBytecode(config, { address: factoryAddress as `0x${string}` })
  const isFactoryDeployed = !!code && code !== '0x'

  if (!isFactoryDeployed) {
    throw new Error(
      `Account Proxy factory ${factoryAddress} is not deployed on network ${chain.name ?? 'unknown'}. Funds cannot be recovered until the factory is deployed.`,
    )
  }
}
