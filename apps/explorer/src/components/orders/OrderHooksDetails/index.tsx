import React, { ReactElement } from 'react'

import { latest } from '@cowprotocol/app-data'
import { HookToDappMatch, matchHooksToDappsRegistry } from '@cowprotocol/hook-dapp-lib'

import { HookItem } from './HookItem'
import { HooksList, Wrapper } from './styled'

import { useAppData } from '../../../hooks/useAppData'

interface OrderHooksDetailsProps {
  appData: string
  fullAppData: string | undefined
  children: (content: ReactElement | string) => ReactElement
}

// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, complexity
export function OrderHooksDetails({ appData, fullAppData, children }: OrderHooksDetailsProps) {
  const { appDataDoc } = useAppData(appData, fullAppData)

  if (!appDataDoc?.metadata) return null

  const metadata = appDataDoc.metadata as latest.Metadata

  const preHooksToDapp = matchHooksToDappsRegistry(metadata.hooks?.pre || [])
  const postHooksToDapp = matchHooksToDappsRegistry(metadata.hooks?.post || [])

  const hasHooks = preHooksToDapp.length > 0 || postHooksToDapp.length > 0

  return children(
    hasHooks ? (
      <>
        {preHooksToDapp.length > 0 && <HooksInfo data={preHooksToDapp} title="Pre Hooks" />}
        {postHooksToDapp.length > 0 && <HooksInfo data={postHooksToDapp} title="Post Hooks" />}
      </>
    ) : (
      <span>-</span>
    ),
  )
}

interface HooksInfoProps {
  data: HookToDappMatch[]
  title: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function HooksInfo({ data, title }: HooksInfoProps) {
  return (
    <Wrapper>
      <div>
        <h3>
          {title} ({data.length})
        </h3>
        <HooksList>
          {data.map((item, index) => (
            <HookItem
              key={`${item.hook.callData}${item.hook.target}${item.hook.gasLimit}`}
              item={item}
              number={index + 1}
            />
          ))}
        </HooksList>
      </div>
    </Wrapper>
  )
}
