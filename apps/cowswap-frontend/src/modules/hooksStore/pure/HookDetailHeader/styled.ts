import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Header = styled.div<{ iconSize?: number, gap?: number, padding?: string }>`
  display: flex;
  align-items: flex-start;
  gap: ${({ gap }) => gap || 20}px;
  padding: ${({ padding }) => padding || '16px 10px'};
  border-bottom: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});


  > img {
    --size: ${({ iconSize }) => iconSize || 134}px;
    width: var(--size);
    height: var(--size);
    object-fit: contain;
    border-radius: 16px;
    background-color: var(${UI.COLOR_PAPER_DARKER});
    padding: 10px;
  }
`

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  > h3 {
    font-size: 23px;
    font-weight: bold;
    line-height: 1.2;
    margin: 0;
  }
`
 

export const Description = styled.p`
  margin: 0;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const AddButton = styled.button`
  background: var(${UI.COLOR_PRIMARY});
  color: var(${UI.COLOR_PAPER});
  border: none;
  outline: none;
  font-weight: 600;
  font-size: 16px;
  padding: 11px;
  border-radius: 21px;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
  margin: 16px 0 0;

  &:hover {
    background: var(${UI.COLOR_PRIMARY_DARKEST});
  }
`