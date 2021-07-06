import { TypedUseSelectorHook, useSelector } from 'react-redux'
import { AppState } from 'state'

export * from '@src/state/hooks'

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector
