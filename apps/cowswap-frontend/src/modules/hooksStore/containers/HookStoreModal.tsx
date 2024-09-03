import { useCallback, useMemo, useState } from 'react'

import ICON_INFO from '@cowprotocol/assets/cow-swap/info.svg'
import { Command, HookDapp, HookDappContext as HookDappContextType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { NewModal } from 'common/pure/NewModal'

import { CustomHookButton } from './CustomHookButton'
import * as Styled from './styled'

import { HookDappContext } from '../context'
import { POST_HOOK_REGISTRY, PRE_HOOK_REGISTRY } from '../hookRegistry'
import { useAddHook } from '../hooks/useAddHook'
import { isHookDappIframe } from '../utils'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
`

interface HookStoreModal {
  onDismiss: Command
  isPreHook: boolean
}

export function HookStoreModal({ onDismiss, isPreHook }: HookStoreModal) {
  const { chainId, account } = useWalletInfo()
  const [selectedDapp, setSelectedDapp] = useState<HookDapp | null>(null)
  const [selectedDappDescription, setSelectedDappDescription] = useState<HookDapp | null>(null)
  const addHook = useAddHook()

  const dapps = isPreHook ? PRE_HOOK_REGISTRY[chainId] : POST_HOOK_REGISTRY[chainId]

  const openDescriptionModal = useCallback((dapp: HookDapp) => {
    setSelectedDappDescription(dapp)
  }, [])

  const closeDescriptionModal = useCallback(() => {
    setSelectedDappDescription(null)
  }, [])

  const title = selectedDappDescription ? 'Hook description' : selectedDapp ? selectedDapp.name : 'Hook Store'

  const onDismissModal = useCallback(() => {
    if (selectedDappDescription) {
      closeDescriptionModal()
    } else if (selectedDapp) {
      setSelectedDapp(null)
    } else {
      onDismiss()
    }
  }, [onDismiss, selectedDapp, selectedDappDescription, closeDescriptionModal])

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
        <NewModal modalMode={!selectedDapp} title={title} onDismiss={onDismissModal}>
          {selectedDappDescription ? (
            <HookDescriptionModal
              dapp={selectedDappDescription}
              onSelect={setSelectedDapp}
              onDismiss={closeDescriptionModal}
            />
          ) : selectedDapp ? (
            <HookDappUi dapp={selectedDapp} />
          ) : (
            <Styled.HookDappsList>
              <CustomHookButton />

              {dapps.map((dapp) => (
                <HookDappItem
                  key={dapp.name}
                  dapp={dapp}
                  onSelect={setSelectedDapp}
                  onOpenDescription={openDescriptionModal}
                />
              ))}
            </Styled.HookDappsList>
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

  return dapp.component
}

export function HookDappItem({
  dapp,
  onSelect,
  onOpenDescription,
}: {
  dapp: HookDapp
  onSelect: (dapp: HookDapp) => void
  onOpenDescription: (dapp: HookDapp) => void
}) {
  const { name, description, image, version, imageBgContrast = false } = dapp

  return (
    <Styled.HookDappListItem imageBgContrast={imageBgContrast}>
      <img src={image} alt={name} />

      <Styled.HookDappDetails>
        <h3>{name}</h3>
        <p>
          {description} <Styled.Version>{version}</Styled.Version>
        </p>
      </Styled.HookDappDetails>
      <span>
        <Styled.LinkButton onClick={() => onSelect(dapp)}>Add</Styled.LinkButton>
        <i
          onClick={(e) => {
            e.stopPropagation()
            onOpenDescription(dapp)
          }}
        >
          <SVG src={ICON_INFO} /> details
        </i>
      </span>
    </Styled.HookDappListItem>
  )
}

interface HookDescriptionModalProps {
  dapp: HookDapp
  onSelect: (dapp: HookDapp) => void
  onDismiss: () => void // Add this prop
}

function HookDescriptionModal({ dapp, onSelect, onDismiss }: HookDescriptionModalProps) {
  const handleAddClick = useCallback(() => {
    onSelect(dapp)
    onDismiss() // Close the modal after selecting
  }, [dapp, onSelect, onDismiss])

  return (
    <>
      <Styled.HookDappListItem imageBgContrast={dapp.imageBgContrast} isDescriptionView>
        <span>
          <img src={dapp.image} alt={dapp.name} />
          <Styled.Version isDescriptionView>{dapp.version}</Styled.Version>
        </span>
        <Styled.HookDappDetails isDescriptionView>
          <h3>{dapp.name}</h3>
          <p>{dapp.descriptionFull || dapp.description}</p>
          {dapp.website && (
            <Styled.TextLink href={dapp.website} target="_blank" rel="noopener noreferrer">
              {dapp.website}
            </Styled.TextLink>
          )}

          <Styled.LinkButton onClick={handleAddClick}>Add</Styled.LinkButton>
        </Styled.HookDappDetails>
      </Styled.HookDappListItem>
    </>
  )
}
