import { UI } from '@cowprotocol/ui'

import { Link2 } from 'react-feather'
import styled from 'styled-components/macro'

import CopyHelper from 'legacy/components/Copy'

import { ExtLink } from 'pages/Account/styled'

const Box = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  gap: 4px;
  min-width: 128px;
  padding: 0;
  margin: 0;
`

const CopyHelperWrapper = styled(CopyHelper)`
  padding: 6px 8px;
  border-radius: 0;

  &:hover {
    background: var(${UI.COLOR_PAPER});
  }
`

const ExtLinkWrapper = styled(ExtLink)`
  padding: 6px 8px;
  width: 100%;
  display: flex;
  align-items: center;
  text-decoration: none;
  font-size: 0.825rem;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover,
  &:active,
  &:focus {
    color: var(${UI.COLOR_TEXT});
    background: var(${UI.COLOR_PAPER});
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
      <CopyHelperWrapper toCopy={address} copyIconWidth="100%">
        <Text>Copy address</Text>
      </CopyHelperWrapper>
      <ExtLinkWrapper href={target} target="_blank">
        <Link2 size={16} />
        <Text>View details</Text>
      </ExtLinkWrapper>
    </Box>
  )
}
