import { useEffect, useMemo, useState } from 'react'
import { useActiveWeb3React } from '@src/custom/hooks/web3'
import { fetchClaim, hasAllocation } from './claimData'
import MERKLE_DROP_ABI from 'abis/MerkleDrop.json'
import TOKEN_DISTRO_ABI from 'abis/TokenDistro.json'
import { MerkleDrop, TokenDistro } from '@src/custom/abis/types'
import { useContract } from '@src/custom/hooks/useContract'
import { COW as COW_TOKENS } from '@src/custom/constants/tokens'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { useSingleCallResult } from '@src/state/multicall/hooks'

// we will just generally use the mainnet version, since we shouldn't need to read from contract anyways
const COW = COW_TOKENS[1]

const MERKLE_DROP_CONTRACT_ADDRESSES = {
  1: '0x64646f112FfD6F1B7533359CFaAF7998F23C8c40',
  4: '0xe354c570B77b02F1a568Ea28901184e12703960D',
  100: '0x3d610e917130f9D036e85A030596807f57e11093',
}

const useMerkleDropContract = () => useContract<MerkleDrop>(MERKLE_DROP_CONTRACT_ADDRESSES, MERKLE_DROP_ABI, true)

const TOKEN_DISTRO_CONTRACT_ADDRESSES = {
  1: '0x68FFAaC7A431f276fe73604C127Bd78E49070c92',
  4: '0x31E7495e461Cf8147C7Bc0814a49aAbeA76B704b',
  100: '0x3d610e917130f9D036e85A030596807f57e11093',
}

const useTokenDistroContract = () => useContract<TokenDistro>(TOKEN_DISTRO_CONTRACT_ADDRESSES, TOKEN_DISTRO_ABI, true)

export const useAllocation = () => {
  const { chainId, account } = useActiveWeb3React()
  const [allocation, setAllocation] = useState(CurrencyAmount.fromRawAmount(COW, 0))

  const accountHasAllocation = account && chainId && hasAllocation(account, chainId)

  useEffect(() => {
    let canceled = false
    if (accountHasAllocation) {
      fetchClaim(account, chainId).then((claim) => {
        if (!canceled) {
          setAllocation(CurrencyAmount.fromRawAmount(COW, claim.amount))
        }
      })
    }
    return () => {
      canceled = true
    }
  }, [chainId, account, accountHasAllocation])

  return allocation
}

const START_TIME = 1644584715000
const DURATION = 126144000000
// const TOTAL_TOKENS: Record<number, CurrencyAmount<Token>> = {
//   1: CurrencyAmount.fromRawAmount(COW[1], '41894957000000000000000000'),
//   4: CurrencyAmount.fromRawAmount(COW[4], '0x0d3ba50f27f04d54b90800'),
//   100: CurrencyAmount.fromRawAmount(COW[100], '8105044000000000000000000'),
// }

export const useBalances = () => {
  const { chainId, account } = useActiveWeb3React()
  const accountHasAllocation = account && chainId && hasAllocation(account, chainId)
  const allocated = useAllocation()
  const vested = allocated.multiply(Date.now() - START_TIME).divide(DURATION)

  const tokenDistro = useTokenDistroContract()
  const { result } = useSingleCallResult(accountHasAllocation ? tokenDistro : null, 'balances', [account || undefined])
  console.log(result && result.claimed.toString())
  const claimed = useMemo(() => CurrencyAmount.fromRawAmount(COW, result ? result.claimed.toString() : 0), [result])

  return {
    allocated,
    vested,
    claimed,
  }
}
