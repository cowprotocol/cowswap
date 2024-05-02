import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

const FeeInformationTooltipWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
`

export const Container = styled.div`
  max-width: 460px;
  width: 100%;
`
export const Wrapper = styled.div`
  position: relative;
  padding: 8px;
`

// TODO: refactor these styles
export const AuxInformationContainer = styled.div<{
  margin?: string
  borderColor?: string
  borderWidth?: string
  hideInput: boolean
  disabled?: boolean
  showAux?: boolean
}>`
  border: 1px solid ${({ hideInput }) => (hideInput ? ' transparent' : `var(${UI.COLOR_PAPER_DARKER})`)};
  background-color: var(${UI.COLOR_PAPER});
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};

  :focus,
  :hover {
    border: 1px solid ${({ theme, hideInput }) => (hideInput ? ' transparent' : theme.bg3)};
  }

  ${({ theme, hideInput, disabled }) =>
    !disabled &&
    `
      :focus,
      :hover {
        border: 1px solid ${hideInput ? ' transparent' : theme.bg3};
      }
    `}

  margin: ${({ margin = '0 auto' }) => margin};
  border-radius: 0 0 15px 15px;
  border: 2px solid var(${UI.COLOR_PAPER_DARKER});

  &:hover {
    border: 2px solid var(${UI.COLOR_PAPER_DARKER});
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: auto;
    flex-flow: column wrap;
    justify-content: flex-end;
    align-items: flex-end;
  `}
  > ${FeeInformationTooltipWrapper} {
    align-items: center;
    justify-content: space-between;
    margin: 0 16px;
    padding: 16px 0;
    font-weight: 600;
    font-size: 14px;
    height: auto;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      flex-flow: column wrap;
      width: 100%;
      align-items: flex-start;
      margin: 0;
      padding: 16px;
    `}

    > span {
      font-size: 18px;
      gap: 2px;
      word-break: break-all;
      text-align: right;

      ${({ theme }) => theme.mediaWidth.upToSmall`
        text-align: left;
        align-items: flex-start;
        width: 100%;
      `};
    }

    > span:first-child {
      font-size: 14px;
      display: flex;
      align-items: center;
      white-space: nowrap;

      ${({ theme }) => theme.mediaWidth.upToSmall`
        margin: 0 0 10px;
      `}
    }

    > span > small {
      opacity: 0.75;
      font-size: 13px;
      font-weight: 500;
    }
  }
`
