import { darken } from 'polished'
import styled from 'styled-components/macro'

import { RowBetween, RowFixed } from 'legacy/components/Row'

import { UI } from 'common/constants/theme'

import SlippageTabsMod, { TransactionSettingsProps, OptionCustom } from './TransactionSettingsMod'

const Wrapper = styled.div`
  ${RowBetween} > button, ${OptionCustom} {
    &:disabled {
      background-color: ${({ theme }) => darken(0.031, theme.bg3)};
      border: none;
      pointer-events: none;
    }
  }

  ${OptionCustom} {
    background-color: var(${UI.COLOR_GREY});
    border: 0;

    > div > input {
      background: transparent;
      &:disabled {
        background-color: inherit;
      }
    }

    > div > input::placeholder {
      opacity: 0.5;
      color: var(${UI.COLOR_TEXT1});
    }
  }

  ${RowFixed} {
    > div {
      color: var(${UI.COLOR_TEXT1});
      opacity: 0.85;
    }

    > button {
      background-color: var(${UI.COLOR_GREY});
      border: 0;
    }

    > button > input {
      background: transparent;
    }

    > button > input::placeholder {
      background: transparent;
      opacity: 0.5;
      color: var(${UI.COLOR_TEXT1});
    }
  }
`

export default function SlippageTabs(params: TransactionSettingsProps) {
  return (
    <Wrapper>
      <SlippageTabsMod {...params} />
    </Wrapper>
  )
}
