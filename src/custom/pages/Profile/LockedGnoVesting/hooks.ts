import { BigNumber } from '@ethersproject/bignumber'
import { useEffect, useState } from 'react'
import { useActiveWeb3React } from '@src/custom/hooks/web3'
import { fetchClaim, hasAllocation } from './claimData'
import MERKLE_DROP_ABI from 'abis/MerkleDrop.json'
import TOKEN_DISTRO_ABI from 'abis/TokenDistro.json'
import { MerkleDrop, TokenDistro } from '@src/custom/abis/types'
import { useContract } from '@src/custom/hooks/useContract'

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
  const [allocation, setAllocation] = useState(BigNumber.from(0))

  const { chainId, account } = useActiveWeb3React()
  const accountHasAllocation = account && chainId && hasAllocation(account, chainId)

  useEffect(() => {
    let canceled = false
    if (accountHasAllocation) {
      fetchClaim(account, chainId).then((claim) => {
        if (!canceled) {
          setAllocation(BigNumber.from(claim.amount))
        }
      })
    }
    return () => {
      canceled = true
    }
  }, [chainId, account, accountHasAllocation])

  return allocation
}

const useBalances = () => {
  const { account, chainId } = useActiveWeb3React()
  const allocation = useAllocation()
}
