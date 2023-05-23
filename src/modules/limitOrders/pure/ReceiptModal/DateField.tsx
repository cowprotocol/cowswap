import * as styledEl from './styled'
import useTimeAgo from 'legacy/hooks/useTimeAgo'
import { format } from 'date-fns'

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
