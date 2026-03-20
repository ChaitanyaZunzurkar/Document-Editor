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

import { FontSizeExtension } from '@/extensions/font-size'
import { useSocket } from '@/hooks/use-socket'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation';
import { ThreadExtension } from '@/extensions/threads';
import { FloatingThreads } from './floating-threads';
import throttle from 'lodash.throttle'; // <-- Make sure to import this!

interface EditorProps {
    documentId: string;
    userName: string;
    userId: string;
}

export const Editor = ({ documentId, userName, userId }: EditorProps) => {
    const { setEditor } = useEditorStore();
    const router = useRouter();
    
    const socket = useSocket(documentId, userName, userId);
    let saveTimeout: NodeJS.Timeout;

    const [collaborators, setCollaborators] = useState<any[]>([]);

    // 1. COLLABORATIVE RULER STATE
    const [leftMargin, setLeftMargin] = useState(56);
    const [rightMargin, setRightMargin] = useState(56);
    const isDraggingRulerRef = useRef(false);

    // 2. THROTTLED EMITTER FOR RULER
    const emitRulerChange = useMemo(
        () => throttle((left: number, right: number) => {
            socket?.emit("ruler-move", documentId, { left, right });
        }, 50),
        [socket, documentId]
    );

    const handleLeftMarginChange = (newMargin: number) => {
        setLeftMargin(newMargin); 
        emitRulerChange(newMargin, rightMargin);
    };

    const handleRightMarginChange = (newMargin: number) => {
        setRightMargin(newMargin);
        emitRulerChange(leftMargin, newMargin);
    };

    // 3. LISTEN FOR PEER RULER MOVEMENTS
    useEffect(() => {
        if (!socket) return;
        const rulerHandler = (margins: { left: number, right: number }) => {
            if (!isDraggingRulerRef.current) {
                setLeftMargin(margins.left);
                setRightMargin(margins.right);
            }
        };
        socket.on("receive-ruler", rulerHandler);
        return () => { socket.off("receive-ruler", rulerHandler); };
    }, [socket]);

    const editor = useEditor({
        immediatelyRender: false,
        onUpdate: ({ transaction, editor }) => {
            setEditor(editor);
            if (transaction.getMeta("remote")) return;

            const steps = transaction.steps.map(step => step.toJSON());
            if (steps.length === 0) return; 

            socket?.emit("send-changes", documentId, steps);

            clearTimeout(saveTimeout);
            
            saveTimeout = setTimeout(() => {
                const content = editor.getHTML(); 
                socket?.emit("save-document", documentId, content);
                console.log("Auto-saving to database...");
            }, 3000);
        },
        onSelectionUpdate({ editor }) {
            setEditor(editor)

            const { from } = editor.state.selection
            socket?.emit("cursor-move", documentId, {
                id: socket.id,
                position: from
            })
        },
        onCreate({ editor }) { setEditor(editor) },
        onDestroy() { setEditor(null) },
        onTransaction({ editor }) { setEditor(editor) },
        onFocus({ editor }) { setEditor(editor) },
        onBlur({ editor }) { setEditor(editor) },
        onContentError({ editor }) { setEditor(editor) },
        editorProps: {
            attributes: {
                // Kept your EXACT original classes intact so the box model doesn't break
                style: 'padding-left: 56px; padding-right: 56px;', 
                class: 'focus:outline-none print:border-0 bg-white border border-[#C7C7C7] flex flex-col min-h-[1054px] w-[816px] pt-10 pr-14 cursor-text'
            }
        },
        extensions: [
            StarterKit,
            LiveCursors,
            ThreadExtension,
            FontSizeExtension,
            LineHeightExtension.configure({ types: ["heading", "paragraph"], defaultLineHeight: "normal" }),
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Heading.configure({ levels: [1,2,3,4,5,6] }),
            Table.configure({ resizable: true }),
            TableRow, TableCell, TableHeader, Underline, FontFamily, TextStyle, Color,
            Highlight.configure({ multicolor: true }),
            Link.configure({ openOnClick: true, autolink: true, defaultProtocol: "https" }),
            Image,
            ImageResize.configure({ inline: true })
        ],
    })

    // 4. REACTIVELY UPDATE TIPTAP MARGINS WITHOUT BREAKING LAYOUT
    // This injects the new padding directly into the active editor instance
    useEffect(() => {
        if (editor) {
            editor.setOptions({
                editorProps: {
                    attributes: {
                        ...editor.options.editorProps.attributes,
                        style: `padding-left: ${leftMargin}px; padding-right: ${rightMargin}px;`
                    }
                }
            });
        }
    }, [leftMargin, rightMargin, editor]);

    const collaboratorsRef = useRef(collaborators);
    useEffect(() => {
        collaboratorsRef.current = collaborators;
    }, [collaborators]);

    useEffect(() => {
        if (!socket) return;
        
        socket.on("access-denied", (message) => {
            console.error("Access Denied:", message);
            router.push("/");
        });
        
        return () => { 
            socket.off("access-denied"); 
        };
    }, [socket, router]);

    // Phase 4: History & Sync Listener
    useEffect(() => {
        if (!socket || !editor) return;

        socket.emit("request-document", documentId);

        const loadHandler = (pastSteps: any[]) => {
            if (pastSteps.length === 0) return; 
            const transaction = editor.state.tr;
            pastSteps.forEach((stepJSON) => {
                const step = Step.fromJSON(editor.schema, stepJSON);
                transaction.step(step);
            });
            transaction.setMeta("remote", true);
            editor.view.dispatch(transaction);
        };

        const changeHandler = (steps: any[]) => {
            const transaction = editor.state.tr;
            steps.forEach((stepJSON) => {
                const step = Step.fromJSON(editor.schema, stepJSON);
                transaction.step(step);
            });
            transaction.setMeta("remote", true);
            editor.view.dispatch(transaction);
        }

        socket.on("load-document", loadHandler);
        socket.on("receive-changes", changeHandler);

        // Optional: Load initial margins from server if you saved them for late joiners
        socket.on("receive-ruler", (margins) => {
            setLeftMargin(margins.left);
            setRightMargin(margins.right);
        });

        return () => {
            socket.off("load-document", loadHandler);
            socket.off("receive-changes", changeHandler);
            socket.off("receive-ruler");
        }
    }, [socket, editor, documentId]); 

    // Phase 3: Live Cursors Listener
    useEffect(() => {
        if (!socket || !editor) return;

        const cursorHandler = (cursorData: any) => {
            const user = collaboratorsRef.current.find(u => u.id === cursorData.id);
            if (!user) return;

            const activeCursors = [{
                position: cursorData.position,
                color: user.color,
                name: user.name
            }];

            editor.view.dispatch(editor.state.tr.setMeta('updateCursors', activeCursors));
        };

        socket.on("receive-cursor", cursorHandler);

        return () => {
            socket.off("receive-cursor", cursorHandler);
        };
    }, [socket, editor]);

    // Phase 3: Presence Listener
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

    return (
        <div className="relative w-full h-full bg-[#F9FBFD] overflow-hidden print:overflow-visible">
            
            <div className="w-full h-full overflow-y-auto">
                <div className="w-[816px] mx-auto py-4 print:p-0 print:bg-white">
                    
                    <div className="flex justify-end gap-2 pb-2 w-full">
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

                    <div 
                        onMouseDown={() => { isDraggingRulerRef.current = true; }}
                        onMouseUp={() => { isDraggingRulerRef.current = false; }}
                    >
                        <Ruler 
                            leftMargin={leftMargin} 
                            rightMargin={rightMargin} 
                            setLeftMargin={handleLeftMarginChange} 
                            setRightMargin={handleRightMarginChange} 
                        /> 
                    </div>
                    
                    <EditorContent editor={editor} />
                </div>
            </div>

            <div className="absolute top-4 bottom-4 left-[calc(50%+408px+24px)] w-[280px] print:hidden">
                <FloatingThreads editor={editor} documentId={documentId} />
            </div>
        </div>
    )
}