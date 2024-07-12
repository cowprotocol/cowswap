import { useCallback, useMemo, useState } from 'react'

import { Command, HookDapp, HookDappContext as HookDappContextType } from '@cowprotocol/types'
import { UI } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

import { NewModal } from 'common/pure/NewModal'

import { HookDappContext } from '../context'
import { POST_HOOK_REGISTRY, PRE_HOOK_REGISTRY } from '../hookRegistry'
import { useAddHook } from '../hooks/useAddHook'
import { isHookDappIframe } from '../utils'

const MODAL_MAX_WIDTH = 450

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  max-width: ${MODAL_MAX_WIDTH}px;
`

const HookDappsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-wrap: wrap
  align-items: stretch;

  img {
    width: 120px;
    max-height: 120px;
    height: 100%;
    cursor: pointer;
  }

`

const HookDappListItem = styled.li`
  flex: 1 1 100px;
  margin: 8px;
  box-sizing: border-box;
  text-align: center;
  background-color: var(${UI.COLOR_PAPER});

  display: flex;
  flex-direction: row;
  justify-content: space-between;

  position: relative;
`

const HookDappDetails = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.5em;

  flex-grow: 1;

  h3 {
  }

  p {
    text-align: left;
    padding: 0;
    margin: 0;
    flex-grow: 1;
    color: var(${UI.COLOR_TEXT2});
  }

  a {
    display: block;
    margin: 20px 0 0px 0;
    font-size: 0.8em;
    text-decoration: underline;
    font-weight: 600;
  }
`

export const Link = styled.button`
  display: inline-block;
  cursor: pointer;
  margin: 0;
  background: none;
  border: none;
  outline: none;
  color: inherit;

  font-weight: 600;
  font-size: 12px;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`

const Version = styled.div`
  position: absolute;
  top: 0;
  right: 0;

  padding: 5px;
  font-size: 0.8em;
  color: var(${UI.COLOR_TEXT2});
  font-weight: 600;
`

interface HookStoreModal {
  onDismiss: Command
  isPreHook: boolean
}

export function HookStoreModal({ onDismiss, isPreHook }: HookStoreModal) {
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

  return dapp.component
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
