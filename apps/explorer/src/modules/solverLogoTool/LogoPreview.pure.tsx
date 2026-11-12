import { Fragment, ReactElement, useEffect, useRef, useState } from 'react'

import { clippedFraction } from './geometry.utils'
import { drawContext } from './previews.utils'
import { Note, Panel, PanelHeading, PreviewMatrix, Segmented } from './solverLogoTool.styled'
import { LogoContext, PreviewTheme } from './solverLogoTool.types'
import { SolverLogoController } from './useSolverLogoTool'

export function LogoPreview({ tool }: { tool: SolverLogoController }): ReactElement {
  const [actual, setActual] = useState(false)
  const cropped = tool.asset ? clippedFraction(tool.asset, tool.transform) > 0.01 : false
  return (
    <Panel aria-labelledby="solver-logo-preview-title">
      <PanelHeading>
        <h2 id="solver-logo-preview-title">See it on CoW Swap</h2>
        <Segmented aria-label="Preview scale">
          <button type="button" aria-pressed={actual} onClick={(): void => setActual(true)}>
            Actual size
          </button>
          <button type="button" aria-pressed={!actual} onClick={(): void => setActual(false)}>
            2×
          </button>
        </Segmented>
      </PanelHeading>
      <Note>The same logo, in every context.</Note>
      <PreviewMatrix $actual={actual}>
        <div />
        {(['Row', 'Winner', 'Stack'] as const).map((title) => (
          <div key={title} className="context-title">
            {title}
            <span>{title === 'Stack' ? '18' : '24'}px</span>
          </div>
        ))}
        {(['light', 'dark'] as const).map((theme) => (
          <Fragment key={theme}>
            <div className="theme-label">{theme === 'light' ? 'Light' : 'Dark'}</div>
            {(['row', 'winner', 'stack'] as const).map((kind) => (
              <div className="preview-cell" key={kind}>
                <ContextPreview artwork={tool.artwork} theme={theme} kind={kind} />
              </div>
            ))}
          </Fragment>
        ))}
      </PreviewMatrix>
      <Note>
        {actual ? 'Actual size: Row / Winner 24px · Stack 18px.' : 'Shown at 2× so you can inspect the details.'}
      </Note>
      <Note $warning={cropped}>
        {cropped
          ? 'Some of the mark may fall outside the circular crop. Reduce the size or move it towards the centre.'
          : 'The mark fits the crop. Check that its small details stay recognisable.'}
      </Note>
      <Note>
        Based on the proposed logo treatments. The thin edge ring belongs to the UI and is not added to your export.
      </Note>
    </Panel>
  )
}

function ContextPreview({
  artwork,
  theme,
  kind,
}: {
  artwork: HTMLCanvasElement | null
  theme: PreviewTheme
  kind: LogoContext
}): ReactElement {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (artwork && canvas.current) drawContext(canvas.current, artwork, theme, kind)
  }, [artwork, theme, kind])
  return <canvas ref={canvas} width={144} height={144} aria-label={`${theme} ${kind} logo preview`} />
}
