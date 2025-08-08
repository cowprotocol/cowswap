import { ReactNode } from 'react'

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
  font-size: 13px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

const CopyHelperWrapper = styled(CopyHelper)`
  padding: 12px;
  border-radius: 6px;
  justify-content: normal;

  &:hover {
    background: var(${UI.COLOR_PAPER_DARKER});
  }
`

const ExtLinkWrapper = styled(ExtLink)`
  padding: 12px;
  border-radius: 6px;
  width: 100%;
  display: flex;
  align-items: center;
  text-decoration: none;
  font-size: inherit;
  color: inherit;

  &:hover,
  &:active,
  &:focus {
    color: var(${UI.COLOR_TEXT});
    background: var(${UI.COLOR_PAPER_DARKER});
    text-decoration: none;
  }
`

const Text = styled.span`
  margin: 0 0 0 8px;
`

interface ContentProps {
  address: string
  target: string
}

export function AddressContextMenuContent({ address, target }: ContentProps): ReactNode {
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
