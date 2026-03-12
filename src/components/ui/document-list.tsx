"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { 
  Loader2Icon, 
  MoreVertical, 
  TrashIcon, 
  ExternalLinkIcon, 
  PencilIcon, 
  CircleUserIcon,
  Users2
} from "lucide-react";

import { SiGoogledocs } from 'react-icons/si'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteDocument, getDocuments, updateDocument } from "@/lib/services/documents";
import { cn } from "@/lib/utils";
import { RenameDialog } from "./rename-dialog";

interface DocumentListProps {
  initialDocuments: any[];
}

export const DocumentList = ({ initialDocuments }: DocumentListProps) => {
  const router = useRouter();
  
  // States for Infinite Scroll
  const [documents, setDocuments] = useState(initialDocuments);
  const [skip, setSkip] = useState(10);
  const [hasMore, setHasMore] = useState(initialDocuments.length === 10);

  const [renameId, setRenameId] = useState<string | null>(null);
  const [initialTitle, setInitialTitle] = useState("");
  
  // States for Row Navigation Loading
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clickedId, setClickedId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const { ref, inView } = useInView();

  // Logic to load more documents on scroll
  const loadMoreDocs = async () => {
    if (!hasMore) return;

    try {
      const newDocs = await getDocuments(skip, 10);
      if (newDocs.length < 10) {
        setHasMore(false);
      }
      setDocuments((prev) => [...prev, ...newDocs]);
      setSkip((prev) => prev + 10);
    } catch (error) {
      console.error("Failed to load more documents", error);
    }
  };

  const onDelete = async (id: string) => {
    try {
      setDeletingId(id)
      await deleteDocument(id)
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch(error) {
      console.log("Fail to delete document.")
    } finally {
      setDeletingId(null)
    }
  }

  const updateTitle = async (id: string, title: string) => {
    try {
      setIsUpdating(true);
      const updatedDoc = await updateDocument(id, title);
      
      setDocuments((prev) => 
        prev.map((doc) => (doc.id === id ? updatedDoc : doc))
      );

    } catch (error) {
      console.error("Fail to rename document", error);

    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (inView && hasMore) {
      loadMoreDocs();
    }
  }, [inView, hasMore]);

  const onRowClick = (id: string) => {
    setClickedId(id);
    startTransition(() => {
      router.push(`/documents/${id}`);
    });
  };

  return (
    <div className="flex flex-col gap-y-4">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-none">
            <TableHead className="w-[50%]">Name</TableHead>
            <TableHead className="hidden md:table-cell">Owner</TableHead>
            <TableHead className="hidden md:table-cell">Created at</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => {
            const isThisRowLoading = isPending && clickedId === doc.id;

            return (
              <TableRow
                key={doc.id}
                className={cn(
                  "cursor-pointer hover:bg-gray-100/50 transition-colors",
                  isPending && "pointer-events-none opacity-80"
                )}
                onClick={() => onRowClick(doc.id)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-x-2">
                    {isThisRowLoading ? (
                      <Loader2Icon className="size-5 text-blue-600 animate-spin" />
                    ) : (
                      <SiGoogledocs className="size-5 text-blue-500" />
                    )}
                    <div className="flex items-center gap-x-2 overflow-hidden">
                      <span className="truncate max-w-[200px] sm:max-w-[400px]">
                        {doc.title}
                      </span>

                      {(doc.collaborators && doc.collaborators.length > 0) ? (
                        <Users2 className="size-5 text-muted-foreground"/>
                      ) : (
                        <CircleUserIcon className="size-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground hidden md:table-cell">
                  { doc.owner?.name || "Me" }
                </TableCell>
                <TableCell className="text-muted-foreground hidden md:table-cell">
                  {new Date(doc.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="p-2 hover:bg-gray-200 rounded-full transition"
                        onClick={(e) => e.stopPropagation()} 
                      >
                        <MoreVertical className="size-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-fit ">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/documents/${doc.id}`, "_blank");
                        }}
                      >
                        <ExternalLinkIcon className="size-4 mr-2" />
                        Open in new tab
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        setRenameId(doc.id);
                        setInitialTitle(doc.title);
                      }}>
                        <PencilIcon className="size-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!!deletingId}
                        className="text-red-600 focus:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(doc.id)
                        }}
                      >
                        {(deletingId === doc.id) ? (
                          <Loader2Icon className="size-4 mr-2 animate-spin" />
                        ) : (
                          <TrashIcon className="size-4 mr-2" />
                        )}
                        <span>{deletingId === doc.id ? "Deleting..." : "Remove"}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <RenameDialog
        documentId={renameId || ""}
        initialTitle={initialTitle}
        isOpen={!!renameId}
        onClose={() => setRenameId(null)}
        onRename={updateTitle} 
      />

      {hasMore && (
        <div ref={ref} className="flex justify-center py-10">
          <Loader2Icon className="size-6 text-blue-600 animate-spin" />
        </div>
      )}
    </div>
  );
};