import { useCallback, useState } from 'react'

import { useConfig, useWalletClient } from 'wagmi'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import type { CowShedHooks } from '@cowprotocol/sdk-cow-shed'
import { useWalletInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'

import { recoverFundsFromProxy } from '../services/recoverFundsFromProxy.service'

const DELAY_BETWEEN_SIGNATURES = ms`500ms`

export interface RecoverFundsContext {
  callback: () => Promise<string | undefined>
  txSigningStep: RecoverSigningStep | null
  proxyAddress: string | undefined
}

export interface UseRecoverFundsFromProxyParams {
  cowShedHooks?: CowShedHooks
  selectedTokenAddress?: string
  tokenBalance: CurrencyAmount<Currency> | null
  isNativeToken: boolean
}

export enum RecoverSigningStep {
  SIGN_RECOVER_FUNDS = 'SIGN_RECOVER_FUNDS',
  SIGN_TRANSACTION = 'SIGN_TRANSACTION',
}

export function useRecoverFundsFromProxy({
  cowShedHooks,
  selectedTokenAddress,
  tokenBalance,
  isNativeToken,
}: UseRecoverFundsFromProxyParams): RecoverFundsContext {
  const [txSigningStep, setTxSigningStep] = useState<RecoverSigningStep | null>(null)

  const { data: walletClient } = useWalletClient()
  const { account } = useWalletInfo()
  const config = useConfig()

  const proxyAddress = account && cowShedHooks ? cowShedHooks.proxyOf(account) : undefined
  const factoryAddress = cowShedHooks ? cowShedHooks.getFactoryAddress() : undefined

  const callback = useCallback(async () => {
    if (
      !cowShedHooks ||
      !walletClient ||
      !walletClient.account ||
      !proxyAddress ||
      !factoryAddress ||
      !selectedTokenAddress ||
      !account ||
      !tokenBalance
    ) {
      console.error('Context is not ready for proxy funds recovering!')
      return
    }

    setTxSigningStep(RecoverSigningStep.SIGN_RECOVER_FUNDS)

    try {
      return recoverFundsFromProxy({
        config,
        cowShedHooks,
        walletClient,
        account,
        proxyAddress,
        factoryAddress,
        selectedTokenAddress,
        tokenBalanceAtoms: tokenBalance.quotient.toString(),
        isNativeToken,
        delayBetweenSignaturesMs: DELAY_BETWEEN_SIGNATURES,
        onBeforeTransactionSign: () => setTxSigningStep(RecoverSigningStep.SIGN_TRANSACTION),
      })
    } finally {
      setTxSigningStep(null)
    }
  }, [
    walletClient,
    proxyAddress,
    factoryAddress,
    selectedTokenAddress,
    account,
    tokenBalance,
    cowShedHooks,
    isNativeToken,
    config,
  ])

  return { callback, txSigningStep, proxyAddress }
}
