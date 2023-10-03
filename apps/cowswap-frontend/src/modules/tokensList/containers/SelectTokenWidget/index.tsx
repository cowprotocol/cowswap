import { useAtomValue } from 'jotai'

import { useAllTokens, useFavouriteTokens } from '@cowprotocol/tokens'

import { CowModal } from 'common/pure/Modal'

import { useToggleTokenSelectWidget } from '../../hooks/useToggleTokenSelectWidget'
import { selectTokenWidgetAtom } from '../../state/selectTokenWidgetAtom'
import { SelectTokenModal } from '../SelectTokenModal'

// TODO: remove mock
const balancesMock = {}

export function SelectTokenWidget() {
  const { open, onSelectToken } = useAtomValue(selectTokenWidgetAtom)
  const toggleTokenSelectWidget = useToggleTokenSelectWidget()

  const allTokens = useAllTokens()
  const favouriteTokens = useFavouriteTokens()

  if (!onSelectToken) return null

  return (
    <CowModal isOpen={open} onDismiss={toggleTokenSelectWidget}>
      <SelectTokenModal
        allTokens={allTokens}
        favouriteTokens={favouriteTokens}
        balances={balancesMock}
        onSelectToken={onSelectToken}
      ></SelectTokenModal>
    </CowModal>
  )
}
