import { type MentionOption } from '../types/mentions'
import { DOM_CLASSES, MENTION_DOM_REG } from './config'

export const computePosition = (contrastElement: HTMLElement, targetElement: HTMLElement) => {
  const contrastRect = contrastElement.getBoundingClientRect()
  const targetRect = targetElement.getBoundingClientRect()
  const { innerWidth, innerHeight } = window

  const availableWidth = Math.min(innerWidth, targetRect.width)
  let availableHeight = Math.min(innerHeight, targetRect.height)

  const x = contrastRect.left + availableWidth > innerWidth
    ? innerWidth - availableWidth
    : contrastRect.left
  let y = contrastRect.bottom

  if (contrastRect.bottom + targetRect.height > innerHeight) {
    if (contrastRect.top - targetRect.height < 0) {
      // 无法正确放置，尝试选择最优位置，并重置 target 高度
      if (Math.abs(contrastRect.bottom + targetRect.height - innerHeight) > Math.abs(contrastRect.top - targetRect.height)) {
        // 上面剩余位置多，放置在上面
        availableHeight = contrastRect.top
        y = 0
      } else {
        // 下面剩余位置多，放置在下面
        availableHeight = innerHeight - y
      }
    } else {
      // 放在上面
      y = contrastRect.top - availableHeight
    }
  }

  return {
    x,
    y,
    availableWidth,
    availableHeight
  }
}

export const createAtElement = (prefix: string) => {
  const oAt = document.createElement('span')
  oAt.className = DOM_CLASSES.AT
  oAt.textContent = prefix
  return oAt
}

export const createMentionElement = (name: string, id: string | number, prefix: string, suffix: string) => {
  const oM = document.createElement('em')
  oM.className = DOM_CLASSES.MENTION
  oM.setAttribute('data-id', `${id}`)
  oM.setAttribute('data-name', name)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  oM.setAttribute('contenteditable', false)
  oM.innerText = `${prefix}${name}${suffix}`
  return oM
}

export const insertNodeAfterRange = (node: Node, range?: Range, isClick?: boolean) => {
  if (!range) {
    range = window.getSelection()!.getRangeAt(0)
  }
  range.insertNode(node)
  if (!isClick) {
    setRangeAfterNode(node)
  }
}

export const setRangeAfterNode = (node: Node) => {
  const selection = window.getSelection()!
  const range = new Range()
  range.setStartAfter(node)
  range.setEndAfter(node)
  selection.removeAllRanges()
  selection.addRange(range)
}

/**
 * 判断 node2 是否在 node1 之后
 * @param {Node} node1
 * @param {Node} node2
 */
export const isNodeAfterNode = (node1: Node, node2: Node) => {
  return (node1.compareDocumentPosition(node2) & Node.DOCUMENT_POSITION_FOLLOWING) === Node.DOCUMENT_POSITION_FOLLOWING
}

/**
 * 判断元素是否为 Mention 元素
 */
export const isMention = (node: Element) => {
  return [...document.querySelectorAll(`.${DOM_CLASSES.MENTION}`) as unknown as HTMLElement[]].some(m => m.contains(node))
}

export function integerValidator (value: number) {
  return !Number.isNaN(value) && value >= 0
}

export const valueFormatter = (innerHTML = '', parser?: (id: string, name: string) => string) => {
  return innerHTML
    .replace(
      MENTION_DOM_REG,
      (_, $id: string, $name: string) => {
        return typeof parser === 'function'
          ? parser($id, $name)
          : `#{name:${$name},id:${$id}}`
      }
    ) // 解析 mention 块
    .replace(/(<((?:p|div|br))[^>]*>)/ig, '\n$1') // 块级标签增加\n
    .replace(/<[^>]*>/g, '') // 移除剩余所有标签
}

export const isEmptyTextNode = (node: Node) => node.nodeType === 3 && !node.nodeValue?.length

export const computeMentionLength = (mention: MentionOption, calculator?: (m: MentionOption) => number) => {
  return typeof calculator === 'function'
    ? calculator(mention)
    : `#{name:${mention.label},id:${mention.value}}`.length
}
