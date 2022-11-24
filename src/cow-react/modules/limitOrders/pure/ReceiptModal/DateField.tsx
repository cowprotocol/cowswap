import moment from 'moment'
import * as styledEl from './styled'

interface Props {
  date: string | Date | undefined
}

export function DateField({ date }: Props) {
  return (
    <styledEl.Value>
      {date ? (
        <styledEl.InlineWrapper>
          <strong>{moment(date).fromNow()}</strong>
          <span>({moment(date).format('MMM D YYYY, h:mm a')})</span>
        </styledEl.InlineWrapper>
      ) : (
        '-'
      )}
    </styledEl.Value>
  )
}
