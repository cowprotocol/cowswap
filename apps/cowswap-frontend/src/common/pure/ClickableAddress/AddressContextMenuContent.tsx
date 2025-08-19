import { ReactNode, RefObject } from 'react'

import { UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
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
  justify-content: normal;

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
  ref?: RefObject<HTMLDivElement | null>
}

export function AddressContextMenuContent({ ref, address, target }: ContentProps): ReactNode {
  return (
    <Box ref={ref}>
      <CopyHelperWrapper toCopy={address} copyIconWidth="100%">
        <Text>
          <Trans>Copy address</Trans>
        </Text>
      </CopyHelperWrapper>
      <ExtLinkWrapper href={target} target="_blank">
        <Link2 size={16} />
        <Text>
          <Trans>View details</Trans>
        </Text>
      </ExtLinkWrapper>
    </Box>
  )
}
