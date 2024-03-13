import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { SBCDepositContract, SBCDepositContractAbi } from '@cowprotocol/abis'
import { useContract } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { v4 as uuidv4 } from 'uuid'

import { hooksAtom } from '../state/hookDetailsAtom'
import { CowHookCreation, CowHookDetails } from '../types'

export const SBC_DEPOSIT_CONTRACT_ADDRESS = '0x0B98057eA310F4d31F2a452B414647007d1645d9'

export function useHooks() {
  return useAtomValue(hooksAtom)
}

export function useAddHook() {
  const updateHooks = useSetAtom(hooksAtom)

  return useCallback(
    (hookToAdd: CowHookCreation, isPreHook: boolean) => {
      console.log('[hooks] Add ' + (isPreHook ? 'pre-hook' : 'post-hook'), hookToAdd, isPreHook)
      const uuid = uuidv4()
      updateHooks((hooks) => {
        if (isPreHook) {
          return { preHooks: [...hooks.preHooks, { ...hookToAdd, uuid }], postHooks: hooks.postHooks }
        } else {
          return { preHooks: hooks.preHooks, postHooks: [...hooks.postHooks, { ...hookToAdd, uuid }] }
        }
      })
    },
    [updateHooks]
  )
}

export function useRemoveHook() {
  const updateHooks = useSetAtom(hooksAtom)

  return useCallback(
    (hookToRemove: CowHookDetails, isPreHook: boolean) => {
      console.log('[hooks] Remove ' + (isPreHook ? 'pre-hook' : 'post-hook'), hookToRemove, isPreHook)

      updateHooks((hooks) => {
        if (isPreHook) {
          return {
            preHooks: hooks.preHooks.filter((hook) => hook.uuid !== hookToRemove.uuid),
            postHooks: hooks.postHooks,
          }
        } else {
          return {
            preHooks: hooks.preHooks,
            postHooks: hooks.postHooks.filter((hook) => hook.uuid !== hookToRemove.uuid),
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
