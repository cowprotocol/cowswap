import { useAtomValue } from 'jotai'
import { useState } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CowHookDetails } from '@cowprotocol/types'
import { ButtonSecondaryAlt, HelpTooltip, TokenAmount, UI } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

import { Link } from 'legacy/components/Link'

import { CloseIcon as CloseIconOriginal } from 'common/pure/CloseIcon'

import { HookStoreModal } from './HookStoreModal'

import { HOOKS_TRAMPOLINE_ADDRESS } from '../const'
import { useRemoveHook } from '../hooks'
import { hooksAtom } from '../state/hookDetailsAtom'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0 0.5rem 0;
`

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.8rem;
`

const CustomLink = styled.a`
  margin: 0.5em 0;
  padding: 0 10em;
  text-decoration: none;

  :hover {
    text-decoration: underline;
  }
`

const HookList = styled.ul`
  padding-right: 10px;
  max-width: 100%;
  display: flex;

  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: 0.8rem;
`
const HookItemWrapper = styled.li`
  position: relative;
  display: flex;
  flex-direction: column;

  dl {
    background-color: var(${UI.COLOR_BACKGROUND});
    padding: 20px;
  }

  dd {
    color: var(${UI.COLOR_TEXT2});
    word-break: break-all;
  }

  img {
    width: 35px;
    height: 35px;
  }
`

const CloseIcon = styled(CloseIconOriginal)`
  position: absolute;
  top: 0;
  right: 0;
`

const HookItemInfo = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0.5em;

  dl {
    margin: 0;
    padding: 0 1em;
    background-color: inherit;
  }

  dt {
    width: 6em;
  }

  dd {
    display: flex;
    align-items: center;
    padding: 0;

    img {
      width: 20px;
      vertical-align: middle;
      margin-right: 10px;
    }
  }

  dt,
  dd {
    float: left;
    margin: 5px;
  }

  dt {
    font-weight: bold;
    clear: left;
    margin-right: 5px;
  }
`

export function PreHookButton() {
  const { chainId } = useWalletInfo()
  const [open, setOpen] = useState(false)
  const hooks = useAtomValue(hooksAtom)
  const removeHook = useRemoveHook()
  return (
    <>
      {hooks.preHooks.length > 0 && (
        <HookList>
          {hooks.preHooks.map((hookDetails, index) => (
            <HookItem key={index} chainId={chainId} hookDetails={hookDetails} removeHook={removeHook} isPreHook />
          ))}
        </HookList>
      )}

      <Wrapper>
        <ButtonGroup>
          <ButtonSecondaryAlt onClick={() => setOpen(true)}>🪝 Add Pre-hook</ButtonSecondaryAlt>{' '}
          <HookTooltip isPreHook />
        </ButtonGroup>
        <List>
          <li>
            📚 <Link href="https://docs.cow.fi/cow-protocol/reference/sdks/cow-sdk">Learn more about hooks</Link>
          </li>
          <li>
            🪝 <Link href="https://docs.cow.fi/cow-protocol/reference/sdks/cow-sdk">Create your own hook</Link>
          </li>
        </List>
      </Wrapper>
      {open && <HookStoreModal onDismiss={() => setOpen(false)} isPreHook />}
    </>
  )
}

export function PostHookButton() {
  const { chainId } = useWalletInfo()
  const [open, setOpen] = useState(false)
  const hooks = useAtomValue(hooksAtom)
  const removeHook = useRemoveHook()

  return (
    <>
      {hooks.postHooks && (
        <HookList>
          {hooks.postHooks.map((hook, index) => (
            <HookItem key={index} chainId={chainId} hookDetails={hook} removeHook={removeHook} isPreHook={false} />
          ))}
        </HookList>
      )}
      <Wrapper>
        <ButtonGroup>
          <ButtonSecondaryAlt onClick={() => setOpen(true)}>🪝 Add Post-hook</ButtonSecondaryAlt>{' '}
          <HookTooltip isPreHook={false} />
        </ButtonGroup>
      </Wrapper>
      {open && <HookStoreModal onDismiss={() => setOpen(false)} isPreHook={false} />}
    </>
  )
}

function HookTooltip({ isPreHook }: { isPreHook: boolean }) {
  return (
    <HelpTooltip
      text={`${isPreHook ? 'Pre' : 'Post'}-hook allow you to automatically execute any action action ${
        isPreHook ? 'AFTER' : 'BEFORE'
      } your trade is executed`}
    />
  )
}

interface HookItemProp {
  chainId: SupportedChainId
  hookDetails: CowHookDetails
  isPreHook: boolean
  removeHook: (uuid: string, isPreHook: boolean) => void
}

function HookItem({ chainId, hookDetails, isPreHook, removeHook }: HookItemProp) {
  const { uuid, hook, dapp, outputTokens } = hookDetails
  const { callData, gasLimit, target } = hook

  const [showDetails, setShowDetails] = useState(false)
  return (
    <HookItemWrapper>
      <HookItemInfo>
        <img src={dapp.image} alt={dapp.name} />
        <dl>
          <dt>Action</dt>
          <dd>{dapp.name}</dd>

          <dt>Token</dt>
          <dd>
            <img src={dapp.image} alt={dapp.name} /> <span>GNO</span>
          </dd>

          {outputTokens && (
            <>
              <dt>Amount</dt>
              <dd>
                {outputTokens.map((token) => (
                  <TokenAmount amount={token} tokenSymbol={token.currency} />
                ))}
              </dd>
            </>
          )}
        </dl>
      </HookItemInfo>

      <CustomLink
        target="_blank"
        rel="noreferrer"
        href={`https://dashboard.tenderly.co/gp-v2/watch-tower-prod/simulator/new?network=${chainId}&contractAddress=${target}&rawFunctionInput=${callData}&from=${HOOKS_TRAMPOLINE_ADDRESS}`}
      >
        🧪 Simulate on Tenderly
      </CustomLink>

      <CustomLink
        onClick={(e) => {
          e.preventDefault()
          setShowDetails((details) => !details)
        }}
        href="#"
      >
        👀 See hook details
      </CustomLink>

      {showDetails && (
        <dl>
          <dt>UUID</dt>
          <dd>{uuid}</dd>

          <dt>target</dt>
          <dd>{target}</dd>

          <dt>gasLimit</dt>
          <dd>{gasLimit}</dd>

          <dt>callData</dt>
          <dd>{callData}</dd>
        </dl>
      )}
      <CloseIcon onClick={() => removeHook(hookDetails.uuid, isPreHook)} />
    </HookItemWrapper>
  )
}
