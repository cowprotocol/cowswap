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
  hasError: boolean
  onRetry: () => void
}

export function WaitAndSaveRow({
  isEnabled,
  toggle,
  joinsBatchInRef,
  hasError,
  onRetry,
}: WaitAndSaveRowProps): ReactNode {
  const { t } = useLingui()
  const [starSpinKey, setStarSpinKey] = useState(0)

  const handleToggle = (): void => {
    if (!isEnabled) {
      setStarSpinKey((key) => key + 1)
    }
    toggle()
  }

  return (
    <styledEl.Wrapper $hasError={hasError}>
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
            {hasError ? (
              <styledEl.ScheduleError>
                <Trans>
                  Couldn’t load the next batch{' '}
                  <styledEl.NoBreakAroundDot>
                    time ·{' '}
                    <styledEl.RetryButton type="button" onClick={onRetry}>
                      Try again
                    </styledEl.RetryButton>
                  </styledEl.NoBreakAroundDot>
                </Trans>
              </styledEl.ScheduleError>
            ) : (
              <styledEl.SaveAmount>
                <Trans>
                  Save at least{' '}
                  <styledEl.NoBreakAroundDot>
                    $2.50
                    <styledEl.NextBatch>
                      {' · '}Joins batch in <span ref={joinsBatchInRef} />
                    </styledEl.NextBatch>
                  </styledEl.NoBreakAroundDot>
                </Trans>
              </styledEl.SaveAmount>
            )}
          </styledEl.DescriptionRow>
        </styledEl.TextColumn>
      </styledEl.Content>

      {hasError ? null : (
        <styledEl.WaitAndSaveToggle
          id="wait-and-save-toggle"
          checked={isEnabled}
          toggle={handleToggle}
          variant="success"
          aria-label={t`Wait & save`}
        />
      )}
    </styledEl.Wrapper>
  )
}
