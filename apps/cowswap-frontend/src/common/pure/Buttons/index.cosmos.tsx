import { ReactNode } from 'react'

import {
  BackButton,
  ButtonConfirmed,
  ButtonEmpty,
  ButtonError,
  ButtonOutlined,
  ButtonPrimary,
  ButtonSecondary,
  ButtonSecondaryAlt,
  ButtonStar,
  ContextMenu,
  ContextMenuButton,
  ContextMenuCopyButton,
  ContextMenuItemButton,
  ContextMenuList,
  FancyButton,
  LinkStyledButton,
} from '@cowprotocol/ui'

import { MoreVertical } from 'react-feather'
import styled from 'styled-components/macro'

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 320px;
`

function ContextMenuFixture(): ReactNode {
  return (
    <Stack>
      <ContextMenu>
        <ContextMenuButton>
          <MoreVertical size={16} />
        </ContextMenuButton>
        <ContextMenuList>
          <ContextMenuItemButton onClick={() => alert('ContextMenuItemButton clicked')}>
            ContextMenuItemButton
          </ContextMenuItemButton>
          <ContextMenuCopyButton address="0x0000000000000000000000000000000000000001" />
        </ContextMenuList>
      </ContextMenu>

      <ContextMenuItemButton onClick={() => alert('Standalone ContextMenuItemButton clicked')}>
        Standalone ContextMenuItemButton
      </ContextMenuItemButton>
    </Stack>
  )
}

const Fixtures = {
  ButtonPrimary: () => <ButtonPrimary onClick={() => alert('ButtonPrimary clicked')}>ButtonPrimary</ButtonPrimary>,
  ButtonSecondary: () => (
    <ButtonSecondary onClick={() => alert('ButtonSecondary clicked')}>ButtonSecondary</ButtonSecondary>
  ),
  ButtonSecondaryAlt: () => (
    <ButtonSecondaryAlt onClick={() => alert('ButtonSecondaryAlt clicked')}>ButtonSecondaryAlt</ButtonSecondaryAlt>
  ),
  ButtonOutlined: () => <ButtonOutlined onClick={() => alert('ButtonOutlined clicked')}>ButtonOutlined</ButtonOutlined>,
  ButtonEmpty: () => <ButtonEmpty onClick={() => alert('ButtonEmpty clicked')}>ButtonEmpty</ButtonEmpty>,
  ButtonError: () => (
    <Stack>
      <ButtonError error={false}>ButtonError (error=false)</ButtonError>
      <ButtonError error={true}>ButtonError (error=true)</ButtonError>
    </Stack>
  ),
  ButtonConfirmed: () => (
    <Stack>
      <ButtonConfirmed confirmed={false}>ButtonConfirmed (confirmed=false)</ButtonConfirmed>
      <ButtonConfirmed confirmed={true}>ButtonConfirmed (confirmed=true)</ButtonConfirmed>
    </Stack>
  ),
  ButtonStar: () => <ButtonStar stroke="currentColor" fill="gold" size="20px" onClick={() => alert('star clicked')} />,
  LinkStyledButton: () => (
    <LinkStyledButton onClick={() => alert('LinkStyledButton clicked')}>LinkStyledButton</LinkStyledButton>
  ),
  BackButton: () => <BackButton onClick={() => alert('BackButton clicked')} />,
  FancyButton: () => <FancyButton onClick={() => alert('FancyButton clicked')}>FancyButton</FancyButton>,
  ContextMenuButton: () => <ContextMenuFixture />,
  ContextMenuItemButton: () => (
    <ContextMenuItemButton onClick={() => alert('ContextMenuItemButton clicked')}>
      ContextMenuItemButton
    </ContextMenuItemButton>
  ),
  ContextMenuCopyButton: () => <ContextMenuCopyButton address="0x0000000000000000000000000000000000000001" />,
}

export default Fixtures
