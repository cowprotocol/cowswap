import { ReactNode, RefObject, useState } from 'react'

import svgStarShineSrc from '@cowprotocol/assets/cow-swap/star-shine.svg'
import { TooltipIcon } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import * as styledEl from './WaitAndSaveRow.styled'

export interface WaitAndSaveRowProps {
  isEnabled: boolean
  toggle: () => void
  joinsBatchInRef: RefObject<HTMLElement | null>
}

export function WaitAndSaveRow({ isEnabled, toggle, joinsBatchInRef }: WaitAndSaveRowProps): ReactNode {
  const { t } = useLingui()
  const [starSpinKey, setStarSpinKey] = useState(0)

  const handleToggle = (): void => {
    if (!isEnabled) {
      setStarSpinKey((key) => key + 1)
    }
    toggle()
  }

  return (
    <styledEl.Wrapper>
      <styledEl.Content>
        <styledEl.Icon key={starSpinKey} $animate={starSpinKey > 0} aria-hidden>
          <SVG src={svgStarShineSrc} />
        </styledEl.Icon>
        <styledEl.TextColumn>
          <styledEl.TitleRow>
            <Trans>Wait & save</Trans>
            <TooltipIcon
              type="info"
              title={t`Wait & save`}
              content={
                <Trans>
                  Join the next batch to save on volume fees and potentially get a better price. Prices may change, and
                  the countdown isn’t a guaranteed fill time. Price-improvement fees still apply.
                </Trans>
              }
            />
          </styledEl.TitleRow>
          <styledEl.DescriptionRow>
            <styledEl.SaveAmount>
              <Trans>Save $2.50</Trans>
            </styledEl.SaveAmount>
            <styledEl.NextBatch>
              <Trans>
                · Joins batch in <span ref={joinsBatchInRef} />
              </Trans>
            </styledEl.NextBatch>
          </styledEl.DescriptionRow>
        </styledEl.TextColumn>
      </styledEl.Content>
      <styledEl.WaitAndSaveToggle
        id="wait-and-save-toggle"
        checked={isEnabled}
        toggle={handleToggle}
        variant="success"
        aria-label={t`Wait & save`}
      />
    </styledEl.Wrapper>
  )
}
