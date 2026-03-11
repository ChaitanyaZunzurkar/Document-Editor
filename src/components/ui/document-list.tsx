"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { 
  Loader2Icon, 
  FileIcon, 
  MoreVertical, 
  TrashIcon, 
  ExternalLinkIcon, 
  PencilIcon 
} from "lucide-react";

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
import { getDocuments } from "@/lib/services/documents";
import { cn } from "@/lib/utils";

interface DocumentListProps {
  initialDocuments: any[];
}

export const DocumentList = ({ initialDocuments }: DocumentListProps) => {
  const router = useRouter();
  
  // States for Infinite Scroll
  const [documents, setDocuments] = useState(initialDocuments);
  const [skip, setSkip] = useState(10);
  const [hasMore, setHasMore] = useState(initialDocuments.length === 10);
  
  // States for Row Navigation Loading
  const [isPending, startTransition] = useTransition();
  const [clickedId, setClickedId] = useState<string | null>(null);

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

  useEffect(() => {
    if (inView && hasMore) {
      loadMoreDocs();
    }
  }, [inView, hasMore]);

  // Logic to handle row click with loading state
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
                      <FileIcon className="size-5 text-blue-500 fill-blue-500/10" />
                    )}
                    <span className="truncate max-w-[200px] sm:max-w-[400px]">
                      {doc.title}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground hidden md:table-cell">
                  Me
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
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/documents/${doc.id}`, "_blank");
                        }}
                      >
                        <ExternalLinkIcon className="size-4 mr-2" />
                        Open in new tab
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <PencilIcon className="size-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TrashIcon className="size-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {hasMore && (
        <div ref={ref} className="flex justify-center py-10">
          <Loader2Icon className="size-6 text-blue-600 animate-spin" />
        </div>
      )}
    </div>
  );
};