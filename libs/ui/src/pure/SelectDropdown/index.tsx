import styled from 'styled-components/macro'

import { UI } from '../../enum'

export const SelectDropdown = styled.select`
  border-radius: 12px;
  padding: 8px 34px 8px 8px;
  appearance: none;
  cursor: pointer;
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;
  width: 100%;
  outline: none;
  border: 1px solid var(--cow-color-border);
  color: var(--cow-color-text1);
  background:
    linear-gradient(45deg, transparent 50%, var(--cow-color-lightBlue) 50%) calc(100% - 13px) calc(13px) / 5px 5px
      no-repeat,
    linear-gradient(135deg, var(--cow-color-lightBlue) 50%, transparent 50%) calc(100% - 8px) calc(13px) / 5px 5px
      no-repeat,
    linear-gradient(to right, var(--cow-color-lightBlue-opacity-90), var(--cow-color-lightBlue-opacity-90)) 100% 0 /
      26px 100% no-repeat;

  &:hover {
    background:
      linear-gradient(45deg, transparent 50%, var(--cow-color-lightBlue) 50%) calc(100% - 13px) calc(13px) / 5px 5px
        no-repeat,
      linear-gradient(135deg, var(--cow-color-lightBlue) 50%, transparent 50%) calc(100% - 8px) calc(13px) / 5px 5px
        no-repeat,
      linear-gradient(to right, var(--cow-color-lightBlue-opacity-80), var(--cow-color-lightBlue-opacity-80)) 100% 0 /
        26px 100% no-repeat;
  }

  option {
    background: var(${UI.COLOR_PAPER});
  }
`
