"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquarePlusIcon, SendIcon, CheckCircle2Icon, MessageSquareOffIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getThreads, createThread, addCommentToThread, resolveThread } from "@/lib/services/threads";

interface ThreadSidebarProps {
  editor: any;
  documentId: string;
}

export const ThreadSidebar = ({ editor, documentId }: ThreadSidebarProps) => {
  const [threads, setThreads] = useState<any[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch threads on load
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const data = await getThreads(documentId);
        setThreads(data);
      } catch (error) {
        console.error("Failed to fetch threads");
      } finally {
        setIsLoading(false);
      }
    };
    fetchThreads();
  }, [documentId]);

  // 2. Listen to Tiptap to see what the user is highlighting or clicking on
  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      // Are they clicking inside an existing comment highlight?
      const isActive = editor.isActive("thread");
      if (isActive) {
        const threadId = editor.getAttributes("thread").threadId;
        setActiveThreadId(threadId);
        return;
      }

      // Did they highlight new text?
      const { empty } = editor.state.selection;
      if (!empty) {
        setActiveThreadId("new");
      } else {
        setActiveThreadId(null);
      }
    };

    editor.on("selectionUpdate", handleSelectionUpdate);
    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor]);

  // 3. Create a brand new thread
  const handleCreateThread = async () => {
    if (!newCommentText.trim() || !editor) return;

    // Grab the exact text they highlighted
    const { from, to } = editor.state.selection;
    const quote = editor.state.doc.textBetween(from, to, " ");
    
    // Generate a unique ID for this highlight
    const threadId = `thread_${Date.now()}`;

    try {
      // Instantly wrap the text in yellow
      editor.chain().focus().setThread(threadId).run();

      // Save it to PostgreSQL
      const newThread = await createThread(documentId, quote, newCommentText);
      setThreads([newThread, ...threads]);
      setNewCommentText("");
      setActiveThreadId(newThread.id);
      toast.success("Comment added");
    } catch (error) {
      toast.error("Failed to add comment");
      // If it fails, remove the yellow highlight
      editor.chain().focus().unsetThread().run();
    }
  };

  // 4. Reply to an existing thread
  const handleReply = async (threadId: string) => {
    if (!replyText.trim()) return;

    try {
      const newComment = await addCommentToThread(threadId, replyText);
      
      // Update local state so it shows up instantly
      setThreads(threads.map(t => {
        if (t.id === threadId) {
          return { ...t, comments: [...t.comments, newComment] };
        }
        return t;
      }));
      
      setReplyText("");
    } catch (error) {
      toast.error("Failed to reply");
    }
  };

  // 5. Resolve (hide) a thread
  const handleResolve = async (threadId: string) => {
    try {
      await resolveThread(threadId);
      setThreads(threads.filter(t => t.id !== threadId));
      
      // Tell Tiptap to remove the yellow highlight
      // (Note: To do this perfectly across the whole doc requires a transaction, 
      // but reloading the doc or selecting it works for now)
      toast.success("Thread resolved");
      setActiveThreadId(null);
    } catch (error) {
      toast.error("Failed to resolve thread");
    }
  };

  if (isLoading) return <div className="w-80 border-l bg-gray-50 flex items-center justify-center text-sm text-gray-500 print:hidden">Loading...</div>;

  return (
    <div className="w-80 flex-shrink-0 border-l bg-gray-50 flex flex-col print:hidden shadow-[-4px_0_15px_rgba(0,0,0,0.03)] z-10">
      <div className="h-14 border-b flex items-center px-4 bg-white font-medium text-gray-700">
        Comments
      </div>

      <ScrollArea className="flex-1 p-4">
        {/* State 1: User highlighted new text but hasn't commented yet */}
        {activeThreadId === "new" && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200 mb-4 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center gap-2 text-blue-600 mb-2 font-medium text-sm">
              <MessageSquarePlusIcon className="size-4" />
              New Comment
            </div>
            <p className="text-xs text-gray-500 italic mb-3 border-l-2 border-gray-200 pl-2">
              "{editor?.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, " ").substring(0, 50)}..."
            </p>
            <textarea
              autoFocus
              className="w-full text-sm resize-none outline-none placeholder:text-gray-400 mb-2 bg-transparent"
              placeholder="Add a comment..."
              rows={3}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setActiveThreadId(null)}>Cancel</Button>
              <Button size="sm" onClick={handleCreateThread} disabled={!newCommentText.trim()}>Comment</Button>
            </div>
          </div>
        )}

        {/* State 2: List all existing threads */}
        {threads.length === 0 && activeThreadId !== "new" && (
          <div className="flex flex-col items-center justify-center text-center pt-20 text-gray-400 space-y-3">
            <MessageSquareOffIcon className="size-10 opacity-20" />
            <p className="text-sm">No active comments.<br/>Highlight text to start a thread.</p>
          </div>
        )}

        {threads.map((thread) => (
          <div 
            key={thread.id} 
            className={`bg-white p-4 rounded-lg shadow-sm border mb-4 transition-all duration-200 ${
              activeThreadId === thread.id ? "border-blue-400 ring-1 ring-blue-400 shadow-md" : "border-gray-200"
            }`}
            onClick={() => setActiveThreadId(thread.id)}
          >
            {/* The Highlighted Quote */}
            {thread.quote && (
              <p className="text-xs text-gray-500 italic mb-3 border-l-2 border-blue-200 pl-2 bg-blue-50/50 py-1 pr-1 rounded-r">
                "{thread.quote}"
              </p>
            )}

            {/* The Comments Chat Log */}
            <div className="space-y-4 mb-4">
              {thread.comments.map((comment: any) => (
                <div key={comment.id} className="flex gap-x-3">
                  <div className="size-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
                    {comment.user?.name?.[0] || comment.user?.email?.[0] || "?"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-semibold text-gray-800">{comment.user?.name || "Anonymous"}</span>
                      <span className="text-[10px] text-gray-400">
                        {formatDistanceToNow(new Date(comment.createdAt))} ago
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Input & Resolve Button */}
            <div className="flex items-center gap-2 mt-2 pt-3 border-t">
              <input
                type="text"
                placeholder="Reply..."
                className="flex-1 text-sm outline-none placeholder:text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full"
                value={activeThreadId === thread.id ? replyText : ""}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && activeThreadId === thread.id) {
                    handleReply(thread.id);
                  }
                }}
              />
              {replyText.trim() && activeThreadId === thread.id ? (
                <Button size="icon" className="size-8 rounded-full" onClick={() => handleReply(thread.id)}>
                  <SendIcon className="size-4" />
                </Button>
              ) : (
                <Button size="icon" variant="ghost" className="size-8 text-gray-400 hover:text-green-600 rounded-full" onClick={() => handleResolve(thread.id)} title="Resolve thread">
                  <CheckCircle2Icon className="size-5" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};