import { useMemo } from 'react'

import { Erc20Abi, Erc20Interface } from '@cowprotocol/abis'
import { ZERO_ADDRESS } from '@cowprotocol/common-const'
import { WRAPPED_NATIVE_CURRENCIES as WETH } from '@cowprotocol/common-const'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { useMultipleContractSingleData } from '@cowprotocol/multicall'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Interface } from '@ethersproject/abi'
import { BigNumber } from '@ethersproject/bignumber'

import ms from 'ms.macro'
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
const SWR_CONFIG: SWRConfiguration = { refreshInterval: ms`30m`, revalidateOnFocus: false }

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function useIsAnySwapAffectedUser() {
  const { chainId, account } = useWalletInfo()
  const { data: allowances } = useMultipleContractSingleData<[BigNumber]>(
    AFFECTED_TOKENS,
    ERC20_INTERFACE,
    'allowance',
    [account || ZERO_ADDRESS, ANYSWAP_V4_CONTRACT],
    MULTICALL_OPTIONS,
    SWR_CONFIG,
  )

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
