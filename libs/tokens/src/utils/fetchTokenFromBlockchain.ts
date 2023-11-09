import { getContract } from '@cowprotocol/common-utils'
import { Erc20, Erc20Abi } from '@cowprotocol/abis'
import type { JsonRpcProvider } from '@ethersproject/providers'
import { getAddress } from '@ethersproject/address'
import { TokenInfo } from '@uniswap/token-lists'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export async function fetchTokenFromBlockchain(
  tokenAddress: string,
  chainId: SupportedChainId,
  provider: JsonRpcProvider
): Promise<TokenInfo> {
  const formattedAddress = getAddress(tokenAddress)
  const erc20Contract = getContract(formattedAddress, Erc20Abi, provider) as Erc20

  const [name, symbol, decimals] = await Promise.all([
    erc20Contract.callStatic.name(),
    erc20Contract.callStatic.symbol(),
    erc20Contract.callStatic.decimals(),
  ])

  return {
    chainId,
    address: formattedAddress,
    name,
    symbol,
    decimals,
  }
}
