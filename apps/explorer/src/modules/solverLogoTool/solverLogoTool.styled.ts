import { Color } from '@cowprotocol/ui'

import { ButtonBase } from 'components/common/Button'
import styled from 'styled-components/macro'

import { Wrapper } from '../../explorer/pages/styled'

export const Page = styled(Wrapper)`
  max-width: 128rem;
  padding: 0 2.4rem 4.8rem;
  font-size: 1.4rem;
  line-height: 1.6;
  color: ${Color.explorer_textSecondary1};
  > h1 {
    font-size: 3.4rem;
    line-height: 1.1;
    padding: 3.2rem 0 1.2rem;
  }
  a {
    color: ${Color.explorer_textActive};
    text-underline-offset: 0.3rem;
  }
  button,
  input,
  textarea,
  summary,
  [tabindex] {
    outline-offset: 0.3rem;
  }
  :is(button, input, textarea, a, summary, [tabindex]):focus-visible {
    outline: 0.2rem solid ${Color.explorer_textActive};
  }
  input {
    accent-color: ${Color.explorer_textActive};
    caret-color: ${Color.explorer_textActive};
  }
  input[type='number'],
  input[type='text'],
  textarea {
    background: ${Color.explorer_bgInput};
    color: ${Color.explorer_textSecondary1};
    border: 0.1rem solid ${Color.explorer_border};
    border-radius: 0.6rem;
    padding: 0.8rem 1rem;
    font-size: 1.3rem;
    line-height: 1.5;
    min-width: 0;
  }
  input[hidden] {
    display: none;
  }
  @media (max-width: 850px) {
    padding: 0 1.6rem 3.2rem;
  }
  @media (max-width: 480px) {
    padding: 0 1.2rem 3.2rem;
    > h1 {
      font-size: 2.8rem;
    }
  }
`
export const Intro = styled.p`
  color: ${Color.explorer_textSecondary2};
  margin: 0 0 2.4rem;
  font-size: 1.4rem;
  max-width: 70ch;
`
export const Workspace = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  align-items: start;
  gap: 2.4rem;
  @media (max-width: 850px) {
    grid-template-columns: 1fr;
  }
`
export const Panel = styled.section`
  min-width: 0;
  border: 0.1rem solid ${Color.explorer_border};
  background: ${Color.explorer_background};
  border-radius: 0.6rem;
  padding: 2.4rem;
  h2 {
    font-size: 1.8rem;
    line-height: 1.35;
    margin: 0;
  }
  @media (max-width: 480px) {
    padding: 1.6rem;
  }
