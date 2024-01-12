import { useRef, useEffect, RefObject, useState, useMemo, useLayoutEffect } from 'react'
import { Instance, Options, State, Placement } from '@popperjs/core'

export const TOOLTIP_OFFSET = 12 // px

const defaultConfig: Partial<Options> & Pick<Options, 'modifiers'> = {
  // default tooltip placement
  placement: 'top',
  modifiers: [
    {
      // move slightly to make space for the arrow element
      name: 'offset',
      options: {
        offset: [0, TOOLTIP_OFFSET],
      },
    },
  ],
}

const createConfig = (
  config: Partial<Options> | undefined | null,
  setState: (state: State) => void,
): Partial<Options> => {
  const finalConfig = {
    ...defaultConfig,
    ...config,
  }

  // applyStyles delegates styling to react
  finalConfig.modifiers.push({
    name: 'applyStyles',
    fn: ({ state }) => {
      // popper.state is mutable, need a new instance
      setState({ ...state })
    },
  })

  return finalConfig
}

interface Result<T extends HTMLElement, U extends HTMLElement = HTMLDivElement> {
  show(): void
  hide(): void
  toggle(): void
  target: RefObject<T>
  ref: RefObject<U>
  isShown: boolean
  state: State | Record<string, unknown>
}

export const usePopper = <T extends HTMLElement, U extends HTMLElement = HTMLDivElement>(
  config?: Partial<Options>,
): Result<T, U> => {
  const [isShown, setIsShown] = useState(false)
  const popupRef = useRef<U>(null)
  const targetRef = useRef<T>(null)
  const popperRef = useRef<Instance | null>(null)
  const [state, setState] = useState<State | Record<string, unknown>>({})

  useEffect(() => {
    if (!targetRef.current || !popupRef.current) return

    import(
      /* webpackChunkName: "popper_chunk"*/
      '@popperjs/core'
    ).then(({ createPopper }) => {
      if (!targetRef.current || !popupRef.current) return
      popperRef.current = createPopper(targetRef.current, popupRef.current, createConfig(config, setState))
    })

    return (): void => {
      popperRef.current?.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // memoize what doesn't change between rerenders
  const stableProps = useMemo(
    () => ({
      show: (): void => setIsShown(true),
      hide: (): void => setIsShown(false),
      toggle: (): void => setIsShown((isShown) => !isShown),
      target: targetRef,
      ref: popupRef,
    }),
    [],
  )

  // LayoutEffect gets applied before browser paint
  // avoids unnecessary restyling
  useLayoutEffect(() => {
    isShown && popperRef.current?.forceUpdate()
  }, [isShown])

  return useMemo(
    () => ({
      ...stableProps,
      isShown,
      state,
    }),
    [isShown, state, stableProps],
  )
}

const usePlacementAndOffset = ({ placement, offset }: { placement: Placement; offset?: number }): Partial<Options> => {
  return useMemo(() => {
    const config: Partial<Options> = { placement }
    if (offset !== undefined) {
      config.modifiers = [
        {
          name: 'offset',
          options: {
            offset: [0, offset],
          },
        },
      ]
    }
    return config
  }, [placement, offset])
}

interface PopperDefaultHookResult<T extends HTMLElement> {
  // default triggers for the tooltip
  // can spread over target element
  targetProps: {
    onMouseEnter: Result<T>['show']
    onMouseLeave: Result<T>['hide']
    onFocus: Result<T>['show']
    onBlur: Result<T>['hide']
    ref: Result<T>['target']
  }
  // tooltip state
  // can spread over Tooltip component
  tooltipProps: Pick<Result<T>, 'ref' | 'isShown' | 'state'>
}

// Popper hook using default triggers
export const usePopperDefault = <T extends HTMLElement>(
  placement: Placement = 'top',
  offset?: number,
): PopperDefaultHookResult<T> => {
  const config = usePlacementAndOffset({ placement, offset })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { target, show, hide, toggle, ...tooltipProps } = usePopper<T>(config)
  // ignore toggle var

  const targetProps = useMemo(
    () => ({
      onMouseEnter: show,
      onMouseLeave: hide,
      onFocus: show,
      onBlur: hide,
      ref: target,
    }),
    [hide, show, target],
  )

  return {
    targetProps,
    tooltipProps,
  }
}

interface PopperOnClickResult<T extends HTMLElement> {
  // default triggers for the tooltip
  // can spread over target element
  targetProps: {
    onClick: Result<T>['toggle']
    ref: Result<T>['target']
  }
  // tooltip state
  // can spread over Tooltip component
  tooltipProps: Pick<Result<T>, 'ref' | 'isShown' | 'state'>
}

export const usePopperOnClick = <T extends HTMLElement>(
  placement: Placement = 'top',
  offset?: number,
): PopperOnClickResult<T> => {
  const config = usePlacementAndOffset({ placement, offset })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { target, show, hide, toggle, ...tooltipProps } = usePopper<T>(config)
  // ignore show and hide vars

  useEffect(() => {
    const handler = (e: MouseEvent): void => {
      const clickTarget = e.target as Node
      // close Tooltip on click outside
      if (!target.current?.contains(clickTarget) && !tooltipProps.ref.current?.contains(clickTarget)) hide()
    }
    document.addEventListener('click', handler)

    return (): void => document.removeEventListener('click', handler)
  }, [hide, target, tooltipProps.ref])

  const targetProps = useMemo(
    () => ({
      onClick: toggle,
      ref: target,
    }),
    [toggle, target],
  )

  return {
    targetProps,
    tooltipProps,
  }
}
