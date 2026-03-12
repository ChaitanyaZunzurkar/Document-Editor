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
import { SiGoogledocs } from 'react-icons/si';

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
  
  const [documents, setDocuments] = useState(initialDocuments);
  const [skip, setSkip] = useState(10);
  const [hasMore, setHasMore] = useState(initialDocuments.length === 10);
  
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clickedId, setClickedId] = useState<string | null>(null);
  
  const [renameId, setRenameId] = useState<string | null>(null);
  const [initialTitle, setInitialTitle] = useState("");

  const { ref, inView } = useInView();

  const loadMoreDocs = async () => {
    if (!hasMore) return;
    try {
      const newDocs = await getDocuments(skip, 10);
      if (newDocs.length < 10) setHasMore(false);
      setDocuments((prev) => [...prev, ...newDocs]);
      setSkip((prev) => prev + 10);
    } catch (error) {
      console.error("Failed to load more documents", error);
    }
  };

  useEffect(() => {
    if (inView && hasMore) loadMoreDocs();
  }, [inView, hasMore]);

  const onRowClick = (id: string) => {
    setClickedId(id);
    startTransition(() => {
      router.push(`/documents/${id}`);
    });
  };

  const onDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      setDeletingId(null);
    }
  };

  const onRename = async (id: string, title: string) => {
    const updatedDoc = await updateDocument(id, title);
    setDocuments((prev) => 
      prev.map((doc) => (doc.id === id ? updatedDoc : doc))
    );
  };

  return (
    <div className="flex flex-col gap-y-4 h-full">
      <div className="overflow-x-auto">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[60%] lg:w-[50%] pl-4">Name</TableHead>
              <TableHead className="hidden md:table-cell w-[20%]">Owner</TableHead>
              <TableHead className="hidden md:table-cell w-[20%]">Created at</TableHead>
              <TableHead className="w-[50px] text-right pr-4"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => {
              const isThisRowLoading = isPending && clickedId === doc.id;

              return (
                <TableRow
                  key={doc.id}
                  className={cn(
                    "cursor-pointer hover:bg-gray-100/50 transition-colors group",
                    isThisRowLoading && "bg-blue-50/50 pointer-events-none"
                  )}
                  onClick={() => onRowClick(doc.id)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-x-2 overflow-hidden">
                      {isThisRowLoading ? (
                        <Loader2Icon className="size-5 text-blue-600 animate-spin flex-shrink-0" />
                      ) : (
                        <SiGoogledocs className="size-5 text-blue-500 flex-shrink-0" />
                      )}
                      <span className="truncate">{doc.title}</span>
                      {doc.collaborators?.length > 0 ? (
                        <Users2 className="size-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <CircleUserIcon className="size-4 text-muted-foreground/30 flex-shrink-0" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">
                    {doc.owner?.name || "Me"}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">
                    {new Date(doc.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-gray-200 rounded-full transition outline-none">
                          <MoreVertical className="size-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-fit min-w-[160px]">
                        <DropdownMenuItem onClick={() => window.open(`/documents/${doc.id}`, "_blank")}>
                          <ExternalLinkIcon className="size-4 mr-2" />
                          <span className="whitespace-nowrap">Open in new tab</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setRenameId(doc.id); setInitialTitle(doc.title); }}>
                          <PencilIcon className="size-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          disabled={!!deletingId}
                          className="text-red-600 focus:text-red-600"
                          onClick={() => onDelete(doc.id)}
                        >
                          {deletingId === doc.id ? (
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
      </div>

      {hasMore && (
        <div ref={ref} className="flex justify-center py-10">
          <Loader2Icon className="size-6 text-blue-600 animate-spin" />
        </div>
      )}

      {!hasMore && documents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200 mt-4">
          <SiGoogledocs className="size-10 text-blue-500/40 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No documents found</h3>
          <p className="text-sm text-muted-foreground">Create your first document to get started.</p>
        </div>
      )}

      <RenameDialog
        documentId={renameId || ""}
        initialTitle={initialTitle}
        isOpen={!!renameId}
        onClose={() => setRenameId(null)}
        onRename={onRename}
      />
    </div>
  );
};