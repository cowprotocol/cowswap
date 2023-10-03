import { useAtomValue } from 'jotai'
import { useState } from 'react'

import { useAllTokenListsInfo, useAllTokens, useFavouriteTokens, useUserAddedTokens } from '@cowprotocol/tokens'

import { CowModal } from 'common/pure/Modal'

import { useToggleTokenSelectWidget } from '../../hooks/useToggleTokenSelectWidget'
import { selectTokenWidgetAtom } from '../../state/selectTokenWidgetAtom'
import { ManageListsAndTokens } from '../ManageListsAndTokens'
import { SelectTokenModal } from '../SelectTokenModal'

// TODO: remove mock
const balancesMock = {}

export function SelectTokenWidget() {
  const { open, onSelectToken } = useAtomValue(selectTokenWidgetAtom)
  const [isManageWidgetOpen, setIsManageWidgetOpen] = useState(false)

  const toggleTokenSelectWidget = useToggleTokenSelectWidget()

  const allTokens = useAllTokens()
  const favouriteTokens = useFavouriteTokens()
  const userAddedTokens = useUserAddedTokens()
  const allTokenLists = useAllTokenListsInfo()

  if (!onSelectToken) return null

  return (
    <CowModal isOpen={open} onDismiss={toggleTokenSelectWidget}>
      {isManageWidgetOpen ? (
        <ManageListsAndTokens
          lists={allTokenLists}
          customTokens={userAddedTokens}
          onDismiss={toggleTokenSelectWidget}
          onBack={() => setIsManageWidgetOpen(false)}
        />
      ) : (
        <SelectTokenModal
          allTokens={allTokens}
          favouriteTokens={favouriteTokens}
          balances={balancesMock}
          onSelectToken={onSelectToken}
          onDismiss={toggleTokenSelectWidget}
          onOpenManageWidget={() => setIsManageWidgetOpen(true)}
        ></SelectTokenModal>
      )}
    </CowModal>
  )
}
