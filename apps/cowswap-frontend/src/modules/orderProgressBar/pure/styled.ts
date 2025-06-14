import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

const getOpacity = (status: string, isDarkMode: boolean): number => {
  const opacityMap = {
    done: isDarkMode ? 0.3 : 0.1,
    active: 1,
    next: isDarkMode ? 0.6 : 0.5,
    future: isDarkMode ? 0.3 : 0.2,
    disabled: 0.2,
  }
  return opacityMap[status as keyof typeof opacityMap] || 1
}

export const StepsContainer = styled.div<{ $height: number; $minHeight?: string; bottomGradient?: boolean }>`
  position: relative;
  height: ${({ $height }) => $height}px;
  min-height: ${({ $minHeight }) => $minHeight || '192px'};
  overflow: hidden;
  transition: height 0.5s ease-in-out;
  width: 100%;
  padding: 0;

  // implement a gradient to hide the bottom of the steps container using white to opacity white using pseudo element
  &::after {
    content: ${({ bottomGradient }) => (bottomGradient ? '""' : 'none')};
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 30px;
    background: linear-gradient(to bottom, transparent, var(${UI.COLOR_PAPER}));
  }
`

export const StepsWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  padding: 0;
  width: 100%;
  position: relative;
  transition: transform 1s ease-in-out;
`

export const Step = styled.div<{ status: string; isFirst: boolean }>`
  transition: opacity 0.3s ease-in-out;
  display: flex;
  align-items: flex-start;
  margin: 0 auto;
  width: 100%;
  padding: 30px 30px 10px;
  opacity: ${({ status, theme }) => getOpacity(status, theme.darkMode)};
`

export const Content = styled.div`
  display: flex;
  flex-direction: column;
`

export const Title = styled.h3<{ customColor?: string }>`
  color: ${({ customColor }) => customColor || `var(${UI.COLOR_TEXT_PAPER})`};
  margin: 0;
  font-size: 21px;
`

export const ProgressTopSection = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  border-radius: 21px;
  background: var(${UI.COLOR_PAPER_DARKER});
  min-height: 230px;

  ${Media.upToSmall()} {
    min-height: auto;
  }
`

export const CowImage = styled.div`
  height: 100%;
  width: auto;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  position: relative;

  ${Media.upToSmall()} {
    width: 100%;
    align-items: center;
    justify-content: center;
    max-height: 100%;
  }

  > svg {
    height: 100%;
    width: 100%;
    max-width: 199px;

    ${Media.upToSmall()} {
      max-width: 100%;
    }
  }
`

export const TokenPairTitle = styled.span`
  margin: 4px 0 4px 4px;
  background: var(${UI.COLOR_BLUE_100_PRIMARY});
  color: var(${UI.COLOR_BLUE_900_PRIMARY});
  border-radius: 12px;
  padding: 0 6px;
  word-break: break-word;
  line-height: 1;
`

export const Surplus = styled.div`
  font-weight: bold;
  color: inherit;
  width: 100%;
  height: 100%;
  text-align: right;
  line-height: 1.2;
  margin: 0;
`

export const FinishedTagLine = styled.div`
  line-height: 1.2;
  font-weight: bold;
  color: inherit;
  max-width: 100%;
  font-size: 22px;
  width: 100%;
  text-align: right;
  height: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 0;
  flex: 1 1 0;

  ${Media.upToSmall()} {
    flex: 0 0 auto;
    height: auto;
  }
`

export const FinishedLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1;
  padding: 0;
  margin: auto 0 0;
  width: 100%;
  flex: 0;

  > b {
    font-weight: 700;
  }
`

export const NumberedElement = styled.div<{
  status: string
  customColor?: string
  $isUnfillable?: boolean
  $isCancelling?: boolean
}>`
  --size: 28px;
  width: var(--size);
  height: var(--size);
  min-width: var(--size);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
  color: ${({ status }) => (status === 'active' ? `var(${UI.COLOR_PAPER})` : `var(${UI.COLOR_PAPER})`)};
  font-weight: bold;
  font-size: 16px;
  background-color: ${({ status, customColor, $isUnfillable, $isCancelling }) =>
    $isCancelling
      ? `var(${UI.COLOR_DANGER_BG})`
      : $isUnfillable
        ? '#996815'
        : customColor || (status === 'active' ? '#2196F3' : `var(${UI.COLOR_TEXT})`)};
  border-radius: 50%;
  position: relative;
`

export const Spinner = styled.div`
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 2px solid transparent;
  border-top-color: ${`var(${UI.COLOR_PRIMARY_LIGHTER})`};
  border-radius: 50%;
  animation: spin 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`

export const ClockAnimation = styled.div`
  --size: 85px;
  width: var(--size);
  height: var(--size);
  position: absolute;
  bottom: 36px;
  right: 71px;
  background: #996815;
  border-radius: var(--size);
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;

  ${Media.upToSmall()} {
    bottom: 16px;
    right: 16px;
  }
`

export const FinishedImageContent = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  width: 50%;
  position: relative;
  border: 2px solid var(${UI.COLOR_BLUE_900_PRIMARY});
  border-radius: 21px;
  padding: 12px;
  gap: 14px;
  color: var(${UI.COLOR_BLUE_900_PRIMARY});

  ${Media.upToSmall()} {
    width: 100%;
    max-height: 290px;
  }
`

export const BenefitSurplusContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  justify-content: flex-start;
  gap: 0;
  font-size: 20px;
  line-height: 1.4;
`

export const BenefitText = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 6px 0 0;
  margin: 0;
  box-sizing: border-box;

  > span {
    display: inline-block;
    line-height: 1.2;
    text-align: left;
    word-break: break-word;
    hyphens: auto;
    width: 100%;
  }
`

export const BenefitTagLine = styled.div`
  width: auto;
  font-size: 14px;
  margin: 0 auto auto 0;
  border-radius: 12px;
  padding: 2px 10px;
  background-color: var(${UI.COLOR_BLUE_400_PRIMARY});
  color: var(${UI.COLOR_TEXT});
`
