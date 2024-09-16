import { useCallback, useMemo, useState } from 'react'

import { ButtonPrimary } from '@cowprotocol/ui'

import { useGeneratePermitHook, usePermitInfo, useTokenSupportsPermit } from 'modules/permit'

import { ContentWrapper, Row, Wrapper } from './styled'

import { HookDappProps } from '../../types/hooks'
import { TradeType } from 'modules/trade'
import { Token } from '@uniswap/sdk-core'
import { isAddress } from '@cowprotocol/common-utils'

export function PermitHookApp({ isPreHook, context }: HookDappProps) {
  const hookToEdit = context.hookToEdit
  const [tokenAddress, setTokenAddress] = useState<string>()
  const [spenderAddress, setSpenderAddress] = useState<string>()
  const generatePermitHook = useGeneratePermitHook()
  const token = useMemo(() => {
    try {
      return new Token(context.chainId, tokenAddress || '', 18)
    } catch (e) {
      return null
    }
  }, [tokenAddress])
  const tokenSupportsPermit = useTokenSupportsPermit(token, TradeType.SWAP)
  const permitInfo = usePermitInfo(token, TradeType.SWAP, spenderAddress)

  const onButtonClick = useCallback(async () => {
    if (!permitInfo) return
    const hook = await generatePermitHook({
      inputToken: { address: token?.address || '', name: token?.name || '' },
      account: context.account,
      permitInfo,
      customSpender: spenderAddress,
    })
    if (!hook) return

    if (hookToEdit) {
      context.editHook(hookToEdit.uuid, hook, isPreHook)
      return
    }

    context.addHook({ hook })
  }, [generatePermitHook, context, permitInfo, token, spenderAddress])

  const buttonProps = useMemo(() => {
    const confirmMessage = hookToEdit ? 'Save changes' : `Add ${isPreHook ? 'Pre' : 'Post'}-hook`
    if (!spenderAddress || !tokenAddress) return { message: confirmMessage, disabled: true }
    if (!context.account) return { message: 'Connect wallet', disabled: true }
    if (!token || !isAddress(spenderAddress)) return { message: 'Invalid parameters', disabled: true }
    if (!tokenSupportsPermit) return { message: 'Token not permittable', disabled: true }
    return { message: confirmMessage, disabled: false }
  }, [hookToEdit, token, permitInfo, context.account, tokenAddress, spenderAddress])

  return (
    <Wrapper>
      <ContentWrapper>
        <Row>
          <label>Token</label>
          <div>
            <input name="token" value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value.trim())} />
          </div>
        </Row>
        <Row>
          <label>Spender</label>
          <div>
            <input name="spender" value={spenderAddress} onChange={(e) => setSpenderAddress(e.target.value.trim())} />
          </div>
        </Row>
      </ContentWrapper>

      <ButtonPrimary onClick={onButtonClick} disabled={buttonProps.disabled}>
        {buttonProps.message}
      </ButtonPrimary>
    </Wrapper>
  )
}
