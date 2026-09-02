import { ReactNode } from 'react'

import { UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { LandedStatus } from '../../hooks/useProposalLanded'
import { AssistantProposal } from '../../types'

const Card = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(${UI.COLOR_PRIMARY});
  border-radius: 14px;
  background: var(${UI.COLOR_PRIMARY_OPACITY_10});
`

const Summary = styled.div`
  font-size: 14px;
  font-weight: 600;
  line-height: 1.45;
`

const Legs = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 12px 13px;
  border-radius: 10px;
  background: var(${UI.COLOR_PAPER_DARKER});
`

const Leg = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 3px;
  min-width: 0;
`

const Label = styled.span`
  font-size: 10.5px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(${UI.COLOR_TEXT_OPACITY_60});
`

const Value = styled.span`
  font-size: 15px;
  font-weight: 600;
  word-break: break-word;
`

const Detail = styled.span`
  font-size: 13.5px;
`

const Note = styled.span`
  font-size: 11px;
  color: var(${UI.COLOR_TEXT_OPACITY_60});
`

const Confirm = styled.button`
  height: 42px;
  border: 0;
  border-radius: 14px;
  background: var(${UI.COLOR_PRIMARY});
  color: var(${UI.COLOR_BUTTON_TEXT});
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: default;
  }
`

const FinePrint = styled.div`
  font-size: 11px;
  line-height: 1.45;
  text-align: center;
  color: var(${UI.COLOR_TEXT_OPACITY_50});
`

interface ProposalCardProps {
  landed: LandedStatus
  chainName: string
  display: { buySymbol: string; sellSymbol: string } | null
  onConfirm(): void
  /** Applying is in flight — usually waiting on a wallet network switch. */
  pending: boolean
  proposal: AssistantProposal
}

export function ProposalCard({
  chainName,
  display,
  landed,
  onConfirm,
  pending,
  proposal,
}: ProposalCardProps): ReactNode {
  // Symbols come from the server, derived from the ADDRESSES in the proposal rather
  // than from anything the model called them — so the card can't read "USDC" over a
  // different contract.
  const sellSymbol = display?.sellSymbol ?? shortId(proposal.sellToken)
  const buySymbol = display?.buySymbol ?? shortId(proposal.buyToken)
  const isLimit = proposal.orderType === 'limit'

  return (
    <Card>
      <Summary>{proposal.summary}</Summary>

      <Legs>
        <Leg>
          <Label>
            <Trans>Sell</Trans>
          </Label>
          <Value>{proposal.sellAmount ? `${proposal.sellAmount} ${sellSymbol}` : sellSymbol}</Value>
          {!proposal.sellAmount && (
            <Note>
              <Trans>amount set by the quote</Trans>
            </Note>
          )}
        </Leg>

        <Leg>
          <Label>
            <Trans>Receive</Trans>
          </Label>
          <Value>{proposal.buyAmount ? `${proposal.buyAmount} ${buySymbol}` : buySymbol}</Value>
          {!proposal.buyAmount && (
            <Note>{isLimit ? <Trans>at your limit price</Trans> : <Trans>quoted in the form</Trans>}</Note>
          )}
        </Leg>

        <Leg>
          <Label>
            <Trans>Type</Trans>
          </Label>
          <Detail>{isLimit ? <Trans>Limit order</Trans> : <Trans>Market order</Trans>}</Detail>
        </Leg>

        <Leg>
          <Label>
            <Trans>Network</Trans>
          </Label>
          <Detail>{chainName}</Detail>
        </Leg>
      </Legs>

      <Confirm onClick={onConfirm} disabled={pending || landed !== 'pending'}>
        {/* Reports what the form shows. 'partial' is the honest answer to the case
            where the tokens loaded and the amounts didn't — saying it loaded there
            sends someone to sign a trade they haven't read. */}
        {landed === 'landed' && <Trans>Loaded into the form</Trans>}
        {landed === 'partial' && <Trans>Partly loaded — check the form</Trans>}
        {/* A cross-chain proposal waits on a wallet prompt, and a Confirm that looks
            inert while that happens reads as a broken button. */}
        {landed === 'pending' && (pending ? <Trans>Switching network…</Trans> : <Trans>Confirm</Trans>)}
      </Confirm>

      <FinePrint>
        <Trans>Loads the trade into the form. Nothing is signed until you confirm it there.</Trans>
      </FinePrint>
    </Card>
  )
}

/** Last-resort label when the server couldn't name a token. Honest, not reassuring. */
function shortId(id: string): string {
  if (!id.startsWith('0x')) return id
  return `${id.slice(0, 6)}…${id.slice(-4)}`
}
