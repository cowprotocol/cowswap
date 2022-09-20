/* eslint-disable prefer-rest-params */
export function nodeRemoveChildFix() {
  if (typeof Node === 'function' && Node.prototype) {
    const originalRemoveChild = Node.prototype.removeChild
    Node.prototype.removeChild = function <T extends Node>(child: T): T {
      if (child.parentNode !== this) {
        if (console) {
          console.error('Cannot remove a child from a different parent', child, this)
        }
        return child
      }
      return originalRemoveChild.apply(this, arguments as unknown as [child: Node]) as T
    }

    const originalInsertBefore = Node.prototype.insertBefore
    Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
      if (referenceNode && referenceNode.parentNode !== this) {
        if (console) {
          console.error('Cannot insert before a reference node from a different parent', referenceNode, this)
        }
        return newNode
      }
      return originalInsertBefore.apply(this, arguments as unknown as [node: Node, child: Node | null]) as T
    }
  }
}
