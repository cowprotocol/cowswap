import { fontFamilyBrand } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

/** Digit metrics from the Figma countdown (node 3430:13145): Bold 48.64/63.84, one 0-9 reel per digit. */
export const DIGIT_LINE_HEIGHT_PX = 63.84
const DIGIT_FONT_SIZE_PX = 48.64
const DIGIT_WIDTH_PX = 33.44

export const DigitsRow = styled.div`
  ${fontFamilyBrand}
  display: flex;
  align-items: center;
  font-size: ${DIGIT_FONT_SIZE_PX}px;
  font-weight: 700;
  line-height: ${DIGIT_LINE_HEIGHT_PX}px;
  font-variant-numeric: tabular-nums;
`

export const ReelClip = styled.div`
  height: ${DIGIT_LINE_HEIGHT_PX}px;
  width: ${DIGIT_WIDTH_PX}px;
  overflow: hidden;
`

export const ReelStrip = styled.div`
  display: flex;
  flex-direction: column;
  transition: transform 0.4s ease-out;

  > span {
    display: block;
    height: ${DIGIT_LINE_HEIGHT_PX}px;
    text-align: center;
  }
`

export const Colon = styled.span`
  width: ${DIGIT_WIDTH_PX / 2}px;
  text-align: center;
`

export const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`
