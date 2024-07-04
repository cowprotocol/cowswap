import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { SBCDepositContract, SBCDepositContractAbi } from '@cowprotocol/abis'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { AddHook, RemoveHook } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { v4 as uuidv4 } from 'uuid'

import { useContract } from 'common/hooks/useContract'

import { hooksAtom } from './state/hookDetailsAtom'

export const SBC_DEPOSIT_CONTRACT_ADDRESS = '0x0B98057eA310F4d31F2a452B414647007d1645d9'

export function useHooks() {
  return useAtomValue(hooksAtom)
}

export function useAddHook(): AddHook {
  const updateHooks = useSetAtom(hooksAtom)

  return useCallback(
    (hookToAdd, isPreHook) => {
      console.log('[hooks] Add ' + (isPreHook ? 'pre-hook' : 'post-hook'), hookToAdd, isPreHook)
      const uuid = uuidv4()
      const hookDetails = { ...hookToAdd, uuid }
      updateHooks((hooks) => {
        if (isPreHook) {
          return { preHooks: [...hooks.preHooks, hookDetails], postHooks: hooks.postHooks }
        } else {
          return { preHooks: hooks.preHooks, postHooks: [...hooks.postHooks, hookDetails] }
        }
      })

      return hookDetails
    },
    [updateHooks]
  )
}

export function useRemoveHook(): RemoveHook {
  const updateHooks = useSetAtom(hooksAtom)

  return useCallback(
    (uuid, isPreHook) => {
      console.log('[hooks] Remove ' + (isPreHook ? 'pre-hook' : 'post-hook'), uuid, isPreHook)

      updateHooks((hooks) => {
        if (isPreHook) {
          return {
            preHooks: hooks.preHooks.filter((hook) => hook.uuid !== uuid),
            postHooks: hooks.postHooks,
          }
        } else {
          return {
            preHooks: hooks.preHooks,
            postHooks: hooks.postHooks.filter((hook) => hook.uuid !== uuid),
          }
        }
      })
    },
    [updateHooks]
  )
}

export function useSBCDepositContract(): SBCDepositContract | null {
  const { chainId } = useWalletInfo()
  return useContract<SBCDepositContract>(
    chainId === SupportedChainId.GNOSIS_CHAIN ? SBC_DEPOSIT_CONTRACT_ADDRESS : undefined,
    SBCDepositContractAbi,
    true
  )
}
