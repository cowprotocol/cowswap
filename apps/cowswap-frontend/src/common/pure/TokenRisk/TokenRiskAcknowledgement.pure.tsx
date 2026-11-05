import { ReactNode } from 'react'

import * as styledEl from './TokenRisk.styled'
import { useAcknowledgementSentence } from './useTokenRiskCopy'

export interface TokenRiskAcknowledgementProps {
  seriousCodes: string[]
  symbol: string
  isChecked: boolean
  onChange(isChecked: boolean): void
}

/**
 * The one checkbox that names every serious risk before import. The whole row is the label, so a
 * tap anywhere on it toggles the box.
 */
export function TokenRiskAcknowledgement(props: TokenRiskAcknowledgementProps): ReactNode {
  const { seriousCodes, symbol, isChecked, onChange } = props

  const getSentence = useAcknowledgementSentence(symbol)

  if (!seriousCodes.length) return null

  return (
    <styledEl.Acknowledgement>
      <input type="checkbox" checked={isChecked} onChange={(event) => onChange(event.target.checked)} />
      <span>{getSentence(seriousCodes)}</span>
    </styledEl.Acknowledgement>
  )
}
