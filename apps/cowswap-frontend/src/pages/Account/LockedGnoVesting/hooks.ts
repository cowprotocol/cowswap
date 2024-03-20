import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { MerkleDrop, MerkleDropAbi, TokenDistro, TokenDistroAbi } from '@cowprotocol/abis'
import {
  COW,
  LOCKED_GNO_VESTING_DURATION,
  LOCKED_GNO_VESTING_START_TIME,
  MERKLE_DROP_CONTRACT_ADDRESSES,
  TOKEN_DISTRO_CONTRACT_ADDRESSES,
} from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'
import { ContractTransaction } from '@ethersproject/contracts'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import useSWR from 'swr'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { useContract } from 'common/hooks/useContract'

import { fetchClaim } from './claimData'

// We just generally use the mainnet version. We don't read from the contract anyways so the address doesn't matter
const _COW = COW[SupportedChainId.MAINNET]

const useMerkleDropContract = () => useContract<MerkleDrop>(MERKLE_DROP_CONTRACT_ADDRESSES, MerkleDropAbi, true)
const useTokenDistroContract = () => useContract<TokenDistro>(TOKEN_DISTRO_CONTRACT_ADDRESSES, TokenDistroAbi, true)

export const useAllocation = (): CurrencyAmount<Token> => {
  const { chainId, account } = useWalletInfo()
  const initialAllocation = useRef(CurrencyAmount.fromRawAmount(_COW, 0))
  const [allocation, setAllocation] = useState(initialAllocation.current)

  useEffect(() => {
    let canceled = false
    if (account && chainId) {
      fetchClaim(account, chainId).then((claim) => {
        if (!canceled) {
          setAllocation(CurrencyAmount.fromRawAmount(_COW, claim?.amount ?? 0))
        }
      })
    } else {
      setAllocation(initialAllocation.current)
    }
    return () => {
      canceled = true
    }
  }, [chainId, account, initialAllocation])

  return allocation
}

export const useCowFromLockedGnoBalances = () => {
  const { account } = useWalletInfo()
  const allocated = useAllocation()
  const vested = allocated
    .multiply(Math.min(Date.now() - LOCKED_GNO_VESTING_START_TIME, LOCKED_GNO_VESTING_DURATION))
    .divide(LOCKED_GNO_VESTING_DURATION)

  const tokenDistro = useTokenDistroContract()

  const { data, isLoading } = useSWR(['useCowFromLockedGnoBalances', account, allocated, tokenDistro], async () => {
    if (account && tokenDistro && allocated.greaterThan(0)) {
      return tokenDistro.balances(account)
    }

    return null
  })

  const claimed = useMemo(() => CurrencyAmount.fromRawAmount(_COW, data ? data.claimed.toString() : 0), [data])

  return {
    allocated,
    vested,
    claimed,
    loading: isLoading,
  }
}

interface ClaimCallbackParams {
  openModal: (message: string) => void
  closeModal: Command
  isFirstClaim: boolean
}
export function useClaimCowFromLockedGnoCallback({
  openModal,
  closeModal,
  isFirstClaim,
}: ClaimCallbackParams): () => Promise<ContractTransaction> {
  const { chainId, account } = useWalletInfo()
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
      throw new Error('Contract not present')
    }

    const claim = await fetchClaim(account, chainId)
    if (!claim) throw new Error('Trying to claim without claim data')

    const { index, proof, amount } = claim

    // On the very first claim we need to provide the merkle proof.
    // Afterwards the allocation will be already in the tokenDistro contract and we can just claim it there.
    const claimPromise = isFirstClaim ? merkleDrop.claim(index, amount, proof) : tokenDistro.claim()
    const summary = 'Claim vested COW'
    openModal(summary)

    return claimPromise
      .then((tx) => {
        addTransaction({
          swapLockedGNOvCow: true,
          hash: tx.hash,
          summary,
        })
        return tx
      })
      .finally(closeModal)
  }, [account, addTransaction, chainId, closeModal, openModal, isFirstClaim, merkleDrop, tokenDistro])

  return claimCallback
}
