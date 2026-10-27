import type { ReactNode } from 'react'

import styles from './IssuersCount.module.css'

import type { RwaToken } from '../model/types'

import { Tooltip } from '@/shared/ui/tooltip'

const ISSUERS_HINT =
  'Different issuers offer separate tokens referencing the same stock. Rights, risks and restrictions may vary.'

interface IssuersCountProps {
  tokens: Pick<RwaToken, 'issuer'>[]
  className?: string
}

export function IssuersCount({ tokens, className }: IssuersCountProps): ReactNode {
  const issuers = [...new Set(tokens.map((token) => token.issuer))]

  return (
    <Tooltip
      className={className}
      content={
        <>
          <strong className={styles.names}>{issuers.join(', ')}</strong>
          {ISSUERS_HINT}
        </>
      }
    >
      {issuers.length} {issuers.length === 1 ? 'issuer' : 'issuers'}
    </Tooltip>
  )
}
