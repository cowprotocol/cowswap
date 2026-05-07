import { Color, Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const JsonPanel = styled.div`
  border: 1px solid ${Color.explorer_tableRowBorder};
  background: ${Color.explorer_tableRowBorder};
  border-radius: 0.5rem;
  overflow: hidden;
  margin-top: 16px;

  ${Media.upToSmall()} {
    margin-left: -14px;
    margin-right: -14px;
    border-radius: 0;
    border-right: 0;
    border-left: 0;
  }
`

export const TopRow = styled.div`
  --control-size: 3.2rem;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  border-bottom: 1px solid ${Color.explorer_tableRowBorder};
  min-height: var(--control-size);
`

export const Tabs = styled.div`
  display: flex;
  align-items: stretch;
`

export const TabButton = styled.button<{ $active: boolean }>`
  appearance: none;
  border: none;
  border-bottom: 0.1rem solid
    ${({ $active }): string => ($active ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.28)')};
  background: ${({ $active }): string => ($active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)')};
  color: ${({ $active }): string => ($active ? Color.explorer_textActive : 'inherit')};
  padding: 0.5rem 1rem;
  font-size: 1.3rem;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  min-width: 8rem;
  height: 100%;

  :hover {
    border-color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.16);
  }

  :focus-visible {
    outline: 0.2rem solid rgba(255, 255, 255, 0.35);
    outline-offset: 0.1rem;
  }
`

export const CopyButtonSlot = styled.div`
  width: var(--control-size);
  min-width: var(--control-size);
  aspect-ratio: 1 / 1;
  height: var(--control-size);
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 1px solid ${Color.explorer_tableRowBorder};
  background: rgba(255, 255, 255, 0.08);
  cursor: pointer;
  margin-left: auto;

  > span {
    width: 100%;
    height: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    & > svg {
      margin: 0;
    }
  }

  :hover {
    background: rgba(255, 255, 255, 0.16);
  }
`

export const JsonContent = styled.pre`
  word-break: break-all;
  line-height: 1.5;
  overflow: auto;
  margin: 0;
  padding: 0.75rem;
  white-space: pre-wrap;
`
