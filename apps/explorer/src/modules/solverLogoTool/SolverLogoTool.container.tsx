import { ReactElement } from 'react'

import { LogoEditor } from './LogoEditor.pure'
import { LogoExport } from './LogoExport.pure'
import { LogoGuidelines } from './LogoGuidelines.pure'
import { LogoPreview } from './LogoPreview.pure'
import { SOLVER_LOGO_PATH } from './solverLogoTool.constants'
import { Intro, Message, Page, PreviewColumn, PrivacyNote, Workspace } from './solverLogoTool.styled'
import { useSolverLogoTool } from './useSolverLogoTool'

export function SolverLogoTool(): ReactElement {
  const tool = useSolverLogoTool()
  return (
    <Page onDragOver={(event): void => event.preventDefault()} onDrop={(event): void => event.preventDefault()}>
      <h1>Solver logo tool</h1>
      <Intro>
        Upload your logo, find its fit, and see it on CoW Swap. Download one logo pack to share with the team.{' '}
        <a href={`${SOLVER_LOGO_PATH}#solver-logo-guidelines`}>Logo guidelines</a>
      </Intro>
      {tool.error && <Message role="alert">{tool.error}</Message>}
      <Workspace>
        <LogoEditor tool={tool} />
        <PreviewColumn>
          <LogoPreview tool={tool} />
          <LogoExport tool={tool} />
        </PreviewColumn>
      </Workspace>
      <LogoGuidelines />
      <PrivacyNote>
        Preparation happens in your browser. You choose what to share. Downloading a pack does not update the CMS.
      </PrivacyNote>
    </Page>
  )
}
