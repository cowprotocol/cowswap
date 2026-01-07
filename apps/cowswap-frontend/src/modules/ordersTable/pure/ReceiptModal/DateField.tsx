import { ReactNode } from 'react'

import { useTimeAgo } from '@cowprotocol/common-hooks'

import { i18n } from '@lingui/core'

import * as styledEl from './styled'

interface Props {
  date: Date | undefined
}

const options: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
}

export function DateField({ date }: Props): ReactNode {
  const timeAgo = useTimeAgo(date)
  const previewDate = date ? date.toLocaleString(i18n.locale, options) : ''

  return (
    <styledEl.Value>
      {date ? (
        <styledEl.InlineWrapper>
          <strong>{timeAgo}</strong>
          <span>({previewDate})</span>
        </styledEl.InlineWrapper>
      ) : (
        '-'
      )}
    </styledEl.Value>
  )
}
