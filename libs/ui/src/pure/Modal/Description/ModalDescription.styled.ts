import styled from 'styled-components/macro'

import { UI } from '../../../enum'
import { font } from '../../../utils/font'
import { SimpleStyledText } from '../../SimpleStyledText/SimpleStyledText.styled'

/** Matches `ModalHeader` inner horizontal padding; use as a sibling of `Modal.Content`. */
const DESCRIPTION_HORIZONTAL_PADDING_PX = 16

export const Description = styled(SimpleStyledText)`
  ${font('FONT_SMALL_PLUS', 'regular')}
  margin: 0 0 16px;
  padding: 0 ${DESCRIPTION_HORIZONTAL_PADDING_PX}px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  line-height: 1.4;
`
