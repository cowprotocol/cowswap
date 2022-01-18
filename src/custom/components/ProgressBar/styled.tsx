import styled from 'styled-components/macro'
import * as CSS from 'csstype'
import { FlexWrap as FlexWrapMod } from 'pages/Profile/styled'
import { transparentize } from 'polished'

export const FlexWrap = styled(FlexWrapMod)`
  max-width: 100%;
  align-items: flex-end;
`

export const ProgressBarWrap = styled(FlexWrapMod)`
  max-width: 500px; //optional
  padding-top: 40px;
  position: relative;
`

export const ProgressContainer = styled.div`
  background-color: ${({ theme }) => transparentize(0.61, theme.text1)};
  height: 24px;
  width: 100% !important;
  position: relative;
  overflow: hidden;
  border-radius: 10px;
`

export const HiddenRange = styled.input`
  width: 100%;
  background-color: transparent;
  z-index: 3;
  position: relative;
  opacity: 0;
`

export const Progress = styled.div<Partial<CSS.Properties & { percentage: number }>>`
  background-color: ${({ theme }) => theme.primary1};
  width: 100%;
  max-width: ${(props) => props.percentage}%;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  transition: max-width 0.2s;
`

export const ProgressVal = styled.span`
  display: inline-block;
  color: ${({ theme }) => theme.text1};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  font-weight: bold;
  font-size: 16px;
`

export const Label = styled.a<Partial<CSS.Properties & { position: any }>>`
  cursor: pointer;
  position: absolute;
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
  top: 10px;
  left: ${(props) => props.position}%;
  transform: translateX(-50%);
  font-weight: bold;
  text-decoration: underline;

  &:first-child {
    transform: none;
  }
  &:nth-last-child(2) {
    transform: translateX(-100%);
  }

  &:hover {
    text-decoration: none;
  }
`
