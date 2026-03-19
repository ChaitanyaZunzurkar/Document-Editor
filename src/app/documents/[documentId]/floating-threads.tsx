"use client";

import { useEffect, useState, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquarePlusIcon, SendIcon, CheckCircle2Icon, XIcon, MessageSquareOffIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getThreads, addCommentToThread, resolveThread, createThread } from "@/lib/services/threads";

interface FloatingThreadsProps {
  editor: any;
  documentId: string;
}

export const FloatingThreads = ({ editor, documentId }: FloatingThreadsProps) => {
  const [threads, setThreads] = useState<any[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  // Draft State
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftQuote, setDraftQuote] = useState("");
  const [draftText, setDraftText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Threads
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const data = await getThreads(documentId);
        setThreads(data);
      } catch (error) {
        console.error("Failed to fetch threads");
      }
    };
    fetchThreads();
  }, [documentId]);

  // 2. Watch for Selection Changes (No Math Needed!)
  useEffect(() => {
    if (!editor) return;

    const checkSelection = () => {
      // Are we drafting a new comment?
      if (editor.isActive("thread") && editor.isActive("thread", { threadId: "draft" })) {
        setIsDrafting(true);
        const { from, to } = editor.state.selection;
        setDraftQuote(editor.state.doc.textBetween(from, to, " "));
        setActiveThreadId(null);
        return;
      }

      // Are we clicking an existing comment in the text?
      if (editor.isActive("thread")) {
        const id = editor.getAttributes("thread").threadId;
        setActiveThreadId(id);
        setIsDrafting(false);
        
        // Auto-scroll the sidebar to the active comment box
        setTimeout(() => {
            const card = document.getElementById(`comment-${id}`);
            if (card && scrollRef.current) {
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 50);
      } else {
        setActiveThreadId(null);
      }
    };

    editor.on('selectionUpdate', checkSelection);
    return () => { editor.off('selectionUpdate', checkSelection); };
  }, [editor]);

  // Helper to swap the "draft" highlight for a permanent one
  const updateDraftMark = (newId: string | null) => {
    let tr = editor.state.tr;
    editor.state.doc.descendants((node: any, pos: number) => {
      if (node.isText && node.marks) {
        const threadMark = node.marks.find((m: any) => m.type.name === 'thread' && m.attrs.threadId === 'draft');
        if (threadMark) {
          tr = tr.removeMark(pos, pos + node.nodeSize, threadMark.type);
          if (newId) tr = tr.addMark(pos, pos + node.nodeSize, threadMark.type.create({ threadId: newId }));
        }
      }
    });
    editor.view.dispatch(tr);
  };

  const cancelDraft = () => {
    updateDraftMark(null);
    setIsDrafting(false);
    setDraftText("");
  };

  const submitDraft = async () => {
    if (!draftText.trim()) return;
    setIsSubmitting(true);
    try {
      const newThread = await createThread(documentId, draftQuote, draftText);
      updateDraftMark(newThread.id);
      setThreads([newThread, ...threads]);
      setIsDrafting(false);
      setDraftText("");
      setActiveThreadId(newThread.id);
      toast.success("Comment added");
    } catch (error) {
      toast.error("Failed to post comment");
      cancelDraft();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (threadId: string, content: string) => {
    try {
      const newComment = await addCommentToThread(threadId, content);
      setThreads(threads.map(t => t.id === threadId ? { ...t, comments: [...t.comments, newComment] } : t));
    } catch {
      toast.error("Failed to reply");
    }
  };

  const handleResolve = async (threadId: string) => {
    try {
      await resolveThread(threadId);
      setThreads(threads.filter(t => t.id !== threadId));
      toast.success("Thread resolved");
    } catch {
      toast.error("Failed to resolve thread");
    }
  };

  return (
    // Changed to a standard Flex column that fills its container height
    <div className="flex flex-col h-full bg-gray-50/50 border border-gray-200 rounded-lg shadow-sm overflow-hidden">

      {/* The Scrollable Area containing the stacked boxes */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Empty State */}
        {threads.length === 0 && !isDrafting && (
          <div className="flex flex-col items-center justify-center text-center pt-10 text-gray-400 space-y-3">
            <MessageSquareOffIcon className="size-10 opacity-20" />
            <p className="text-sm">No comments yet.<br/>Highlight text to start a thread.</p>
          </div>
        )}

        {/* 1. The "New Comment" Draft Card (Small and clean) */}
        {isDrafting && (
          <div className="bg-white p-3 rounded-lg shadow-md border border-blue-400 ring-2 ring-blue-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-blue-600 font-medium text-xs">
                <MessageSquarePlusIcon className="size-3.5" />
                New Comment
              </div>
              <button onClick={cancelDraft} className="text-gray-400 hover:text-red-500 transition-colors">
                <XIcon className="size-3.5" />
              </button>
            </div>
            
            <p className="text-[11px] text-gray-500 italic mb-3 border-l-2 border-blue-200 pl-2 bg-blue-50/50 py-1 pr-1 rounded-r truncate">
              "{draftQuote}"
            </p>
            
            <textarea
              autoFocus
              className="w-full text-xs resize-none outline-none placeholder:text-gray-400 mb-2 bg-transparent"
              placeholder="Type your comment..."
              rows={3}
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
            />
            
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={cancelDraft} className="h-7 text-xs">Cancel</Button>
              <Button size="sm" onClick={submitDraft} disabled={!draftText.trim() || isSubmitting} className="h-7 text-xs bg-blue-600 text-white hover:bg-blue-700">
                {isSubmitting ? "Posting..." : "Comment"}
              </Button>
            </div>
          </div>
        )}

        {/* 2. Stacked Thread Cards */}
        {threads.map((thread) => (
          <ThreadCard
            key={thread.id}
            thread={thread}
            isActive={activeThreadId === thread.id}
            onClick={() => setActiveThreadId(thread.id)}
            onReply={(content: string) => handleReply(thread.id, content)}
            onResolve={() => handleResolve(thread.id)}
          />
        ))}
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: The Standard Block Card ---
const ThreadCard = ({ thread, isActive, onClick, onReply, onResolve }: any) => {
  const [replyText, setReplyText] = useState("");

  const submitReply = () => {
    if (!replyText.trim()) return;
    onReply(replyText);
    setReplyText("");
  };

  return (
    <div 
      id={`comment-${thread.id}`}
      onClick={onClick}
      // Removed all absolute positioning! It now just stacks normally. 
      // Made padding smaller (p-3) for a cleaner look.
      className={`bg-white p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
        isActive ? "border-blue-500 ring-1 ring-blue-100 shadow-md" : "border-gray-200 shadow-sm hover:border-blue-300"
      }`}
    >
      <p className="text-[11px] text-gray-500 italic mb-3 border-l-2 border-yellow-400 pl-2 bg-yellow-50/50 py-1 pr-1 rounded-r">
        "{thread.quote}"
      </p>

      <div className="space-y-3 mb-2 max-h-[150px] overflow-y-auto pr-1">
        {thread.comments.map((comment: any) => (
          <div key={comment.id} className="flex gap-x-2">
            <div className="size-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[10px] flex-shrink-0 mt-0.5">
              {comment.user?.name?.[0] || comment.user?.email?.[0] || "?"}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-gray-800">{comment.user?.name || "Anonymous"}</span>
                <span className="text-[9px] text-gray-400">
                  {formatDistanceToNow(new Date(comment.createdAt))}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5 whitespace-pre-wrap">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* The Hidden Reply Box (Only shows when isActive is true) */}
      {isActive && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 animate-in fade-in slide-in-from-top-1">
          <input
            autoFocus
            type="text"
            placeholder="Reply..."
            className="flex-1 text-xs outline-none placeholder:text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 focus:border-blue-300"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submitReply() }}
          />
          {replyText.trim() ? (
            <Button size="icon" className="size-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white" onClick={submitReply}>
              <SendIcon className="size-3" />
            </Button>
          ) : (
            <Button size="icon" variant="ghost" className="size-7 text-gray-400 hover:text-green-600 rounded-full" onClick={onResolve} title="Resolve thread">
              <CheckCircle2Icon className="size-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};