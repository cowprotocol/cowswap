import { useState } from 'react'

import { ButtonSecondaryAlt } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { Link } from 'legacy/components/Link'
import QuestionHelper from 'legacy/components/QuestionHelper'

import { HookStoreModal } from './HookStoreModal'

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

export function PreHookButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Wrapper>
        <ButtonGroup>
          <ButtonSecondaryAlt onClick={() => setOpen(true)}>🪝 Add Pre-hook</ButtonSecondaryAlt>{' '}
          <HookTooltip isPrehook />
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
      {open && <HookStoreModal onDismiss={() => setOpen(false)} />}
    </>
  )
}

export function PostHookButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Wrapper>
        <ButtonGroup>
          <ButtonSecondaryAlt onClick={() => setOpen(true)}>🪝 Add Post-hook</ButtonSecondaryAlt>{' '}
          <HookTooltip isPrehook={false} />
        </ButtonGroup>
      </Wrapper>
      {open && <HookStoreModal onDismiss={() => setOpen(false)} />}
    </>
  )
}

function HookTooltip({ isPrehook }: { isPrehook: boolean }) {
  return (
    <QuestionHelper
      text={`${isPrehook ? 'Pre' : 'Post'}-hook allow you to automatically execute any action action ${
        isPrehook ? 'AFTER' : 'BEFORE'
      } your trade is executed`}
    />
  )
}
