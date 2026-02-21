import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  COW_TOKEN_TO_CHAIN,
  LOCKED_GNO_VESTING_DURATION,
  LOCKED_GNO_VESTING_START_TIME,
  MERKLE_DROP_CONTRACT_ADDRESSES,
  TOKEN_DISTRO_CONTRACT_ADDRESSES,
} from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { MerkleDropAbi, TokenDistroAbi } from '@cowprotocol/cowswap-abis'
import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { useLingui } from '@lingui/react/macro'
import { useConfig, useReadContract } from 'wagmi'
import { writeContract, getTransactionReceipt } from 'wagmi/actions'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { ContractData, UseContractResult } from 'common/hooks/useContract'

import { fetchClaim } from './claimData'

import type { Hex, TransactionReceipt } from 'viem'

// We just generally use the mainnet version. We don't read from the contract anyways so the address doesn't matter
const _COW = COW_TOKEN_TO_CHAIN[SupportedChainId.MAINNET]

type MerdleDropContractData = Omit<ContractData<typeof MerkleDropAbi>, 'address'> & { address: string | null }
const useMerkleDropContract = (): UseContractResult<MerdleDropContractData> => {
  const { chainId } = useWalletInfo()

  return {
    abi: MerkleDropAbi,
    address: MERKLE_DROP_CONTRACT_ADDRESSES[chainId],
    chainId,
  }
}

type TokenDistroContractData = Omit<ContractData<typeof TokenDistroAbi>, 'address'> & { address: string | null }
const useTokenDistroContract = (): UseContractResult<TokenDistroContractData> => {
  const { chainId } = useWalletInfo()

  return {
    abi: TokenDistroAbi,
    address: TOKEN_DISTRO_CONTRACT_ADDRESSES[chainId],
    chainId,
  }
}

export const useAllocation = (): CurrencyAmount<Token> => {
  const { t } = useLingui()
  const SupportedChainIdMAINNET = SupportedChainId.MAINNET

  if (!_COW) {
    throw new Error(t`COW token not found for chain ${SupportedChainIdMAINNET}`)
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
  const { t } = useLingui()
  const SupportedChainIdMAINNET = SupportedChainId.MAINNET

  if (!_COW) {
    throw new Error(t`COW token not found for chain ${SupportedChainIdMAINNET}`)
  }
  const { account } = useWalletInfo()
  const allocated = useAllocation()
  const vested = allocated
    .multiply(Math.min(Date.now() - LOCKED_GNO_VESTING_START_TIME, LOCKED_GNO_VESTING_DURATION))
    .divide(LOCKED_GNO_VESTING_DURATION)

  const tokenDistro = useTokenDistroContract()

  const { data, isLoading } = useReadContract({
    abi: tokenDistro.abi,
    address: tokenDistro.address!,
    functionName: 'balances',
    args: [account!],
    query: {
      enabled: !!tokenDistro.address && !!account,
    },
  })

  const claimed = useMemo(() => {
    const [_allocatedTokens, claimed] = data || [0n, 0n]
    return CurrencyAmount.fromRawAmount(_COW, claimed.toString())
  }, [data])

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
}: ClaimCallbackParams): () => Promise<TransactionReceipt> {
  const config = useConfig()
  const { account } = useWalletInfo()
  const { chainId: merkleDropChainId, ...merkleDrop } = useMerkleDropContract()
  const { chainId: tokenDistroChainId, ...tokenDistro } = useTokenDistroContract()
  const { t } = useLingui()

  const addTransaction = useTransactionAdder()

  return useCallback(async () => {
    if (!account) {
      throw new Error(t`Not connected`)
    }

    if (!merkleDrop.address || !tokenDistro.address) {
      throw new Error(t`Contract not present or not connected to any supported chain`)
    }

    if (merkleDropChainId !== tokenDistroChainId) {
      throw new Error(t`Contract and chainId are not on the same chain`)
    }

    const claim = await fetchClaim(account, tokenDistroChainId)
    if (!claim) throw new Error(t`Trying to claim without claim data`)

    const { index, proof, amount } = claim

    // On the very first claim we need to provide the merkle proof.
    // Afterwards the allocation will be already in the tokenDistro contract and we can just claim it there.
    const claimPromise = isFirstClaim
      ? writeContract(config, {
          abi: merkleDrop.abi,
          address: merkleDrop.address,
          functionName: 'claim',
          args: [BigInt(index), BigInt(amount), proof as Hex[]],
        })
      : writeContract(config, {
          abi: tokenDistro.abi,
          address: tokenDistro.address,
          functionName: 'claim',
        })

    const summary = t`Claim vested` + ` COW`
    openModal(summary)

    const txHash = await claimPromise
    addTransaction({
      swapLockedGNOvCow: true,
      hash: txHash,
      summary,
    })
    return getTransactionReceipt(config, { hash: txHash }).finally(closeModal)
  }, [
    config,
    account,
    merkleDrop,
    tokenDistro,
    merkleDropChainId,
    tokenDistroChainId,
    t,
    isFirstClaim,
    openModal,
    closeModal,
    addTransaction,
  ])
}
