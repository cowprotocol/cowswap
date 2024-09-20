// apps/cowswap-frontend/src/modules/hooksStore/containers/HookRegistryList/index.tsx

import { useCallback, useEffect, useMemo, useState } from 'react'

import { Command } from '@cowprotocol/types'
import { useIsSmartContractWallet, useWalletInfo } from '@cowprotocol/wallet'

import { NewModal } from 'common/pure/NewModal'

import { EmptyList, HookDappsList, Wrapper } from './styled'

import { POST_HOOK_REGISTRY, PRE_HOOK_REGISTRY } from '../../hookRegistry'
import { useAddExternalHookDapp } from '../../hooks/useAddExternalHookDapp'
import { useExternalHookDapps } from '../../hooks/useExternalHookDapps'
import { useHookById } from '../../hooks/useHookById'
import { useRemoveExternalHookDapp } from '../../hooks/useRemoveExternalHookDapp'
import { AddExternalHookForm } from '../../pure/AddExternalHookForm'
import { HookDappDetails } from '../../pure/HookDappDetails'
import { HookDetailHeader } from '../../pure/HookDetailHeader'
import { HookListItem } from '../../pure/HookListItem'
import { HookListsTabs } from '../../pure/HookListsTabs'
import { HookDapp, HookDappIframe, CowHookDetailsSerialized } from '../../types/hooks'
import { findHookDappById } from '../../utils'
import { HookDappContainer } from '../HookDappContainer'

// Type Guards
function isCowHookDetailsSerialized(obj: any): obj is CowHookDetailsSerialized {
  return obj && typeof obj === 'object' && 'hookDetails' in obj && 'dappId' in obj
}

function isHookDappIframe(dapp: HookDapp): dapp is HookDappIframe {
  return 'url' in dapp && typeof dapp.url === 'string'
}

interface HookStoreModal {
  onDismiss: Command
  isPreHook: boolean
  hookToEdit?: string
}

export function HookRegistryList({ onDismiss, isPreHook, hookToEdit }: HookStoreModal) {
  const { chainId } = useWalletInfo()
  const [selectedDapp, setSelectedDapp] = useState<HookDapp | null>(null)
  const [dappDetails, setDappDetails] = useState<HookDapp | null>(null)

  const [isAllHooksTab, setIsAllHooksTab] = useState<boolean>(true)

  const isSmartContractWallet = useIsSmartContractWallet()
  const addExternalHookDapp = useAddExternalHookDapp()
  const removeExternalHookDapp = useRemoveExternalHookDapp()
  const externalHookDapps = useExternalHookDapps()
  const hookToEditDetails = useHookById(hookToEdit, isPreHook)

  const customHookDapps = useMemo(() => {
    const filtered = externalHookDapps.filter(isHookDappIframe).filter((dapp) => dapp.isCustom)
    console.log('Custom Hook Dapps:', filtered) // Debugging
    return filtered
  }, [externalHookDapps])

  const dapps = useMemo(() => {
    if (isAllHooksTab) {
      if (isPreHook) {
        return PRE_HOOK_REGISTRY[chainId] || []
      } else {
        return [...(POST_HOOK_REGISTRY[chainId] || []), ...externalHookDapps]
      }
    } else {
      return customHookDapps
    }
  }, [isAllHooksTab, isPreHook, chainId, externalHookDapps, customHookDapps])

  const allHooksCount = useMemo(() => {
    if (isPreHook) {
      return PRE_HOOK_REGISTRY[chainId]?.length || 0
    } else {
      return (POST_HOOK_REGISTRY[chainId]?.length || 0) + externalHookDapps.length
    }
  }, [isPreHook, chainId, externalHookDapps])

  const customHooksCount = useMemo(() => customHookDapps.length, [customHookDapps])

  const title = useMemo(() => {
    if (selectedDapp) return selectedDapp.name
    if (dappDetails) return 'Hook description'
    return 'Hook Store'
  }, [selectedDapp, dappDetails])

  const onDismissModal = useCallback(() => {
    if (hookToEdit) {
      setSelectedDapp(null)
      onDismiss()
      return
    }

    if (dappDetails) {
      setDappDetails(null)
    } else if (selectedDapp) {
      setSelectedDapp(null)
    } else {
      onDismiss()
    }
  }, [onDismiss, selectedDapp, dappDetails, hookToEdit])

  useEffect(() => {
    if (!hookToEditDetails) {
      setSelectedDapp(null)
    } else {
      if (!isCowHookDetailsSerialized(hookToEditDetails)) {
        console.error('hookToEditDetails is missing dappId:', hookToEditDetails)
        setSelectedDapp(null)
        return
      }

      setSelectedDapp(findHookDappById(dapps, hookToEditDetails) || null)
    }
  }, [hookToEditDetails, dapps])

  useEffect(() => {
    setDappDetails(null)
  }, [isAllHooksTab])

  useEffect(() => {
    console.log('External Hook Dapps:', externalHookDapps)
  }, [externalHookDapps])

  return (
    <Wrapper>
      <NewModal
        modalMode={false}
        title={title}
        onDismiss={onDismissModal}
        contentPadding="0"
        justifyContent="flex-start"
      >
        <HookListsTabs
          isAllHooksTab={isAllHooksTab}
          setIsAllHooksTab={setIsAllHooksTab}
          allHooksCount={allHooksCount}
          customHooksCount={customHooksCount}
        />
        {(() => {
          if (selectedDapp) {
            return (
              <>
                <HookDetailHeader dapp={selectedDapp} iconSize={58} gap={12} padding="24px 10px" />
                <HookDappContainer
                  isPreHook={isPreHook}
                  onDismiss={onDismiss}
                  dapp={selectedDapp}
                  hookToEdit={hookToEdit}
                />
              </>
            )
          }

          if (dappDetails) {
            return <HookDappDetails dapp={dappDetails} onSelect={() => setSelectedDapp(dappDetails)} />
          }

          const dappsList = dapps.length ? (
            <HookDappsList>
              {dapps.map((dapp) => (
                <HookListItem
                  key={isHookDappIframe(dapp) ? dapp.url : dapp.name}
                  dapp={dapp}
                  onRemove={isAllHooksTab ? undefined : () => removeExternalHookDapp(dapp as HookDappIframe)}
                  onSelect={() => setSelectedDapp(dapp)}
                  onOpenDetails={() => setDappDetails(dapp)}
                />
              ))}
            </HookDappsList>
          ) : (
            <EmptyList>No hook-dapps yet</EmptyList>
          )

          return (
            <>
              {isAllHooksTab ? (
                dappsList
              ) : (
                <AddExternalHookForm
                  isPreHook={isPreHook}
                  isSmartContractWallet={isSmartContractWallet}
                  addHookDapp={addExternalHookDapp}
                >
                  {dappsList}
                </AddExternalHookForm>
              )}
            </>
          )
        })()}
      </NewModal>
    </Wrapper>
  )
}
