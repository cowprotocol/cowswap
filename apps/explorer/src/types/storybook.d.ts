import { Story } from '@storybook/react/types-6-0'
import { AnyFunction } from 'types'

type Bind = AnyFunction['bind']
declare module '@storybook/addons' {
  export interface BaseStory<Args> {
    bind(thisArg: Parameters<Bind>[0]): Story<Args>
    bind(...args: Parameters<Bind>): ReturnType<Bind>
  }
}
