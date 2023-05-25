import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ContractTransaction } from '@ethersproject/contracts'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import MERKLE_DROP_ABI from 'abis/MerkleDrop.json'
import TOKEN_DISTRO_ABI from 'abis/TokenDistro.json'
import { MerkleDrop, TokenDistro } from 'abis/types'
import { useSingleCallResult } from 'lib/hooks/multicall'
import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'
import { useContract } from 'legacy/hooks/useContract'
import { COW as COW_TOKENS } from 'legacy/constants/tokens'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { OperationType } from 'legacy/components/TransactionConfirmationModal'
import { fetchClaim } from './claimData'
import { MERKLE_DROP_CONTRACT_ADDRESSES, TOKEN_DISTRO_CONTRACT_ADDRESSES } from 'legacy/constants/tokens'
import { LOCKED_GNO_VESTING_START_TIME, LOCKED_GNO_VESTING_DURATION } from 'legacy/constants'
import { useWalletInfo } from 'modules/wallet'

// We just generally use the mainnet version. We don't read from the contract anyways so the address doesn't matter
const COW = COW_TOKENS[SupportedChainId.MAINNET]

const useMerkleDropContract = () => useContract<MerkleDrop>(MERKLE_DROP_CONTRACT_ADDRESSES, MERKLE_DROP_ABI, true)
const useTokenDistroContract = () => useContract<TokenDistro>(TOKEN_DISTRO_CONTRACT_ADDRESSES, TOKEN_DISTRO_ABI, true)

export const useAllocation = (): CurrencyAmount<Token> => {
  const { chainId, account } = useWalletInfo()
  const initialAllocation = useRef(CurrencyAmount.fromRawAmount(COW, 0))
  const [allocation, setAllocation] = useState(initialAllocation.current)

  useEffect(() => {
    let canceled = false
    if (account && chainId) {
      fetchClaim(account, chainId).then((claim) => {
        if (!canceled) {
          setAllocation(CurrencyAmount.fromRawAmount(COW, claim?.amount ?? 0))
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
  const { result, loading } = useSingleCallResult(allocated.greaterThan(0) ? tokenDistro : null, 'balances', [
    account ?? undefined,
  ])
  const claimed = useMemo(() => CurrencyAmount.fromRawAmount(COW, result ? result.claimed.toString() : 0), [result])

  return {
    allocated,
    vested,
    claimed,
    loading,
  }
}

interface ClaimCallbackParams {
  openModal: (message: string, operationType: OperationType) => void
  closeModal: () => void
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
    openModal(summary, OperationType.CLAIM_VESTED_COW)

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
