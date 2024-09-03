import { useCallback, useMemo, useState } from 'react'

import { Command, HookDapp, HookDappContext as HookDappContextType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { NewModal } from 'common/pure/NewModal'

import { HookDappDetails, HookDappListItem, HookDappsList, Link, Version, Wrapper } from './styled'

import { HookDappContext } from '../../context'
import { POST_HOOK_REGISTRY, PRE_HOOK_REGISTRY } from '../../hookRegistry'
import { useAddHook } from '../../hooks/useAddHook'
import { isHookDappIframe } from '../../utils'

const MODAL_MAX_WIDTH = 450

interface HookStoreModal {
  onDismiss: Command
  isPreHook: boolean
}

export function HookRegistryList({ onDismiss, isPreHook }: HookStoreModal) {
  const { chainId, account } = useWalletInfo()
  const [selectedDapp, setSelectedDapp] = useState<HookDapp | null>(null)
  const addHook = useAddHook()

  const dapps = isPreHook ? PRE_HOOK_REGISTRY[chainId] : POST_HOOK_REGISTRY[chainId]

  const title = selectedDapp ? selectedDapp.name : 'Hook Store'

  const onDismissModal = useCallback(() => {
    if (selectedDapp) {
      setSelectedDapp(null)
    } else {
      onDismiss()
    }
  }, [onDismiss, selectedDapp])

  const hookDappContext = useMemo<HookDappContextType>(() => {
    return {
      chainId,
      account,
      addHook: (hookToAdd, isPreHook) => {
        const hook = addHook(hookToAdd, isPreHook)
        onDismiss()
        return hook
      },
      close: onDismissModal,
    }
  }, [addHook, onDismissModal, onDismiss, chainId, account])

  return (
    <Wrapper>
      <HookDappContext.Provider value={hookDappContext}>
        <NewModal modalMode={!selectedDapp} title={title} onDismiss={onDismissModal} maxWidth={MODAL_MAX_WIDTH}>
          {selectedDapp ? (
            <HookDappUi dapp={selectedDapp} />
          ) : (
            <HookDappsList>
              {dapps.map((dapp) => (
                <HookDappItem key={dapp.name} dapp={dapp} onSelect={setSelectedDapp} />
              ))}
            </HookDappsList>
          )}
        </NewModal>
      </HookDappContext.Provider>
    </Wrapper>
  )
}

interface HookDappUiProps {
  dapp: HookDapp
}

export function HookDappUi({ dapp }: HookDappUiProps) {
  if (isHookDappIframe(dapp)) {
    // TODO: Create iFrame
    return <>{dapp.name}</>
  }

  return dapp.component(dapp)
}

export function HookDappItem({ dapp, onSelect }: { dapp: HookDapp; onSelect: (dapp: HookDapp) => void }) {
  const { name, description, image, version } = dapp

  return (
    <HookDappListItem>
      <div>
        <img onClick={() => onSelect(dapp)} src={image} alt={name} />
      </div>
      <HookDappDetails>
        <h3>{name}</h3>
        <p>{description}</p>
        <Link onClick={() => onSelect(dapp)}>+ Add hook</Link>

        <Version>{version}</Version>
      </HookDappDetails>
    </HookDappListItem>
  )
}
