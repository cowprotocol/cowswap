import { useCallback, useMemo } from 'react'

import { SigningScheme } from '@cowprotocol/contracts'
import type { CowShedHooks, ICoWShedCall } from '@cowprotocol/cow-sdk'
import { HookDappContext } from '@cowprotocol/hook-dapp-lib'

import { stringToHex } from 'viem'

import type { Signer } from 'ethers'

export interface BaseTransaction {
  to: string
  value: bigint
  callData: string
  isDelegateCall?: boolean
}

export function useHookDeadline({ context }: { context: HookDappContext | undefined }) {
  return useMemo(() => {
    const now = new Date()
    const validToOnTimezone = context?.orderParams?.validTo || 0
    const validToTimestamp = validToOnTimezone + now.getTimezoneOffset() * 60
    const currentTimestamp = new Date().getTime() / 1000
    const oneHourAfter = Number(currentTimestamp.toFixed()) + 60 * 60

    if (validToTimestamp < oneHourAfter) return BigInt(oneHourAfter)
    return BigInt(validToTimestamp)
  }, [context?.orderParams?.validTo])
}

export function getCowShedNonce() {
  return stringToHex(Date.now().toString(), { size: 32 })
}

export function useCowShedSignature({
  cowShed,
  signer,
  context,
}: {
  cowShed: CowShedHooks | undefined
  signer: Signer | undefined
  context: HookDappContext | undefined
}) {
  const hookDeadline = useHookDeadline({ context })

  return useCallback(
    async (txs: BaseTransaction[]) => {
      if (!cowShed || !signer || !context?.account) return
      const cowShedCalls: ICoWShedCall[] = txs.map((tx) => {
        return {
          target: tx.to,
          value: BigInt(tx.value),
          callData: tx.callData,
          allowFailure: false,
          isDelegateCall: !!tx.isDelegateCall,
        }
      })
      const nonce = getCowShedNonce()
      const signature = await cowShed
        .signCalls(cowShedCalls, nonce, hookDeadline, signer, SigningScheme.EIP712)
        .catch(() => {
          throw new Error('User rejected signature')
        })
      return cowShed.encodeExecuteHooksForFactory(cowShedCalls, nonce, hookDeadline, context.account, signature)
    },
    [hookDeadline, cowShed, signer, context],
  )
}
