import { ChangeEvent, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { OrderProgressBar } from 'modules/orderProgressBar'

import { PLAYGROUND_SCENARIOS, STATIC_PLAYGROUND_PREVIEWS } from './OrderProgressBarPlayground.constants'
import { getProgressBarProps } from './OrderProgressBarPlayground.demo.constants'
import * as styledEl from './OrderProgressBarPlayground.styled'
import { getScenarioFrameDelayMs } from './OrderProgressBarPlayground.utils'
import { OrderProgressBarPlaygroundDetails } from './OrderProgressBarPlaygroundDetails'

type PlaygroundMode = 'scenario' | 'static'

type PlaygroundControlsProps = {
  isStaticMode: boolean
  mode: PlaygroundMode
  onModeChange: (event: ChangeEvent<HTMLSelectElement>) => void
  onReplay: () => void
  onScenarioChange: (event: ChangeEvent<HTMLSelectElement>) => void
  onStaticPreviewChange: (event: ChangeEvent<HTMLSelectElement>) => void
  scenarioId: string
  staticPreviewId: string
}

function PlaygroundControls({
  isStaticMode,
  mode,
  onModeChange,
  onReplay,
  onScenarioChange,
  onStaticPreviewChange,
  scenarioId,
  staticPreviewId,
}: PlaygroundControlsProps): ReactNode {
  return (
    <styledEl.Controls>
      <styledEl.Field htmlFor="progress-bar-mode">
        Mode
        <styledEl.Select id="progress-bar-mode" aria-label="Mode" value={mode} onChange={onModeChange}>
          <option value="scenario">Scenario playback</option>
          <option value="static">Static step preview</option>
        </styledEl.Select>
      </styledEl.Field>

      <styledEl.Field htmlFor="progress-bar-scenario">
        Scenario
        <styledEl.Select
          id="progress-bar-scenario"
          aria-label="Scenario"
          value={scenarioId}
          onChange={onScenarioChange}
          disabled={isStaticMode}
        >
          {PLAYGROUND_SCENARIOS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </styledEl.Select>
      </styledEl.Field>

      {isStaticMode ? (
        <styledEl.Field htmlFor="progress-bar-static-preview">
          Static step
          <styledEl.Select
            id="progress-bar-static-preview"
            aria-label="Static step"
            value={staticPreviewId}
            onChange={onStaticPreviewChange}
          >
            {STATIC_PLAYGROUND_PREVIEWS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </styledEl.Select>
        </styledEl.Field>
      ) : (
        <styledEl.ReplayButton type="button" onClick={onReplay}>
          Replay scenario
        </styledEl.ReplayButton>
      )}
    </styledEl.Controls>
  )
}

function useScenarioPlayback(
  frameDelays: number[],
  isStaticMode: boolean,
): { frameIndex: number; restartScenario: () => void } {
  const [playbackKey, setPlaybackKey] = useState(0)
  const [frameIndex, setFrameIndex] = useState(0)

  const restartScenario = useCallback((): void => {
    setFrameIndex(0)
    setPlaybackKey((value) => value + 1)
  }, [])

  useEffect(() => {
    if (isStaticMode) {
      return
    }

    setFrameIndex(0)

    let elapsedMs = 0
    const timers = frameDelays.map((delayMs, index) => {
      elapsedMs += delayMs

      return window.setTimeout(() => setFrameIndex(index + 1), elapsedMs)
    })

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [frameDelays, isStaticMode, playbackKey])

  return { frameIndex, restartScenario }
}

export function OrderProgressBarPlaygroundPage(): ReactNode {
  const [mode, setMode] = useState<PlaygroundMode>('scenario')
  const [scenarioId, setScenarioId] = useState(PLAYGROUND_SCENARIOS[0].id)
  const [staticPreviewId, setStaticPreviewId] = useState(STATIC_PLAYGROUND_PREVIEWS[0].id)
  const scenario = useMemo(
    () => PLAYGROUND_SCENARIOS.find((item) => item.id === scenarioId) || PLAYGROUND_SCENARIOS[0],
    [scenarioId],
  )
  const staticPreview = useMemo(
    () => STATIC_PLAYGROUND_PREVIEWS.find((item) => item.id === staticPreviewId) || STATIC_PLAYGROUND_PREVIEWS[0],
    [staticPreviewId],
  )
  const isStaticMode = mode === 'static'
  const frameDelays = useMemo(
    () =>
      scenario.frames.slice(0, -1).map((frame, index) => getScenarioFrameDelayMs(frame, scenario.frames[index + 1])),
    [scenario],
  )
  const { frameIndex, restartScenario } = useScenarioPlayback(frameDelays, isStaticMode)
  const currentFrameIndex = isStaticMode
    ? 0
    : scenario.frames.length > 1
      ? Math.min(frameIndex, scenario.frames.length - 1)
      : 0
  const currentFrame = isStaticMode ? staticPreview.frame : (scenario.frames[currentFrameIndex] ?? scenario.frames[0])
  const displayedFrames = isStaticMode ? [staticPreview.frame] : scenario.frames
  const sequenceLabel = isStaticMode
    ? currentFrame.backendStatus
    : scenario.frames.map((frame) => frame.backendStatus).join(' -> ')
  const detailsTitle = isStaticMode ? 'Static Preview' : 'Simulation'

  const handleScenarioChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>): void => {
      setScenarioId(event.target.value)
      restartScenario()
    },
    [restartScenario],
  )
  const handleModeChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>): void => setMode(event.target.value as PlaygroundMode),
    [],
  )
  const handleStaticPreviewChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>): void => setStaticPreviewId(event.target.value),
    [],
  )

  return (
    <styledEl.Page>
      <styledEl.Header>
        <styledEl.Title>Progress Bar Playground</styledEl.Title>
        <styledEl.Description>
          Select a canned backend sequence to replay the progress bar without placing a real order.
        </styledEl.Description>
      </styledEl.Header>

      <PlaygroundControls
        isStaticMode={isStaticMode}
        mode={mode}
        onModeChange={handleModeChange}
        onReplay={restartScenario}
        onScenarioChange={handleScenarioChange}
        onStaticPreviewChange={handleStaticPreviewChange}
        scenarioId={scenario.id}
        staticPreviewId={staticPreview.id}
      />

      <styledEl.Layout>
        <styledEl.PreviewCard>
          <OrderProgressBar {...getProgressBarProps(currentFrame)} />
        </styledEl.PreviewCard>

        <OrderProgressBarPlaygroundDetails
          currentFrame={currentFrame}
          currentFrameIndex={currentFrameIndex}
          frames={displayedFrames}
          sequenceLabel={sequenceLabel}
          title={detailsTitle}
        />
      </styledEl.Layout>
    </styledEl.Page>
  )
}
