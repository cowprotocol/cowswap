import { useState } from 'react'

import TenderlyLogo from '@cowprotocol/assets/cow-swap/tenderly-logo.svg'
import { CowHookDetails } from '@cowprotocol/types'
import { InfoTooltip, TokenAmount } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'

import * as styledEl from './styled'

import { TenderlySimulate } from '../../containers/TenderlySimulate'

interface HookItemProp {
  account: string | undefined
  hookDetails: CowHookDetails
  isPreHook: boolean
  removeHook: (uuid: string, isPreHook: boolean) => void
}

export function HookItem({ account, hookDetails, isPreHook, removeHook }: HookItemProp) {
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

      {account && (
        <styledEl.SimulateContainer>
          <div>
            <styledEl.SimulateHeader>
              <strong>Run a simulation</strong>
              <InfoTooltip content="This transaction can be simulated before execution to ensure that it will be succeed, generating a detailed report of the transaction execution." />
            </styledEl.SimulateHeader>
            <styledEl.SimulateFooter>
              <span>Powered by</span>
              <SVG src={TenderlyLogo} description="Tenderly" />
            </styledEl.SimulateFooter>
          </div>
          <div>
            <TenderlySimulate hook={hook} />
          </div>
        </styledEl.SimulateContainer>
      )}

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
