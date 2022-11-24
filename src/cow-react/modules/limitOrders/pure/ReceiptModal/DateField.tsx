import moment from 'moment'
import * as styledEl from './styled'

interface PriceFieldProps {
  date: string
}

export function DateField({ date }: PriceFieldProps) {
  return (
    <styledEl.Value>
      <styledEl.InlineWrapper>
        <strong>{moment(date).fromNow()}</strong>
        <span>({moment(date).format('MMM D YYYY, h:mm a')})</span>
      </styledEl.InlineWrapper>
    </styledEl.Value>
  )
}
