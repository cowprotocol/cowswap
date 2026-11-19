import { ReactNode, RefObject, useState } from 'react'

import svgStarShineSrc from '@cowprotocol/assets/cow-swap/star-shine.svg'
import { TooltipIcon } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import * as styledEl from './WaitAndSaveRow.styled'
import { WaitAndSaveTooltipContent } from './WaitAndSaveTooltipContent.pure'

export interface WaitAndSaveRowProps {
  isEnabled: boolean
  toggle: () => void
  joinsBatchInRef: RefObject<HTMLElement | null>
  hasError: boolean
  onRetry: () => void
  saveAmount?: string
}

export function WaitAndSaveRow({
  isEnabled,
  toggle,
  joinsBatchInRef,
  hasError,
  onRetry,
  saveAmount,
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
            {saveAmount && !hasError ? <styledEl.TitleAmount>{saveAmount}</styledEl.TitleAmount> : null}
            <TooltipIcon
              type="info"
              title={t`Wait & save`}
              interactive
              content={<WaitAndSaveTooltipContent saveAmount={saveAmount && !hasError ? saveAmount : undefined} />}
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
              <styledEl.NextBatch>
                {saveAmount ? (
                  <>
                    <styledEl.NoVolumeFee $active={isEnabled}>
                      <Trans>No volume fee</Trans>
                    </styledEl.NoVolumeFee>{' '}
                    <styledEl.NoBreakAroundDot>
                      ·{' '}
                      <Trans>
                        Joins batch in{isEnabled ? ' ' : ' ~'}
                        <span ref={joinsBatchInRef} />
                      </Trans>
                    </styledEl.NoBreakAroundDot>
                  </>
                ) : (
                  <Trans>
                    Joins batch in{isEnabled ? ' ' : ' ~'}
                    <span ref={joinsBatchInRef} />
                  </Trans>
                )}
              </styledEl.NextBatch>
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
