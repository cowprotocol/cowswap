import { useMultipleContractSingleData } from 'lib/hooks/multicall'
import { WRAPPED_NATIVE_CURRENCY as WETH } from 'constants/tokens'
import { Interface } from '@ethersproject/abi'
import ERC20_ABI from 'abis/erc20.json'
import { Erc20Interface } from '@src/abis/types/Erc20'
import { ChainId } from '@uniswap/sdk'
import { useActiveWeb3React } from 'hooks/web3'
import { useMemo } from 'react'
import { ZERO_ADDRESS } from '@src/constants/misc'
import { BigNumber } from '@ethersproject/bignumber'

const WETH_ADDRESS = WETH[ChainId.MAINNET].address
const PERI_ADDRESS = '0x5d30aD9C6374Bf925D0A75454fa327AACf778492'
const MATIC_ADDRESS = '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0'
const WBNB_ADDRESS = '0x418d75f65a02b3d53b2418fb8e1fe493759c7605'

const AFFECTED_TOKENS = [WETH_ADDRESS, PERI_ADDRESS, MATIC_ADDRESS, WBNB_ADDRESS] // relevant tokens for the check

const ERC20_INTERFACE = new Interface(ERC20_ABI) as Erc20Interface
const ANYSWAP_V4_CONTRACT = '0x6b7a87899490EcE95443e979cA9485CBE7E71522'

// Uncomment to test logic: 0xC92...522 is mainnet VaultRelayer address. Use it with one account that has given some WETH allowance to it
// const ANYSWAP_V4_CONTRACT = '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110' //'0x6b7a87899490EcE95443e979cA9485CBE7E71522'

const BLOCKS_PER_FETCH = 120 // 30min. It would actually suffice to check once, but we check every 120 blocks

export default function useIsAnySwapAffectedUser() {
  const { chainId, account } = useActiveWeb3React()
  const result = useMultipleContractSingleData(
    AFFECTED_TOKENS,
    ERC20_INTERFACE,
    'allowance',
    [account || ZERO_ADDRESS, ANYSWAP_V4_CONTRACT],
    { blocksPerFetch: BLOCKS_PER_FETCH }
  )

  return useMemo(() => {
    // The error affects Mainnet
    if (chainId !== ChainId.MAINNET) {
      return false
    }

    // Check if any of the tokens has allowance in the router contract
    return result.some(({ result, loading, error, valid }) => {
      const allowance = valid && !loading && !error && result ? (result[0] as BigNumber) : undefined
      return allowance ? !allowance.isZero() : false
    })
  }, [chainId, result])
}
