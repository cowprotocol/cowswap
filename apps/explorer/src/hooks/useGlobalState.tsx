import React, { useContext, useReducer } from 'react'

import { AnyAction } from 'combine-reducers'

const GlobalStateContext = React.createContext({})

export function withGlobalContext<P extends JSX.IntrinsicAttributes, State>(
  WrappedComponent: React.FC<P>,
  initialStateFunc: () => State,
  reducer: React.Reducer<State, AnyAction>
): (props: P) => React.ReactNode {
  return function WrappedComponentWithGlobalState(props: P): React.ReactNode {
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
