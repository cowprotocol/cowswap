import { Actions } from 'state'
import { Theme } from 'theme'
import { setStorageItem } from 'utils'

export type ThemeState = Theme

type ActionTypes = 'UPDATE_THEME'

type UpdateThemeAction = Actions<ActionTypes, ThemeState>

export const updateTheme = (payload: ThemeState): UpdateThemeAction => ({
  type: 'UPDATE_THEME',
  payload,
})
const USER_LOCAL_STORAGE_KEY = 'USER_THEME'
export const persistTheme = (themeState: ThemeState): void => {
  setStorageItem(USER_LOCAL_STORAGE_KEY, themeState)
}

export const INITIAL_THEME_STATE: ThemeState = Theme.DARK

export function reducer(state: ThemeState, action: UpdateThemeAction): ThemeState {
  const { type, payload } = action
  switch (type) {
    case 'UPDATE_THEME':
      return payload

    default:
      return state
  }
}

// ******** SIDE EFFECT

export async function sideEffect(state: ThemeState, action: UpdateThemeAction): Promise<void> {
  switch (action.type) {
    case 'UPDATE_THEME':
      persistTheme(state)
  }
}
