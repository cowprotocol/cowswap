import { RefObject, useRef } from 'react'

import { useDrag, useDrop } from 'react-dnd'

type DragObject = {
  id: string
  index: number
}

type DragAndDropContext = {
  isDragging: boolean
  ref: RefObject<HTMLLIElement>
}

const ItemTypes = {
  HOOK: 'hook',
}

export function useDragAndDrop(
  index: number,
  uuid: string,
  moveHook: (dragIndex: number, hoverIndex: number) => void,
): DragAndDropContext {
  const ref = useRef<HTMLLIElement>(null)

  const [, drop] = useDrop<DragObject>({
    accept: ItemTypes.HOOK,
    drop(item: { id: string; index: number }) {
      const dragIndex = item.index
      const hoverIndex = index

      moveHook(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag<DragObject, unknown, { isDragging: boolean }>({
    type: ItemTypes.HOOK,
    item: () => {
      return { id: uuid, index }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  drag(drop(ref))

  return { ref, isDragging }
}
