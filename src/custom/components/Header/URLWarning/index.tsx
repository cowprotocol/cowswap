import { PRODUCTION_URL } from 'constants/index'
import React from 'react'
import URLWarningUni from './URLWarningMod'

export * from './URLWarningMod'

export default function URLWarning() {
  return <URLWarningUni url={PRODUCTION_URL} />
}
