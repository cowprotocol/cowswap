import { useMemo } from 'react'

import { SWR_NO_REFRESH_OPTIONS, WRAPPED_NATIVE_CURRENCIES as WETH } from '@cowprotocol/common-const'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { Erc20Abi, Erc20Interface } from '@cowprotocol/cowswap-abis'
import { useMultipleContractSingleData } from '@cowprotocol/multicall'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Interface } from '@ethersproject/abi'
import { BigNumber } from '@ethersproject/bignumber'

import { SWRConfiguration } from 'swr'

const WETH_ADDRESS = WETH[ChainId.MAINNET].address
const PERI_ADDRESS = '0x5d30aD9C6374Bf925D0A75454fa327AACf778492'
const MATIC_ADDRESS = '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0'
const WBNB_ADDRESS = '0x418d75f65a02b3d53b2418fb8e1fe493759c7605'

const AFFECTED_TOKENS = [WETH_ADDRESS, PERI_ADDRESS, MATIC_ADDRESS, WBNB_ADDRESS] // relevant tokens for the check

const ERC20_INTERFACE = new Interface(Erc20Abi) as Erc20Interface
const ANYSWAP_V4_CONTRACT = '0x6b7a87899490EcE95443e979cA9485CBE7E71522'

// Uncomment to test logic: 0xC92...522 is mainnet VaultRelayer address. Use it with one account that has given some WETH allowance to it
// const ANYSWAP_V4_CONTRACT = '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110' //'0x6b7a87899490EcE95443e979cA9485CBE7E71522'

const MULTICALL_OPTIONS = {}
const SWR_CONFIG: SWRConfiguration = {
  ...SWR_NO_REFRESH_OPTIONS,
  revalidateIfStale: false,
}

export function useIsAnySwapAffectedUser(): boolean {
  const { chainId, account } = useWalletInfo()
  const { data } = useMultipleContractSingleData<[BigNumber]>(
    chainId,
    AFFECTED_TOKENS,
    ERC20_INTERFACE,
    'allowance',
    account ? [account, ANYSWAP_V4_CONTRACT] : undefined,
    MULTICALL_OPTIONS,
    SWR_CONFIG,
    `useIsAnySwapAffectedUser`,
  )

  const allowances = data?.results

  return useMemo(() => {
    // The error affects Mainnet
    if (chainId !== ChainId.MAINNET || !allowances) {
      return false
    }

    // Check if any of the tokens has allowance in the router contract
    return allowances.some((result) => {
      const allowance = result?.[0]

      return allowance ? !allowance.isZero() : false
    })
  }, [chainId, allowances])
}
