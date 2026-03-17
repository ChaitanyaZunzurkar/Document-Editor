import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

const cursorPluginKey = new PluginKey('liveCursors')

export const LiveCursors = Extension.create({
  name: 'liveCursors',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: cursorPluginKey,
        state: {
          init() {
            return DecorationSet.empty
          },
          apply(tr, oldState) {
            // Check if our React component sent us new cursor data
            const newCursors = tr.getMeta('updateCursors')
            
            if (newCursors) {
              // Convert the data into physical HTML elements
              const decorations = newCursors.map((cursor: any) => {
                const widget = document.createElement('span')
                widget.className = 'live-cursor'
                widget.style.borderLeft = `2px solid ${cursor.color}`
                
                const label = document.createElement('span')
                label.className = 'cursor-label'
                label.style.backgroundColor = cursor.color
                label.innerText = cursor.name
                
                widget.appendChild(label)
                
                // Place the HTML element at the exact position index
                return Decoration.widget(cursor.position, widget)
              })
              return DecorationSet.create(tr.doc, decorations)
            }
            
            // If the document changes but cursors don't, keep cursors where they are
            return oldState.map(tr.mapping, tr.doc)
          }
        },
        props: {
          decorations(state) {
            return this.getState(state)
          }
        }
      })
    ]
  }
})