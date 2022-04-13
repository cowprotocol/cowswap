import { useCallback, useEffect, useMemo, useState } from 'react'
import { ContractTransaction } from '@ethersproject/contracts'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useActiveWeb3React } from 'hooks/web3'
import MERKLE_DROP_ABI from 'abis/MerkleDrop.json'
import TOKEN_DISTRO_ABI from 'abis/TokenDistro.json'
import { MerkleDrop, TokenDistro } from 'abis/types'
import { useSingleCallResult } from 'state/multicall/hooks'
import { useTransactionAdder } from 'state/enhancedTransactions/hooks'
import { useContract } from 'hooks/useContract'
import { COW as COW_TOKENS } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { OperationType } from 'components/TransactionConfirmationModal'
import { fetchClaim } from './claimData'

// We just generally use the mainnet version. We don't read from the contract anyways so the address doesn't matter
const COW = COW_TOKENS[SupportedChainId.MAINNET]

const MERKLE_DROP_CONTRACT_ADDRESSES = {
  [SupportedChainId.MAINNET]: '0x64646f112FfD6F1B7533359CFaAF7998F23C8c40',
  [SupportedChainId.RINKEBY]: '0xe354c570B77b02F1a568Ea28901184e12703960D',
  [SupportedChainId.XDAI]: '0x3d610e917130f9D036e85A030596807f57e11093',
}

const useMerkleDropContract = () => useContract<MerkleDrop>(MERKLE_DROP_CONTRACT_ADDRESSES, MERKLE_DROP_ABI, true)

const TOKEN_DISTRO_CONTRACT_ADDRESSES = {
  [SupportedChainId.MAINNET]: '0x68FFAaC7A431f276fe73604C127Bd78E49070c92',
  [SupportedChainId.RINKEBY]: '0x31E7495e461Cf8147C7Bc0814a49aAbeA76B704b',
  [SupportedChainId.XDAI]: '0x3d610e917130f9D036e85A030596807f57e11093',
}

const useTokenDistroContract = () => useContract<TokenDistro>(TOKEN_DISTRO_CONTRACT_ADDRESSES, TOKEN_DISTRO_ABI, true)

export const useAllocation = (): CurrencyAmount<Token> => {
  const { chainId, account } = useActiveWeb3React()
  const [allocation, setAllocation] = useState(CurrencyAmount.fromRawAmount(COW, 0))

  useEffect(() => {
    let canceled = false
    if (account && chainId) {
      fetchClaim(account, chainId).then((claim) => {
        if (!canceled) {
          setAllocation(CurrencyAmount.fromRawAmount(COW, claim?.amount ?? 0))
        }
      })
    }
    return () => {
      canceled = true
    }
  }, [chainId, account])

  return allocation
}

const START_TIME = 1644584715000
const DURATION = 126144000000

export const useBalances = () => {
  const { account } = useActiveWeb3React()
  const allocated = useAllocation()
  const vested = allocated.multiply(Math.min(Date.now() - START_TIME, DURATION)).divide(DURATION)

  const tokenDistro = useTokenDistroContract()
  const { result, loading } = useSingleCallResult(allocated.greaterThan(0) ? tokenDistro : null, 'balances', [
    account || undefined,
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
          swapVCow: true,
          hash: tx.hash,
          summary,
        })
        return tx
      })
      .finally(closeModal)
  }, [account, addTransaction, chainId, closeModal, openModal, isFirstClaim, merkleDrop, tokenDistro])

  return claimCallback
}
