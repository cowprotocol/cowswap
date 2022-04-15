// import useActiveWeb3React from 'hooks/useActiveWeb3React'
// import useDebounce from 'hooks/useDebounce'
// import useIsWindowVisible from 'hooks/useIsWindowVisible'
// import { useCallback, useEffect, useRef, useState } from 'react'
// // import { api, CHAIN_TAG } from 'state/data/enhanced'
// import { useAppDispatch, useAppSelector } from 'state/hooks'
// import { supportedChainId } from 'utils/supportedChainId'
//
// import { updateChainId } from 'state/application/reducer'
//
// // MOD imports
// import { useBlockNumber } from '@src/state/application/hooks'
// import ms from 'ms.macro'
// import { CHAIN_INFO } from 'constants/chains'
// import { switchToNetwork } from 'utils/switchToNetwork'
//
// /* function useQueryCacheInvalidator() {
//   const dispatch = useAppDispatch()
//
//   // subscribe to `chainId` changes in the redux store rather than Web3
//   // this will ensure that when `invalidateTags` is called, the latest
//   // `chainId` is available in redux to build the subgraph url
//   const chainId = useAppSelector((state) => state.application.chainId)
//
//   useEffect(() => {
//     dispatch(api.util.invalidateTags([CHAIN_TAG]))
//   }, [chainId, dispatch])
// } */
//
// export default function Updater(): null {
//   const { chainId, library } = useActiveWeb3React()
//   const dispatch = useAppDispatch()
//   const windowVisible = useIsWindowVisible()
//
//   const [activeChainId, setActiveChainId] = useState(chainId)
//
//   // useQueryCacheInvalidator()
//
//   useEffect(() => {
//     if (library && chainId && windowVisible) {
//       setActiveChainId(chainId)
//     }
//   }, [dispatch, chainId, library, windowVisible])
//
//   const debouncedChainId = useDebounce(activeChainId, 100)
//
//   useEffect(() => {
//     const chainId = debouncedChainId ? supportedChainId(debouncedChainId) ?? null : null
//     dispatch(updateChainId({ chainId }))
//   }, [dispatch, debouncedChainId])
//
//   return null
// }
// TODO: is this still needed? Maybe not, could remove it entirely
import updater from '@src/state/application/updater'
export default updater
