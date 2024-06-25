import { RowBetween, RowFixed } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import SlippageTabsMod, { TransactionSettingsProps, OptionCustom } from './TransactionSettingsMod'

const Wrapper = styled.div`
  ${RowBetween} > button, ${OptionCustom} {
    &:disabled {
      color: var(${UI.COLOR_TEXT_OPACITY_50});
      background-color: var(${UI.COLOR_PAPER});
      border: none;
      pointer-events: none;
    }
  }

  ${OptionCustom} {
    background-color: var(${UI.COLOR_PAPER_DARKER});
    border: 0;
    color: inherit;

    > div > input {
      background: transparent;
      color: inherit;

      &:disabled {
        color: inherit;
        background-color: inherit;
      }
    }

    > div > input::placeholder {
      opacity: 0.5;
      color: inherit;
    }
  }

  ${RowFixed} {
    color: inherit;

    > div {
      color: inherit;
      opacity: 0.85;
    }

    > button {
      background-color: var(${UI.COLOR_PAPER_DARKER});
      border: 0;
    }

    > button > input {
      background: transparent;
      color: inherit;
    }

    > button > input::placeholder {
      background: transparent;
      opacity: 0.5;
      color: inherit;
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
