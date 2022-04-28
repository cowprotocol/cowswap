import { useCallback, useEffect, useMemo, useState } from 'react'
import { useActiveWeb3React } from '@src/custom/hooks/web3'
import { fetchClaim, hasAllocation } from './claimData'
import MERKLE_DROP_ABI from 'abis/MerkleDrop.json'
import TOKEN_DISTRO_ABI from 'abis/TokenDistro.json'
import { MerkleDrop, TokenDistro } from '@src/custom/abis/types'
import { useContract } from '@src/custom/hooks/useContract'
import { COW as COW_TOKENS } from '@src/custom/constants/tokens'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { useSingleCallResult } from '@src/state/multicall/hooks'
import { OperationType } from '@src/custom/components/TransactionConfirmationModal'
import { useTransactionAdder } from 'state/enhancedTransactions/hooks'
import { ContractTransaction } from '@ethersproject/contracts'

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

export const useBalances = () => {
  const { chainId, account } = useActiveWeb3React()
  const accountHasAllocation = account && chainId && hasAllocation(account, chainId)
  const allocated = useAllocation()
  const vested = allocated.multiply(Math.min(Date.now() - START_TIME, DURATION)).divide(DURATION)

  const tokenDistro = useTokenDistroContract()
  const { result, loading } = useSingleCallResult(accountHasAllocation ? tokenDistro : null, 'balances', [
    account || undefined,
  ])
  const claimed = useMemo(() => CurrencyAmount.fromRawAmount(COW, result ? result.claimed.toString() : 0), [result])

  return {
    allocated,
    vested,
    claimed,
    loading: (accountHasAllocation && allocated.equalTo(0)) || loading,
  }
}

interface ClaimCallbackParams {
  openModal: (message: string, operationType: OperationType) => void
  closeModal: () => void
  isFirstClaim: boolean
}
export function useClaimCallback({
  openModal,
  closeModal,
  isFirstClaim,
}: ClaimCallbackParams): () => Promise<ContractTransaction> {
  const { chainId, account } = useActiveWeb3React()
  const merkleDrop = useMerkleDropContract()
  const tokenDistro = useTokenDistroContract()

  const addTransaction = useTransactionAdder()

  const claimCallback = useCallback(async () => {
    if (!account) {
      throw new Error('Not connected')
    }
    if (!chainId) {
      throw new Error('No chainId')
    }
    if (!merkleDrop || !tokenDistro) {
      throw new Error('contract not present')
    }

    const { index, proof, amount } = await fetchClaim(account, chainId)

    // On the very first claim we need to provide the merkle proof.
    // Afterwards the allocation will be already in the tokenDistro contract and we can just claim it there.
    const claimPromise = isFirstClaim ? merkleDrop.claim(index, amount, proof) : tokenDistro.claim()
    const summary = 'Claim vested COW'
    openModal(summary, OperationType.CLAIM_VESTED_COW)

    return claimPromise
      .then((tx) => {
        addTransaction({
          hash: tx.hash,
          summary,
        })
        return tx
      })
      .finally(closeModal)
  }, [account, addTransaction, chainId, closeModal, openModal, isFirstClaim, merkleDrop, tokenDistro])

  return claimCallback
}
