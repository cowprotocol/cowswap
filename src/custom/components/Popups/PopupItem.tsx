import styled from 'styled-components/macro'
import { PopupContent } from 'state/application/actions'
import { default as PopupItemUni, Popup, Fader, StyledClose } from './PopupItemMod'

const Wrapper = styled.div`
  ${Popup} {
    ${({ theme }) => theme.mediaWidth.upToSmall`
      margin: 0 0 16px;
      min-width: 100%;
    `}
  }

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
`

export const PopupItemWrapper = styled(PopupItemUni)`
  ${(props) => props.className} {
    border: 2px solid ${({ theme }) => theme.black};
    box-shadow: 2px 2px 0 ${({ theme }) => theme.black};
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
  return (
    <Wrapper>
      <PopupItemWrapper removeAfterMs={removeAfterMs} content={content} popKey={popKey} />
    </Wrapper>
  )
}

export default PopupItem
