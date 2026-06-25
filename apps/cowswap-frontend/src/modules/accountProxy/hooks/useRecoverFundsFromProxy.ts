import { useCallback, useState } from 'react'

import { delay } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { ContractsSigningScheme } from '@cowprotocol/sdk-contracts-ts'
import { CoWShedVersion } from '@cowprotocol/sdk-cow-shed'
import { useWalletInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'
import { stringToHex } from 'viem'

import { useWalletClientWithFallback } from 'common/hooks/useWalletClientWithFallback'

import { useCowShedHooks } from './useCowShedHooks'

import { getRecoverFundsCalls } from '../services/getRecoverFundsCalls'

const INFINITE_DEADLINE = 99999999999
const DEFAULT_GAS_LIMIT = 600_000n
const DELAY_BETWEEN_SIGNATURES = ms`500ms`

export interface RecoverFundsContext {
  callback: () => Promise<string | undefined>
  txSigningStep: RecoverSigningStep | null
  proxyAddress: string | undefined
}

export enum RecoverSigningStep {
  SIGN_RECOVER_FUNDS = 'SIGN_RECOVER_FUNDS',
  SIGN_TRANSACTION = 'SIGN_TRANSACTION',
}

export function useRecoverFundsFromProxy(
  proxyAddress: string | undefined,
  proxyVersion: CoWShedVersion | undefined,
  selectedTokenAddress: string | undefined,
  tokenBalance: CurrencyAmount<Currency> | null,
  isNativeToken: boolean,
): RecoverFundsContext {
  const [txSigningStep, setTxSigningStep] = useState<RecoverSigningStep | null>(null)

  const { account, chainId } = useWalletInfo()
  const { walletClient } = useWalletClientWithFallback({ chainId, account })
  const cowShedHooks = useCowShedHooks(proxyVersion)

  const factoryAddress = cowShedHooks?.getFactoryAddress()

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
      const calls = getRecoverFundsCalls({
        isNativeToken,
        account,
        tokenBalance: tokenBalance.quotient.toString(),
        selectedTokenAddress,
        proxyAddress,
      })

      const hex = stringToHex(Date.now().toString()).slice(2)
      const nonce = ('0x' + (hex + '0'.repeat(64)).slice(0, 64)) as `0x${string}`
      // This field is supposed to be used with orders, but here we just do a transaction
      const validTo = INFINITE_DEADLINE

      const encodedSignature = await cowShedHooks.signCalls(
        calls,
        nonce,
        BigInt(validTo),
        ContractsSigningScheme.EIP712, // TODO: support other signing types
      )

      setTxSigningStep(RecoverSigningStep.SIGN_TRANSACTION)

      await delay(DELAY_BETWEEN_SIGNATURES)

      // Use the SDK's own encoder to build the calldata, matching how CowShedSdk.signCalls works internally
      const callData = cowShedHooks.encodeExecuteHooksForFactory(
        calls,
        nonce,
        BigInt(validTo),
        account,
        encodedSignature,
      )

      const hash = await walletClient.sendTransaction({
        to: factoryAddress as `0x${string}`,
        data: callData as `0x${string}`,
        account: walletClient.account,
        chain: walletClient.chain,
        gas: DEFAULT_GAS_LIMIT,
      })

      return hash
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
  ])

  return { callback, txSigningStep, proxyAddress }
}
