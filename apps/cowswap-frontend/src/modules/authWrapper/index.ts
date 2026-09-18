export type {
  AuthWrapperOrderAuthorization,
  AuthWrapperOrderToSign,
  CowAuthWrapperConfig,
  ResolvedAuthWrapper,
} from './authWrapper.types'

export { useAuthWrapper } from './hooks/useAuthWrapper'

export { AuthWrapperConfigError, resolveAuthWrapper } from './utils/resolveAuthWrapper'
export { computeOrderAppData } from './utils/computeOrderAppData'
export { buildWrapperOrderTypedData } from './utils/buildWrapperOrderTypedData'

export { AuthWrapperSignatureError, signAuthWrapperOrder } from './services/signAuthWrapperOrder'
export {
  buildAuthWrappedOrderBody,
  postAuthWrappedOrder,
  type AuthWrappedOrderCreation,
  type AuthWrappedOrderResult,
} from './services/postAuthWrappedOrder'
