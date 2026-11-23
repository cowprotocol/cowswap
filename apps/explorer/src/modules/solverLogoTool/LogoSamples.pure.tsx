import { ReactElement, useRef, useState } from 'react'

import { SAMPLES } from './solverLogoTool.constants'
import { Samples, TextButton, ToolButton } from './solverLogoTool.styled'
import { SampleKey } from './solverLogoTool.types'

interface Props {
  hasSource: boolean
  sampleKey: SampleKey | null
  loading: boolean
  onSelect(key: SampleKey): Promise<void>
}

export function LogoSamples({ hasSource, sampleKey, loading, onSelect }: Props): ReactElement {
  const [pendingSample, setPendingSample] = useState<SampleKey | null>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const closeConfirmation = (): void => {
    setPendingSample(null)
    trigger.current?.focus()
  }
  return (
    <Samples>
      <span>Try a supplied example</span>
      <div>
        {(Object.keys(SAMPLES) as SampleKey[]).map((key) => (
          <button
            key={key}
            type="button"
            disabled={loading}
            aria-pressed={key === sampleKey}
            onClick={(event): void => {
              if (hasSource) {
                trigger.current = event.currentTarget
                setPendingSample(key)
              } else void onSelect(key)
            }}
          >
            <img src={SAMPLES[key].url} alt="" width={22} height={22} />
            {SAMPLES[key].name}
          </button>
        ))}
      </div>
      {pendingSample && (
        <section aria-label="Replace current logo">
          <p role="alert">
            Use the {SAMPLES[pendingSample].name} example? This replaces your current logo and resets its size,
            position, background and solver name.
          </p>
          <div>
            <ToolButton
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={(): void => {
                closeConfirmation()
                void onSelect(pendingSample)
              }}
            >
              Use {SAMPLES[pendingSample].name} example
            </ToolButton>
            <TextButton type="button" onClick={closeConfirmation}>
              Cancel
            </TextButton>
          </div>
        </section>
      )}
    </Samples>
  )
}
