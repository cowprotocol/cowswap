import styled from 'styled-components/macro'
import { PopupContent } from 'state/application/actions'
import { default as PopupItemUni, Fader, StyledClose } from './PopupItemMod'

export const Wrapper = styled(PopupItemUni)`
  ${(props) => props.className} {
    border: 2px solid ${({ theme }) => theme.black};
    box-shadow: 2px 2px 0 ${({ theme }) => theme.black};

    ${Fader} {
      background-color: ${({ theme }) => theme.disabled};
      height: 4px;
    }

    ${StyledClose} {
      stroke: ${({ theme }) => theme.text1};
    }

    a {
      text-decoration: underline;
      color: ${({ theme }) => theme.textLink};
    }
  }
`

export function PopupItem({
  removeAfterMs,
  content,
  popKey,
}: {
  removeAfterMs: number | null
  content: PopupContent
  popKey: string
}) {
  return <Wrapper removeAfterMs={removeAfterMs} content={content} popKey={popKey} />
}

export default PopupItem
