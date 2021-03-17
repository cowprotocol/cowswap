import reducer, { ListsStateByNetwork as ListsState } from './reducerMod'
export * from '@src/state/lists/reducer'
// getting a TS error if i don't alias here
// https://github.com/microsoft/TypeScript/issues/28481
export type ListsStateByNetwork = ListsState
export default reducer
