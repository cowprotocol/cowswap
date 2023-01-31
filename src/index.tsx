import './cow-react'

// import '@reach/dialog/styles.css'
// import 'inter-ui'
// import 'polyfills'
// import 'components/analytics'

// import { BlockNumberProvider } from 'lib/hooks/useBlockNumber'
// import { MulticallUpdater } from 'lib/state/multicall'
// import { StrictMode } from 'react'
// import ReactDOM from 'react-dom'
// import { Provider } from 'react-redux'
// import { HashRouter } from 'react-router-dom'

// import Blocklist from 'components/Blocklist'
// import Web3Provider from 'components/Web3Provider'
// import { LanguageProvider } from 'i18n'
// import App from 'pages/App'
// import * as serviceWorkerRegistration from 'serviceWorkerRegistration'
// import store from 'state'
// import ApplicationUpdater from 'state/application/updater'
// import ListsUpdater from 'state/lists/updater'
// import LogsUpdater from 'state/logs/updater'
// import TransactionUpdater from 'state/transactions/updater'
// import UserUpdater from 'state/user/updater'
// import GnosisSafeUpdater from 'state/gnosisSafe/updater'
// import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from 'theme'
// import RadialGradientByChainUpdater from 'theme/RadialGradientByChainUpdater'

// import EnhancedTransactionUpdater from 'state/enhancedTransactions/updater'
// import FeesUpdater from 'state/price/updater'
// import GasUpdater from 'state/gas/updater'
// import SentryUpdater from 'state/sentry/updater'

// import {
//   GpOrdersUpdater,
//   CancelledOrdersUpdater,
//   PendingOrdersUpdater,
//   UnfillableOrdersUpdater,
// } from 'state/orders/updaters'
// // import { EventUpdater } from 'state/orders/mocks'
// import AppziButton from 'components/AppziButton'
// import { nodeRemoveChildFix } from 'utils/node'
// import { Provider as AtomProvider } from 'jotai'

// import Popups from 'components/Popups'
// import { UploadToIpfsUpdater } from 'state/appData/updater'
// import { GasPriceStrategyUpdater } from 'state/gas/gas-price-strategy-updater'

// // Node removeChild hackaround
// // based on: https://github.com/facebook/react/issues/11538#issuecomment-417504600
// nodeRemoveChildFix()

// if (!!window.ethereum) {
//   window.ethereum.autoRefreshOnNetworkChange = false
// }

// function Updaters() {
//   return (
//     <>
//       <RadialGradientByChainUpdater />
//       <ListsUpdater />
//       <UserUpdater />
//       <ApplicationUpdater />
//       <TransactionUpdater />
//       <EnhancedTransactionUpdater />
//       <MulticallUpdater />
//       <PendingOrdersUpdater />
//       <CancelledOrdersUpdater />
//       <FeesUpdater />
//       <UnfillableOrdersUpdater />
//       <GpOrdersUpdater />
//       <GasUpdater />
//       <LogsUpdater />
//       <SentryUpdater />
//       <UploadToIpfsUpdater />
//       <GnosisSafeUpdater />
//       <GasPriceStrategyUpdater />
//     </>
//   )
// }

// ReactDOM.render(
//   <StrictMode>
//     <FixedGlobalStyle />
//     <Provider store={store}>
//       <AtomProvider>
//         <HashRouter>
//           <LanguageProvider>
//             <Web3Provider>
//               <Blocklist>
//                 <BlockNumberProvider>
//                   <Updaters />
//                   <ThemeProvider>
//                     <ThemedGlobalStyle />
//                     <Popups />
//                     <AppziButton />
//                     <App />
//                   </ThemeProvider>
//                 </BlockNumberProvider>
//               </Blocklist>
//             </Web3Provider>
//           </LanguageProvider>
//         </HashRouter>
//       </AtomProvider>
//     </Provider>
//   </StrictMode>,
//   document.getElementById('root')
// )

// if (process.env.REACT_APP_SERVICE_WORKER !== 'false') {
//   serviceWorkerRegistration.register()
// }
