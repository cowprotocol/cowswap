type ApiActionType = 'update'

export interface MetadataApiErrorObject {
  errorType: MetadataApiErrorCodes
  description: string
}

// TODO: Validate/Update error code when the API is updated
export enum MetadataApiErrorCodes {
  AddressNotFound = 'AddressNotFound',
  UNHANDLED_GET_ERROR = 'UNHANDLED_GET_ERROR',
  UNHANDLED_UPLOAD_ERROR = 'UNHANDLED_UPLOAD_ERROR',
}

export enum MetadataApiErrorCodeDetails {
  AddressNotFound = "The referral address doesn't exist",
  UNHANDLED_GET_ERROR = 'Metadata AppDoc fetch failed. This may be due to a server or network connectivity issue. Please try again later.',
  UNHANDLED_UPLOAD_ERROR = 'The metadata object could not be saved',
}

function _mapActionToErrorDetail(action?: ApiActionType) {
  switch (action) {
    case 'update':
      return MetadataApiErrorCodeDetails.UNHANDLED_UPLOAD_ERROR
    default:
      console.error(
        '[OperatorError::_mapActionToErrorDetails] Uncaught error mapping error action type to server error. Please try again later.'
      )
      return 'Something failed. Please try again later.'
  }
}

export default class MetadataError extends Error {
  name = 'MetadataError'
  type: MetadataApiErrorCodes
  description: MetadataApiErrorObject['description']

  // Status 400 errors
  static apiErrorDetails = MetadataApiErrorCodeDetails

  public static async getErrorMessage(response: Response, action: ApiActionType) {
    try {
      const orderPostError: MetadataApiErrorObject = await response.json()

      if (orderPostError.errorType) {
        const errorMessage = MetadataError.apiErrorDetails[orderPostError.errorType]
        // shouldn't fall through as this error constructor expects the error code to exist but just in case
        return errorMessage || orderPostError.errorType
      } else {
        console.error('Unknown reason for bad order submission', orderPostError)
        return orderPostError.description
      }
    } catch (error) {
      console.error('Error handling a 400 error. Likely a problem deserializing the JSON response')
      return _mapActionToErrorDetail(action)
    }
  }
  static async getErrorFromStatusCode(response: Response, action: 'update') {
    switch (response.status) {
      case 400:
        return this.getErrorMessage(response, action)

      case 500:
      default:
        console.error(
          `[MetadataError::getErrorFromStatusCode] Error updating the metadata object, status code:`,
          response.status || 'unknown'
        )
        return `Error updating the metadata object`
    }
  }
  constructor(apiError: MetadataApiErrorObject) {
    super(apiError.description)

    this.type = apiError.errorType
    this.description = apiError.description
    this.message = MetadataApiErrorCodeDetails[apiError.errorType]
  }
}

export function isValidMetadataError(error: any): error is MetadataError {
  return error instanceof MetadataError
}
