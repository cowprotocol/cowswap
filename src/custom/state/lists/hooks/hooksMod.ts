import { useSelector } from 'react-redux'
import { AppState } from '../..'

export function useFullLists() {
  return useSelector<AppState, AppState['lists']>(state => state.lists)
}
