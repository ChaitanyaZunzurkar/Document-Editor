'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Heading from '@tiptap/extension-heading'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Underline from '@tiptap/extension-underline'
import FontFamily from '@tiptap/extension-font-family'
import TextStyle from '@tiptap/extension-text-style'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import ImageResize from 'tiptap-extension-resize-image';
import StarterKit from '@tiptap/starter-kit'
import { useEditorStore } from '@/store/use-editor-store'
import { LineHeightExtension } from '@/extensions/list-height'
import { Ruler } from "./ruler";
import { Step } from '@tiptap/pm/transform';
import { LiveCursors } from '@/extensions/live-cursors';

// Custom extension for font-size
import { FontSizeExtension } from '@/extensions/font-size'
import { useSocket } from '@/hooks/use-socket'
import { useEffect, useRef, useState } from 'react'

interface EditorProps {
  documentId: string;
  userName: string
}

export const Editor = ({ documentId, userName}: EditorProps) => {
    const { setEditor } = useEditorStore();
    const socket = useSocket(documentId, userName);

    const [collaborators, setCollaborators] = useState<any[]>([]);

    const editor = useEditor({
        immediatelyRender: false,
        onUpdate: ({ transaction, editor }) => {
            setEditor(editor);
            if (transaction.getMeta("remote")) return;

            // Grab only the exact changes (Deltas) made in this keystroke
            const steps = transaction.steps.map(step => step.toJSON());
            
            // If there are no actual document changes, do nothing
            if (steps.length === 0) return; 

            // Send an Array of tiny change objects instead of a massive HTML string
            socket?.emit("send-changes", documentId, steps);
        },
        onSelectionUpdate({ editor }) {
            setEditor(editor)

            const { from } = editor.state.selection
            socket?.emit("cursor-move", documentId, {
                id: socket.id,
                position: from
            })
        },
        onCreate({ editor }) {
            setEditor(editor)
        },
        onDestroy() {
            setEditor(null)
        },
        onTransaction({ editor }) {
            setEditor(editor)
        },
        onFocus({ editor }) {
            setEditor(editor)
        },
        onBlur({ editor }) {
            setEditor(editor)
        },
        onContentError({ editor }) {
            setEditor(editor)
        },
        editorProps: {
            attributes: {
                style: 'padding-left: 56px; padding-right: 56px;', 
                class: 'focus:outline-none print:border-0 bg-white border border-[#C7C7C7] flex flex-col min-h-[1054px] w-[816px] pt-10 pr-14 cursor-text'
            }
        },
        extensions: [
            StarterKit,
            LiveCursors,
            FontSizeExtension,
            LineHeightExtension.configure({
                types: ["heading", "paragraph"],
                defaultLineHeight: "normal"
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"]
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Heading.configure({
                levels: [1,2,3,4,5,6],
            }),
            Table.configure({
                resizable: true
            }),
            TableRow,
            TableCell,
            TableHeader,
            Underline,
            FontFamily,
            TextStyle,
            Color,
            Highlight.configure({
                multicolor: true
            }),
            Link.configure({
                openOnClick: true,
                autolink: true,
                defaultProtocol: "https"
            }),
            Image,
            ImageResize.configure({
                inline: true,
            })
        ],
    })

    const collaboratorsRef = useRef(collaborators);
    useEffect(() => {
        collaboratorsRef.current = collaborators;
    }, [collaborators]);

    // Listen for incoming cursor movements
    useEffect(() => {
        if (!socket || !editor) return;

        const cursorHandler = (cursorData: any) => {
            // Find who moved their mouse to get their color and name
            const user = collaboratorsRef.current.find(u => u.id === cursorData.id);
            if (!user) return;

            // Bundle the position, color, and name
            const activeCursors = [{
                position: cursorData.position,
                color: user.color,
                name: user.name
            }];

            // Send this bundle to our custom Tiptap extension
            editor.view.dispatch(editor.state.tr.setMeta('updateCursors', activeCursors));
        };

        socket.on("receive-cursor", cursorHandler);

        return () => {
            socket.off("receive-cursor", cursorHandler);
        };
    }, [socket, editor]);

    useEffect(() => {
        if (!socket || !editor) return;

        const handler = (steps: any[]) => {
            // 1. Open a blank transaction (request form)
            const transaction = editor.state.tr;

            // 2. Reconstruct each step from the server and add it to the transaction
            steps.forEach((stepJSON) => {
                const step = Step.fromJSON(editor.schema, stepJSON);
                transaction.step(step);
            });

            // 3. Mark the whole batch as 'remote' and execute it
            transaction.setMeta("remote", true);
            editor.view.dispatch(transaction);
        }

        socket.on("receive-changes", handler)
        return () => {
            socket.off("receive-changes", handler)
        }
    }, [socket, editor])

    useEffect(() => {
        if(!socket) return;

        const presenceHandler = (users: any[]) => {
            const others = users.filter((u) => u.id !== socket.id)
            setCollaborators(others)
        }

        socket.on("presence-update", presenceHandler);

        return () => {
            socket.off("presence-update", presenceHandler)
        }
    }, [socket])

    useEffect(() => {
        if(!socket) return;

        const cursorHandler = (cursorData: any) => {
            console.log("SOMEONE MOVED THEIR CURSOR:", cursorData);
        }

        socket.on("receive-cursor", cursorHandler);

        return () => {
            socket.off("receive-cursor", cursorHandler);
        };

    }, [socket])

    return (
        <div className='size-full overflow-x-auto bg-[#F9FBFD] px-4 print:p-0 print:bg-white print:overflow-visible'>
            <div className="flex justify-end gap-2 p-2 w-[816px] mx-auto">
                {collaborators?.map((user) => (
                    <div
                        key={user.id}
                        className="flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm"
                        style={{ backgroundColor: user.color }}
                        title={user.name}
                    >
                        { user.name.charAt(0).toUpperCase() }
                    </div>
                ))}
            </div>

            <Ruler /> 
            <div className='min-w-max flex justify-center w-[816px] py-4 print:py-0 mx-auto print:w-full print:min-w-0'>
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}