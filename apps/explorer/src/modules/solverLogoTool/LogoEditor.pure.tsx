import { ReactElement, useEffect, useRef, useState } from 'react'

import { AiHelp } from './AiHelp.pure'
import { getCanvasContext } from './canvas.utils'
import { imageRect, MAX_SCALE, MIN_SCALE, POSITION_LIMIT } from './geometry.utils'
import { PercentInput } from './PercentInput.pure'
import { SAMPLES } from './solverLogoTool.constants'
import {
  BackgroundControl,
  Controls,
  DropZone,
  EditorActions,
  Note,
  Panel,
  PanelHeading,
  Samples,
  SourceBar,
  Stage,
  Swatch,
  TextButton,
  ToolButton,
} from './solverLogoTool.styled'
import { SampleKey } from './solverLogoTool.types'
import { SolverLogoController } from './useSolverLogoTool'

export function LogoEditor({ tool }: { tool: SolverLogoController }): ReactElement {
  const fileInput = useRef<HTMLInputElement>(null)
  return (
    <Panel aria-labelledby="solver-logo-editor-title" aria-busy={tool.loading}>
      <PanelHeading>
        <h2 id="solver-logo-editor-title">Prepare your logo</h2>
        <ToolButton variant="secondary" onClick={(): void => fileInput.current?.click()}>
          Upload logo
        </ToolButton>
      </PanelHeading>
      <input
        ref={fileInput}
        type="file"
        hidden
        accept=".png,.svg,image/png,image/svg+xml"
        onChange={(event): void => {
          const file = event.target.files?.[0]
          if (file) void tool.loadFile(file)
          event.target.value = ''
        }}
      />
      <SourceBar>
        <span>{tool.loading ? 'Loading…' : tool.sampleKey ? 'Example' : 'Uploaded'}</span>
        <span title={tool.asset?.name}>{tool.asset?.name || 'Loading example…'}</span>
        <TextButton onClick={(): void => fileInput.current?.click()}>Replace</TextButton>
      </SourceBar>
      <AiHelp key={tool.asset?.url} tool={tool} />
      <PositionEditor tool={tool} />
      <TransformControls tool={tool} />
      <SourceQuality tool={tool} />
      <Samples>
        <span>Try a supplied example</span>
        <div>
          {(Object.keys(SAMPLES) as SampleKey[]).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={key === tool.sampleKey}
              onClick={(): void => {
                void tool.loadSample(key)
              }}
            >
              <img src={SAMPLES[key].url} alt="" width={22} height={22} />
              {SAMPLES[key].name}
            </button>
          ))}
        </div>
      </Samples>
    </Panel>
  )
}

function PositionEditor({ tool }: { tool: SolverLogoController }): ReactElement {
  const target = useRef<HTMLCanvasElement>(null)
  const pointer = useRef<{ id: number; x: number; y: number; startX: number; startY: number } | null>(null)
  const [guides, setGuides] = useState(true)
  const [dragging, setDragging] = useState(false)
  const clearPointer = (): void => {
    pointer.current = null
  }
  useEffect(() => {
    if (target.current && tool.artwork) {
      const ctx = getCanvasContext(target.current)
      ctx.clearRect(0, 0, 1024, 1024)
      ctx.drawImage(tool.artwork, 0, 0)
    }
  }, [tool.artwork])
  return (
    <>
      <DropZone
        $dragging={dragging}
        aria-label="Logo editing area. Drop a PNG or SVG here."
        onDragOver={(event): void => {
          event.preventDefault()
          event.dataTransfer.dropEffect = 'copy'
          setDragging(true)
        }}
        onDragLeave={(event): void => {
          if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget))
            setDragging(false)
        }}
        onDrop={(event): void => {
          event.preventDefault()
          event.stopPropagation()
          setDragging(false)
          if (event.dataTransfer.files.length > 1) tool.setError('Choose one logo at a time.')
          else if (event.dataTransfer.files[0]) void tool.loadFile(event.dataTransfer.files[0])
        }}
      >
        <Stage
          $guides={guides}
          tabIndex={0}
          role="application"
          aria-label="Position logo. Drag to move or use arrow keys to nudge."
          onPointerDown={(event): void => {
            if (!tool.asset || event.button !== 0) return
            pointer.current = {
              id: event.pointerId,
              x: event.clientX,
              y: event.clientY,
              startX: tool.transform.x,
              startY: tool.transform.y,
            }
            event.currentTarget.setPointerCapture(event.pointerId)
            event.currentTarget.focus({ preventScroll: true })
          }}
          onPointerMove={(event): void => {
            const start = pointer.current
            if (!start || start.id !== event.pointerId) return
            const rect = event.currentTarget.getBoundingClientRect()
            tool.setPosition(
              start.startX + ((event.clientX - start.x) / rect.width) * 100,
              start.startY + ((event.clientY - start.y) / rect.height) * 100,
            )
          }}
          onLostPointerCapture={clearPointer}
          onPointerUp={clearPointer}
          onPointerCancel={clearPointer}
          onKeyDown={(event): void => {
            const delta = event.shiftKey ? 5 : 1
            const steps: Record<string, [number, number]> = {
              ArrowLeft: [-delta, 0],
              ArrowRight: [delta, 0],
              ArrowUp: [0, -delta],
              ArrowDown: [0, delta],
            }
            const step = steps[event.key]
            if (step) {
              event.preventDefault()
              tool.setPosition(tool.transform.x + step[0], tool.transform.y + step[1])
            }
          }}
        >
          <canvas ref={target} width={1024} height={1024} aria-label="Editable logo preview" />
          <div className="safe-guide" aria-hidden="true" />
        </Stage>
        <p>{dragging ? 'Drop your logo here' : 'Drag to position · arrow keys to nudge'}</p>
      </DropZone>
      <EditorActions>
        <label>
          <input type="checkbox" checked={guides} onChange={(event): void => setGuides(event.target.checked)} />
          Show safe area
        </label>
        <div>
          <TextButton onClick={tool.fit}>Fit mark</TextButton>
          <TextButton onClick={(): void => tool.setPosition(0, 0)}>Centre</TextButton>
          <TextButton onClick={tool.reset}>Reset</TextButton>
        </div>
      </EditorActions>
    </>
  )
}

