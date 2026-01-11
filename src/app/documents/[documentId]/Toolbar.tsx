"use client";

import { LucideIcon, Undo2Icon , Redo2Icon, Printer, PrinterIcon, SpellCheckIcon, BoldIcon, ItalicIcon, UnderlineIcon, MessageSquarePlusIcon, ListTodoIcon, RemoveFormattingIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/use-editor-store";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const FontFamilyButton = () => {
    const { editor } = useEditorStore();

    const fonts = [
        { label: "Default", value: "inherit" },

        // Sans-serif
        { label: "Arial", value: "Arial" },
        { label: "Helvetica", value: "Helvetica" },
        { label: "Inter", value: "Inter" },
        { label: "Roboto", value: "Roboto" },
        { label: "Open Sans", value: "Open Sans" },
        { label: "Verdana", value: "Verdana" },

        // Serif
        { label: "Times New Roman", value: "Times New Roman" },
        { label: "Georgia", value: "Georgia" },
        { label: "Garamond", value: "Garamond" },

        // Monospace (for code / technical docs)
        { label: "Courier New", value: "Courier New" },
        { label: "JetBrains Mono", value: "JetBrains Mono" },
        { label: "Fira Code", value: "Fira Code" },
        { label: "Source Code Pro", value: "Source Code Pro" },
        { label: "Lexend", value: "Lexend" }
    ]

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-7 w-[120px] shrink-0 flex items-center justify-between rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
                    <span className="truncate">
                        { editor?.getAttributes("textStyle").fontFamily || "Arial" }
                        <ChevronDownIcon className="ml-2 size-4 shrink-0" />
                    </span>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="p-1 flex flex-col gap-y-1">
                { fonts.map(({ label , value }) => (
                    <button 
                        key={value}
                        onClick={() => editor?.chain().focus().setFontFamily(value).run()}
                        className={cn(
                            "flex items-center gap-x-2 px-2 py-2 roundeed-sm hover:bg-neutral-200/80", editor?.getAttributes('textStyle').fontFamily === value && "bg-neutral-200/80"
                        )}
                        style={{fontFamily: value}}
                    >
                        <span className="text-sm">{label}</span>
                    </button>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

interface ToolbarButtonProps {
    onClick?: () => void;
    isActive?: boolean;
    icon: LucideIcon;
}

const ToolbarButton = ({
    onClick,
    isActive,
    icon: Icon
}: ToolbarButtonProps) => {
    return (
        <button 
            type="button"
            onClick={onClick}
            className={cn(
                "text-sm h-7 min-w-7 flex items-center justify-center rounded-sm hover:bg-neutral-200/80", isActive && "bg-neutral-200/80"
            )}
        >
            <Icon className="size-4"/>
        </button>
    )
}

export const Toolbar = () => {
    const { editor } = useEditorStore();

    const sections: {
        label: string;
        icon: LucideIcon;
        onClick: () => void;
        isActive?: boolean;
    }[][] = [
        [
            {
                label: "Undo",
                icon: Undo2Icon,
                onClick: () => editor?.chain().focus().undo().run()
            },
            {
                label: "Redo",
                icon: Redo2Icon,
                onClick: () => editor?.chain().focus().redo().run()
            },
            {
                label: "Print",
                icon: PrinterIcon,
                onClick: () => window.print()
            },
            {
                label: 'Spell Check',
                icon: SpellCheckIcon,
                onClick: () => {
                    const current = editor?.view.dom.getAttribute("spellcheck");
                    editor?.view.dom.setAttribute("spellcheck" , current === "false" ? "true" : "false")
                }
            },
        ],
        [
            {
                label: "Bold",
                icon: BoldIcon,
                isActive: editor?.isActive("bold"),
                onClick: () => editor?.chain().focus().toggleBold().run()
            },
            {
                label: "Italic",
                icon: ItalicIcon,
                isActive: editor?.isActive("italic"),
                onClick: () => editor?.chain().focus().toggleItalic().run()
            },
            {
                label: "Underline",
                icon: UnderlineIcon,
                isActive: editor?.isActive("underline"),
                onClick: () => editor?.chain().focus().toggleUnderline().run()
            },
            {
                label: "Italic",
                icon: ItalicIcon,
                isActive: editor?.isActive("italic"),
                onClick: () => editor?.chain().focus().toggleItalic().run()
            },
        ],
        [
            {
                label: "Comment",
                icon: MessageSquarePlusIcon,
                onClick: () => console.log("Commnet"),
                isActive: false,
            },
            {
                label: "List Todo",
                icon: ListTodoIcon,
                onClick: () => editor?.chain().focus().toggleTaskList().run(),
                isActive: editor?.isActive("taskList"),
            },
            {
                label: "Remove Formatting",
                icon: RemoveFormattingIcon,
                onClick: () => editor?.chain().focus().unsetAllMarks().run(),
            },
        ]
    ];

    return (
        <div className="bg-[#F1F4F9] px-2.5 py-0.5 rounded-[24px] min-h-[40px] flex items-center gap-x-0.5 overflow-x-auto">
            {
                sections[0].map((item) => (
                    <ToolbarButton key={item.label} {...item} />
                ))
            }

            <Separator orientation="vertical" className="h-6 bg-neutral-300" />

            <FontFamilyButton />

             <Separator orientation="vertical" className="h-6 bg-neutral-300" />
            {   
                // heading 
            }
             <Separator orientation="vertical" className="h-6 bg-neutral-300" />
            {   
                // font size 
            }
             <Separator orientation="vertical" className="h-6 bg-neutral-300" />
            {
                sections[1].map((item) => (
                    <ToolbarButton key={item.label} {...item} />
                ))
            }
            {
                // text color 
            }
            {
                // HIghlight color 
            }
            <Separator orientation="vertical" className="h-6 bg-neutral-300" />
            {
                // link 
            }
            {
                // image 
            }
            {
                // align 
            }
            {
                // lineheight
            }
            {
                // list 
            }
            {
                sections[2].map((item) => (
                    <ToolbarButton key={item.label} {...item} />
                ))
            }
        </div>
    )
}