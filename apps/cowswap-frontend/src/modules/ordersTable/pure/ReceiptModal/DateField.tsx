import { useTimeAgo } from '@cowprotocol/common-hooks'

import { format } from 'date-fns'

import * as styledEl from './styled'

interface Props {
  date: Date | undefined
}

export function DateField({ date }: Props) {
  const timeAgo = useTimeAgo(date)
  const previewDate = format(date || 0, 'MMM d YYY, h:mm a')

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
