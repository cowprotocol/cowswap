import { useCallback, useMemo, useState } from 'react'

import { isAddress } from '@cowprotocol/common-utils'
import { isSupportedPermitInfo } from '@cowprotocol/permit-utils'
import { useTokenBySymbolOrAddress } from '@cowprotocol/tokens'
import { ButtonPrimary } from '@cowprotocol/ui'

import { recoverSpenderFromCalldata, useGeneratePermitHook, usePermitInfo } from 'modules/permit'
import { TradeType } from 'modules/trade'

import { useIsPermitEnabled } from 'common/hooks/featureFlags/useIsPermitEnabled'

import { ContentWrapper, Row, Wrapper } from './styled'

import { HookDappProps } from '../../types/hooks'

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function PermitHookApp({ context }: HookDappProps) {
  const hookToEdit = context.hookToEdit
  const isPreHook = context.isPreHook
  const [tokenAddress, setTokenAddress] = useState<string>(hookToEdit?.hook.target || '')
  const isPermitEnabled = useIsPermitEnabled()
  const [spenderAddress, setSpenderAddress] = useState<string>(
    recoverSpenderFromCalldata(hookToEdit?.hook.callData) || '',
  )
  const generatePermitHook = useGeneratePermitHook()
  const token = useTokenBySymbolOrAddress(tokenAddress)
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
      context.editHook({ hook, uuid: hookToEdit.uuid })
      return
    }

    context.addHook({ hook })
  }, [generatePermitHook, context, permitInfo, token, spenderAddress, hookToEdit])

  const buttonProps = useMemo(() => {
    if (!context.account) return { message: 'Connect wallet', disabled: true }
    if (!isPermitEnabled) return { message: 'Unsupported Wallet', disabled: true }
    const confirmMessage = hookToEdit ? 'Save changes' : `Add ${isPreHook ? 'Pre' : 'Post'}-hook`
    if (!spenderAddress || !tokenAddress) return { message: confirmMessage, disabled: true }
    if (!token || !isAddress(spenderAddress)) return { message: 'Invalid parameters', disabled: true }
    if (!isSupportedPermitInfo(permitInfo)) return { message: 'Token not permittable', disabled: true }
    return { message: confirmMessage, disabled: false }
  }, [hookToEdit, token, permitInfo, context.account, tokenAddress, spenderAddress, isPermitEnabled, isPreHook])

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
