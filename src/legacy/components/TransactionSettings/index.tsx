import SlippageTabsMod, { TransactionSettingsProps, OptionCustom } from './TransactionSettingsMod'
import { RowBetween, RowFixed } from 'components/Row'
import styled from 'styled-components/macro'
import { darken } from 'polished'

const Wrapper = styled.div`
  ${RowBetween} > button, ${OptionCustom} {
    &:disabled {
      background-color: ${({ theme }) => darken(0.031, theme.bg3)};
      border: none;
      pointer-events: none;
    }
  }

  ${OptionCustom} {
    background-color: ${({ theme }) => theme.grey1};
    border: 0;

    > div > input {
      background: transparent;
      &:disabled {
        background-color: inherit;
      }
    }

    > div > input::placeholder {
      opacity: 0.5;
      color: ${({ theme }) => theme.text1};
    }
  }

  ${RowFixed} {
    > div {
      color: ${({ theme }) => theme.text1};
      opacity: 0.85;
    }

    > button {
      background-color: ${({ theme }) => theme.grey1};
      border: 0;
    }

    > button > input {
      background: transparent;
    }

    > button > input::placeholder {
      background: transparent;
      opacity: 0.5;
      color: ${({ theme }) => theme.text1};
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
