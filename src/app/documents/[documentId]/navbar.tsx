"use client"

import { toast } from "sonner";
import Link from "next/link"
import Image from "next/image"
import { 
    BoldIcon,
    FileIcon, 
    FileJsonIcon, 
    FilePenIcon, 
    FilePlusIcon, 
    FileTextIcon, 
    GlobeIcon, 
    ItalicIcon, 
    PrinterIcon, 
    Redo2Icon, 
    RemoveFormattingIcon, 
    StrikethroughIcon, 
    TextIcon, 
    TrashIcon, 
    UnderlineIcon, 
    Undo2Icon
} from "lucide-react"

import { DocumentInput } from "./document-input"
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger,
} from '@/components/ui/menubar'
import { BsFilePdf } from "react-icons/bs"
import { useEditorStore } from "@/store/use-editor-store"
import { AddCollaborators } from "@/components/ui/add-collaborators"
import { createDocument, deleteDocument, updateDocument } from "@/lib/services/documents";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RenameDialog } from "@/components/ui/rename-dialog";
import { cn } from "@/lib/utils";

export const Navbar = ({ initialData }: { initialData: any }) => {
    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { editor } = useEditorStore();
    const router = useRouter();

    if (!initialData) return null;
    const isOwner = initialData.ownerId === initialData.owner.id;

    const insertTable = ({ rows, cols} : { rows: number, cols: number}) => {
        editor
        ?.chain()
        .focus()
        .insertTable({ rows, cols, withHeaderRow: false })
        .run()
    }

    const onDownload = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href= url;
        a.download = filename
        a.click()
        toast.success(`Exported as ${filename.split('.').pop()?.toUpperCase()}`);
    }

    const onSaveJson = () => {
        if(!editor) return;
        const content = editor.getJSON();
        const blob = new Blob([JSON.stringify(content)], {
            type: "application/json",
        });
        onDownload(blob, 'document.json')
    }

    const onSaveHTML = () => {
        if(!editor) return;
        const content = editor.getHTML();
        const blob = new Blob([JSON.stringify(content)], {
            type: "text/html",
        });
        onDownload(blob, 'document.html')
    }

    const onSaveText = () => {
        if(!editor) return;
        const content = editor.getText();
        const blob = new Blob([JSON.stringify(content)], {
            type: "text/plain",
        });
        onDownload(blob, 'document.txt')
    }

    const onRemove = async () => {
        // 1. Add a safety confirmation so it's not accidental
        const confirmed = window.confirm("Are you sure you want to delete this document?");
        if (!confirmed) return;

        try {
            await deleteDocument(initialData.id);
            
            // 2. Success toast
            toast.success("Document moved to trash");

            // 3. CRITICAL: Refresh the server cache before pushing
            // This prevents the "Success but still shows up" bug
            router.refresh();

            // 4. Redirect to dashboard
            router.push("/");
        } catch (error) {
            // This will now only trigger if the API call actually fails
            console.error("Delete failed:", error);
            toast.error("Failed to remove document");
        }
    }

    const handleRename = async (id: string, newTitle: string) => {
        try {
            await updateDocument(id, newTitle);
            toast.success("Document renamed");
        } catch (error) {
            toast.error("Failed to rename document");
            throw error; 
        }
    };

    const onNewDocument = () => {
        startTransition(async () => {
            try {
                const toastId = toast.loading("Creating new document...");
                const newDoc = await createDocument("Untitled Document");

                toast.success("Document created", { id: toastId });
                router.push(`/documents/${newDoc.id}`);
            } catch (error) {
                toast.error("Failed to create document");
                console.error(error);
            }
        });
    };

    return (
        <nav className="flex items-center justify-between px-4 py-2 bg-[#F9FBFD]">
            <div className="flex gap-2 items-center">
                <Link href='/'>
                    <Image src='/logo.svg' alt="Logo" width={36} height={36} />
                </Link>
                <div className="flex flex-col">
                    <DocumentInput initialTitle={initialData.title} />
                    <div className="flex">
                        <Menubar className="border-none bg-transparent shadow-none h-auto p-0">
                            <MenubarMenu>
                                <MenubarTrigger className="text-sm font-normal py-0.5 px-[7px] rounded-sm hover:bg-muted h-auto cursor-pointer">
                                    File
                                </MenubarTrigger>
                                <MenubarContent className="print:hidden">
                                    <MenubarSub>
                                        <MenubarSubTrigger>
                                            <FileIcon className="size-4 mr-2" />
                                            Save
                                        </MenubarSubTrigger>
                                        <MenubarSubContent>
                                            <MenubarItem onClick={() => window.print()}>
                                                <BsFilePdf className="size-4 mr-2" />
                                                PDF (.pdf)
                                            </MenubarItem>
                                            <MenubarItem onClick={onSaveJson}>
                                                <FileJsonIcon className="size-4 mr-2" />
                                                JSON (.json)
                                            </MenubarItem>
                                            <MenubarItem onClick={onSaveHTML}>
                                                <GlobeIcon className="size-4 mr-2" />
                                                HTML (.html)
                                            </MenubarItem>
                                            <MenubarItem onClick={onSaveText}>
                                                <FileTextIcon className="size-4 mr-2" />
                                                TEXT 
                                            </MenubarItem>
                                        </MenubarSubContent>
                                    </MenubarSub>
                                    <MenubarItem 
                                        onClick={onNewDocument}
                                        disabled={isPending}
                                        className="cursor-pointer"
                                    >
                                        <FilePlusIcon className="size-4 mr-2" />
                                        New Document
                                    </MenubarItem>
                                    <MenubarSeparator />
                                    <MenubarItem onClick={() => setIsRenameOpen(true)}>
                                        <FilePenIcon className="size-4 mr-2" />
                                        Rename
                                    </MenubarItem>

                                    <MenubarItem 
                                        disabled={!isOwner}
                                        onClick={onRemove} 
                                        className={cn(
                                            "text-red-600 focus:text-red-600",
                                            !isOwner && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <TrashIcon className="size-4 mr-2" />
                                        Remove
                                    </MenubarItem>
                                    <MenubarSeparator />
                                    <MenubarItem onClick={() => window.print()}>
                                        <PrinterIcon className="size-4 mr-2" />
                                        Print
                                        <MenubarShortcut>⌘P</MenubarShortcut>
                                    </MenubarItem>
                                </MenubarContent>
                            </MenubarMenu>

                            <MenubarMenu>
                                <MenubarTrigger className="text-sm font-normal py-0.5 px-[7px] rounded-sm hover:bg-muted h-auto cursor-pointer">
                                    Edit
                                </MenubarTrigger>
                                <MenubarContent>
                                    <MenubarItem onClick={() => editor?.chain().focus().undo().run()}>
                                        <Undo2Icon className="size-4 mr-2" />
                                        Undo 
                                        <MenubarShortcut>⌘Z</MenubarShortcut>
                                    </MenubarItem>
                                    <MenubarItem onClick={() => editor?.chain().focus().redo().run()}>
                                        <Redo2Icon className="size-4 mr-2" />
                                        Redo 
                                        <MenubarShortcut>⌘Y</MenubarShortcut>
                                    </MenubarItem>
                                </MenubarContent>
                            </MenubarMenu>

                            <MenubarMenu>
                                <MenubarTrigger className="text-sm font-normal py-0.5 px-[7px] rounded-sm hover:bg-muted h-auto cursor-pointer">
                                    Insert
                                </MenubarTrigger>
                                <MenubarContent>
                                    <MenubarSub>
                                        <MenubarSubTrigger>Table</MenubarSubTrigger>
                                        <MenubarSubContent>
                                            <MenubarItem onClick={() => insertTable({ rows: 1, cols: 1})}>
                                                1 x 1
                                            </MenubarItem>
                                            <MenubarItem onClick={() => insertTable({ rows: 2, cols: 2})}>
                                                2 x 2
                                            </MenubarItem>
                                            <MenubarItem onClick={() => insertTable({ rows: 3, cols: 3})}>
                                                3 x 3
                                            </MenubarItem>
                                            <MenubarItem onClick={() => insertTable({ rows: 4, cols: 4})}>
                                                4 x 4
                                            </MenubarItem>
                                        </MenubarSubContent>
                                    </MenubarSub>
                                </MenubarContent>
                            </MenubarMenu>

                            <MenubarMenu>
                                <MenubarTrigger className="text-sm font-normal py-0.5 px-[7px] rounded-sm hover:bg-muted h-auto cursor-pointer">
                                    Format
                                </MenubarTrigger>
                                <MenubarContent>
                                    <MenubarSub>
                                        <MenubarSubTrigger>
                                            <TextIcon className="size-4 mr-2" />
                                            Text
                                        </MenubarSubTrigger>
                                        <MenubarSubContent>
                                            <MenubarItem onClick={() => editor?.chain().focus().toggleBold().run()}>
                                                <BoldIcon className="size-4 mr-2" />
                                                Bold
                                                <MenubarShortcut>⌘B</MenubarShortcut>
                                            </MenubarItem>
                                            <MenubarItem onClick={() => editor?.chain().focus().toggleItalic().run()}>
                                                <ItalicIcon className="size-4 mr-2" />
                                                Italic
                                                <MenubarShortcut>⌘I</MenubarShortcut>
                                            </MenubarItem>
                                            <MenubarItem onClick={() => editor?.chain().focus().toggleUnderline().run()}>
                                                <UnderlineIcon className="size-4 mr-2" />
                                                Underline 
                                                <MenubarShortcut>⌘U</MenubarShortcut>
                                            </MenubarItem>
                                            <MenubarItem onClick={() => editor?.chain().focus().toggleStrike().run()}>
                                                <StrikethroughIcon className="size-4 mr-2" />
                                                Strickthrough&nbsp;&nbsp;
                                                <MenubarShortcut>⌘S</MenubarShortcut>
                                            </MenubarItem>
                                        </MenubarSubContent>
                                    </MenubarSub>
                                    <MenubarItem onClick={() => editor?.chain().focus().unsetAllMarks().run()}>
                                        <RemoveFormattingIcon className="size-4 mr-2" />
                                        Clear formatting
                                    </MenubarItem>
                                </MenubarContent>
                            </MenubarMenu>
                        </Menubar>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-x-2">
                <AddCollaborators 
                    documentId={initialData.id}
                    title={initialData.title}
                    initialCollaborators={initialData.collaborators}
                    ownerId={initialData.owner.id}
                />
            </div>

            <RenameDialog
                documentId={initialData.id}
                initialTitle={initialData.title}
                isOpen={isRenameOpen}
                onClose={() => setIsRenameOpen(false)}
                onRename={handleRename}
            />
        </nav>
    )
}