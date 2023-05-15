import * as styledEl from './styled'
import QuestionHelper from 'components/QuestionHelper'
import { Trans } from '@lingui/macro'
import { useSinglePartTime } from '../../hooks/useSinglePartTime'

export function DeadlineDisplayPart() {
  const partTime = useSinglePartTime()

  return (
    <styledEl.Wrapper>
      <styledEl.Label>
        <Trans>Part Every</Trans>
        <QuestionHelper text={<Trans>TODO: Add part every text</Trans>} />
      </styledEl.Label>

      <styledEl.Value>{partTime}</styledEl.Value>
    </styledEl.Wrapper>
  )
}
