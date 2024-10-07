import { ReactElement } from 'react'

import { latest } from '@cowprotocol/app-data'
import { HookToDappMatch, matchHooksToDappsRegistry } from '@cowprotocol/hook-dapp-lib'

import { HookItem } from './HookItem'
import { HooksList } from './styled'

import { useAppData } from '../../../hooks/useAppData'

interface OrderHooksDetailsProps {
  appData: string
  fullAppData: string | undefined
  children: (content: ReactElement) => ReactElement
}

export function OrderHooksDetails({ appData, fullAppData, children }: OrderHooksDetailsProps) {
  const { appDataDoc } = useAppData(appData, fullAppData)

  if (!appDataDoc) return null

  const metadata = appDataDoc.metadata as latest.Metadata

  const preHooksToDapp = matchHooksToDappsRegistry(metadata.hooks?.pre || [])
  const postHooksToDapp = matchHooksToDappsRegistry(metadata.hooks?.post || [])

  return children(
    <>
      <HooksInfo data={preHooksToDapp} title="Pre Hooks" />
      <HooksInfo data={postHooksToDapp} title="Post Hooks" />
    </>,
  )
}

interface HooksInfoProps {
  data: HookToDappMatch[]
  title: string
}

function HooksInfo({ data, title }: HooksInfoProps) {
  return (
    <>
      {data.length && (
        <div>
          <h3>{title}</h3>
          <HooksList>
            {data.map((item) => {
              return <HookItem key={item.hook.callData + item.hook.target + item.hook.gasLimit} item={item} />
            })}
          </HooksList>
        </div>
      )}
    </>
  )
}
