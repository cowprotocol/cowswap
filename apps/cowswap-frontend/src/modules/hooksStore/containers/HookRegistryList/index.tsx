import { useCallback, useMemo, useState } from 'react'

import { Command, HookDapp, HookDappContext as HookDappContextType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { NewModal } from 'common/pure/NewModal'

import { HookDappDetails, HookDappListItem, HookDappsList, Link, Version, Wrapper } from './styled'

import { POST_HOOK_REGISTRY, PRE_HOOK_REGISTRY } from '../../hookRegistry'
import { useAddHook } from '../../hooks/useAddHook'
import { isHookDappIframe } from '../../utils'

const MODAL_MAX_WIDTH = 450

interface HookStoreModal {
  onDismiss: Command
  isPreHook: boolean
}

export function HookRegistryList({ onDismiss, isPreHook }: HookStoreModal) {
  const { chainId } = useWalletInfo()
  const [selectedDapp, setSelectedDapp] = useState<HookDapp | null>(null)

  const dapps = isPreHook ? PRE_HOOK_REGISTRY[chainId] : POST_HOOK_REGISTRY[chainId]

  const title = selectedDapp ? selectedDapp.name : 'Hook Store'

  const onDismissModal = useCallback(() => {
    if (selectedDapp) {
      setSelectedDapp(null)
    } else {
      onDismiss()
    }
  }, [onDismiss, selectedDapp])

  return (
    <Wrapper>
      <NewModal modalMode={!selectedDapp} title={title} onDismiss={onDismissModal} maxWidth={MODAL_MAX_WIDTH}>
        {selectedDapp ? (
          <HookDappUi isPreHook={isPreHook} onDismiss={onDismiss} onDismissModal={onDismissModal} dapp={selectedDapp} />
        ) : (
          <HookDappsList>
            {dapps.map((dapp) => (
              <HookDappItem key={dapp.name} dapp={dapp} onSelect={setSelectedDapp} />
            ))}
          </HookDappsList>
        )}
      </NewModal>
    </Wrapper>
  )
}

interface HookDappUiProps {
  dapp: HookDapp
  isPreHook: boolean
  onDismiss: Command
  onDismissModal: Command
}

export function HookDappUi({ dapp, isPreHook, onDismiss, onDismissModal }: HookDappUiProps) {
  const { chainId, account } = useWalletInfo()
  const addHook = useAddHook(dapp, isPreHook)

  const context = useMemo<HookDappContextType>(() => {
    return {
      chainId,
      account,
      addHook: (hookToAdd) => {
        const hook = addHook(hookToAdd)
        onDismiss()

        return hook
      },
      close: onDismissModal,
    }
  }, [addHook, onDismiss, onDismissModal, chainId, account])

  const dappProps = useMemo(() => ({ context, dapp, isPreHook }), [context, dapp, isPreHook])

  if (isHookDappIframe(dapp)) {
    // TODO: Create iFrame
    return <>{dapp.name}</>
  }

  return dapp.component(dappProps)
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
