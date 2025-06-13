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
  min-width: 155px;
  min-height: 104px;
  padding: 10px;
  margin: 0;
`

const CopyHelperWrapper = styled(CopyHelper)`
  padding: 12px;
  border-radius: 6px;

  &:hover {
    background: var(${UI.COLOR_PAPER});
  }
`

const ExtLinkWrapper = styled(ExtLink)`
  padding: 12px;
  border-radius: 6px;
  width: 100%;
  display: flex;
  align-items: center;
  text-decoration: none;
  font-size: 0.825rem;

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

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
