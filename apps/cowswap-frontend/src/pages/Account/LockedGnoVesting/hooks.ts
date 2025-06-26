import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { MerkleDrop, MerkleDropAbi, TokenDistro, TokenDistroAbi } from '@cowprotocol/abis'
import {
  COW_TOKEN_TO_CHAIN,
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
const _COW = COW_TOKEN_TO_CHAIN[SupportedChainId.MAINNET]

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const useMerkleDropContract = () => useContract<MerkleDrop>(MERKLE_DROP_CONTRACT_ADDRESSES, MerkleDropAbi, true)
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const useTokenDistroContract = () => useContract<TokenDistro>(TOKEN_DISTRO_CONTRACT_ADDRESSES, TokenDistroAbi, true)

export const useAllocation = (): CurrencyAmount<Token> => {
  if (!_COW) {
    throw new Error(`COW token not found for chain ${SupportedChainId.MAINNET}`)
  }

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

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useCowFromLockedGnoBalances = () => {
  if (!_COW) {
    throw new Error(`COW token not found for chain ${SupportedChainId.MAINNET}`)
  }
  const { account } = useWalletInfo()
  const allocated = useAllocation()
  const vested = allocated
    .multiply(Math.min(Date.now() - LOCKED_GNO_VESTING_START_TIME, LOCKED_GNO_VESTING_DURATION))
    .divide(LOCKED_GNO_VESTING_DURATION)

  const { contract: tokenDistro } = useTokenDistroContract()

  const { data, isLoading } = useSWR(
    account && tokenDistro && allocated?.greaterThan(0)
      ? ['useCowFromLockedGnoBalances', account, allocated, tokenDistro]
      : null,
    async ([, _account, , _tokenDistro]) => _tokenDistro.balances(_account),
  )

  const claimed = useMemo(() => CurrencyAmount.fromRawAmount(_COW, data ? data.claimed.toString() : 0), [data])

  return useMemo(
    () => ({
      allocated,
      vested,
      claimed,
      loading: isLoading,
    }),
    [allocated, vested, claimed, isLoading],
  )
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
  const { account } = useWalletInfo()
  const { contract: merkleDrop, chainId: merkleDropChainId } = useMerkleDropContract()
  const { contract: tokenDistro, chainId: tokenDistroChainId } = useTokenDistroContract()

  const addTransaction = useTransactionAdder()

  return useCallback(async () => {
    if (!account) {
      throw new Error('Not connected')
    }

    if (!merkleDrop || !tokenDistro) {
      throw new Error('Contract not present or not connected to any supported chain')
    }

    if (merkleDropChainId !== tokenDistroChainId) {
      throw new Error('Contract and chainId are not on the same chain')
    }

    const claim = await fetchClaim(account, tokenDistroChainId)
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
  }, [
    account,
    addTransaction,
    closeModal,
    openModal,
    isFirstClaim,
    merkleDrop,
    tokenDistro,
    merkleDropChainId,
    tokenDistroChainId,
  ])
}
