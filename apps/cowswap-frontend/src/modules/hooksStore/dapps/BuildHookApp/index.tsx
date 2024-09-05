import { useCallback, useState } from 'react'

import { CowHook, HookDappProps } from '@cowprotocol/types'
import { ButtonPrimary } from '@cowprotocol/ui'

import { ContentWrapper, Row, Wrapper } from './styled'

export function BuildHookApp({ isPreHook, context }: HookDappProps) {
  const [hook, setHook] = useState<CowHook>({
    target: '',
    callData: '',
    gasLimit: '',
  })

  const clickOnAddHook = useCallback(() => {
    const { callData, gasLimit, target } = hook
    if (!callData || !gasLimit || !target) {
      return
    }

    context.addHook({ hook })
  }, [hook, context])

  return (
    <Wrapper>
      <ContentWrapper>
        <Row>
          <label>Target</label>
          <div>
            <input
              name="target"
              value={hook.target}
              onChange={(e) => setHook((hook) => ({ ...hook, target: e.target.value }))}
            />
          </div>
        </Row>
        <Row>
          <label>Gas Limit</label>
          <div>
            <input
              name="gasLimit"
              value={hook.gasLimit}
              onChange={(e) => setHook((hook) => ({ ...hook, gasLimit: e.target.value }))}
            />
          </div>
        </Row>

        <Row>
          <label>Calldata</label>
          <div>
            <textarea
              name="callData"
              value={hook.callData}
              onChange={(e) => setHook((hook) => ({ ...hook, callData: e.target.value }))}
            />
          </div>
        </Row>
      </ContentWrapper>
      <ButtonPrimary onClick={clickOnAddHook}>Add {isPreHook ? 'Pre' : 'Post'}-hook</ButtonPrimary>
    </Wrapper>
  )
}
