import EtherscanImage from '@cowprotocol/assets/cow-swap/etherscan-icon.svg'
import { UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import CopyHelper from 'legacy/components/Copy'

import { ExtLink } from 'pages/Account/styled'

const Box = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  gap: 12px;
  min-width: 124px;
`

const CopyHelperWrapper = styled(CopyHelper)`
  opacity: 0.75;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }
`

const ExtLinkWrapper = styled(ExtLink)`
  padding-left: 6px;
  display: flex;
  align-items: center;
  text-decoration: none;
  font-size: 0.825rem;
  opacity: 0.75;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover,
  &:active,
  &:focus {
    text-decoration: none;
    opacity: 1;
  }
`

const ExplorerIcon = styled(SVG)`
  margin: 0 0 0 1px;
  > path {
    fill: var(${UI.COLOR_TEXT});
  }
`

const Text = styled.span`
  margin: 0 0 0 8px;
`

interface ContentProps {
  address: string
  target: string
}

export function Content({ address, target }: ContentProps) {
  return (
    <Box>
      <CopyHelperWrapper toCopy={address}>
        <Text>Copy address</Text>
      </CopyHelperWrapper>
      <ExtLinkWrapper href={target} target="_blank">
        <ExplorerIcon
          src={EtherscanImage}
          width={16}
          height={16}
          title="View token contract"
          description="View token contract"
        />
        <Text>View details</Text>
      </ExtLinkWrapper>
    </Box>
  )
}
