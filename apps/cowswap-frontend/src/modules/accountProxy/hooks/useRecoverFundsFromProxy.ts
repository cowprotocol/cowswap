import { useCallback, useState } from 'react'

import { delay } from '@cowprotocol/common-utils'
import { CowShedContractAbi } from '@cowprotocol/cowswap-abis'
import { ContractsSigningScheme } from '@cowprotocol/sdk-contracts-ts'
import { CoWShedVersion } from '@cowprotocol/sdk-cow-shed'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import ms from 'ms.macro'
import { stringToHex } from 'viem'
import { useConfig } from 'wagmi'
import { writeContract } from 'wagmi/actions'

import { useCowShedHooks } from './useCowShedHooks'

import { getRecoverFundsCalls } from '../services/getRecoverFundsCalls'

import type { Hex } from 'viem'

const INFINITE_DEADLINE = 99999999999
const DEFAULT_GAS_LIMIT = 600_000n
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

  const config = useConfig()
  const { account } = useWalletInfo()
  const cowShedHooks = useCowShedHooks(proxyVersion)

  const factoryAddress = cowShedHooks?.getFactoryAddress()

  const callback = useCallback(async () => {
    if (!cowShedHooks || !proxyAddress || !factoryAddress || !selectedTokenAddress || !account || !tokenBalance) {
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

      const nonce = stringToHex(Date.now().toString(), { size: 32 })
      // This field is supposed to be used with orders, but here we just do a transaction
      const validTo = INFINITE_DEADLINE

      const encodedSignature = (await cowShedHooks.signCalls(
        calls,
        nonce,
        BigInt(validTo),
        ContractsSigningScheme.EIP712, // TODO: support other signing types
      )) as Hex

      setTxSigningStep(RecoverSigningStep.SIGN_TRANSACTION)

      await delay(DELAY_BETWEEN_SIGNATURES)

      const txHash = await writeContract(config, {
        abi: CowShedContractAbi,
        address: factoryAddress,
        functionName: 'executeHooks',
        args: [calls, nonce, BigInt(validTo), account, encodedSignature],
        gas: DEFAULT_GAS_LIMIT,
      })

      return txHash
    } finally {
      setTxSigningStep(null)
    }
  }, [config, proxyAddress, factoryAddress, selectedTokenAddress, account, tokenBalance, cowShedHooks, isNativeToken])

  return { callback, txSigningStep, proxyAddress }
}
