import { useMemo } from 'react'

import { WRAPPED_NATIVE_CURRENCIES as WETH } from '@cowprotocol/common-const'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { erc20Abi } from 'viem'
import { useReadContracts } from 'wagmi'

const WETH_ADDRESS = WETH[ChainId.MAINNET].address
const PERI_ADDRESS = '0x5d30aD9C6374Bf925D0A75454fa327AACf778492'
const MATIC_ADDRESS = '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0'
const WBNB_ADDRESS = '0x418d75f65a02b3d53b2418fb8e1fe493759c7605'

const AFFECTED_TOKENS = [WETH_ADDRESS, PERI_ADDRESS, MATIC_ADDRESS, WBNB_ADDRESS] // relevant tokens for the check

const ANYSWAP_V4_CONTRACT = '0x6b7a87899490EcE95443e979cA9485CBE7E71522'

// Uncomment to test logic: 0xC92...522 is mainnet VaultRelayer address. Use it with one account that has given some WETH allowance to it
// const ANYSWAP_V4_CONTRACT = '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110' //'0x6b7a87899490EcE95443e979cA9485CBE7E71522'

export function useIsAnySwapAffectedUser(): boolean {
  const { chainId, account } = useWalletInfo()
  const { data } = useReadContracts({
    contracts: AFFECTED_TOKENS.map((address) => ({
      abi: erc20Abi,
      address,
      functionName: 'allowance',
      args: [account, ANYSWAP_V4_CONTRACT],
    })),
  })

  return useMemo(() => {
    // The error affects Mainnet
    if (chainId !== ChainId.MAINNET || !data) {
      return false
    }

    // Check if any of the tokens has allowance in the router contract
    return data.some((tokenData) => {
      const allowance = tokenData.result
      return allowance ? BigInt(allowance) > 0n : false
    })
  }, [chainId, data])
}
