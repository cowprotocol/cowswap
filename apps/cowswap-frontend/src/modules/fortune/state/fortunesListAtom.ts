import { atom } from 'jotai'
import { loadable } from 'jotai/utils'

import { RAW_CODE_LINK } from '@cowprotocol/common-const'

import { FortuneItem } from 'modules/fortune/types'

const FILE_PATH = '/configuration/config/fortunes.json'

const fortuneFetchAtom = atom(async () => {
  const fortunes: FortuneItem[] = await fetch(RAW_CODE_LINK + FILE_PATH).then((res) => res.json())

  return fortunes
})

export const fortunesListAtom = loadable(fortuneFetchAtom)
