export class IframeSafeSdkBridge {
  forwardSdkMessage: (event: MessageEvent<unknown>) => void

  constructor(
    private appWindow: Window,
    private iframeWidow: Window,
  ) {
    this.forwardSdkMessage = (event: MessageEvent<unknown>) => {
      if (!isSafeMessage(event.data)) {
        return
      }

      if (typeof window !== 'undefined' && event.origin === window.location.origin) {
        return
      }

      if (isSafeMessageRequest(event.data)) {
        this.appWindow.parent.postMessage(event.data, '*')
      } else if (isSafeMessageResponse(event.data)) {
        this.iframeWidow.postMessage(event.data, '*')
      }
    }

    this.startListening()
  }

  private startListening(): void {
    this.appWindow.addEventListener('message', this.forwardSdkMessage)
  }

  public stopListening(): void {
    this.appWindow.removeEventListener('message', this.forwardSdkMessage)
  }
}

function isSafeMessage(obj: unknown): obj is SafeMessage {
  return typeof obj === 'object' && obj !== null && 'id' in obj && typeof obj.id === 'string'
}

function isSafeMessageRequest(message: SafeMessage): message is SafeMessageRequest {
  return (
    'method' in message &&
    typeof message.method === 'string' &&
    'params' in message &&
    'env' in message &&
    typeof message.env === 'object' &&
    message.env !== null &&
    'sdkVersion' in message.env
  )
}

function isSafeMessageResponse(message: SafeMessage): message is SafeMessageResponse {
  return (
    'success' in message &&
    typeof message.success === 'boolean' &&
    'version' in message &&
    typeof message.version === 'string'
  )
}

interface SafeMessage {
  id: string
}

interface SafeMessageRequest extends SafeMessage {
  method: string
  params: unknown
  env: {
    sdkVersion: string
  }
}

interface SafeMessageResponse extends SafeMessage {
  id: string
  success: boolean
  version: string
}
