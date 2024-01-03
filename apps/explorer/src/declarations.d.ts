/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'console-feed' {
  import { AnyFunction } from 'types'

  export type Methods =
    | 'log'
    | 'debug'
    | 'info'
    | 'warn'
    | 'error'
    | 'table'
    | 'clear'
    | 'time'
    | 'timeEnd'
    | 'count'
    | 'assert'

  export interface LogMessage {
    method: Methods
    data?: any[]
  }
  export interface Payload extends LogMessage {
    id: string
  }

  export interface Message extends Payload {
    data: any[]
  }

  export type Variants = 'light' | 'dark'

  export interface Styles {
    // Log icons
    LOG_ICON_WIDTH?: string | number
    LOG_ICON_HEIGHT?: string | number

    // Log colors
    // LOG_ICON => CSS background-image property
    LOG_COLOR?: string
    LOG_ICON?: string
    LOG_BACKGROUND?: string
    LOG_ICON_BACKGROUND_SIZE?: string
    LOG_BORDER?: string

    LOG_INFO_COLOR?: string
    LOG_INFO_ICON?: string
    LOG_INFO_BACKGROUND?: string
    LOG_INFO_BORDER?: string

    LOG_COMMAND_COLOR?: string
    LOG_COMMAND_ICON?: string
    LOG_COMMAND_BACKGROUND?: string
    LOG_COMMAND_BORDER?: string

    LOG_RESULT_COLOR?: string
    LOG_RESULT_ICON?: string
    LOG_RESULT_BACKGROUND?: string
    LOG_RESULT_BORDER?: string

    LOG_WARN_COLOR?: string
    LOG_WARN_ICON?: string
    LOG_WARN_BACKGROUND?: string
    LOG_WARN_BORDER?: string

    LOG_ERROR_COLOR?: string
    LOG_ERROR_ICON?: string
    LOG_ERROR_BACKGROUND?: string
    LOG_ERROR_BORDER?: string

    // Fonts
    BASE_FONT_FAMILY?: any
    BASE_FONT_SIZE?: any
    BASE_LINE_HEIGHT?: any

    // Spacing
    PADDING?: string

    // react-inspector
    BASE_BACKGROUND_COLOR?: any
    BASE_COLOR?: any

    OBJECT_NAME_COLOR?: any
    OBJECT_VALUE_NULL_COLOR?: any
    OBJECT_VALUE_UNDEFINED_COLOR?: any
    OBJECT_VALUE_REGEXP_COLOR?: any
    OBJECT_VALUE_STRING_COLOR?: any
    OBJECT_VALUE_SYMBOL_COLOR?: any
    OBJECT_VALUE_NUMBER_COLOR?: any
    OBJECT_VALUE_BOOLEAN_COLOR?: any
    OBJECT_VALUE_FUNCTION_KEYWORD_COLOR?: any

    HTML_TAG_COLOR?: any
    HTML_TAGNAME_COLOR?: any
    HTML_TAGNAME_TEXT_TRANSFORM?: any
    HTML_ATTRIBUTE_NAME_COLOR?: any
    HTML_ATTRIBUTE_VALUE_COLOR?: any
    HTML_COMMENT_COLOR?: any
    HTML_DOCTYPE_COLOR?: any

    ARROW_COLOR?: any
    ARROW_MARGIN_RIGHT?: any
    ARROW_FONT_SIZE?: any

    TREENODE_FONT_FAMILY?: any
    TREENODE_FONT_SIZE?: any
    TREENODE_LINE_HEIGHT?: any
    TREENODE_PADDING_LEFT?: any

    TABLE_BORDER_COLOR?: any
    TABLE_TH_BACKGROUND_COLOR?: any
    TABLE_TH_HOVER_COLOR?: any
    TABLE_SORT_ICON_COLOR?: any
    TABLE_DATA_BACKGROUND_IMAGE?: any
    TABLE_DATA_BACKGROUND_SIZE?: any

    [style: string]: any
  }

  interface Props {
    logs: Message[]
    variant?: Variants
    styles?: Styles
    filter?: Methods[]
    searchKeywords?: string
    logFilter?: AnyFunction
  }

  // export type Console = new () => React.PureComponent<Props, any>
  class ConsoleComponent extends React.PureComponent<Props, any> {}
  export { ConsoleComponent as Console }

  export interface Storage {
    pointers: {
      [name: string]: AnyFunction
    }
    src: any
  }

  export interface HookedConsole extends Console {
    feed: Storage
  }

  export type Callback = (encoded: any, message: LogMessage) => void

  export function Hook(console: Console, callback: Callback, encode = true): HookedConsole

  export function Unhook(console: HookedConsole): boolean

  export function Encode<T>(data: any): T

  export function Decode(data: any): Message
}

declare module '@walletconnect/web3-provider/*' // allows to import '@walletconnect/web3-provider/dist/umd/index.min.js'
declare module '*.otf'
declare module '*.woff'
declare module '*.woff2'
declare module '*.md' {
  export const react: React.FC
}

declare module 'eth-json-rpc-middleware/*'

declare module 'cytoscape-no-overlap'
declare module 'cytoscape-fcose'
declare module 'cytoscape-klay'
