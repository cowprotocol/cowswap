import { TextProps as TextPropsOriginal } from 'rebass'

export type TextProps = Omit<TextPropsOriginal, 'css'> & { override?: boolean }
