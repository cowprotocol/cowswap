import { MouseEvent, ReactNode } from 'react'

import { TokenWarning } from '@cowprotocol/tokens'

import { AlertTriangle, ChevronDown, ChevronUp } from 'react-feather'

import * as styledEl from './TokenRisk.styled'
import { getRiskCountSummary } from './TokenRisk.utils'

export interface TokenRiskQuietLineProps {
  warnings: TokenWarning[]
  isOpen: boolean
  panelId: string
  onToggle(): void
}

/**
 * The reminder the swap form carries once a token's serious risks are confirmed: a count, in the
 * colour of its worst tier, that opens the details in place.
 */
export function TokenRiskQuietLine({ warnings, isOpen, panelId, onToggle }: TokenRiskQuietLineProps): ReactNode {
  const summary = getRiskCountSummary(warnings)

  if (!warnings.length) return null

  // Sorted worst-first upstream, so the first one carries the line's tier.
  const tier = warnings[0].tier
  const Chevron = isOpen ? ChevronUp : ChevronDown

  // The currency card is a <label>, so a click inside it also activates the amount input —
  // the MAX button in the same card guards against this the same way.
  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault()
    event.stopPropagation()
    onToggle()
  }

  return (
    <styledEl.QuietRow>
      <styledEl.QuietLine
        tier={tier}
        type="button"
        onClick={handleClick}
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <AlertTriangle size={14} />
        <span>{summary}</span>
        <Chevron size={12} />
      </styledEl.QuietLine>
    </styledEl.QuietRow>
  )
}
