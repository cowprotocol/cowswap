import { _getClientOrThrow } from '@cow/api/gnosisSafe'
import { Web3Provider } from '@ethersproject/providers'
import EthersAdapter from '@safe-global/safe-ethers-lib'
// eslint-disable-next-line no-restricted-imports
import { ethers } from 'ethers'
import Safe from '@safe-global/safe-core-sdk'
import SafeServiceClient from '@gnosis.pm/safe-service-client'
import { JsonRpcSigner } from '@ethersproject/providers/src.ts/json-rpc-provider'

export async function getSafeUtils(
  chainId: number,
  account: string,
  library: Web3Provider
): Promise<{
  client: SafeServiceClient
  safe: Safe
  signer: JsonRpcSigner
}> {
  const client = _getClientOrThrow(chainId, library)
  const signer = library.getSigner()

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: signer,
  })
  const safe = await Safe.create({ ethAdapter: ethAdapter as any, safeAddress: account })

  return { client, safe, signer }
}
