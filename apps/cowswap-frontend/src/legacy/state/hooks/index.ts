import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

import { AppDispatch, AppState } from '../index'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector
