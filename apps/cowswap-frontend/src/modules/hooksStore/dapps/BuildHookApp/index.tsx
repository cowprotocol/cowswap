import { useCallback, useContext, useState } from 'react'

import { CowHook, HookDappInternal, HookDappType } from '@cowprotocol/types'
import { ButtonPrimary } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { HookDappContext } from '../../context'
import buildImg from '../../images/build.png'

const TITLE = 'Build your own Pre-hook'
const DESCRIPTION = 'Add an arbitrary calldata to be executed before your hook'

export const PRE_BUILD: HookDappInternal = {
  name: TITLE,
  description: DESCRIPTION,
  type: HookDappType.INTERNAL,
  path: '/hooks-dapps/pre/build',
  image: buildImg,
  component: <ClaimGnoHookApp />,
  version: 'v0.1.0',
}

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;

  flex-grow: 1;
`

const Link = styled.button`
  border: none;
  padding: 0;
  text-decoration: underline;
  display: text;
  cursor: pointer;
  background: none;
  color: white;
  margin: 10px 0;
`

const Header = styled.div`
  display: flex;
  padding: 1.5em;

  p {
    padding: 0 1em;
  }
`

const ContentWrapper = styled.div`
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

const Row = styled.div`
  display: flex;
  flex-flow: row wrap;
  margin: 10px;
  width: 100%;

  label {
    margin: 10px;
    flex-grow: 0;
    width: 5em;
  }

  input,
  textarea {
    flex-grow: 1;
  }
`

export function ClaimGnoHookApp() {
  const hookDappContext = useContext(HookDappContext)
  const [hook, setHook] = useState<CowHook>({
    target: '',
    callData: '',
    gasLimit: '',
  })

  const clickOnAddHook = useCallback(() => {
    const { callData, gasLimit, target } = hook
    if (!hookDappContext || !callData || !gasLimit || !target) {
      return
    }

    hookDappContext.addHook(
      {
        hook: hook,
        dapp: PRE_BUILD,
        outputTokens: undefined, // TODO: Simulate and extract the output tokens
      },
      true
    )
  }, [hook, hookDappContext])

  if (!hookDappContext) {
    return 'Loading...'
  }

  return (
    <Wrapper>
      <Header>
        <img src={buildImg} alt={TITLE} width="60" />
        <p>{DESCRIPTION}</p>
      </Header>
      <ContentWrapper>
        <Row>
          <label>Target</label>
          <input
            name="target"
            value={hook.target}
            onChange={(e) => setHook((hook) => ({ ...hook, target: e.target.value }))}
          />
        </Row>
        <Row>
          <label>Gas Limit</label>
          <input
            name="gasLimit"
            value={hook.gasLimit}
            onChange={(e) => setHook((hook) => ({ ...hook, gasLimit: e.target.value }))}
          />
        </Row>

        <Row>
          <label>Calldata</label>
          <textarea
            name="callData"
            value={hook.callData}
            onChange={(e) => setHook((hook) => ({ ...hook, callData: e.target.value }))}
          />
        </Row>
      </ContentWrapper>
      <ButtonPrimary onClick={clickOnAddHook}>+Add Pre-hook</ButtonPrimary>
      <Link
        onClick={(e) => {
          e.preventDefault()
          hookDappContext.close()
        }}
      >
        Close
      </Link>
    </Wrapper>
  )
}