function SourceQuality({ tool }: { tool: SolverLogoController }): ReactElement | null {
  const asset = tool.asset
  if (!asset) return null
  const rect = imageRect(asset, tool.transform)
  const small = asset.type === 'png' && Math.max(rect.width / asset.width, rect.height / asset.height) > 1.25
  return (
    <Note $warning={small}>
      {small
        ? `Small source: ${asset.width} × ${asset.height}px. A 1024px export won’t add detail; use a larger PNG or vector SVG.`
        : (asset.type === 'svg'
            ? 'Vector source. Your SVG export stays vector.'
            : `Source: ${asset.width} × ${asset.height}px.`) + ' Original colours are preserved.'}
    </Note>
  )
}

function TransformControls({ tool }: { tool: SolverLogoController }): ReactElement {
  return (
    <>
      <Controls>
        <div className="size-heading">
          <label htmlFor="solver-logo-scale">Size</label>
          <PercentInput
            label="Size"
            value={tool.transform.scale}
            min={MIN_SCALE}
            max={MAX_SCALE}
            onChange={tool.setScale}
          />
        </div>
        <input
          id="solver-logo-scale"
          type="range"
          min={MIN_SCALE}
          max={MAX_SCALE}
          step={1}
          value={tool.transform.scale}
          onChange={(event): void => tool.setScale(+event.target.value)}
        />
        <div className="position-controls">
          <span>Position</span>
          <PercentInput
            label="X"
            showLabel
            value={tool.transform.x}
            min={-POSITION_LIMIT}
            max={POSITION_LIMIT}
            onChange={(x): void => tool.setPosition(x, tool.transform.y)}
          />
          <PercentInput
            label="Y"
            showLabel
            value={tool.transform.y}
            min={-POSITION_LIMIT}
            max={POSITION_LIMIT}
            onChange={(y): void => tool.setPosition(tool.transform.x, y)}
          />
        </div>
      </Controls>
      <BackgroundControl>
        <legend>Logo background</legend>
        <div>
          {(
            [
              ['transparent', 'Transparent'],
              ['#ffffff', 'White'],
              ['#00234e', 'Navy'],
            ] as const
          ).map(([color, label]) => (
            <Swatch
              key={color}
              type="button"
              $color={color}
              $selected={tool.transform.background === color}
              aria-label={`${label} background`}
              aria-pressed={tool.transform.background === color}
              onClick={(): void => tool.updateTransform({ background: color })}
            />
          ))}
          <label>
            <input
              type="color"
              aria-label="Custom background"
              value={tool.transform.background === 'transparent' ? '#00234e' : tool.transform.background}
              onChange={(event): void => tool.updateTransform({ background: event.target.value })}
            />
            Custom
          </label>
        </div>
      </BackgroundControl>
    </>
  )
}
