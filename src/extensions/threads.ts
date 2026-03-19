import { Mark, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    thread: {
      setThread: (threadId: string) => ReturnType,
      unsetThread: () => ReturnType,
    }
  }
}

export const ThreadExtension = Mark.create({
  name: 'thread',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'bg-yellow-200 cursor-pointer border-b-2 border-yellow-400',
      },
    }
  },

  addAttributes() {
    return {
      threadId: {
        default: null,
        parseHTML: element => element.getAttribute('data-thread-id'),
        renderHTML: attributes => {
          if (!attributes.threadId) {
            return {}
          }
          return {
            'data-thread-id': attributes.threadId,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-thread-id]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setThread: (threadId: string) => ({ commands }) => {
        return commands.setMark(this.name, { threadId })
      },
      unsetThread: () => ({ commands }) => {
        return commands.unsetMark(this.name)
      },
    }
  },
})