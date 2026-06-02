import { BASE_SELECT_OPTION_HEIGHT } from '../../../ui/inputs/Select/base/BaseSelectInput.styles'

import type { TokenListScope } from './TokensSectionForm.utils'

const ITEM_PADDING_TOP = 8

export const TOKEN_LIST_MENU_PROPS = {
  PaperProps: {
    style: {
      maxHeight: BASE_SELECT_OPTION_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
}

export const TOKEN_LIST_SELECT_CONFIG: { label: string; scope: TokenListScope }[] = [
  { label: 'Active Token Lists', scope: 'enabled' },
  { label: 'Sell Token Lists', scope: 'enabledForSell' },
  { label: 'Buy Token Lists', scope: 'enabledForBuy' },
]
