import QuestionHelper from 'components/QuestionHelper'
import { ChevronDown } from 'react-feather'
import { Trans } from '@lingui/macro'
import * as styledEl from './styled'
import { Menu } from '@reach/menu-button'
import { ordersDeadlines } from '../deadlines'

type SelectorPropsType = {
  selectDeadline: any
  displayDeadline: any
  customDeadline: any
  currentDeadlineNode: any
  openModal: any
}

export function Selector({
  selectDeadline,
  displayDeadline,
  customDeadline,
  currentDeadlineNode,
  openModal,
}: SelectorPropsType) {
  return (
    <styledEl.Selector>
      <styledEl.Label>
        <styledEl.LabelWrapper>
          <span>Total time</span>
          <QuestionHelper text={<Trans>This is some text here</Trans>} />
        </styledEl.LabelWrapper>
      </styledEl.Label>

      <Menu>
        <styledEl.Current ref={currentDeadlineNode as any} $custom={!!customDeadline}>
          <span>{displayDeadline}</span>
          <ChevronDown size="18" />
        </styledEl.Current>

        <styledEl.ListWrapper>
          {ordersDeadlines.map((item) => (
            <li key={item.value}>
              <styledEl.ListItem onSelect={() => selectDeadline(item.value)}>
                <Trans>{item.title}</Trans>
              </styledEl.ListItem>
            </li>
          ))}
          <styledEl.ListItem onSelect={openModal}>
            <Trans>Custom</Trans>
          </styledEl.ListItem>
        </styledEl.ListWrapper>
      </Menu>
    </styledEl.Selector>
  )
}
