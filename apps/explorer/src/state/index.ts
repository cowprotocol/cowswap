import { Reducer, AnyAction, Action } from 'combine-reducers'
import { Theme } from 'theme/types'

export interface Actions<T, P> {
  type: T
  payload: P
}

export type ActionCreator<T, P> = (payload: P) => Actions<T, P>

export type ReducerCreator<S, A> = (state: S, action: A) => S

export interface GlobalState {
  theme: Theme
}

/**********************************
 * Initial Global State
 *
 * Sets app's initial global state
 * make sure the name of the state key(s) is/are the same as the reducer key(s) below
 */

export const GLOBAL_INITIAL_STATE = (): GlobalState => ({ theme: Theme.DARK })

/**********************************
 * Side Effect after a reducer has run its course
 *
 * Allows to post-process state/slice of state
 * to log, save to Storage, etc.
 */

export const addSideEffect = <S, A extends Action = AnyAction>(
  reducer: Reducer<S, A>,
  sideEffect: (newState: S, action: A) => void,
): Reducer<S, A> => {
  return (state: S, action: A): S => {
    const newState = reducer(state, action)

    sideEffect(newState, action)

    return newState
  }
}

/**********************************
 * Root Reducer
 *
 * make sure the name of the Reducer key is the same as the state key you'd like from src/App
 */
export const globalRootReducer = (state: GlobalState = GLOBAL_INITIAL_STATE()): GlobalState => state
