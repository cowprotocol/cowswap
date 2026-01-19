import type { ReactNode } from 'react'

import { REDIRECT_SECONDS } from './constants'

const REDIRECT_URL = 'https://mevblocker.io'

export default function Head(): ReactNode {
  return <meta httpEquiv="refresh" content={`${REDIRECT_SECONDS};url=${REDIRECT_URL}`} />
}
