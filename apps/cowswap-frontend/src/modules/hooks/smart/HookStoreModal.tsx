import { Command } from '@cowprotocol/types'
import { UI } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

import { NewModal } from 'common/pure/NewModal'

import { POST_HOOK_REGISTRY, PRE_HOOK_REGISTRY } from '../hookRegistry'
import { HookDapp } from '../types'

const MODAL_MAX_WIDTH = 450

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  max-width: ${MODAL_MAX_WIDTH}px;
`

const HookDapps = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-wrap: wrap
  align-items: stretch;

`

const HookDappWrapper = styled.li`
  flex: 1 1 100px; /* Adjust the width as needed */
  margin: 8px;
  box-sizing: border-box;
  text-align: center;
  background-color: var(${UI.COLOR_PAPER});
`

interface HookStoreModal {
  onDismiss: Command
  isPrehook: boolean
}

export function HookStoreModal({ onDismiss, isPrehook }: HookStoreModal) {
  const { chainId } = useWalletInfo()
  const dapps = isPrehook ? PRE_HOOK_REGISTRY[chainId] : POST_HOOK_REGISTRY[chainId]

  return (
    <Wrapper>
      <NewModal modalMode title="Hook Store" onDismiss={onDismiss} maxWidth={MODAL_MAX_WIDTH}>
        <HookDapps>
          {dapps.map((dapp) => (
            <HookDappItem dapp={dapp} />
          ))}
        </HookDapps>
      </NewModal>
    </Wrapper>
  )
}

export function HookDappItem({ dapp }: { dapp: HookDapp }) {
  const { name, description } = dapp
  return (
    <HookDappWrapper>
      {name}: {description}
    </HookDappWrapper>
  )
}
