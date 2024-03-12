import { Command } from '@cowprotocol/types'
import { UI } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

import { Link } from 'legacy/components/Link'

import { NewModal } from 'common/pure/NewModal'

import { POST_HOOK_REGISTRY, PRE_HOOK_REGISTRY } from '../hookRegistry'
import { HookDapp } from '../types'
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
  isPrehook: boolean
}

export function HookStoreModal({ onDismiss, isPrehook }: HookStoreModal) {
  const { chainId } = useWalletInfo()
  const dapps = isPrehook ? PRE_HOOK_REGISTRY[chainId] : POST_HOOK_REGISTRY[chainId]

  return (
    <Wrapper>
      <NewModal modalMode title="Hook Store" onDismiss={onDismiss} maxWidth={MODAL_MAX_WIDTH}>
        <HookDappsList>
          {dapps.map((dapp) => (
            <HookDappItem dapp={dapp} />
          ))}
        </HookDappsList>
      </NewModal>
    </Wrapper>
  )
}

export function HookDappItem({ dapp }: { dapp: HookDapp }) {
  const { name, description } = dapp

  const { url, component } = isHookDappIframe(dapp)
    ? { url: dapp.url, component: undefined }
    : { url: dapp.path, component: dapp.component }

  return (
    <HookDappListItem>
      <div>
        <Link href={url}>
          <img src="https://swap.cow.fi/images/og-meta-cowswap.png?v=2" alt="CoW Swap Logo" />
        </Link>
      </div>
      <HookDappDetails>
        <h3>{name}</h3>
        <p>{description}</p>
        {url && (
          <div>
            <Link href={url}>+ Add hook</Link>
          </div>
        )}
        {component}

        <Version>v1.0.0</Version>
      </HookDappDetails>
    </HookDappListItem>
  )
}
