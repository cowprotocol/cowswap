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
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'
import useSWR from 'swr'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { useContract } from 'common/hooks/useContract'

import { fetchClaim } from './claimData'

// We just generally use the mainnet version. We don't read from the contract anyways so the address doesn't matter
const _COW = COW_TOKEN_TO_CHAIN[SupportedChainId.MAINNET]

interface MerkleDropContract {
  claim(index: number, amount: string, proof: string[]): Promise<{ hash: `0x${string}` }>
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- return type is complex (UseContractResult<Abi>)
function useMerkleDropContract() {
  const { chainId } = useWalletInfo()
  return useContract<MerkleDropContract | null>(
    chainId != null ? MERKLE_DROP_CONTRACT_ADDRESSES[chainId] : undefined,
    MerkleDropAbi,
    true,
  )
}

interface TokenDistroContract {
  balances(account: string): Promise<{ claimed: bigint }>
  claim(): Promise<{ hash: `0x${string}` }>
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- return type is complex (UseContractResult<Abi>)
function useTokenDistroContract() {
  const { chainId } = useWalletInfo()
  return useContract<TokenDistroContract | null>(
    chainId != null ? TOKEN_DISTRO_CONTRACT_ADDRESSES[chainId] : undefined,
    TokenDistroAbi,
    true,
  )
}

export const useAllocation = (): CurrencyAmount<Currency> => {
  const { t } = useLingui()
  const SupportedChainIdMAINNET = SupportedChainId.MAINNET

  if (!_COW) {
    throw new Error(t`COW token not found for chain ${SupportedChainIdMAINNET}`)
  }

  const { chainId, account } = useWalletInfo()
  const cowCurrency = _COW as unknown as Currency
  const initialAllocation = useRef(CurrencyAmount.fromRawAmount(cowCurrency, 0))
  const [allocation, setAllocation] = useState(initialAllocation.current)

  useEffect(() => {
    let canceled = false
    if (account && chainId) {
      fetchClaim(account, chainId).then((claim) => {
        if (!canceled) {
          setAllocation(CurrencyAmount.fromRawAmount(cowCurrency, claim?.amount ?? 0))
        }
      })
    } else {
      setAllocation(initialAllocation.current)
    }
    return () => {
      canceled = true
    }
  }, [chainId, account, initialAllocation, cowCurrency])

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

  const { contract: tokenDistro } = useTokenDistroContract()

  type SwrKey = [string, string, CurrencyAmount<Currency>, TokenDistroContract | null]
  const { data, isLoading } = useSWR(
    account && tokenDistro && allocated?.greaterThan(0)
      ? (['useCowFromLockedGnoBalances', account, allocated, tokenDistro] as SwrKey)
      : null,
    async (key: SwrKey) => {
      const [, accountVal, , tokenDistroVal] = key
      if (!tokenDistroVal) throw new Error('tokenDistro required')
      return tokenDistroVal.balances(accountVal)
    },
  )

  const claimed = useMemo(
    () => CurrencyAmount.fromRawAmount(_COW as unknown as Currency, data ? data.claimed.toString() : 0),
    [data],
  )

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
}: ClaimCallbackParams): () => Promise<{ hash: `0x${string}` }> {
  const { account } = useWalletInfo()
  const { contract: merkleDrop, chainId: merkleDropChainId } = useMerkleDropContract()
  const { contract: tokenDistro, chainId: tokenDistroChainId } = useTokenDistroContract()
  const { t } = useLingui()

  const addTransaction = useTransactionAdder()

  return useCallback(async () => {
    if (!account) {
      throw new Error(t`Not connected`)
    }

    if (!merkleDrop || !tokenDistro) {
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
    const claimPromise = isFirstClaim ? merkleDrop.claim(index, amount, proof) : tokenDistro.claim()
    const summary = t`Claim vested` + ` COW`
    openModal(summary)

    return claimPromise
      .then((tx: { hash: `0x${string}` }) => {
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
