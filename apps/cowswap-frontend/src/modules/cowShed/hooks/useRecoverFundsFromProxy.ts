import { useCallback, useState } from 'react'

import { CowShedContract, CowShedContractAbi } from '@cowprotocol/abis'
import { SigningScheme } from '@cowprotocol/contracts'
import { COW_SHED_FACTORY } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { formatBytes32String } from '@ethersproject/strings'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useContract } from 'common/hooks/useContract'

import { useCowShedHooks } from './useCowShedHooks'
import { useCurrentAccountProxyAddress } from './useCurrentAccountProxyAddress'

import { getRecoverFundsCalls } from '../services/getRecoverFundsCalls'

const INFINITE_DEADLINE = 99999999999
const DEFAULT_GAS_LIMIT = 600_000

export interface RecoverFundsContext {
  callback: () => Promise<string | undefined>
  isTxSigningInProgress: boolean
  proxyAddress: string | undefined
}

export function useRecoverFundsFromProxy(
  selectedTokenAddress: string | undefined,
  tokenBalance: CurrencyAmount<Currency> | null,
  isNativeToken: boolean,
): RecoverFundsContext {
  const [isTxSigningInProgress, setTxSigningInProgress] = useState<boolean>(false)

  const provider = useWalletProvider()
  const { account } = useWalletInfo()
  const cowShedHooks = useCowShedHooks()
  const { contract: cowShedContract } = useContract<CowShedContract>(COW_SHED_FACTORY, CowShedContractAbi)

  const { proxyAddress } = useCurrentAccountProxyAddress() || {}

  const callback = useCallback(async () => {
    if (
      !cowShedHooks ||
      !provider ||
      !proxyAddress ||
      !cowShedContract ||
      !selectedTokenAddress ||
      !account ||
      !tokenBalance
    )
      return

    setTxSigningInProgress(true)

    try {
      const calls = getRecoverFundsCalls({
        isNativeToken,
        account,
        tokenBalance: tokenBalance.quotient.toString(),
        selectedTokenAddress,
        proxyAddress,
      })

      const nonce = formatBytes32String(Date.now().toString())
      // This field is supposed to be used with orders, but here we just do a transaction
      const validTo = INFINITE_DEADLINE

      const encodedSignature = await cowShedHooks.signCalls(
        calls,
        nonce,
        BigInt(validTo),
        provider.getSigner(),
        SigningScheme.EIP712, // TODO: support other signing types
      )

      const transaction = await cowShedContract.executeHooks(calls, nonce, BigInt(validTo), account, encodedSignature, {
        gasLimit: DEFAULT_GAS_LIMIT,
      })

      return transaction.hash
    } finally {
      setTxSigningInProgress(false)
    }
  }, [
    provider,
    proxyAddress,
    cowShedContract,
    selectedTokenAddress,
    account,
    tokenBalance,
    cowShedHooks,
    isNativeToken,
  ])

  return { callback, isTxSigningInProgress, proxyAddress }
}
