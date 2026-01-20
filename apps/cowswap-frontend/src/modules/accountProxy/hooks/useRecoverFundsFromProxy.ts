import { useCallback, useState } from 'react'

import { CowShedContract, CowShedContractAbi } from '@cowprotocol/abis'
import { delay } from '@cowprotocol/common-utils'
import { ContractsSigningScheme } from '@cowprotocol/sdk-contracts-ts'
import { CoWShedVersion } from '@cowprotocol/sdk-cow-shed'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { formatBytes32String } from '@ethersproject/strings'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import ms from 'ms.macro'

import { useContract } from 'common/hooks/useContract'

import { useCowShedHooks } from './useCowShedHooks'

import { getRecoverFundsCalls } from '../services/getRecoverFundsCalls'

const INFINITE_DEADLINE = 99999999999
const DEFAULT_GAS_LIMIT = 600_000
const DELAY_BETWEEN_SIGNATURES = ms`500ms`

export enum RecoverSigningStep {
  SIGN_RECOVER_FUNDS = 'SIGN_RECOVER_FUNDS',
  SIGN_TRANSACTION = 'SIGN_TRANSACTION',
}

export interface RecoverFundsContext {
  callback: () => Promise<string | undefined>
  txSigningStep: RecoverSigningStep | null
  proxyAddress: string | undefined
}

export function useRecoverFundsFromProxy(
  proxyAddress: string | undefined,
  proxyVersion: CoWShedVersion | undefined,
  selectedTokenAddress: string | undefined,
  tokenBalance: CurrencyAmount<Currency> | null,
  isNativeToken: boolean,
): RecoverFundsContext {
  const [txSigningStep, setTxSigningStep] = useState<RecoverSigningStep | null>(null)

  // TODO M-6 COW-573
  // This flow will be reviewed and updated later, to include a wagmi alternative
  const provider = useWalletProvider()
  const { account } = useWalletInfo()
  const cowShedHooks = useCowShedHooks(proxyVersion)

  const factoryAddress = cowShedHooks?.getFactoryAddress()

  const { contract: cowShedContract } = useContract<CowShedContract>(factoryAddress, CowShedContractAbi)

  const callback = useCallback(async () => {
    if (
      !cowShedHooks ||
      !provider ||
      !proxyAddress ||
      !cowShedContract ||
      !selectedTokenAddress ||
      !account ||
      !tokenBalance
    ) {
      console.error('Context is not ready for proxy funds recovering!')
      return
    }

    setTxSigningStep(RecoverSigningStep.SIGN_RECOVER_FUNDS)

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
        ContractsSigningScheme.EIP712, // TODO: support other signing types
        provider.getSigner(),
      )

      setTxSigningStep(RecoverSigningStep.SIGN_TRANSACTION)

      await delay(DELAY_BETWEEN_SIGNATURES)

      const transaction = await cowShedContract.executeHooks(calls, nonce, BigInt(validTo), account, encodedSignature, {
        gasLimit: DEFAULT_GAS_LIMIT,
      })

      return transaction.hash
    } finally {
      setTxSigningStep(null)
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

  return { callback, txSigningStep, proxyAddress }
}
