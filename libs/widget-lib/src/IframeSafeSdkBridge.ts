export class IframeSafeSdkBridge {
  forwardSdkMessage: (event: MessageEvent<unknown>) => void

  constructor(
    private appWindow: Window,
    private iframeWindow: Window,
    private iframeOrigin: string,
    private parentOrigin: string | null,
  ) {
    this.forwardSdkMessage = (event: MessageEvent<unknown>) => {
      if (!isSafeMessage(event.data)) {
        return
      }

      if (isSafeMessageRequest(event.data)) {
        if (
          event.source !== this.iframeWindow ||
          event.origin !== this.iframeOrigin ||
          !this.parentOrigin ||
          this.appWindow.parent === this.appWindow
        ) {
          return
        }

        this.appWindow.parent.postMessage(event.data, this.parentOrigin)
      } else if (isSafeMessageResponse(event.data)) {
        if (
          event.source !== this.appWindow.parent ||
          event.origin !== this.parentOrigin ||
          this.appWindow.parent === this.appWindow
        ) {
          return
        }

        this.iframeWindow.postMessage(event.data, this.iframeOrigin)
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

export function getTrustedParentOrigin(appWindow: Window): string | null {
  if (appWindow.parent === appWindow || !appWindow.document.referrer) {
    return null
  }

  try {
    return new URL(appWindow.document.referrer).origin
  } catch {
    return null
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
