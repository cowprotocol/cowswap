import { RefObject, useRef } from 'react'

import { useDrag, useDrop } from 'react-dnd'

type DragObject = {
  id: string
  index: number
}

type DragAndDropContext = {
  isDragging: boolean
  isOver: boolean
  canDrop: boolean
  draggedItem: DragObject | null
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

  const [{ isOver, canDrop, draggedItem }, drop] = useDrop<
    DragObject,
    void,
    { isOver: boolean; canDrop: boolean; draggedItem: DragObject | null }
  >({
    accept: ItemTypes.HOOK,
    drop(item: DragObject) {
      const dragIndex = item.index
      const hoverIndex = index

      moveHook(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
      draggedItem: monitor.getItem(),
    }),
  })

  const [{ isDragging }, drag] = useDrag<DragObject, void, { isDragging: boolean }>({
    type: ItemTypes.HOOK,
    item: { id: uuid, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  drag(drop(ref))

  return { ref, isDragging, isOver, canDrop, draggedItem }
}
