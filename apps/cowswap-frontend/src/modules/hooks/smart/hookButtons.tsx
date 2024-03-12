import { useAtomValue } from 'jotai'
import { useState } from 'react'

import { ButtonSecondaryAlt } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { Link } from 'legacy/components/Link'
import QuestionHelper from 'legacy/components/QuestionHelper'

import { HookStoreModal } from './HookStoreModal'

import { hooksAtom } from '../state/hooksAtom'
import { PermitHookData } from '../types'

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

const HookList = styled.ul``
const HookItemWrapper = styled.li``

export function PreHookButton() {
  const [open, setOpen] = useState(false)
  const hooks = useAtomValue(hooksAtom)
  return (
    <>
      <HookList>
        {hooks.preHooks.map((hook) => (
          <HookItem key={hook.callData} hook={hook} />
        ))}
      </HookList>
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
  const [open, setOpen] = useState(false)
  const hooks = useAtomValue(hooksAtom)
  return (
    <>
      <Wrapper>
        <ButtonGroup>
          <ButtonSecondaryAlt onClick={() => setOpen(true)}>🪝 Add Post-hook</ButtonSecondaryAlt>{' '}
          <HookTooltip isPreHook={false} />
        </ButtonGroup>
      </Wrapper>
      {open && <HookStoreModal onDismiss={() => setOpen(false)} isPreHook={false} />}
      {hooks.postHooks.map((hook) => (
        <HookItem key={hook.callData} hook={hook} />
      ))}
    </>
  )
}

function HookTooltip({ isPreHook }: { isPreHook: boolean }) {
  return (
    <QuestionHelper
      text={`${isPreHook ? 'Pre' : 'Post'}-hook allow you to automatically execute any action action ${
        isPreHook ? 'AFTER' : 'BEFORE'
      } your trade is executed`}
    />
  )
}

interface HookItemProp {
  hook: PermitHookData
}

function HookItem({ hook }: HookItemProp) {
  const { callData, gasLimit, target } = hook
  return (
    <HookItemWrapper>
      <div>target: {target}</div>
      <div>gasLimit: {gasLimit}</div>
      <div>callData: {callData} </div>
    </HookItemWrapper>
  )
}
