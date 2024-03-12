import { CowEvents } from '@cowprotocol/events'
import { ButtonPrimary, UI } from '@cowprotocol/ui'

import { EVENT_EMITTER } from 'eventEmitter'
import styled from 'styled-components/macro'

import { HookDappInternal, HookDappType } from 'modules/hooks/types'

import gnoLogo from './gnosis-logo.svg'

const TITLE = 'Claim GNO from validators'
const DESCRIPTION = 'Allows you to withdraw the rewards from your Gnosis validators.'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;

  flex-grow: 1;
`

const Header = styled.div`
  display: flex;
  padding: 1.5em;

  p {
    padding: 0 1em;
  }
`

const Label = styled.span`
  color: var(${UI.COLOR_TEXT2});
`

const Content = styled.div`
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  flex-flow: column wrap;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 1em;
  text-align: center;
`

const Amount = styled.div`
  font-weight: 600;
  margin-top: 0.3em;
`

export const PRE_CLAIM_GNO: HookDappInternal = {
  name: TITLE,
  description: DESCRIPTION,
  type: HookDappType.INTERNAL,
  path: '/hooks-dapps/pre/claim-gno',
  component: <ClaimGnoHookApp />,
  image: gnoLogo,
  version: 'v0.1.1',
}

export function ClaimGnoHookApp() {
  return (
    <Wrapper>
      <Header>
        <img src={gnoLogo} alt={TITLE} width="60" />
        <p>{DESCRIPTION}</p>
      </Header>

      <Content>
        <div>
          <Label>Total claimable rewards</Label>:
        </div>
        <Amount>52.30216 GNO</Amount>
      </Content>
      <ButtonPrimary
        onClick={() =>
          EVENT_EMITTER.emit(CowEvents.ON_ADDED_HOOK, {
            hook: {
              callData: '0x00000000000',
              gasLimit: '1234567',
              target: '0x00000000001',
            },
            isPreHook: true,
          })
        }
      >
        +Add Pre-hook
      </ButtonPrimary>
    </Wrapper>
  )
}
