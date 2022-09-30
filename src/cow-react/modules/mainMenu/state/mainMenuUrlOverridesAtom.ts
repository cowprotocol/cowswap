import { atom } from 'jotai'
import { MainMenuItemId } from '../constants/mainMenu'

/**
 * key - BasicMenuLink.id
 * value - override for BasicMenuLink.url
 * For some cases we need to override url in the main menu.
 * For example: LIMIT_ORDER = '/:chainId?/limit-orders/:inputCurrencyId?/:outputCurrencyId?'
 * @see `src/cow-react/modules/mainMenu/constants/mainMenu.ts#MAIN_MENU`
 */
export type MainMenuUrlOverrides = { [key in keyof Partial<typeof MainMenuItemId>]: string }

export const mainMenuUrlOverridesAtom = atom<MainMenuUrlOverrides>({})
