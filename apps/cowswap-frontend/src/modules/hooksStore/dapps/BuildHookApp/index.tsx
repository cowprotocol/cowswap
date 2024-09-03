import { useCallback, useContext, useState } from 'react'

import { CowHook, HookDapp } from '@cowprotocol/types'
import { ButtonPrimary } from '@cowprotocol/ui'

import { HookDappContext } from '../../context'
import buildImg from './build.png'
import { ContentWrapper, Header, Link, Row, Wrapper } from './styled'

export interface BuildHookAppProps {
  isPreHook: boolean
  dapp: HookDapp
}

export function BuildHookApp({ isPreHook, dapp }: BuildHookAppProps) {
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
        dapp,
        outputTokens: undefined, // TODO: Simulate and extract the output tokens
      },
      isPreHook,
    )
  }, [hook, hookDappContext])

  if (!hookDappContext) {
    return 'Loading...'
  }

  return (
    <Wrapper>
      <Header>
        <img src={buildImg} alt={dapp.name} width="60" />
        <p>{dapp.description}</p>
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
      <ButtonPrimary onClick={clickOnAddHook}>+Add {isPreHook ? 'Pre' : 'Post'}-hook</ButtonPrimary>
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
