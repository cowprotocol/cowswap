import { useState } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CowHookDetails } from '@cowprotocol/types'
import { TokenAmount } from '@cowprotocol/ui'

import * as styledEl from './styled'

import { HOOKS_TRAMPOLINE_ADDRESS } from '../../const'

interface HookItemProp {
  chainId: SupportedChainId
  hookDetails: CowHookDetails
  isPreHook: boolean
  removeHook: (uuid: string, isPreHook: boolean) => void
}

export function HookItem({ chainId, hookDetails, isPreHook, removeHook }: HookItemProp) {
  const { uuid, hook, dapp, outputTokens } = hookDetails
  const { callData, gasLimit, target } = hook

  const [showDetails, setShowDetails] = useState(false)
  return (
    <styledEl.HookItemWrapper>
      <styledEl.HookItemInfo>
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
      </styledEl.HookItemInfo>

      <styledEl.CustomLink
        target="_blank"
        rel="noreferrer"
        href={`https://dashboard.tenderly.co/gp-v2/watch-tower-prod/simulator/new?network=${chainId}&contractAddress=${target}&rawFunctionInput=${callData}&from=${HOOKS_TRAMPOLINE_ADDRESS}`}
      >
        🧪 Simulate on Tenderly
      </styledEl.CustomLink>

      <styledEl.CustomLink
        onClick={(e) => {
          e.preventDefault()
          setShowDetails((details) => !details)
        }}
        href="#"
      >
        👀 See hook details
      </styledEl.CustomLink>

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
      <styledEl.CloseIcon onClick={() => removeHook(hookDetails.uuid, isPreHook)} />
    </styledEl.HookItemWrapper>
  )
}
