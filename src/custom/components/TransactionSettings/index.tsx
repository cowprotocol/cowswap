import SlippageTabsMod, {
  TransactionSettingsProps as TransactionSettingsPropsMod,
  FancyButton as FancyButtonUni,
  OptionCustom,
} from './TransactionSettingsMod'
import { RowFixed } from 'components/Row'
import styled from 'styled-components/macro'

// TODO: option was restyled in v3, review if this change is necessary
export const Option = styled(FancyButtonUni)<{ active: boolean }>`
  margin-right: 8px;
  border: 0;
  background-color: ${({ theme }) => theme.bg4};
  color: ${({ theme }) => theme.text1};
  border: ${({ active, theme }) => active && `1px solid ${theme.primary1}`};

  &:hover {
    cursor: pointer;
  }
`

const Wrapper = styled.div`
  ${OptionCustom} {
    background-color: ${({ theme }) => theme.bg4};

    > div > input {
      background: transparent;
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
      background-color: ${({ theme }) => theme.bg4};
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

export type TransactionSettingsProps = Omit<TransactionSettingsPropsMod, 'Option'>

export default function SlippageTabs(params: TransactionSettingsProps) {
  return (
    <Wrapper>
      {/* TODO: v3 option prop merge issue, review */}
      <SlippageTabsMod {...params} /* Option={Option} */ />
    </Wrapper>
  )
}
