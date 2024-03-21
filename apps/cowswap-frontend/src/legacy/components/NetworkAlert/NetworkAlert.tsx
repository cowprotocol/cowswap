import { getChainInfo } from '@cowprotocol/common-const'
import { useTheme } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { AutoRow } from '@cowprotocol/ui'
import { ExternalLink } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/macro'
import { ArrowUpRight } from 'react-feather'
import styled from 'styled-components/macro'

import { useDarkModeManager } from 'legacy/state/user/hooks'
import { HideSmall } from 'legacy/theme'

const L2Icon = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 16px;
`

const BodyText = styled.div`
  color: ${({ color }) => (color ? color : 'inherit')};
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin: 8px;
  font-size: 14px;

  :hover {
    text-decoration: underline;
  }
`
const RootWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  position: relative;
  margin-top: 16px;
  color: inherit;
  gap: 10px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0 10px;
  `}
`

const SHOULD_SHOW_ALERT = {
  [SupportedChainId.GNOSIS_CHAIN]: true,
}

type NetworkAlertChains = keyof typeof SHOULD_SHOW_ALERT

const StyledArrowUpRight = styled(ArrowUpRight)`
  margin-left: 12px;
  width: 24px;
  height: 24px;
`

const ContentWrapper = styled.div<{ chainId: NetworkAlertChains; darkMode: boolean; logoUrl: string }>`
  background: var(${UI.COLOR_PAPER_DARKER});
  transition: color var(${UI.ANIMATION_DURATION}) ease-in-out, background var(${UI.ANIMATION_DURATION}) ease-in-out; // MOD
  border-radius: 20px;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  position: relative;
  width: 100%;
  color: inherit;

  :before {
    background-image: url(${({ logoUrl }) => logoUrl});
    background-repeat: no-repeat;
    background-size: 300px;
    content: '';
    height: 300px;
    opacity: 0.08;
    position: absolute;
    transform: rotate(25deg) translate(-100px, -90px);
    width: 300px;
    z-index: 0;
  }

  ${BodyText},
  ${StyledArrowUpRight} {
    color: inherit;
    stroke: currentColor;
    text-decoration: none;
    transition: transform var(${UI.ANIMATION_DURATION}) ease-in-out, stroke var(${UI.ANIMATION_DURATION}) ease-in-out,
      color var(${UI.ANIMATION_DURATION}) ease-in-out;
  }

  &:hover {
    background: var(${UI.COLOR_PAPER});

    ${BodyText},
    ${StyledArrowUpRight} {
      color: inherit;
      stroke: var(${UI.COLOR_TEXT_PAPER});
      transform: rotate(0);
    }

    ${StyledArrowUpRight} {
      transform: rotate(45deg);
    }
  }
`
const Header = styled.h2`
  font-weight: 600;
  font-size: 16px;
  margin: 0;
`

const LinkOutToBridge = styled(ExternalLink)`
  align-items: center;
  border-radius: 8px;
  color: inherit;
  display: flex;
  font-size: 16px;
  justify-content: space-between;
  padding: 6px 8px;
  margin-right: 12px;
  text-decoration: none !important;
  width: 100%;
`

function shouldShowAlert(chainId: number | undefined): chainId is NetworkAlertChains {
  return Boolean(chainId && SHOULD_SHOW_ALERT[chainId as unknown as NetworkAlertChains])
}

export function NetworkAlert() {
  const { active: isActive, chainId } = useWalletInfo()
  const [darkMode] = useDarkModeManager()

  const theme = useTheme()

  if (!shouldShowAlert(chainId) || !isActive) {
    return null
  }

  const { label, logoUrl, bridge } = getChainInfo(chainId)
  const textColor = theme.text1

  return bridge ? (
    <RootWrapper>
      <ContentWrapper chainId={chainId} darkMode={darkMode} logoUrl={logoUrl}>
        <LinkOutToBridge href={bridge}>
          <BodyText color={textColor}>
            <L2Icon src={logoUrl} />
            <AutoRow>
              <Header>
                <Trans>{label} token bridge</Trans>
              </Header>
              <HideSmall>
                <Trans>Deposit tokens to the {label} network.</Trans>
              </HideSmall>
            </AutoRow>
          </BodyText>
          <StyledArrowUpRight color={textColor} />
        </LinkOutToBridge>
      </ContentWrapper>
    </RootWrapper>
  ) : null
}
