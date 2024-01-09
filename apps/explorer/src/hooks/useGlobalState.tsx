import React, { useContext, useReducer } from 'react'
import { AnyAction } from 'combine-reducers'

const GlobalStateContext = React.createContext({})

export function withGlobalContext<P, State>(
  WrappedComponent: React.FC<P>,
  initialStateFunc: () => State,
  reducer: React.Reducer<State, AnyAction>,
): (props: P) => JSX.Element {
  return function WrappedComponentWithGlobalState(props: P): JSX.Element {
    const [state, dispatch] = useReducer(reducer, initialStateFunc())

    return (
      <GlobalStateContext.Provider value={[state, dispatch]}>
        <WrappedComponent {...props} />
      </GlobalStateContext.Provider>
    )
  }
}

function useGlobalState<State>(): [globalState: State, dispatch: React.Dispatch<AnyAction>] {
  return useContext(GlobalStateContext) as [State, React.Dispatch<AnyAction>]
}

export default useGlobalState