`
export const PanelHeading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: wrap;
`
export const ToolButton = styled(ButtonBase)`
  border-radius: 0.6rem;
  min-height: 4rem;
  padding: 0.8rem 1.2rem;
  font-size: 1.3rem;
  letter-spacing: 0;
  font-weight: 600;
  color: ${({ variant }): string =>
    variant === 'primary' ? Color.explorer_paperCustom : Color.explorer_textSecondary1};
  &:hover {
    color: ${Color.explorer_textSecondary1};
  }
  &:disabled {
    opacity: 0.5;
    cursor: wait;
  }
`
export const TextButton = styled.button`
  background: none;
  border: 0;
  border-radius: 0.4rem;
  color: ${Color.explorer_textActive};
  padding: 0.5rem;
  font-size: 1.2rem;
  min-height: 3.2rem;
  cursor: pointer;
  &:hover {
    background: ${Color.explorer_bgOpaque};
  }
`
export const SourceBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin: 1.6rem 0 1.2rem;
  font-size: 1.2rem;
  color: ${Color.explorer_textSecondary2};
  > span:first-child {
    background: ${Color.explorer_bgOpaque};
    padding: 0.2rem 0.6rem;
    border-radius: 0.4rem;
    flex: none;
  }
  > span:nth-child(2) {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  > button {
    margin-left: auto;
  }
`
export const DropZone = styled.div<{ $dragging: boolean }>`
  background: ${Color.explorer_bg};
  border: 0.1rem ${({ $dragging }): string => ($dragging ? 'dashed' : 'solid')} ${Color.explorer_border};
  border-color: ${({ $dragging }): string => ($dragging ? Color.explorer_textActive : Color.explorer_border)};
  padding: 2rem 1.6rem 1.2rem;
  border-radius: 0.6rem;
  > p {
    font-size: 1.2rem;
    text-align: center;
    color: ${Color.explorer_textSecondary2};
    margin: 1.2rem 0 0;
  }
`
export const Stage = styled.div<{ $guides: boolean }>`
  width: min(100%, 32rem);
  aspect-ratio: 1;
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  margin: auto;
  cursor: grab;
  touch-action: none;
  background: conic-gradient(#e3eaf2 25%, #fff 0 50%, #e3eaf2 0 75%, #fff 0);
  background-size: 2rem 2rem;
  &:active {
    cursor: grabbing;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  &:after {
    content: '';
    position: absolute;
    inset: 0;
    border: 0.1rem solid ${Color.explorer_textSecondary2};
    border-radius: 50%;
    pointer-events: none;
  }
  > .safe-guide {
    display: ${({ $guides }): string => ($guides ? 'block' : 'none')};
    position: absolute;
    inset: 12%;
    border: 0.1rem dashed ${Color.explorer_textActive};
    border-radius: 50%;
    pointer-events: none;
  }
`
export const EditorActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  padding: 1.2rem 0;
  label {
    font-size: 1.2rem;
    display: flex;
    gap: 0.6rem;
    align-items: center;
    color: ${Color.explorer_textSecondary2};
  }
  > div {
    display: flex;
    gap: 0.4rem;
  }
`
export const Controls = styled.div`
  border-top: 0.1rem solid ${Color.explorer_border};
  padding-top: 1.6rem;
  font-size: 1.2rem;
  .size-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1.2rem;
  }
  input[type='range'] {
    width: 100%;
    margin: 1.2rem 0 1.6rem;
    min-height: 2.4rem;
    cursor: pointer;
  }
  .position-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    > span {
      margin-right: auto;
    }
  }
`
export const PercentField = styled.label`
  display: flex;
  gap: 0.6rem;
  align-items: center;
  font-size: 1.2rem;
  color: ${Color.explorer_textSecondary2};
  input {
    width: 6.8rem;
    font-variant-numeric: tabular-nums;
  }
`
export const BackgroundControl = styled.fieldset`
  padding: 0;
  border: 0;
  margin: 2rem 0 0;
  min-width: 0;
  legend {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }
  > div {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }
  label {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 1.2rem;
    cursor: pointer;
  }
  input {
    width: 3rem;
    height: 3rem;
    padding: 0;
    border: 0;
    cursor: pointer;
    background: transparent;
  }
`
export const Swatch = styled.button<{ $color: string; $selected: boolean }>`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  padding: 0.3rem;
  cursor: pointer;
  border: 0.1rem solid ${Color.explorer_border};
  background: ${({ $color }): string =>
    $color === 'transparent' ? 'conic-gradient(#dce4ef 25%, #fff 0 50%, #dce4ef 0 75%, #fff 0)' : $color};
  background-size: 1rem 1rem;
  outline: ${({ $selected }): string => ($selected ? `0.2rem solid ${Color.explorer_textActive}` : 'none')};
  outline-offset: 0.2rem;
`
export const Note = styled.p<{ $warning?: boolean }>`
  font-size: 1.2rem;
  line-height: 1.6;
  color: ${({ $warning }): string => ($warning ? Color.explorer_yellow4 : Color.explorer_textSecondary2)};
  margin: 1.2rem 0 0;
`
export const Samples = styled.div`
  margin-top: 1.6rem;
  padding-top: 1.6rem;
  border-top: 0.1rem solid ${Color.explorer_border};
  font-size: 1.2rem;
  color: ${Color.explorer_textSecondary2};
  > div {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    margin-top: 0.8rem;
  }
  button {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.6rem 0.8rem;
    border-radius: 0.4rem;
    border: 0.1rem solid ${Color.explorer_border};
    background: transparent;
    color: ${Color.explorer_textSecondary1};
    font-size: 1.2rem;
    cursor: pointer;
  }
  button[aria-pressed='true'],
  button:hover {
    border-color: ${Color.explorer_textActive};
  }
  img {
    width: 2.2rem;
    height: 2.2rem;
    object-fit: contain;
    border-radius: 50%;
    background: white;
  }
`
export const PreviewColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
  min-width: 0;
`
export const Segmented = styled.div`
  display: flex;
  background: ${Color.explorer_bg};
  border: 0.1rem solid ${Color.explorer_border};
  border-radius: 0.4rem;
  padding: 0.2rem;
  button {
    border: 0;
    border-radius: 0.3rem;
    background: transparent;
    color: ${Color.explorer_textSecondary2};
    font-size: 1.2rem;
    padding: 0.5rem 0.8rem;
    cursor: pointer;
  }
  button[aria-pressed='true'] {
    background: ${Color.explorer_bg2};
    color: ${Color.explorer_textSecondary1};
  }
`
export const PreviewMatrix = styled.div<{ $actual: boolean }>`
  display: grid;
  grid-template-columns: 3rem repeat(3, minmax(7.2rem, 1fr));
  gap: 0.8rem;
  align-items: center;
  margin: 2rem 0 1.2rem;
  .context-title {
    text-align: center;
    font-size: 1.2rem;
    line-height: 1.5;
    span {
      display: block;
      color: ${Color.explorer_textSecondary2};
    }
  }
  .theme-label {
    font-size: 1.2rem;
    color: ${Color.explorer_textSecondary2};
  }
  .preview-cell {
    display: grid;
    place-items: center;
    min-height: 9.6rem;
    border-radius: 0.4rem;
    background: ${Color.explorer_bg};
  }
  canvas {
    width: ${({ $actual }): string => ($actual ? '3.6rem' : '7.2rem')};
    height: ${({ $actual }): string => ($actual ? '3.6rem' : '7.2rem')};
  }
  @media (max-width: 480px) {
    grid-template-columns: 2.8rem repeat(3, minmax(7.2rem, 1fr));
    gap: 0.4rem;
  }
`
export const ExportPanel = styled(Panel)`
  > label {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    font-size: 1.2rem;
    margin: 1.8rem 0;
  }
  > button {
    width: 100%;
    margin-top: 0.4rem;
  }
  ul {
    margin: 1.6rem 0;
    padding: 0;
    list-style: none;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
    font-size: 1.2rem;
  }
  li {
    padding-left: 1.2rem;
    position: relative;
    &:before {
      content: '';
      width: 0.4rem;
      height: 0.4rem;
      border-radius: 50%;
      position: absolute;
      left: 0;
      top: 0.7rem;
      background: ${Color.explorer_textActive};
    }
  }
`
export const AiDetails = styled.details`
  border-block: 0.1rem solid ${Color.explorer_border};
  margin-bottom: 1.6rem;
  font-size: 1.2rem;
  summary {
    cursor: pointer;
    padding: 1.2rem 0;
    color: ${Color.explorer_textActive};
    font-weight: 600;
  }
  summary span {
    color: ${Color.explorer_textSecondary2};
    font-weight: 400;
    margin-left: 0.6rem;
  }
  p,
  ol {
    color: ${Color.explorer_textSecondary2};
    margin: 0 0 1.2rem;
  }
  ol {
    padding-left: 2rem;
    li + li {
      margin-top: 0.4rem;
    }
  }
  .ai-actions,
  .ai-providers {
    display: flex;
    gap: 0.8rem;
    flex-wrap: wrap;
    margin-bottom: 1.2rem;
  }
  .ai-providers a {
    border: 0.1rem solid ${Color.explorer_border};
    padding: 0.8rem 1rem;
    border-radius: 0.6rem;
    &:hover {
      border-color: ${Color.explorer_textActive};
    }
  }
  label {
    display: block;
    font-weight: 600;
    margin: 1.6rem 0 0.6rem;
  }
  textarea {
    display: block;
    width: 100%;
    min-height: 13rem;
    max-width: 100%;
    resize: vertical;
    margin-bottom: 1.2rem;
    font-family: inherit;
  }
`
export const Message = styled.p`
  padding: 1.2rem 1.6rem;
  border: 0.1rem solid ${Color.explorer_yellow4};
  border-radius: 0.6rem;
  color: ${Color.explorer_yellow4};
  font-size: 1.3rem;
  margin: 0 0 1.6rem;
`
export const Guidelines = styled.section`
  margin: 4rem 0 2.4rem;
  > h2 {
    font-size: 2.4rem;
    margin: 0 0 0.8rem;
  }
  > p {
    color: ${Color.explorer_textSecondary2};
    margin: 0 0 2.4rem;
  }
  .guideline-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 3.2rem;
  }
  h3 {
    font-size: 1.6rem;
    margin: 1.6rem 0 0.8rem;
  }
  article p {
    color: ${Color.explorer_textSecondary2};
    font-size: 1.3rem;
    margin: 0;
  }
  .guideline-demo {
    display: flex;
    gap: 1.6rem;
    align-items: center;
    min-height: 12rem;
  }
  figure {
    margin: 0;
    text-align: center;
    font-size: 1.2rem;
  }
  figcaption {
    margin-top: 0.8rem;
    color: ${Color.explorer_textSecondary2};
  }
  .guide-circle {
    width: 8rem;
    height: 8rem;
    border-radius: 50%;
    overflow: hidden;
    background: white;
  }
  .guide-circle img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .crowded img {
    transform: scale(1.75);
  }
  .theme-example {
    padding: 1.2rem;
    background: #fff;
    border-radius: 0.4rem;
  }
  .theme-example.dark {
    background: #18193b;
  }
  .theme-example img {
    width: 5.6rem;
    height: 5.6rem;
    border-radius: 50%;
  }
  .format-example {
    font-size: 2.4rem;
    font-weight: 600;
    min-height: 12rem;
    display: flex;
    gap: 2rem;
    align-items: center;
    small {
      font-size: 1.2rem;
      font-weight: 400;
      display: block;
    }
  }
  @media (max-width: 650px) {
    .guideline-grid {
      grid-template-columns: 1fr;
      gap: 2.4rem;
    }
  }
`
export const PrivacyNote = styled.p`
  border-top: 0.1rem solid ${Color.explorer_border};
  padding-top: 2rem;
  color: ${Color.explorer_textSecondary2};
  font-size: 1.2rem;
`
