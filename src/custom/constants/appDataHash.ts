import { environmentName } from 'utils/environments'

const DEFAULT_APP_DATA = '0x0000000000000000000000000000000000000000000000000000000000000000'

export function getAppDataHash(): string {
  switch (environmentName) {
    case 'production':
      return process.env.REACT_APP_DATA_HASH_PRODUCTION || DEFAULT_APP_DATA

    case 'ens':
      return process.env.REACT_APP_DATA_HASH_ENS || DEFAULT_APP_DATA

    case 'barn':
      return process.env.REACT_APP_DATA_HASH_BARN || DEFAULT_APP_DATA

    case 'staging':
      return process.env.REACT_APP_DATA_HASH_STAGING || DEFAULT_APP_DATA

    case 'pr':
      return process.env.REACT_APP_DATA_HASH_PR || DEFAULT_APP_DATA

    case 'development':
      return process.env.REACT_APP_DATA_HASH_DEVELOPMENT || DEFAULT_APP_DATA

    case 'local':
      return process.env.REACT_APP_DATA_HASH_LOCAL || DEFAULT_APP_DATA

    default:
      break
  }
  return 'no'
}
