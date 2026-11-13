import { ReactElement } from 'react'

import { ExportPanel, Note, ToolButton } from './solverLogoTool.styled'
import { SolverLogoController } from './useSolverLogoTool'

export function LogoExport({ tool }: { tool: SolverLogoController }): ReactElement {
  return (
    <ExportPanel aria-labelledby="solver-logo-export-title">
      <h2 id="solver-logo-export-title">Ready to share?</h2>
      <Note>Your pack keeps the original artwork alongside the prepared files.</Note>
      <label htmlFor="solver-logo-name">
        Solver name
        <input
          id="solver-logo-name"
          type="text"
          value={tool.solverName}
          maxLength={60}
          autoComplete="off"
          onChange={(event): void => tool.setSolverName(event.target.value)}
        />
      </label>
      <ul>
        <li>1024 × 1024 PNG</li>
        <li>{tool.asset?.type === 'svg' ? 'Prepared vector SVG' : 'SVG with a vector upload'}</li>
        <li>Six-context preview sheet</li>
        <li>Original file + edit settings</li>
      </ul>
      <ToolButton
        variant="primary"
        disabled={!tool.asset || tool.loading || !!tool.exporting}
        onClick={(): void => {
          void tool.exportPack('logo')
        }}
      >
        {tool.exporting === 'logo' ? 'Preparing logo pack…' : 'Download logo pack'}
      </ToolButton>
      <Note role="status">
        {tool.status.includes('-logo-pack.zip')
          ? tool.status
          : tool.asset?.type === 'svg'
            ? 'SVG + PNG + original + previews + settings.'
            : 'PNG + original + previews + settings, in one ZIP.'}
      </Note>
    </ExportPanel>
  )
}
