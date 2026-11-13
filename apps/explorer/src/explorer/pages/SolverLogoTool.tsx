import { ReactElement } from 'react'

import { Helmet } from 'react-helmet'

import { SolverLogoTool } from 'modules/solverLogoTool'

import { APP_TITLE } from '../const'

export default function SolverLogoToolPage(): ReactElement {
  return (
    <>
      <Helmet>
        <title>Solver logo tool - {APP_TITLE}</title>
        <meta name="robots" content="noindex,follow" />
      </Helmet>
      <SolverLogoTool />
    </>
  )
}
