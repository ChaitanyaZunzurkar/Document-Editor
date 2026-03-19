import { Mark, mergeAttributes } from '@tiptap/core';

export interface ThreadOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    thread: {
      /**
       * Set a comment thread mark on the selected text
       */
      setThread: (threadId: string) => ReturnType;
      /**
       * Remove a comment thread mark
       */
      unsetThread: () => ReturnType;
    };
  }
}

export const ThreadExtension = Mark.create<ThreadOptions>({
  name: 'thread',

  // Marks can overlap with other marks (like Bold + Italic + Comment)
  inclusive: false, 

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'comment-thread-highlight',
      },
    };
  },

  addAttributes() {
    return {
      threadId: {
        default: null,
        // Tell Tiptap how to find this ID when loading from the database
        parseHTML: element => element.getAttribute('data-thread-id'),
        // Tell Tiptap how to write this to the DOM
        renderHTML: attributes => {
          if (!attributes.threadId) {
            return {};
          }
          return {
            'data-thread-id': attributes.threadId,
            // Classic Google Docs yellow highlight styling!
            style: 'background-color: #fef08a; cursor: pointer; border-bottom: 2px solid #eab308;', 
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-thread-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setThread:
        (threadId) =>
        ({ commands }) => {
          return commands.setMark(this.name, { threadId });
        },
      unsetThread:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});