"use client";

import { LucideIcon, Undo2Icon , Redo2Icon, Printer, PrinterIcon, SpellCheckIcon, BoldIcon, ItalicIcon, UnderlineIcon, MessageSquarePlusIcon, ListTodoIcon, RemoveFormattingIcon, ChevronDownIcon, HighlighterIcon, Link2Icon, ImageIcon, UploadIcon, SearchIcon, AlignLeftIcon, AlignCenter, AlignCenterIcon, AlignRightIcon, AlignJustifyIcon, ListIcon, ListOrdered, ListOrderedIcon, MinusIcon, PlusIcon, ListCollapseIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/use-editor-store";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { type Level } from "@tiptap/extension-heading"
import { type ColorResult, SketchPicker } from "react-color"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'

const ImageButton = () => {
    const { editor } = useEditorStore();
    const [isDialogOpen , setIsDialogOpen] = useState(false);
    const [imgUrl , setImageUrl] = useState("");

    const onChange = (src: string) => {
        editor?.chain().focus().setImage({ src }).run()
    }

    const onUpload = () => {
        const input = document.createElement("input")
        input.type = "file";
        input.accept = "image/*";

        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if(file) {
                const imgUrl = URL.createObjectURL(file);
                onChange(imgUrl);
            }
        }

        input.click();
    }

    const handleImageUrlSubmit = () => {
        if(imgUrl) {
            onChange(imgUrl);
            setImageUrl("");
            setIsDialogOpen(false)
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
                        <ImageIcon className="size-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={onUpload}>
                        <UploadIcon className="size-4 mr-2" />
                        Upload
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                        <SearchIcon className="size-4 mr-2" />
                        Paste image url
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Insert image URL</DialogTitle>
                    </DialogHeader>
                    <Input 
                        placeholder="Insert image URL"
                        value={imgUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault()
                                handleImageUrlSubmit()
                            }
                        }}
                    />
                    <DialogFooter>
                        <Button onClick={handleImageUrlSubmit}>
                            Insert
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

const LinkButton = () => {
    const { editor } = useEditorStore();
    const [value , setValue] = useState(editor?.getAttributes("link").href || "");

    const onChange = (href: string) => {
        if (!href) {
            editor?.chain().focus().extendMarkRange("link").unsetLink().run()
        } else {
            editor?.chain().focus().extendMarkRange("link").setLink({ href }).run()
        }
        setValue("")
    }

    return (
        <DropdownMenu onOpenChange={(open) => {
            if(open) {
                setValue(editor?.getAttributes("link").href || "")}
            }
        }>
            <DropdownMenuTrigger asChild>
                <button 
                className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
                    <Link2Icon className="size-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2.5 flex items-center gap-x-2">
                <Input 
                    placeholder="https://example.com"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
                <Button onClick={() => onChange(value)}>
                    Apply
                </Button>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const HighlightColorButton = () => {
    const { editor } = useEditorStore();

    const value = editor?.getAttributes("highlight").color || '#FFFFFF'

    const onChange = (color: ColorResult) => {
        editor?.chain().focus().setHighlight({color: color.hex}).run()
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
                    <HighlighterIcon className="size-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-0">
                <SketchPicker 
                    color={value}
                    onChange={onChange}
                />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const AlignButton = () => {
    const { editor } = useEditorStore();

    const alignments = [
        {
            label: 'Align Left',
            value: 'left',
            icon: AlignLeftIcon
        },
        {
            label: 'Align Center',
            value: 'center',
            icon: AlignCenterIcon
        },
        {
            label: 'Align Right',
            value: 'right',
            icon: AlignRightIcon
        },
        {
            label: 'Align Justify',
            value: 'justify',
            icon: AlignJustifyIcon
        }
    ]

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
                    <AlignLeftIcon className="size-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-1 flex flex-col gap-y-1">
                {
                    alignments.map(({label, value, icon: Icon}) => (
                        <button
                            key={value}
                            onClick={
                                () => editor?.chain().focus().setTextAlign(value).run()
                            }
                            className={
                                cn(
                                    "flex items-center gap-x-2 px-2 py-2 rounded-sm hover:bg-neutral-200/80",
                                    editor?.isActive({ textAlign: value}) && "bg-neutral-200/80"
                                )
                            }
                        >
                            <Icon className="size-4" />
                            <span className="text-sm">
                                {label}
                            </span>
                        </button>
                    ))
                }
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const ListButton = () => {
    const { editor } = useEditorStore();

    const lists = [
        {
            label: 'Bullet List',
            icon: ListIcon,
            isActive: () => editor?.isActive("bulletList"),
            onClick: () => editor?.chain().focus().toggleBulletList().run(),
        },
        {
            label: 'Ordered List',
            icon: ListOrderedIcon,
            isActive: () => editor?.isActive("orderedList"),
            onClick: () => editor?.chain().focus().toggleOrderedList().run(),
        },
    ]

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
                    <ListIcon className="size-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-1 flex flex-col gap-y-1">
                {
                    lists.map(({label, icon: Icon, onClick, isActive}) => (
                        <button
                            key={label}
                            onClick={onClick}
                            className={
                                cn(
                                    "flex items-center gap-x-2 px-2 py-2 rounded-sm hover:bg-neutral-200/80",
                                    isActive() && "bg-neutral-200/80"
                                )
                            }
                        >
                            <Icon className="size-4" />
                            <span className="text-sm">
                                {label}
                            </span>
                        </button>
                    ))
                }
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const TextColorButton = () => {
    const { editor } = useEditorStore();

    const value = editor?.getAttributes("textStyle").color || "#000000";

    const onChange = (color: ColorResult) => {
        editor?.chain().focus().setColor(color.hex).run()
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
                    <span className="truncate">A</span>
                    <div className="h-0.5 w-full" style={{backgroundColor: value}} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-0">
                <SketchPicker 
                    color={value}
                    onChange={onChange}
                />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const HeadingLevelButton = () => {
    const { editor } = useEditorStore();

    const headings = [
        { label: "Normal text" , value: 0 ,  fontSize: "16px" },
        { label: "Heading 1" , value: 1 , fontSize: "32px" },
        { label: "Heading 2" , value: 2 , fontSize: "24px" },
        { label: "Heading 3" , value: 3, fontSize: "20px" },
        { label: "Heading 4" , value: 4 , fontSize: "18px" },
        { label: "Heading 5" , value: 5 , fontSize: "16px" }
    ]

    const getCurrentHeading = () => {
        for (let level = 1; level <= 5; level++) {
            if(editor?.isActive("heading" , {level})) {
                return `Heading ${level}`
            }
        }

        return "Normal text"
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild> 
                <button className="h-7 min-w-7 shrink-0 flex items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
                    <span className="truncate flex justify-between">
                        {getCurrentHeading()}
                        <ChevronDownIcon className="ml-2 size-4 shrink-0" />
                    </span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-1 flex flex-col gap-y-1">
                {
                    headings.map(({ label , value , fontSize }) => (
                        <button 
                            key={value}
                            onClick={() => {
                                if (value === 0) {
                                    editor?.chain().focus().setParagraph().run()
                                } else {
                                    editor?.chain().focus().toggleHeading({ level: value as Level}).run()
                                }
                            }}
                            className={cn(
                                "flex items-center gap-x-2 px-2 py-2 rounded-sm hover:bg-neutral-200/80", (value === 0 && !editor?.isActive("heading")) || editor?.isActive("heading" , { level : value}) && "bg-neutral-200/80"
                            )}
                            style={{ fontSize }}
                        >
                            { label }
                        </button>
                    ))
                }
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

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
                <button className="h-7 w-[100px] shrink-0 flex items-center justify-between rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm ">
                    <span className="truncate flex w-[100%] justify-between">
                        { editor?.getAttributes("textStyle").fontFamily || "Arial" }
                        <ChevronDownIcon className="ml-2 size-4 shrink-0" />
                    </span>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="p-1 flex flex-col gap-y-1">
                { fonts.map(({ label , value }) => (
                    <button 
                        key={value}
                        onClick={() => {
                            if (value === "inherit") {
                                editor?.chain().focus().unsetFontFamily().run()
                            } else {
                                editor?.chain().focus().setFontFamily(value).run()
                            }
                        }}
                        className={cn(
                            "flex items-center gap-x-2 px-2 py-2 rounded-sm hover:bg-neutral-200/80", editor?.getAttributes('textStyle').fontFamily === value && "bg-neutral-200/80"
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

const ToolbarButton = ({ onClick, isActive, icon: Icon }: ToolbarButtonProps) => {
  const { editor } = useEditorStore()
    return (
        <button 
            type="button"
            disabled={!editor}
            onClick={onClick}
            className={cn(
                "text-sm h-7 min-w-7 flex items-center justify-center rounded-sm hover:bg-neutral-200/80", isActive && "bg-neutral-200/80"
            )}
        >
            <Icon className="size-4"/>
        </button>
    )
}

export const FontSizeButton = () => {
  const { editor } = useEditorStore()

  const [fontSize, setFontSize] = useState("16")
  const [inputValue, setInputValue] = useState("16")
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!editor) return

    const update = () => {
      const size =
        editor.getAttributes("textStyle")?.fontSize?.replace("px", "") || "16"
      setFontSize(size)
      setInputValue(size)
    }

    update()
    editor.on("selectionUpdate", update)
    editor.on("transaction", update)

    return () => {
      editor.off("selectionUpdate", update)
      editor.off("transaction", update)
    }
  }, [editor])

  if (!editor) {
    return (
      <div className="flex items-center gap-x-0.5 opacity-50">
        <button className="h-7 min-w-7 rounded-sm" disabled>
          <MinusIcon className="size-4" />
        </button>
        <span className="h-7 min-w-10 text-sm flex items-center justify-center">
          16
        </span>
        <button className="h-7 min-w-7 rounded-sm" disabled>
          <PlusIcon className="size-4" />
        </button>
      </div>
    )
  }

  const updateFontSize = (newSize: string) => {
    const size = parseInt(newSize)
    if (isNaN(size) || size <= 0) return

    editor.chain().focus().setFontSize(`${size}px`).run()
    setFontSize(newSize)
    setInputValue(newSize)
    setIsEditing(false)
  }

  const increment = () => updateFontSize((parseInt(fontSize) + 1).toString())
  const decrement = () => {
    const next = parseInt(fontSize) - 1
    if (next >= 8) updateFontSize(next.toString())
  }

  return (
    <div className="flex items-center gap-x-0.5">
      <button
        onClick={decrement}
        className="h-7 min-w-7 flex items-center justify-center rounded-sm hover:bg-neutral-200/80"
      >
        <MinusIcon className="size-4" />
      </button>

      {isEditing ? (
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={() => updateFontSize(inputValue)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              updateFontSize(inputValue)
            }
          }}
          className="h-7 w-10 text-sm text-center rounded-sm border border-black bg-transparent focus:outline-none"
        />
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="h-7 min-w-10 text-sm rounded-sm cursor-text"
        >
          {fontSize}
        </button>
      )}

      <button
        onClick={increment}
        className="h-7 min-w-7 flex items-center justify-center rounded-sm hover:bg-neutral-200/80"
      >
        <PlusIcon className="size-4" />
      </button>
    </div>
  )
}

export const LineHeightButton = () => {
    const { editor } = useEditorStore();

    const lineHeights = [
        { label: 'Default', value: 'normal' },
        { label: 'Single', value: '1' },
        { label: '1.15', value: '1.15' },
        { label: '1.5', value: '1.5' },
        { label: 'Double', value: '2' },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
                    <ListCollapseIcon className="size-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-1 flex flex-col gap-y-1">
                {
                    lineHeights.map(({ label, value }) => (
                        <button
                            key={value}
                            onClick={() => {
                                if (value === 'normal') {
                                    editor?.chain().focus().unsetLineHeight().run();
                                } else {
                                    editor?.chain().focus().setLineHeight(value).run();
                                }
                            }}
                            className={cn(
                                "flex items-center gap-x-2 px-2 py-2 rounded-sm hover:bg-neutral-200/80",
                                editor?.getAttributes("paragraph").lineHeight === value && "bg-neutral-200/80",
                                editor?.getAttributes("heading").lineHeight === value && "bg-neutral-200/80"
                            )}
                        >
                            <span className="text-sm">{label}</span>
                        </button>
                    ))
                }
            </DropdownMenuContent>
        </DropdownMenu>
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
                    const dom = editor?.view.dom
                    if (!dom) return
                    dom.spellcheck = !dom.spellcheck
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
        ],
        [
            {
                label: "Comment",
                icon: MessageSquarePlusIcon,
                onClick: () => {
                    if (!editor?.state.selection.empty) {
                        editor?.chain().focus().setMark("thread", { threadId: "draft" }).run();
                    }
                },
                isActive: editor?.isActive("thread"),
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
            
            <HeadingLevelButton />

            <Separator orientation="vertical" className="h-6 bg-neutral-300" />
            
            <FontSizeButton />

            <Separator orientation="vertical" className="h-6 bg-neutral-300" />
            {
                sections[1].map((item) => (
                    <ToolbarButton key={item.label} {...item} />
                ))
            }

            <TextColorButton />

            <HighlightColorButton />

            <Separator orientation="vertical" className="h-6 bg-neutral-300" />
            
            <LinkButton />
            
            <ImageButton />

            <AlignButton />

            <LineHeightButton />

            <ListButton />
            {
                sections[2].map((item) => (
                    <ToolbarButton key={item.label} {...item} />
                ))
            }
        </div>
    )
}